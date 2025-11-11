import { prisma, withPrismaRetry } from '@/lib/prisma/client'
import { CreateNegocioDto, UpdateNegocioDto, Negocio } from '@/types/crm.types'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'
import { Prisma } from '@prisma/client'

export class NegocioRepository {
  async create(data: CreateNegocioDto): Promise<Negocio> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o contato existe e pertence à mesma organização
    const contato = await withPrismaRetry(async () => {
      return await prisma.contato.findFirst({
        where: {
          id: data.contato_id,
          org_id: orgId,
        },
      })
    })

    if (!contato) {
      throw new Error('Contato não encontrado')
    }

    // Preparar dados, removendo campos undefined
    // NOTA: titulo e lead_id não existem no banco de dados
    const createData: Omit<Prisma.NegocioCreateInput, 'org' | 'contato' | 'empresa' | 'responsavel' | 'propostas' | 'contratos' | 'calendarios' | 'pipeline' | 'etapa_rel'> = {
      org_id: orgId,
      contato_id: data.contato_id,
      valor: data.valor,
      empresa_id: data.empresa_id || null,
      pipeline_id: data.pipeline_id || null,
      etapa_id: data.etapa_id || null,
      etapa: data.etapa || 'prospecting',
      probabilidade: data.probabilidade || 0,
      observacoes: data.observacoes || null,
      responsavel_id: data.responsavel_id || null,
    }
    
    // titulo e lead_id não existem no banco, então não incluímos

    const negocio = await withPrismaRetry(async () => {
      return await prisma.negocio.create({
        data: createData,
        select: {
          id: true,
          org_id: true,
          contato_id: true,
          empresa_id: true,
          valor: true,
          etapa: true,
          status: true,
          responsavel_id: true,
          probabilidade: true,
          observacoes: true,
          created_at: true,
          updated_at: true,
          contato: {
            select: {
              id: true,
              nome: true,
              nome_fantasia: true,
              razao_social: true,
              email: true,
              telefone: true,
              cargo: true,
              tipo: true,
              avatar_url: true,
              cpf: true,
              empresa_id: true,
              responsavel_id: true,
              created_at: true,
              updated_at: true,
              responsavel: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  avatar_url: true,
                },
              },
              empresa: {
                select: {
                  id: true,
                  nome_fantasia: true,
                  razao_social: true,
                },
              },
            },
          },
          empresa: {
            select: {
              id: true,
              nome_fantasia: true,
              razao_social: true,
            },
          },
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      })
    })

    // Converter Decimal para number e garantir que empresa pode ser null
    return {
      ...negocio,
      valor: Number(negocio.valor),
      empresa: negocio.empresa || null,
    } as Negocio
  }

  async findById(id: string): Promise<Negocio | null> {
    console.log('[NegocioRepository.findById] Iniciando busca:', { id })
    
    const orgId = await getCurrentUserOrgId()
    console.log('[NegocioRepository.findById] OrgId obtido:', { orgId })
    
    if (!orgId) {
      console.error('[NegocioRepository.findById] OrgId não encontrado')
      throw new Error('Usuário não autenticado')
    }

    try {
      const negocio = await withPrismaRetry(async () => {
        console.log('[NegocioRepository.findById] Executando query Prisma:', { id, orgId })
        return await prisma.negocio.findFirst({
          where: {
            id,
            org_id: orgId,
          },
          select: {
            id: true,
            org_id: true,
            contato_id: true,
            empresa_id: true,
            valor: true,
            etapa: true,
            status: true,
            responsavel_id: true,
            probabilidade: true,
            observacoes: true,
            created_at: true,
            updated_at: true,
            contato: {
              select: {
                id: true,
                nome: true,
                nome_fantasia: true,
                razao_social: true,
                email: true,
                telefone: true,
                cargo: true,
                tipo: true,
                avatar_url: true,
                cpf: true,
                empresa_id: true,
                responsavel_id: true,
                created_at: true,
                updated_at: true,
                responsavel: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    avatar_url: true,
                  },
                },
                empresa: {
                  select: {
                    id: true,
                    nome_fantasia: true,
                    razao_social: true,
                  },
                },
              },
            },
            empresa: {
              select: {
                id: true,
                nome_fantasia: true,
                razao_social: true,
              },
            },
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        })
      })

      console.log('[NegocioRepository.findById] Resultado da query:', { 
        encontrado: !!negocio,
        negocioId: negocio?.id 
      })

      if (!negocio) {
        return null
      }

      // Converter Decimal para number e garantir que empresa pode ser null
      return {
        ...negocio,
        valor: Number(negocio.valor),
        empresa: negocio.empresa || null,
      } as Negocio
    } catch (error: any) {
      console.error('[NegocioRepository.findById] Erro ao buscar negócio:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        error: error
      })
      throw error
    }
  }

  async findAll(filters?: {
    etapa?: string
    status?: string
    responsavel_id?: string
    contato_id?: string
  }): Promise<Negocio[]> {
    console.log('[NegocioRepository.findAll] Iniciando busca:', { filters })
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    const where: any = {
      org_id: orgId,
    }

    if (filters?.etapa) {
      where.etapa = filters.etapa
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.responsavel_id) {
      where.responsavel_id = filters.responsavel_id
    }

    if (filters?.contato_id) {
      where.contato_id = filters.contato_id
    }

    console.log('[NegocioRepository.findAll] Query where:', JSON.stringify(where, null, 2))

    try {
      const negocios = await withPrismaRetry(async () => {
        return await prisma.negocio.findMany({
          where,
          select: {
            id: true,
            org_id: true,
            contato_id: true,
            empresa_id: true,
            valor: true,
            etapa: true,
            status: true,
            responsavel_id: true,
            probabilidade: true,
            observacoes: true,
            created_at: true,
            updated_at: true,
            contato: {
              select: {
                id: true,
                nome: true,
                nome_fantasia: true,
                razao_social: true,
                email: true,
                telefone: true,
                cargo: true,
                tipo: true,
                avatar_url: true,
                cpf: true,
                empresa_id: true,
                responsavel_id: true,
                created_at: true,
                updated_at: true,
                responsavel: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    avatar_url: true,
                  },
                },
                empresa: {
                  select: {
                    id: true,
                    nome_fantasia: true,
                    razao_social: true,
                  },
                },
              },
            },
            empresa: {
              select: {
                id: true,
                nome_fantasia: true,
                razao_social: true,
              },
            },
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar_url: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        })
      })

      console.log('[NegocioRepository.findAll] Negócios encontrados:', negocios.length)

      // Converter Decimal para number e garantir que empresa pode ser null
      return negocios.map((negocio) => ({
        ...negocio,
        valor: Number(negocio.valor),
        empresa: negocio.empresa || null,
      })) as Negocio[]
    } catch (error: any) {
      console.error('[NegocioRepository.findAll] Erro ao buscar negócios:', {
        message: error?.message,
        code: error?.code,
        errorString: JSON.stringify(error).substring(0, 500)
      })
      throw error
    }
  }

  async update(id: string, data: UpdateNegocioDto): Promise<Negocio> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o negócio pertence à mesma organização
    const negocio = await withPrismaRetry(async () => {
      return await prisma.negocio.findFirst({
        where: {
          id,
          org_id: orgId,
        },
      })
    })

    if (!negocio) {
      throw new Error('Negócio não encontrado')
    }

    // Se contato_id foi fornecido, verificar se existe
    if (data.contato_id) {
      const contato = await withPrismaRetry(async () => {
        return await prisma.contato.findFirst({
          where: {
            id: data.contato_id,
            org_id: orgId,
          },
        })
      })

      if (!contato) {
        throw new Error('Contato não encontrado')
      }
    }

    // Preparar dados de atualização, removendo campos undefined
    // NOTA: titulo não existe no banco de dados
    const updateData: any = {}
    
    if (data.contato_id !== undefined) updateData.contato_id = data.contato_id
    if (data.valor !== undefined) updateData.valor = data.valor
    if (data.etapa !== undefined) updateData.etapa = data.etapa
    if (data.etapa_id !== undefined) updateData.etapa_id = data.etapa_id || null
    if (data.pipeline_id !== undefined) updateData.pipeline_id = data.pipeline_id || null
    if (data.status !== undefined) updateData.status = data.status
    if (data.probabilidade !== undefined) updateData.probabilidade = data.probabilidade
    if (data.empresa_id !== undefined) updateData.empresa_id = data.empresa_id || null
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes || null
    if (data.responsavel_id !== undefined) updateData.responsavel_id = data.responsavel_id || null
    
    // titulo não existe no banco, então não incluímos

    const updatedNegocio = await withPrismaRetry(async () => {
      return await prisma.negocio.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          org_id: true,
          contato_id: true,
          empresa_id: true,
          valor: true,
          etapa: true,
          status: true,
          responsavel_id: true,
          probabilidade: true,
          observacoes: true,
          created_at: true,
          updated_at: true,
          contato: {
            select: {
              id: true,
              nome: true,
              nome_fantasia: true,
              razao_social: true,
              email: true,
              telefone: true,
              cargo: true,
              tipo: true,
              avatar_url: true,
              cpf: true,
              empresa_id: true,
              responsavel_id: true,
              created_at: true,
              updated_at: true,
              responsavel: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  avatar_url: true,
                },
              },
              empresa: {
                select: {
                  id: true,
                  nome_fantasia: true,
                  razao_social: true,
                },
              },
            },
          },
          empresa: {
            select: {
              id: true,
              nome_fantasia: true,
              razao_social: true,
            },
          },
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      })
    })

    // Converter Decimal para number e garantir que empresa pode ser null
    return {
      ...updatedNegocio,
      valor: Number(updatedNegocio.valor),
      empresa: updatedNegocio.empresa || null,
    } as Negocio
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o negócio pertence à mesma organização
    const negocio = await withPrismaRetry(async () => {
      return await prisma.negocio.findFirst({
        where: {
          id,
          org_id: orgId,
        },
      })
    })

    if (!negocio) {
      throw new Error('Negócio não encontrado')
    }

    await withPrismaRetry(async () => {
      return await prisma.negocio.delete({
        where: { id },
      })
    })
  }
}

