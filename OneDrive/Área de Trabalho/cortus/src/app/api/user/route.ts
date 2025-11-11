import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { prisma, withPrismaRetry } from '@/lib/prisma/client'

export async function GET() {
  try {
    // Usar ensureUserExists para garantir que o usuário existe com organização
    const { user: ensuredUser, error: ensureError } = await ensureUserExists()

    if (ensureError || !ensuredUser) {
      console.error('Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    // Buscar dados completos do usuário no banco com retry
    // Buscar dados básicos primeiro, depois relacionamentos separadamente
    let user
    let roles: any[] = []
    try {
      // Buscar usuário básico
      user = await withPrismaRetry(async () => {
        return await prisma.user.findUnique({
          where: { id: ensuredUser.id },
          select: {
            id: true,
            org_id: true,
            nome: true,
            email: true,
            avatar_url: true,
            ativo: true,
            telefone: true,
            bio: true,
            created_at: true,
            updated_at: true,
          },
        })
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Buscar organização separadamente
      const org = await withPrismaRetry(async () => {
        return await prisma.org.findUnique({
          where: { id: user.org_id },
          select: {
            id: true,
            nome: true,
            plano: true,
            logo_url: true,
          },
        })
      })

      // Buscar roles separadamente - buscar apenas role_ids primeiro
      const userRoleIds = await withPrismaRetry(async () => {
        return await prisma.userRole.findMany({
          where: { user_id: user.id },
          select: {
            role_id: true,
          },
        })
      })

      // Buscar os roles completos separadamente
      if (userRoleIds.length > 0) {
        const roleIds = userRoleIds.map(ur => ur.role_id)
        const rolesData = await withPrismaRetry(async () => {
          return await prisma.role.findMany({
            where: {
              id: { in: roleIds },
            },
            select: {
              id: true,
              nome: true,
              descricao: true,
            },
          })
        })
        roles = rolesData
      }

      // Combinar os dados
      user = {
        ...user,
        org: org || null,
      } as any
    } catch (queryError: any) {
      console.error('[GET /api/user] Erro ao buscar usuário no Prisma:', {
        errorMessage: queryError?.message,
        errorCode: queryError?.code,
        userId: ensuredUser.id,
        errorString: JSON.stringify(queryError).substring(0, 500)
      })
      throw queryError
    }

    if (!user) {
      console.error('Usuário não encontrado após ensureUserExists:', ensuredUser.id)
      return NextResponse.json(
        { 
          error: 'Erro ao buscar dados do usuário',
          details: 'O usuário foi garantido mas não foi encontrado no banco'
        },
        { status: 500 }
      )
    }

    // Serializar dados do usuário de forma segura
    const serializedUser = {
      id: user.id,
      org_id: user.org_id,
      nome: user.nome,
      email: user.email,
      avatar_url: user.avatar_url,
      ativo: user.ativo,
      telefone: user.telefone,
      bio: user.bio,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      org: user.org ? {
        id: user.org.id,
        nome: user.org.nome,
        plano: user.org.plano,
        logo_url: user.org.logo_url,
      } : null,
      roles: roles,
    }

    return NextResponse.json({ user: serializedUser })
  } catch (error: any) {
    console.error('[GET /api/user] Erro completo:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      errorString: JSON.stringify(error).substring(0, 1000),
      errorKind: error?.kind,
      errorMeta: error?.meta
    })
    
    // Verificar se é um erro do Prisma relacionado a campos obrigatórios
    if (error?.message?.includes('Invalid input') || error?.message?.includes('expected string')) {
      return NextResponse.json(
        { 
          error: 'Erro de validação de dados',
          details: 'Alguns dados obrigatórios estão faltando. Verifique se o usuário foi criado corretamente.',
          message: error.message
        },
        { status: 400 }
      )
    }
    
    // Verificar se é um erro de prepared statement que não foi capturado pelo retry
    const errorString = JSON.stringify(error).toLowerCase()
    const isPreparedStatementError = 
      errorString.includes('prepared statement') ||
      errorString.includes('does not exist') ||
      errorString.includes('26000') ||
      error?.code === '26000'
    
    if (isPreparedStatementError) {
      console.warn('[GET /api/user] Erro de prepared statement detectado, mas não foi capturado pelo retry')
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar dados do usuário',
        details: error?.message || 'Erro desconhecido',
        code: error?.code
      },
      { status: 500 }
    )
  }
}

