import { createClient } from '@/lib/supabase/server'
import { prisma, withPrismaRetry } from '@/lib/prisma/client'

/**
 * Função centralizada para garantir que o usuário autenticado existe no Prisma
 * com uma organização associada. Cria automaticamente se necessário.
 * 
 * Esta é a função principal que deve ser usada para garantir sincronização
 * entre Supabase Auth e Prisma.
 */
export async function ensureUserExists(): Promise<{
  user: {
    id: string
    email: string
    org_id: string
    nome: string
  } | null
  error: string | null
}> {
  try {
    console.log('[ensureUserExists] Iniciando verificação de usuário...')
    const supabase = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      console.error('[ensureUserExists] Erro de autenticação Supabase:', {
        error: authError?.message,
        hasUser: !!authUser
      })
      return { user: null, error: 'Usuário não autenticado no Supabase' }
    }

    if (!authUser.email) {
      console.error('[ensureUserExists] Usuário Supabase sem email:', {
        userId: authUser.id
      })
      return { user: null, error: 'Usuário Supabase sem email' }
    }

    console.log('[ensureUserExists] Usuário autenticado no Supabase:', {
      email: authUser.email,
      userId: authUser.id
    })

    // Tentar buscar pelo email primeiro
    let dbUser = await withPrismaRetry(async () => {
      return await prisma.user.findUnique({
        where: { email: authUser.email },
        select: {
          id: true,
          email: true,
          org_id: true,
          nome: true,
          supabase_user_id: true,
        },
      })
    }).catch((error) => {
      console.error('[ensureUserExists] Erro ao buscar usuário por email:', error)
      return null
    })

    // Se não encontrou pelo email, tentar pelo supabase_user_id
    if (!dbUser && authUser.id) {
      dbUser = await withPrismaRetry(async () => {
        return await prisma.user.findUnique({
          where: { supabase_user_id: authUser.id },
          select: {
            id: true,
            email: true,
            org_id: true,
            nome: true,
            supabase_user_id: true,
          },
        })
      }).catch((error) => {
        console.error('[ensureUserExists] Erro ao buscar usuário por supabase_user_id:', error)
        return null
      })
    }

    // Se o usuário existe mas não tem org_id, criar organização
    if (dbUser && !dbUser.org_id) {
      console.log('[ensureUserExists] Usuário existe mas sem organização. Criando organização...')
      
      try {
        // Usar transação com retry para garantir atomicidade
        const result = await withPrismaRetry(async () => {
          return await prisma.$transaction(async (tx) => {
            const org = await tx.org.create({
              data: {
                nome: `${dbUser.nome}'s Organization`,
                plano: 'free',
              },
            })

            const updatedUser = await tx.user.update({
              where: { id: dbUser.id },
              data: { org_id: org.id },
              select: {
                id: true,
                email: true,
                org_id: true,
                nome: true,
                supabase_user_id: true,
              },
            })

            return { org, user: updatedUser }
          }, {
            timeout: 10000,
          })
        })

        dbUser = result.user

        // Garantir que tem role de admin (fora da transação para evitar deadlock)
        await ensureUserHasAdminRole(dbUser.id).catch((error) => {
          console.error('[ensureUserExists] Erro ao garantir role de admin:', error)
        })
      } catch (error: any) {
        console.error('[ensureUserExists] Erro ao criar organização para usuário existente:', error)
        // Tentar buscar novamente o usuário
        dbUser = await withPrismaRetry(async () => {
          return await prisma.user.findUnique({
            where: { id: dbUser.id },
            select: {
              id: true,
              email: true,
              org_id: true,
              nome: true,
              supabase_user_id: true,
            },
          })
        }).catch(() => null)
      }
    }

    // Se o usuário não existe, criar automaticamente
    if (!dbUser) {
      console.log('[ensureUserExists] Usuário não encontrado no Prisma. Criando automaticamente...', {
        email: authUser.email,
        supabaseUserId: authUser.id
      })
      
      try {
        // Usar transação com retry para garantir atomicidade de todas as operações
        dbUser = await withPrismaRetry(async () => {
          return await prisma.$transaction(async (tx) => {
          // Criar organização primeiro
          const org = await tx.org.create({
            data: {
              nome: `${authUser.email.split('@')[0]}'s Organization`,
              plano: 'free',
            },
          })

          // Buscar ou criar role de admin padrão
          let adminRole = await tx.role.findFirst({
            where: {
              nome: 'admin',
              org_id: null,
              is_system: true,
            },
          })

          if (!adminRole) {
            adminRole = await tx.role.create({
              data: {
                nome: 'admin',
                descricao: 'Administrador do sistema',
                is_system: true,
              },
            })
          }

          // Criar usuário no Prisma
          // Usar upsert para evitar race conditions
          const user = await tx.user.upsert({
            where: { email: authUser.email.trim() },
            update: {
              org_id: org.id,
              supabase_user_id: authUser.id,
              ativo: true,
            },
            create: {
              email: authUser.email.trim(),
              nome: authUser.user_metadata?.nome || authUser.email.split('@')[0],
              org_id: org.id,
              supabase_user_id: authUser.id,
              ativo: true,
              user_roles: {
                create: {
                  role_id: adminRole.id,
                },
              },
            },
            select: {
              id: true,
              email: true,
              org_id: true,
              nome: true,
              supabase_user_id: true,
            },
          })

            return user
          }, {
            timeout: 10000, // 10 segundos de timeout
          })
        })

        console.log('[ensureUserExists] Usuário criado/atualizado automaticamente:', dbUser.id)
      } catch (createError: any) {
        console.error('[ensureUserExists] Erro ao criar usuário:', {
          code: createError.code,
          message: createError.message,
          meta: createError.meta
        })
        
        // Se der erro de constraint única (email já existe), tentar buscar novamente
        if (createError.code === 'P2002') {
          console.log('[ensureUserExists] Erro de constraint única, tentando buscar usuário novamente...')
          dbUser = await withPrismaRetry(async () => {
            return await prisma.user.findUnique({
              where: { email: authUser.email },
              select: {
                id: true,
                email: true,
                org_id: true,
                nome: true,
                supabase_user_id: true,
              },
            })
          }).catch(() => null)
          
          // Se encontrou mas não tem org_id, criar organização
          if (dbUser && !dbUser.org_id) {
            try {
              const result = await withPrismaRetry(async () => {
                return await prisma.$transaction(async (tx) => {
                  const org = await tx.org.create({
                    data: {
                      nome: `${dbUser.nome || authUser.email.split('@')[0]}'s Organization`,
                      plano: 'free',
                    },
                  })
                  
                  const updatedUser = await tx.user.update({
                    where: { id: dbUser.id },
                    data: { org_id: org.id },
                    select: {
                      id: true,
                      email: true,
                      org_id: true,
                      nome: true,
                      supabase_user_id: true,
                    },
                  })
                  
                  return updatedUser
                }, {
                  timeout: 10000,
                })
              })
              
              dbUser = result
              await ensureUserHasAdminRole(dbUser.id).catch(() => {})
            } catch (error) {
              console.error('[ensureUserExists] Erro ao criar organização após constraint:', error)
            }
          }
        } else if (createError.message?.includes('prepared statement') || createError.code === '26000') {
          // Erro de prepared statement - tentar buscar novamente com retry
          console.warn('[ensureUserExists] Erro de prepared statement, tentando buscar usuário novamente...')
          
          dbUser = await withPrismaRetry(async () => {
            return await prisma.user.findUnique({
              where: { email: authUser.email },
              select: {
                id: true,
                email: true,
                org_id: true,
                nome: true,
                supabase_user_id: true,
              },
            })
          }).catch(() => null)
        } else {
          // Para outros erros, apenas logar e continuar tentando buscar
          console.error('[ensureUserExists] Erro desconhecido ao criar usuário:', createError)
        }
      }
    }

    // Garantir que supabase_user_id está sincronizado
    if (dbUser && dbUser.supabase_user_id !== authUser.id && authUser.id) {
      try {
        await withPrismaRetry(async () => {
          return await prisma.user.update({
            where: { id: dbUser.id },
            data: { supabase_user_id: authUser.id },
          })
        })
        console.log('[ensureUserExists] supabase_user_id sincronizado')
        
        // Atualizar dbUser localmente
        dbUser.supabase_user_id = authUser.id
      } catch (error: any) {
        console.error('[ensureUserExists] Erro ao sincronizar supabase_user_id:', error)
        // Não bloquear o fluxo por causa disso - o usuário já tem org_id
      }
    }

    if (!dbUser || !dbUser.org_id) {
      console.error('[ensureUserExists] Erro: usuário sem org_id após todas as tentativas:', {
        hasUser: !!dbUser,
        hasOrgId: !!dbUser?.org_id,
        userId: dbUser?.id
      })
      return { user: null, error: 'Erro ao garantir existência do usuário' }
    }

    console.log('[ensureUserExists] Usuário garantido com sucesso:', {
      userId: dbUser.id,
      email: dbUser.email,
      orgId: dbUser.org_id
    })

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        org_id: dbUser.org_id,
        nome: dbUser.nome,
      },
      error: null,
    }
  } catch (error: any) {
    console.error('[ensureUserExists] Erro ao garantir existência do usuário:', error)
    console.error('[ensureUserExists] Stack:', error?.stack)
    return { user: null, error: error.message || 'Erro desconhecido' }
  }
}

/**
 * Garante que o usuário tem a role de admin
 */
async function ensureUserHasAdminRole(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        user_roles: {
          include: { role: true },
        },
      },
    })

    if (!user) return

    const hasAdminRole = user.user_roles.some(
      (ur) => ur.role?.nome === 'admin' && ur.role?.is_system === true
    )

    if (!hasAdminRole) {
      let adminRole = await prisma.role.findFirst({
        where: {
          nome: 'admin',
          org_id: null,
          is_system: true,
        },
      })

      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: {
            nome: 'admin',
            descricao: 'Administrador do sistema',
            is_system: true,
          },
        })
      }

      await prisma.userRole.create({
        data: {
          user_id: userId,
          role_id: adminRole.id,
        },
      })

      console.log('[ensureUserHasAdminRole] Role de admin atribuída ao usuário')
    }
  } catch (error) {
    console.error('[ensureUserHasAdminRole] Erro ao garantir role de admin:', error)
  }
}

/**
 * Helper para obter o org_id do usuário autenticado
 * Útil para garantir multi-tenant em queries
 * 
 * Agora usa ensureUserExists para garantir sincronização automática
 */
export async function getCurrentUserOrgId(): Promise<string | null> {
  const { user, error } = await ensureUserExists()
  
  if (error || !user) {
    console.error('[getCurrentUserOrgId] Erro:', error)
    return null
  }

  return user.org_id
}

/**
 * Helper para obter o usuário completo com organização
 * 
 * Agora usa ensureUserExists para garantir sincronização automática
 */
export async function getCurrentUser() {
  const { user, error } = await ensureUserExists()
  
  if (error || !user) {
    return null
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        org: true,
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    })

    return dbUser
  } catch (error) {
    console.error('Erro ao obter usuário completo:', error)
    return null
  }
}

/**
 * Helper para verificar se o usuário tem acesso a um recurso da organização
 */
export async function hasOrgAccess(orgId: string): Promise<boolean> {
  const userOrgId = await getCurrentUserOrgId()
  return userOrgId === orgId
}

