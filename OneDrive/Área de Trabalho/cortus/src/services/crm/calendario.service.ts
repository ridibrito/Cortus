import { calendarioRepository } from '@/repositories/crm/calendario.repository'
import { CreateCalendarioDto, UpdateCalendarioDto, Calendario } from '@/types/crm.types'

export class CalendarioService {
  async create(data: CreateCalendarioDto): Promise<Calendario> {
    return calendarioRepository.create(data)
  }

  async findById(id: string): Promise<Calendario | null> {
    return calendarioRepository.findById(id)
  }

  async findAll(filters?: {
    usuario_id?: string
    tipo?: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
    data_inicio?: Date
    data_fim?: Date
  }): Promise<Calendario[]> {
    return calendarioRepository.findAll(filters)
  }

  async update(id: string, data: UpdateCalendarioDto): Promise<Calendario> {
    return calendarioRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return calendarioRepository.delete(id)
  }
}

export const calendarioService = new CalendarioService()

