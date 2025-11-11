"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Comunicacao, CreateComunicacaoDto } from '@/types/crm.types'

const API_BASE = '/api/crm/comunicacoes'

async function fetchComunicacoes(filters?: {
  origem_id?: string
  origem_tipo?: string
  tipo?: string
}): Promise<Comunicacao[]> {
  const params = new URLSearchParams()
  if (filters?.origem_id) params.append('origem_id', filters.origem_id)
  if (filters?.origem_tipo) params.append('origem_tipo', filters.origem_tipo)
  if (filters?.tipo) params.append('tipo', filters.tipo)

  const response = await fetch(`${API_BASE}?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar comunicações' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.comunicacoes || []
}

async function createComunicacao(data: CreateComunicacaoDto): Promise<Comunicacao> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar comunicação')
  }
  const result = await response.json()
  return result.comunicacao
}

async function deleteComunicacao(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar comunicação')
  }
}

export function useComunicacoes(filters?: {
  origem_id?: string
  origem_tipo?: string
  tipo?: string
}) {
  return useQuery({
    queryKey: ['comunicacoes', filters],
    queryFn: () => fetchComunicacoes(filters),
  })
}

export function useCreateComunicacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createComunicacao,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comunicacoes'] })
      // Invalidar também a query do contato para atualizar estatísticas
      if (variables.origem_tipo === 'contato' && variables.origem_id) {
        queryClient.invalidateQueries({ queryKey: ['contato', variables.origem_id] })
      }
    },
  })
}

export function useDeleteComunicacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteComunicacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comunicacoes'] })
    },
  })
}

