"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendario, CreateCalendarioDto, UpdateCalendarioDto } from '@/types/crm.types'

const API_BASE = '/api/crm/calendario'

async function fetchEventos(filters?: {
  usuario_id?: string
  tipo?: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
  data_inicio?: Date
  data_fim?: Date
}): Promise<Calendario[]> {
  const params = new URLSearchParams()
  if (filters?.usuario_id) params.append('usuario_id', filters.usuario_id)
  if (filters?.tipo) params.append('tipo', filters.tipo)
  if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio.toISOString())
  if (filters?.data_fim) params.append('data_fim', filters.data_fim.toISOString())

  const response = await fetch(`${API_BASE}?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao buscar eventos' }))
    throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()
  return data.eventos || []
}

async function createEvento(data: CreateCalendarioDto): Promise<Calendario> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar evento')
  }
  const result = await response.json()
  return result.evento
}

export function useEventos(filters?: {
  usuario_id?: string
  tipo?: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
  data_inicio?: Date
  data_fim?: Date
}) {
  return useQuery({
    queryKey: ['eventos', filters],
    queryFn: () => fetchEventos(filters),
  })
}

export function useCreateEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
  })
}

