import { empresaRepository } from '@/repositories/crm/empresa.repository'
import { CreateEmpresaDto, UpdateEmpresaDto, Empresa } from '@/types/crm.types'

export class EmpresaService {
  async create(data: CreateEmpresaDto): Promise<Empresa> {
    return empresaRepository.create(data)
  }

  async findById(id: string): Promise<Empresa | null> {
    return empresaRepository.findById(id)
  }

  async findAll(filters?: {
    segmento?: string
    tamanho?: 'pequena' | 'media' | 'grande'
    responsavel_id?: string
    search?: string
  }): Promise<Empresa[]> {
    return empresaRepository.findAll(filters)
  }

  async update(id: string, data: UpdateEmpresaDto): Promise<Empresa> {
    return empresaRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return empresaRepository.delete(id)
  }
}

export const empresaService = new EmpresaService()

