import { comunicacaoRepository } from '@/repositories/crm/comunicacao.repository'
import { CreateComunicacaoDto, Comunicacao } from '@/types/crm.types'

export class ComunicacaoService {
  async create(data: CreateComunicacaoDto): Promise<Comunicacao> {
    return comunicacaoRepository.create(data)
  }

  async findAll(filters?: {
    origem_id?: string
    origem_tipo?: string
    tipo?: string
  }): Promise<Comunicacao[]> {
    return comunicacaoRepository.findAll(filters)
  }

  async delete(id: string): Promise<void> {
    return comunicacaoRepository.delete(id)
  }
}

export const comunicacaoService = new ComunicacaoService()

