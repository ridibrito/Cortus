import { PipelineRepository, CreatePipelineDto, UpdatePipelineDto, CreateEtapaDto, UpdateEtapaDto } from '@/repositories/crm/pipeline.repository'
import { Pipeline, Etapa } from '@/types/crm.types'

export class PipelineService {
  private repository: PipelineRepository

  constructor() {
    this.repository = new PipelineRepository()
  }

  async createPipeline(data: CreatePipelineDto): Promise<Pipeline> {
    return this.repository.create(data)
  }

  async getPipelineById(id: string): Promise<Pipeline | null> {
    return this.repository.findById(id)
  }

  async getAllPipelines(): Promise<Pipeline[]> {
    return this.repository.findAll()
  }

  async getPipelinePadrao(): Promise<Pipeline | null> {
    return this.repository.findPadrao()
  }

  async updatePipeline(id: string, data: UpdatePipelineDto): Promise<Pipeline> {
    return this.repository.update(id, data)
  }

  async deletePipeline(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  // Métodos para Etapas
  async createEtapa(data: CreateEtapaDto): Promise<Etapa> {
    return this.repository.createEtapa(data)
  }

  async updateEtapa(id: string, data: UpdateEtapaDto): Promise<Etapa> {
    return this.repository.updateEtapa(id, data)
  }

  async deleteEtapa(id: string): Promise<void> {
    return this.repository.deleteEtapa(id)
  }

  async reorderEtapas(pipelineId: string, etapaIds: string[]): Promise<void> {
    return this.repository.reorderEtapas(pipelineId, etapaIds)
  }
}

export const pipelineService = new PipelineService()

