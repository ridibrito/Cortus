"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateEmpresaInput, UpdateEmpresaInput, Empresa } from '@/types/crm.types'

const API_BASE = '/api/crm/empresas'

async function fetchEmpresas(filters?: {
  segmento?: string
  tamanho?: 'pequena' | 'media' | 'grande'
  responsavel_id?: string
  search?: string
}): Promise<Empresa[]> {
  const params = new URLSearchParams()
  if (filters?.segmento) params.append('segmento', filters.segmento)
  if (filters?.tamanho) params.append('tamanho', filters.tamanho)
  if (filters?.responsavel_id) params.append('responsavel_id', filters.responsavel_id)
  if (filters?.search) params.append('search', filters.search)

  const response = await fetch(`${API_BASE}?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar empresas' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.empresas || []
}

async function fetchEmpresa(id: string): Promise<Empresa> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) throw new Error('Erro ao buscar empresa')
  const data = await response.json()
  return data.empresa
}

async function createEmpresa(data: CreateEmpresaInput): Promise<Empresa> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar empresa')
  }
  const result = await response.json()
  return result.empresa
}

async function updateEmpresa({ id, data }: { id: string; data: UpdateEmpresaInput }): Promise<Empresa> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar empresa')
  }
  const result = await response.json()
  return result.empresa
}

async function deleteEmpresa(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar empresa')
  }
}

export function useEmpresas(filters?: {
  segmento?: string
  tamanho?: 'pequena' | 'media' | 'grande'
  responsavel_id?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['empresas', filters],
    queryFn: () => fetchEmpresas(filters),
  })
}

export function useEmpresa(id: string | null) {
  return useQuery({
    queryKey: ['empresa', id],
    queryFn: () => fetchEmpresa(id!),
    enabled: !!id,
  })
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmpresa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
    },
  })
}

export function useUpdateEmpresa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmpresa,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      queryClient.invalidateQueries({ queryKey: ['empresa', variables.id] })
    },
  })
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEmpresa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
    },
  })
}

