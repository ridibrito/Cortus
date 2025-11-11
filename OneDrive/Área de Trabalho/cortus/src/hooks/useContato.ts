"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateContatoInput, UpdateContatoInput, Contato } from '@/types/crm.types'

const API_BASE = '/api/crm/contatos'

async function fetchContatoByEmpresaId(empresa_id: string): Promise<Contato | null> {
  const response = await fetch(`/api/crm/contatos/by-empresa/${empresa_id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar contato empresa' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.contato || null
}

async function fetchContatos(filters?: {
  tipo?: 'pessoa' | 'empresa'
  empresa_id?: string
  responsavel_id?: string
  search?: string
}): Promise<Contato[]> {
  const params = new URLSearchParams()
  if (filters?.tipo) params.append('tipo', filters.tipo)
  if (filters?.empresa_id) params.append('empresa_id', filters.empresa_id)
  if (filters?.responsavel_id) params.append('responsavel_id', filters.responsavel_id)
  if (filters?.search) params.append('search', filters.search)

  const url = `${API_BASE}?${params.toString()}`
  console.log('[useContato] Buscando contatos:', url)
  
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar contatos' }))
    console.error('[useContato] Erro na resposta:', { status: response.status, error })
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  console.log('[useContato] Dados recebidos:', {
    hasContatos: !!data.contatos,
    contatosLength: data.contatos?.length || 0,
    contatos: data.contatos?.slice(0, 3).map((c: any) => ({ id: c.id, nome: c.nome, tipo: c.tipo }))
  })
  return data.contatos || []
}

async function fetchContato(id: string): Promise<Contato> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar contato' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.contato
}

async function createContato(data: CreateContatoInput): Promise<Contato> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar contato')
  }
  const result = await response.json()
  return result.contato
}

async function updateContato({ id, data }: { id: string; data: UpdateContatoInput }): Promise<Contato> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar contato')
  }
  const result = await response.json()
  return result.contato
}

async function deleteContato(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar contato')
  }
}

export function useContatoByEmpresaId(empresa_id: string | null | undefined) {
  return useQuery({
    queryKey: ['contato-empresa', empresa_id],
    queryFn: () => fetchContatoByEmpresaId(empresa_id!),
    enabled: !!empresa_id,
  })
}

export function useContatos(filters?: {
  tipo?: 'pessoa' | 'empresa'
  empresa_id?: string
  responsavel_id?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['contatos', filters],
    queryFn: () => fetchContatos(filters),
  })
}

export function useContato(id: string | null) {
  return useQuery({
    queryKey: ['contato', id],
    queryFn: () => fetchContato(id!),
    enabled: !!id,
  })
}

export function useCreateContato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createContato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
    },
  })
}

export function useUpdateContato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateContato,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
      queryClient.invalidateQueries({ queryKey: ['contato', variables.id] })
    },
  })
}

export function useDeleteContato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteContato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
    },
  })
}

