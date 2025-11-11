import { prisma, withPrismaRetry } from '@/lib/prisma/client'
import { Pipeline, Etapa } from '@/types/crm.types'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'

export interface CreatePipelineDto {
  nome: string
  descricao?: string
  is_padrao?: boolean
  ordem?: number
}

export interface UpdatePipelineDto {
  nome?: string
  descricao?: string
  ativo?: boolean
  is_padrao?: boolean
  ordem?: number
}

export interface CreateEtapaDto {
  pipeline_id: string
  nome: string
  descricao?: string
  cor?: string
  ordem?: number
  probabilidade?: number
  is_final?: boolean
}

export interface UpdateEtapaDto {
  nome?: string
  descricao?: string
  cor?: string
  ordem?: number
  probabilidade?: number
  is_final?: boolean
}

export class PipelineRepository {
  async create(data: CreatePipelineDto): Promise<Pipeline> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Se este pipeline será padrão, desmarcar outros pipelines padrão
    if (data.is_padrao) {
      await withPrismaRetry(async () => {
        return await prisma.pipeline.updateMany({
          where: {
            org_id: orgId,
            is_padrao: true,
          },
          data: {
            is_padrao: false,
          },
        })
      })
    }

    const pipeline = await withPrismaRetry(async () => {
      return await prisma.pipeline.create({
        data: {
          org_id: orgId,
          nome: data.nome,
          descricao: data.descricao || null,
          is_padrao: data.is_padrao || false,
          ordem: data.ordem || 0,
          ativo: true,
        },
        include: {
          etapas: {
            orderBy: {
              ordem: 'asc',
            },
          },
        },
      })
    })

    return pipeline as Pipeline
  }

  async findById(id: string): Promise<Pipeline | null> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    const pipeline = await withPrismaRetry(async () => {
      return await prisma.pipeline.findFirst({
        where: {
          id,
          org_id: orgId,
        },
        include: {
          etapas: {
            orderBy: {
              ordem: 'asc',
            },
          },
        },
      })
    })

    return pipeline as Pipeline | null
  }

  async findAll(): Promise<Pipeline[]> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    const pipelines = await withPrismaRetry(async () => {
      return await prisma.pipeline.findMany({
        where: {
          org_id: orgId,
          ativo: true,
        },
        include: {
          etapas: {
            orderBy: {
              ordem: 'asc',
            },
          },
        },
        orderBy: {
          ordem: 'asc',
        },
      })
    })

    return pipelines as Pipeline[]
  }

  async findPadrao(): Promise<Pipeline | null> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    const pipeline = await withPrismaRetry(async () => {
      return await prisma.pipeline.findFirst({
        where: {
          org_id: orgId,
          is_padrao: true,
          ativo: true,
        },
        include: {
          etapas: {
            orderBy: {
              ordem: 'asc',
            },
          },
        },
      })
    })

    return pipeline as Pipeline | null
  }

  async update(id: string, data: UpdatePipelineDto): Promise<Pipeline> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Se este pipeline será padrão, desmarcar outros pipelines padrão
    if (data.is_padrao) {
      await withPrismaRetry(async () => {
        return await prisma.pipeline.updateMany({
          where: {
            org_id: orgId,
            is_padrao: true,
            id: { not: id },
          },
          data: {
            is_padrao: false,
          },
        })
      })
    }

    const pipeline = await withPrismaRetry(async () => {
      return await prisma.pipeline.update({
        where: { id },
        data: {
          nome: data.nome,
          descricao: data.descricao,
          ativo: data.ativo,
          is_padrao: data.is_padrao,
          ordem: data.ordem,
        },
        include: {
          etapas: {
            orderBy: {
              ordem: 'asc',
            },
          },
        },
      })
    })

    return pipeline as Pipeline
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se há negócios usando este pipeline
    const negociosCount = await withPrismaRetry(async () => {
      return await prisma.negocio.count({
        where: {
          pipeline_id: id,
          org_id: orgId,
        },
      })
    })

    if (negociosCount > 0) {
      throw new Error('Não é possível deletar pipeline com negócios associados')
    }

    await withPrismaRetry(async () => {
      return await prisma.pipeline.delete({
        where: { id },
      })
    })
  }

  // Métodos para Etapas
  async createEtapa(data: CreateEtapaDto): Promise<Etapa> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o pipeline pertence à organização
    const pipeline = await withPrismaRetry(async () => {
      return await prisma.pipeline.findFirst({
        where: {
          id: data.pipeline_id,
          org_id: orgId,
        },
      })
    })

    if (!pipeline) {
      throw new Error('Pipeline não encontrado')
    }

    const etapa = await withPrismaRetry(async () => {
      return await prisma.etapa.create({
        data: {
          pipeline_id: data.pipeline_id,
          nome: data.nome,
          descricao: data.descricao || null,
          cor: data.cor || null,
          ordem: data.ordem || 0,
          probabilidade: data.probabilidade || 0,
          is_final: data.is_final || false,
        },
      })
    })

    return etapa as Etapa
  }

  async updateEtapa(id: string, data: UpdateEtapaDto): Promise<Etapa> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se a etapa pertence à organização
    const etapa = await withPrismaRetry(async () => {
      return await prisma.etapa.findFirst({
        where: {
          id,
          pipeline: {
            org_id: orgId,
          },
        },
      })
    })

    if (!etapa) {
      throw new Error('Etapa não encontrada')
    }

    const updatedEtapa = await withPrismaRetry(async () => {
      return await prisma.etapa.update({
        where: { id },
        data: {
          nome: data.nome,
          descricao: data.descricao,
          cor: data.cor,
          ordem: data.ordem,
          probabilidade: data.probabilidade,
          is_final: data.is_final,
        },
      })
    })

    return updatedEtapa as Etapa
  }

  async deleteEtapa(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se há negócios usando esta etapa
    const negociosCount = await withPrismaRetry(async () => {
      return await prisma.negocio.count({
        where: {
          etapa_id: id,
          org_id: orgId,
        },
      })
    })

    if (negociosCount > 0) {
      throw new Error('Não é possível deletar etapa com negócios associados')
    }

    await withPrismaRetry(async () => {
      return await prisma.etapa.delete({
        where: { id },
      })
    })
  }

  async reorderEtapas(pipelineId: string, etapaIds: string[]): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o pipeline pertence à organização
    const pipeline = await withPrismaRetry(async () => {
      return await prisma.pipeline.findFirst({
        where: {
          id: pipelineId,
          org_id: orgId,
        },
      })
    })

    if (!pipeline) {
      throw new Error('Pipeline não encontrado')
    }

    // Atualizar ordem de cada etapa
    await withPrismaRetry(async () => {
      return await prisma.$transaction(
        etapaIds.map((etapaId, index) =>
          prisma.etapa.update({
            where: { id: etapaId },
            data: { ordem: index },
          })
        )
      )
    })
  }
}

export const pipelineRepository = new PipelineRepository()

