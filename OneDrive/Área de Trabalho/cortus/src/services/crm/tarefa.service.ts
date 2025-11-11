import { tarefaRepository } from '@/repositories/crm/tarefa.repository'
import { CreateTarefaDto, UpdateTarefaDto, Tarefa } from '@/types/crm.types'

export class TarefaService {
  async create(data: CreateTarefaDto): Promise<Tarefa> {
    return tarefaRepository.create(data)
  }

  async findById(id: string): Promise<Tarefa | null> {
    return tarefaRepository.findById(id)
  }

  async findAll(filters?: {
    contato_id?: string
    projeto_id?: string
    responsavel_id?: string
    status?: 'pendente' | 'em_andamento' | 'concluida'
  }): Promise<Tarefa[]> {
    return tarefaRepository.findAll(filters)
  }

  async update(id: string, data: UpdateTarefaDto): Promise<Tarefa> {
    return tarefaRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return tarefaRepository.delete(id)
  }
}

export const tarefaService = new TarefaService()

