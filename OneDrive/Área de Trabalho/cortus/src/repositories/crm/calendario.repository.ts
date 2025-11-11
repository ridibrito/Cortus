import { prisma } from '@/lib/prisma/client'
import { getCurrentUserOrgId, getCurrentUser } from '@/lib/auth/helpers'
import { CreateCalendarioDto, UpdateCalendarioDto, Calendario } from '@/types/crm.types'

export class CalendarioRepository {
  async create(data: CreateCalendarioDto): Promise<Calendario> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }

    // Validar que o usuário existe e pertence à organização
    const user = await prisma.user.findFirst({
      where: {
        id: data.usuario_id,
        org_id: orgId,
      },
    })

    if (!user) {
      throw new Error('Usuário não encontrado ou não pertence à sua organização')
    }

    return prisma.calendario.create({
      data: {
        org_id: orgId,
        usuario_id: data.usuario_id,
        titulo: data.titulo,
        descricao: data.descricao || null,
        data_inicio: new Date(data.data_inicio),
        data_fim: new Date(data.data_fim),
        evento_externo_id: data.evento_externo_id || null,
        tipo: data.tipo || 'evento',
        localizacao: data.localizacao || null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }) as Calendario
  }

  async findById(id: string): Promise<Calendario | null> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    return prisma.calendario.findFirst({
      where: {
        id,
        org_id: orgId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }) as Calendario | null
  }

  async findAll(filters?: {
    usuario_id?: string
    tipo?: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
    data_inicio?: Date
    data_fim?: Date
  }): Promise<Calendario[]> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    const where: any = {
      org_id: orgId,
    }

    if (filters?.usuario_id) {
      where.usuario_id = filters.usuario_id
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo
    }

    if (filters?.data_inicio || filters?.data_fim) {
      where.AND = []
      if (filters.data_inicio) {
        where.AND.push({ data_fim: { gte: filters.data_inicio } })
      }
      if (filters.data_fim) {
        where.AND.push({ data_inicio: { lte: filters.data_fim } })
      }
    }

    return prisma.calendario.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        data_inicio: 'asc',
      },
    }) as Calendario[]
  }

  async update(id: string, data: UpdateCalendarioDto): Promise<Calendario> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se o evento pertence à mesma organização
    const calendario = await prisma.calendario.findFirst({
      where: {
        id,
        org_id: orgId,
      },
    })

    if (!calendario) {
      throw new Error('Evento não encontrado')
    }

    return prisma.calendario.update({
      where: { id },
      data: {
        titulo: data.titulo !== undefined ? data.titulo : calendario.titulo,
        descricao: data.descricao !== undefined ? data.descricao : calendario.descricao,
        data_inicio: data.data_inicio !== undefined ? new Date(data.data_inicio) : calendario.data_inicio,
        data_fim: data.data_fim !== undefined ? new Date(data.data_fim) : calendario.data_fim,
        evento_externo_id: data.evento_externo_id !== undefined ? data.evento_externo_id : calendario.evento_externo_id,
        tipo: data.tipo !== undefined ? data.tipo : calendario.tipo,
        localizacao: data.localizacao !== undefined ? data.localizacao : calendario.localizacao,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    }) as Calendario
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se o evento pertence à mesma organização
    const calendario = await prisma.calendario.findFirst({
      where: {
        id,
        org_id: orgId,
      },
    })

    if (!calendario) {
      throw new Error('Evento não encontrado')
    }

    await prisma.calendario.delete({
      where: { id },
    })
  }
}

export const calendarioRepository = new CalendarioRepository()

