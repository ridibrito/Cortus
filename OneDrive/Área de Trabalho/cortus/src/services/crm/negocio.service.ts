import { NegocioRepository } from '@/repositories/crm/negocio.repository'
import { CreateNegocioDto, UpdateNegocioDto, Negocio } from '@/types/crm.types'

export class NegocioService {
  private repository: NegocioRepository

  constructor() {
    this.repository = new NegocioRepository()
  }

  async createNegocio(data: CreateNegocioDto): Promise<Negocio> {
    // Validações de negócio podem ser adicionadas aqui
    return this.repository.create(data)
  }

  async getNegocioById(id: string): Promise<Negocio | null> {
    return this.repository.findById(id)
  }

  async getAllNegocios(filters?: {
    etapa?: string
    status?: string
    responsavel_id?: string
    contato_id?: string
  }): Promise<Negocio[]> {
    return this.repository.findAll(filters)
  }

  async updateNegocio(id: string, data: UpdateNegocioDto): Promise<Negocio> {
    // Lógica de negócio adicional pode ser adicionada aqui
    return this.repository.update(id, data)
  }

  async deleteNegocio(id: string): Promise<void> {
    // Verificar se o negócio tem propostas ou contratos associados
    return this.repository.delete(id)
  }

  async moveToEtapa(id: string, etapa: 'prospecting' | 'proposal' | 'negotiation' | 'closed'): Promise<Negocio> {
    return this.repository.update(id, { etapa })
  }

  async winNegocio(id: string): Promise<Negocio> {
    return this.repository.update(id, {
      status: 'ganho',
      etapa: 'closed',
    })
  }

  async loseNegocio(id: string, motivo?: string): Promise<Negocio> {
    return this.repository.update(id, {
      status: 'perdido',
      etapa: 'closed',
      observacoes: motivo,
    })
  }

  async updateProbabilidade(id: string, probabilidade: number): Promise<Negocio> {
    if (probabilidade < 0 || probabilidade > 100) {
      throw new Error('Probabilidade deve estar entre 0 e 100')
    }
    return this.repository.update(id, { probabilidade })
  }
}

