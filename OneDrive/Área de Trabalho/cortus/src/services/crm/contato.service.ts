import { contatoRepository } from '@/repositories/crm/contato.repository'
import { CreateContatoDto, UpdateContatoDto, Contato } from '@/types/crm.types'

export class ContatoService {
  async create(data: CreateContatoDto): Promise<Contato> {
    return contatoRepository.create(data)
  }

  async findById(id: string): Promise<Contato | null> {
    return contatoRepository.findById(id)
  }

  async findAll(filters?: {
    tipo?: 'pessoa' | 'empresa'
    empresa_id?: string
    responsavel_id?: string
    search?: string
  }): Promise<Contato[]> {
    return contatoRepository.findAll(filters)
  }

  async update(id: string, data: UpdateContatoDto): Promise<Contato> {
    return contatoRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return contatoRepository.delete(id)
  }
}

export const contatoService = new ContatoService()

