"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreatePropostaInput, UpdatePropostaInput, Proposta } from '@/types/crm.types'

const API_BASE = '/api/crm/propostas'

async function fetchPropostas(filters?: {
  negocio_id?: string
  status?: string
}): Promise<Proposta[]> {
  const params = new URLSearchParams()
  if (filters?.negocio_id) params.append('negocio_id', filters.negocio_id)
  if (filters?.status) params.append('status', filters.status)

  const response = await fetch(`${API_BASE}?${params.toString()}`)
  if (!response.ok) throw new Error('Erro ao buscar propostas')
  const data = await response.json()
  return data.propostas
}

async function fetchProposta(id: string): Promise<Proposta> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) throw new Error('Erro ao buscar proposta')
  const data = await response.json()
  return data.proposta
}

async function createProposta(data: CreatePropostaInput): Promise<Proposta> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar proposta')
  }
  const result = await response.json()
  return result.proposta
}

async function updateProposta({ id, data }: { id: string; data: UpdatePropostaInput }): Promise<Proposta> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar proposta')
  }
  const result = await response.json()
  return result.proposta
}

async function deleteProposta(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar proposta')
  }
}

export function usePropostas(filters?: {
  negocio_id?: string
  status?: string
}) {
  return useQuery({
    queryKey: ['propostas', filters],
    queryFn: () => fetchPropostas(filters),
  })
}

export function useProposta(id: string | null) {
  return useQuery({
    queryKey: ['proposta', id],
    queryFn: () => fetchProposta(id!),
    enabled: !!id,
  })
}

export function useCreateProposta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProposta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas'] })
    },
  })
}

export function useUpdateProposta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProposta,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['propostas'] })
      queryClient.invalidateQueries({ queryKey: ['proposta', variables.id] })
    },
  })
}

export function useDeleteProposta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProposta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas'] })
    },
  })
}

