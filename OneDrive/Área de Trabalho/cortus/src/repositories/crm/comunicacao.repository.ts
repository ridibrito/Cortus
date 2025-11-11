import { prisma } from '@/lib/prisma/client'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'
import { CreateComunicacaoDto, Comunicacao } from '@/types/crm.types'

export class ComunicacaoRepository {
  async create(data: CreateComunicacaoDto): Promise<Comunicacao> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Preparar dados para criação, garantindo que campos obrigatórios tenham valores
    const createData: any = {
      tipo: data.tipo,
      conteudo: data.conteudo,
      org: {
        connect: { id: orgId },
      },
      origem_id: data.origem_id || null,
      origem_tipo: data.origem_tipo || null,
      destino: data.destino || '',
      canal: data.canal || data.tipo, // Usar tipo como canal padrão se não fornecido
      assunto: data.assunto || null,
      status: data.status || 'enviado',
      metadata: data.metadata || null,
    }
    
    return prisma.comunicacao.create({
      data: createData,
    }) as Comunicacao
  }

  async findAll(filters?: {
    origem_id?: string
    origem_tipo?: string
    tipo?: string
  }): Promise<Comunicacao[]> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    const where: any = {
      org_id: orgId,
    }

    if (filters?.origem_id) {
      where.origem_id = filters.origem_id
    }

    if (filters?.origem_tipo) {
      where.origem_tipo = filters.origem_tipo
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo
    }

    return prisma.comunicacao.findMany({
      where,
      orderBy: {
        data_envio: 'desc',
      },
    }) as Comunicacao[]
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se a comunicação pertence à mesma organização
    const comunicacao = await prisma.comunicacao.findFirst({
      where: {
        id,
        org_id: orgId,
      },
    })

    if (!comunicacao) {
      throw new Error('Comunicação não encontrada')
    }

    await prisma.comunicacao.delete({
      where: { id },
    })
  }
}

export const comunicacaoRepository = new ComunicacaoRepository()

