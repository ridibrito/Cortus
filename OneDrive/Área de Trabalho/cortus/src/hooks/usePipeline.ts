"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pipeline, Etapa } from '@/types/crm.types'

const API_BASE_PIPELINES = '/api/crm/pipelines'
const API_BASE_ETAPAS = '/api/crm/etapas'

async function fetchPipelines(): Promise<Pipeline[]> {
  const response = await fetch(API_BASE_PIPELINES)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar pipelines' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.pipelines || []
}

async function fetchPipeline(id: string): Promise<Pipeline> {
  const response = await fetch(`${API_BASE_PIPELINES}/${id}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar pipeline' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.pipeline
}

async function createPipeline(data: { nome: string; descricao?: string; is_padrao?: boolean; ordem?: number }): Promise<Pipeline> {
  const response = await fetch(API_BASE_PIPELINES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar pipeline')
  }
  const result = await response.json()
  return result.pipeline
}

async function updatePipeline({ id, data }: { id: string; data: Partial<Pipeline> }): Promise<Pipeline> {
  const response = await fetch(`${API_BASE_PIPELINES}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar pipeline')
  }
  const result = await response.json()
  return result.pipeline
}

async function deletePipeline(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_PIPELINES}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar pipeline')
  }
}

async function createEtapa(data: { pipeline_id: string; nome: string; descricao?: string; cor?: string; ordem?: number; probabilidade?: number; is_final?: boolean }): Promise<Etapa> {
  const response = await fetch(API_BASE_ETAPAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar etapa')
  }
  const result = await response.json()
  return result.etapa
}

async function updateEtapa({ id, data }: { id: string; data: Partial<Etapa> }): Promise<Etapa> {
  const response = await fetch(`${API_BASE_ETAPAS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar etapa')
  }
  const result = await response.json()
  return result.etapa
}

async function deleteEtapa(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_ETAPAS}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar etapa')
  }
}

async function reorderEtapas(pipelineId: string, etapaIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_ETAPAS}?action=reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pipeline_id: pipelineId, etapa_ids: etapaIds }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao reordenar etapas')
  }
}

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: fetchPipelines,
  })
}

export function usePipeline(id: string | null) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => fetchPipeline(id!),
    enabled: !!id,
  })
}

export function useCreatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePipeline,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.id] })
    },
  })
}

export function useDeletePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useCreateEtapa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEtapa,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipeline_id] })
    },
  })
}

export function useUpdateEtapa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEtapa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useDeleteEtapa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEtapa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useReorderEtapas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pipelineId, etapaIds }: { pipelineId: string; etapaIds: string[] }) =>
      reorderEtapas(pipelineId, etapaIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipelineId] })
    },
  })
}

