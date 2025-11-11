"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateNegocioInput, UpdateNegocioInput, Negocio } from '@/types/crm.types'

const API_BASE = '/api/crm/negocios'

async function fetchNegocios(filters?: {
  etapa?: string
  status?: string
  responsavel_id?: string
  contato_id?: string
}): Promise<Negocio[]> {
  const params = new URLSearchParams()
  if (filters?.etapa) params.append('etapa', filters.etapa)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.responsavel_id) params.append('responsavel_id', filters.responsavel_id)
  if (filters?.contato_id) params.append('contato_id', filters.contato_id)

  const response = await fetch(`${API_BASE}?${params.toString()}`)
  if (!response.ok) throw new Error('Erro ao buscar negócios')
  const data = await response.json()
  return data.negocios
}

async function fetchNegocio(id: string): Promise<Negocio> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) throw new Error('Erro ao buscar negócio')
  const data = await response.json()
  return data.negocio
}

async function createNegocio(data: CreateNegocioInput): Promise<Negocio> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar negócio')
  }
  const result = await response.json()
  return result.negocio
}

async function updateNegocio({ id, data }: { id: string; data: UpdateNegocioInput }): Promise<Negocio> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar negócio')
  }
  const result = await response.json()
  return result.negocio
}

async function deleteNegocio(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar negócio')
  }
}

export function useNegocios(filters?: {
  etapa?: string
  status?: string
  responsavel_id?: string
  contato_id?: string
}) {
  return useQuery({
    queryKey: ['negocios', filters],
    queryFn: () => fetchNegocios(filters),
  })
}

export function useNegocio(id: string | null) {
  return useQuery({
    queryKey: ['negocio', id],
    queryFn: () => fetchNegocio(id!),
    enabled: !!id,
  })
}

export function useCreateNegocio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNegocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] })
    },
  })
}

export function useUpdateNegocio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateNegocio,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] })
      queryClient.invalidateQueries({ queryKey: ['negocio', variables.id] })
    },
  })
}

export function useDeleteNegocio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNegocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] })
    },
  })
}

