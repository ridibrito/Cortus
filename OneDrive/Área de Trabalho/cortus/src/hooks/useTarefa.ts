"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tarefa, CreateTarefaDto, UpdateTarefaDto } from '@/types/crm.types'

const API_BASE = '/api/crm/tarefas'

async function fetchTarefas(filters?: {
  contato_id?: string
  projeto_id?: string
  responsavel_id?: string
  status?: 'pendente' | 'em_andamento' | 'concluida'
}): Promise<Tarefa[]> {
  const params = new URLSearchParams()
  if (filters?.contato_id) params.append('contato_id', filters.contato_id)
  if (filters?.projeto_id) params.append('projeto_id', filters.projeto_id)
  if (filters?.responsavel_id) params.append('responsavel_id', filters.responsavel_id)
  if (filters?.status) params.append('status', filters.status)

  const response = await fetch(`${API_BASE}?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar tarefas' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.tarefas || []
}

async function fetchTarefa(id: string): Promise<Tarefa> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar tarefa' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.tarefa
}

async function createTarefa(data: CreateTarefaDto): Promise<Tarefa> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    // Se houver mensagem detalhada, usar ela
    const errorMessage = error.message || error.error || `Erro ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }
  const result = await response.json()
  return result.tarefa
}

async function updateTarefa(id: string, data: UpdateTarefaDto): Promise<Tarefa> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar tarefa')
  }
  const result = await response.json()
  return result.tarefa
}

async function deleteTarefa(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar tarefa')
  }
}

export function useTarefas(filters?: {
  contato_id?: string
  projeto_id?: string
  responsavel_id?: string
  status?: 'pendente' | 'em_andamento' | 'concluida'
}) {
  return useQuery({
    queryKey: ['tarefas', filters],
    queryFn: () => fetchTarefas(filters),
  })
}

export function useTarefa(id: string) {
  return useQuery({
    queryKey: ['tarefa', id],
    queryFn: () => fetchTarefa(id),
    enabled: !!id,
  })
}

export function useCreateTarefa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTarefa,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] })
      if (variables.contato_id) {
        queryClient.invalidateQueries({ queryKey: ['contato', variables.contato_id] })
      }
    },
  })
}

export function useUpdateTarefa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTarefaDto }) => updateTarefa(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] })
      queryClient.invalidateQueries({ queryKey: ['tarefa', variables.id] })
    },
  })
}

export function useDeleteTarefa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTarefa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] })
    },
  })
}

