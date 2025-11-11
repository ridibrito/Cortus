import { prisma } from '@/lib/prisma/client'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'
import { CreateTarefaDto, UpdateTarefaDto, Tarefa } from '@/types/crm.types'

export class TarefaRepository {
  async create(data: CreateTarefaDto): Promise<Tarefa> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      console.error('[TarefaRepository.create] orgId é null ou undefined')
      throw new Error('Organização não encontrada. Verifique sua autenticação. Se o problema persistir, verifique se o Prisma Client foi regenerado corretamente.')
    }

    // Validar que pelo menos projeto_id ou contato_id seja fornecido
    if (!data.projeto_id && !data.contato_id) {
      throw new Error('É necessário fornecer projeto_id ou contato_id')
    }

    // Se projeto_id foi fornecido, verificar se existe e pertence à organização
    if (data.projeto_id) {
      const projeto = await prisma.projeto.findFirst({
        where: {
          id: data.projeto_id,
          org_id: orgId,
        },
      })

      if (!projeto) {
        throw new Error('Projeto não encontrado ou não pertence à sua organização')
      }
    }

    // Se contato_id foi fornecido, verificar se existe e pertence à organização
    if (data.contato_id) {
      const contato = await prisma.contato.findFirst({
        where: {
          id: data.contato_id,
          org_id: orgId,
        },
      })

      if (!contato) {
        throw new Error('Contato não encontrado ou não pertence à sua organização')
      }
    }

    // Se responsavel_id foi fornecido, verificar se existe e pertence à organização
    if (data.responsavel_id) {
      const responsavel = await prisma.user.findFirst({
        where: {
          id: data.responsavel_id,
          org_id: orgId,
        },
      })

      if (!responsavel) {
        throw new Error('Responsável não encontrado ou não pertence à sua organização')
      }
    }

    const createData: any = {
      org_id: orgId,
      titulo: data.titulo,
      descricao: data.descricao || null,
      prioridade: data.prioridade || 'media',
      status: data.status || 'pendente',
      prazo: data.prazo ? new Date(data.prazo) : null,
    }

    // Adicionar projeto se fornecido
    if (data.projeto_id) {
      createData.projeto = {
        connect: { id: data.projeto_id },
      }
    }

    // Adicionar contato se fornecido
    if (data.contato_id) {
      createData.contato = {
        connect: { id: data.contato_id },
      }
    }

    // Adicionar responsável se fornecido
    if (data.responsavel_id) {
      createData.responsavel = {
        connect: { id: data.responsavel_id },
      }
    }

    return prisma.tarefa.create({
      data: createData,
      include: {
        contato: true,
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }) as Tarefa
  }

  async findById(id: string): Promise<Tarefa | null> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    return prisma.tarefa.findFirst({
      where: {
        id,
        org_id: orgId,
      },
      include: {
        contato: true,
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }) as Tarefa | null
  }

  async findAll(filters?: {
    contato_id?: string
    projeto_id?: string
    responsavel_id?: string
    status?: 'pendente' | 'em_andamento' | 'concluida'
  }): Promise<Tarefa[]> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    const where: any = {
      org_id: orgId,
    }

    if (filters?.contato_id) {
      where.contato_id = filters.contato_id
    }

    if (filters?.projeto_id) {
      where.projeto_id = filters.projeto_id
    }

    if (filters?.responsavel_id) {
      where.responsavel_id = filters.responsavel_id
    }

    if (filters?.status) {
      where.status = filters.status
    }

    return prisma.tarefa.findMany({
      where,
      include: {
        contato: true,
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
    }) as Tarefa[]
  }

  async update(id: string, data: UpdateTarefaDto): Promise<Tarefa> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se a tarefa pertence à mesma organização
    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id,
        org_id: orgId,
      },
    })

    if (!tarefa) {
      throw new Error('Tarefa não encontrada')
    }

    // Validar projeto_id se fornecido
    if (data.projeto_id) {
      const projeto = await prisma.projeto.findFirst({
        where: {
          id: data.projeto_id,
          org_id: orgId,
        },
      })

      if (!projeto) {
        throw new Error('Projeto não encontrado ou não pertence à sua organização')
      }
    }

    // Validar contato_id se fornecido
    if (data.contato_id) {
      const contato = await prisma.contato.findFirst({
        where: {
          id: data.contato_id,
          org_id: orgId,
        },
      })

      if (!contato) {
        throw new Error('Contato não encontrado ou não pertence à sua organização')
      }
    }

    // Validar responsavel_id se fornecido
    if (data.responsavel_id) {
      const responsavel = await prisma.user.findFirst({
        where: {
          id: data.responsavel_id,
          org_id: orgId,
        },
      })

      if (!responsavel) {
        throw new Error('Responsável não encontrado ou não pertence à sua organização')
      }
    }

    const updateData: any = {
      titulo: data.titulo !== undefined ? data.titulo : tarefa.titulo,
      descricao: data.descricao !== undefined ? data.descricao : tarefa.descricao,
      prioridade: data.prioridade !== undefined ? data.prioridade : tarefa.prioridade,
      status: data.status !== undefined ? data.status : tarefa.status,
      prazo: data.prazo !== undefined ? (data.prazo ? new Date(data.prazo) : null) : tarefa.prazo,
      concluida_em: data.concluida_em !== undefined ? (data.concluida_em ? new Date(data.concluida_em) : null) : tarefa.concluida_em,
    }

    // Atualizar projeto se fornecido
    if (data.projeto_id !== undefined) {
      if (data.projeto_id) {
        updateData.projeto = {
          connect: { id: data.projeto_id },
        }
      } else {
        updateData.projeto = {
          disconnect: true,
        }
      }
    }

    // Atualizar contato se fornecido
    if (data.contato_id !== undefined) {
      if (data.contato_id) {
        updateData.contato = {
          connect: { id: data.contato_id },
        }
      } else {
        updateData.contato = {
          disconnect: true,
        }
      }
    }

    // Atualizar responsável se fornecido
    if (data.responsavel_id !== undefined) {
      if (data.responsavel_id) {
        updateData.responsavel = {
          connect: { id: data.responsavel_id },
        }
      } else {
        updateData.responsavel = {
          disconnect: true,
        }
      }
    }

    return prisma.tarefa.update({
      where: { id },
      data: updateData,
      include: {
        contato: true,
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }) as Tarefa
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se a tarefa pertence à mesma organização
    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id,
        org_id: orgId,
      },
    })

    if (!tarefa) {
      throw new Error('Tarefa não encontrada')
    }

    await prisma.tarefa.delete({
      where: { id },
    })
  }
}

export const tarefaRepository = new TarefaRepository()

