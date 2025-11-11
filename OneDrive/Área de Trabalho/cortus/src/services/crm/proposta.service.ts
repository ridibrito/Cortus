import { PropostaRepository } from '@/repositories/crm/proposta.repository'
import { CreatePropostaDto, UpdatePropostaDto, Proposta } from '@/types/crm.types'

export class PropostaService {
  private repository: PropostaRepository

  constructor() {
    this.repository = new PropostaRepository()
  }

  async createProposta(data: CreatePropostaDto): Promise<Proposta> {
    // Validações de negócio podem ser adicionadas aqui
    return this.repository.create(data)
  }

  async getPropostaById(id: string): Promise<Proposta | null> {
    return this.repository.findById(id)
  }

  async getAllPropostas(filters?: {
    negocio_id?: string
    status?: string
  }): Promise<Proposta[]> {
    return this.repository.findAll(filters)
  }

  async updateProposta(id: string, data: UpdatePropostaDto): Promise<Proposta> {
    // Lógica de negócio adicional pode ser adicionada aqui
    return this.repository.update(id, data)
  }

  async deleteProposta(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async sendProposta(id: string): Promise<Proposta> {
    return this.repository.update(id, {
      status: 'enviada',
    })
  }

  async acceptProposta(id: string): Promise<Proposta> {
    return this.repository.update(id, {
      status: 'aceita',
    })
  }

  async rejectProposta(id: string): Promise<Proposta> {
    return this.repository.update(id, {
      status: 'rejeitada',
    })
  }
}

