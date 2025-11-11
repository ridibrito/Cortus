import { prisma } from '@/lib/prisma/client'
import { CreatePropostaDto, UpdatePropostaDto, Proposta } from '@/types/crm.types'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'

export class PropostaRepository {
  async create(data: CreatePropostaDto): Promise<Proposta> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o negócio pertence à mesma organização
    const negocio = await prisma.negocio.findFirst({
      where: {
        id: data.negocio_id,
        org_id: orgId,
      },
    })

    if (!negocio) {
      throw new Error('Negócio não encontrado ou sem permissão')
    }

    return prisma.proposta.create({
      data: {
        ...data,
        modelo_id: data.modelo_id || null,
        validade: data.validade || null,
        conteudo: data.conteudo || null,
      },
      include: {
        negocio: {
          include: {
            lead: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    }) as Promise<Proposta>
  }

  async findById(id: string): Promise<Proposta | null> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    return prisma.proposta.findFirst({
      where: {
        id,
        negocio: {
          org_id: orgId,
        },
      },
      include: {
        negocio: {
          include: {
            lead: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    }) as Promise<Proposta | null>
  }

  async findAll(filters?: {
    negocio_id?: string
    status?: string
  }): Promise<Proposta[]> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    const where: any = {
      negocio: {
        org_id: orgId,
      },
    }

    if (filters?.negocio_id) {
      where.negocio_id = filters.negocio_id
    }

    if (filters?.status) {
      where.status = filters.status
    }

    return prisma.proposta.findMany({
      where,
      include: {
        negocio: {
          include: {
            lead: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    }) as Promise<Proposta[]>
  }

  async update(id: string, data: UpdatePropostaDto): Promise<Proposta> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se a proposta pertence à mesma organização
    const proposta = await prisma.proposta.findFirst({
      where: {
        id,
        negocio: {
          org_id: orgId,
        },
      },
    })

    if (!proposta) {
      throw new Error('Proposta não encontrada ou sem permissão')
    }

    return prisma.proposta.update({
      where: { id },
      data: {
        ...data,
        modelo_id: data.modelo_id || null,
        validade: data.validade || null,
        conteudo: data.conteudo || null,
      },
      include: {
        negocio: {
          include: {
            lead: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    }) as Promise<Proposta>
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se a proposta pertence à mesma organização
    const proposta = await prisma.proposta.findFirst({
      where: {
        id,
        negocio: {
          org_id: orgId,
        },
      },
    })

    if (!proposta) {
      throw new Error('Proposta não encontrada ou sem permissão')
    }

    await prisma.proposta.delete({
      where: { id },
    })
  }
}

