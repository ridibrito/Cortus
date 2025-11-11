"use client";
import { useState, useMemo } from 'react'
import { Negocio } from '@/types/crm.types'
import { useComunicacoes, useDeleteComunicacao } from '@/hooks/useComunicacoes'
import { useTarefas } from '@/hooks/useTarefa'
import { usePropostas } from '@/hooks/useProposta'
import InteracaoTabs from './InteracaoTabs'
import { useQueryClient } from '@tanstack/react-query'
import { TrashBinIcon, EnvelopeIcon, PaperPlaneIcon } from '@/icons'
import { formatCurrency } from '@/lib/utils/format'

interface NegocioTimelineProps {
  negocio: Negocio
}

// Função para formatar data relativa
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'há alguns segundos'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `há ${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'}`
}

// Função para formatar data completa
function formatFullDate(date: Date): string {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${dayName}, ${day} de ${month} às ${hours}:${minutes}`
}

const tipoIcons: Record<string, React.ReactNode> = {
  criacao_contato: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  criacao_negocio: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  email: <EnvelopeIcon className="w-5 h-5" />,
  ligacao: <PaperPlaneIcon className="w-5 h-5" />,
  reuniao: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  proposta: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  tarefa: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
}

const tipoLabels: Record<string, string> = {
  criacao_contato: 'Contato Criado',
  criacao_negocio: 'Negócio Criado',
  email: 'Nota de E-mail',
  ligacao: 'Nota de Ligação',
  reuniao: 'Nota de Reunião',
  proposta: 'Proposta',
  tarefa: 'Tarefa',
}

interface TimelineItem {
  id: string
  tipo: string
  conteudo: string
  assunto?: string | null
  destino?: string | null
  data_envio: Date
  podeDeletar?: boolean
  valor?: number
  status?: string
}

export default function NegocioTimeline({ negocio }: NegocioTimelineProps) {
  const queryClient = useQueryClient()
  
  // Buscar comunicações do contato (antes do negócio)
  const { data: comunicacoesContato = [], isLoading: isLoadingComunicacoesContato } = useComunicacoes({
    origem_id: negocio.contato_id,
    origem_tipo: 'contato',
  })

  // Buscar comunicações do negócio
  const { data: comunicacoesNegocio = [], isLoading: isLoadingComunicacoesNegocio } = useComunicacoes({
    origem_id: negocio.id,
    origem_tipo: 'negocio',
  })

  // Buscar tarefas do contato
  const { data: tarefasContato = [], isLoading: isLoadingTarefasContato } = useTarefas({
    contato_id: negocio.contato_id,
  })

  // Buscar propostas do negócio
  const { data: propostas = [], isLoading: isLoadingPropostas } = usePropostas({
    negocio_id: negocio.id,
  })

  const deleteComunicacaoMutation = useDeleteComunicacao()

  const isLoading = isLoadingComunicacoesContato || isLoadingComunicacoesNegocio || isLoadingTarefasContato || isLoadingPropostas

  // Criar evento de criação do contato (se o contato existir)
  const eventoCriacaoContato: TimelineItem | null = negocio.contato ? {
    id: `criacao-contato-${negocio.contato_id}`,
    tipo: 'criacao_contato',
    conteudo: `Contato ${negocio.contato.tipo === 'empresa' ? 'empresa' : 'pessoa'} criado${negocio.contato.responsavel ? ` por ${negocio.contato.responsavel.nome}` : ''}`,
    data_envio: new Date(negocio.contato.created_at),
    podeDeletar: false,
  } : null

  // Criar evento de criação do negócio
  const eventoCriacaoNegocio: TimelineItem = {
    id: `criacao-negocio-${negocio.id}`,
    tipo: 'criacao_negocio',
    conteudo: `Negócio criado${negocio.responsavel ? ` por ${negocio.responsavel.nome}` : ''}${negocio.valor > 0 ? ` com valor de ${formatCurrency(negocio.valor)}` : ''}`,
    data_envio: new Date(negocio.created_at),
    podeDeletar: false,
  }

  // Combinar todos os eventos em uma timeline unificada
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = []

    // Adicionar criação do contato (se existir e for antes do negócio)
    if (eventoCriacaoContato && eventoCriacaoContato.data_envio < eventoCriacaoNegocio.data_envio) {
      items.push(eventoCriacaoContato)
    }

    // Adicionar comunicações do contato (antes do negócio)
    comunicacoesContato
      .filter(c => new Date(c.data_envio) < eventoCriacaoNegocio.data_envio)
      .forEach(c => {
        items.push({
          id: c.id,
          tipo: c.tipo,
          conteudo: c.conteudo,
          assunto: c.assunto,
          destino: c.destino,
          data_envio: new Date(c.data_envio),
          podeDeletar: true,
        })
      })

    // Adicionar tarefas do contato (antes do negócio)
    tarefasContato
      .filter(t => new Date(t.created_at) < eventoCriacaoNegocio.data_envio)
      .forEach(t => {
        items.push({
          id: `tarefa-${t.id}`,
          tipo: 'tarefa',
          conteudo: `Tarefa criada: ${t.titulo}${t.descricao ? ` - ${t.descricao}` : ''}`,
          data_envio: new Date(t.created_at),
          podeDeletar: false,
        })
      })

    // Adicionar criação do negócio
    items.push(eventoCriacaoNegocio)

    // Adicionar comunicações do negócio
    comunicacoesNegocio.forEach(c => {
      items.push({
        id: c.id,
        tipo: c.tipo,
        conteudo: c.conteudo,
        assunto: c.assunto,
        destino: c.destino,
        data_envio: new Date(c.data_envio),
        podeDeletar: true,
      })
    })

    // Adicionar tarefas do contato (depois do negócio)
    tarefasContato
      .filter(t => new Date(t.created_at) >= eventoCriacaoNegocio.data_envio)
      .forEach(t => {
        items.push({
          id: `tarefa-${t.id}`,
          tipo: 'tarefa',
          conteudo: `Tarefa criada: ${t.titulo}${t.descricao ? ` - ${t.descricao}` : ''}`,
          data_envio: new Date(t.created_at),
          podeDeletar: false,
        })
      })

    // Adicionar propostas
    propostas.forEach(p => {
      items.push({
        id: `proposta-${p.id}`,
        tipo: 'proposta',
        conteudo: `Proposta #${p.id.slice(0, 8)} ${p.status === 'aceita' ? 'aceita' : p.status === 'rejeitada' ? 'rejeitada' : 'criada'}${p.valor ? ` no valor de ${formatCurrency(Number(p.valor))}` : ''}`,
        data_envio: new Date(p.created_at),
        podeDeletar: false,
        valor: Number(p.valor),
        status: p.status,
      })
    })

    // Ordenar do mais recente para o mais antigo (mais recente no topo)
    return items.sort((a, b) => b.data_envio.getTime() - a.data_envio.getTime())
  }, [comunicacoesContato, comunicacoesNegocio, tarefasContato, propostas, eventoCriacaoContato, eventoCriacaoNegocio])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta interação?')) {
      try {
        await deleteComunicacaoMutation.mutateAsync(id)
        queryClient.invalidateQueries({ queryKey: ['comunicacoes'] })
      } catch (error) {
        console.error('Erro ao deletar interação:', error)
      }
    }
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['comunicacoes'] })
    queryClient.invalidateQueries({ queryKey: ['tarefas'] })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs para registrar notas e criar tarefas */}
      <InteracaoTabs 
        contatoId={negocio.contato_id} 
        negocioId={negocio.id}
        onSuccess={handleSuccess} 
      />

      {/* Subtabs do histórico */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border-b-2 border-purple-500">
          Histórico completo
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Interações
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Filtrar
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Modificações
        </button>
      </div>

      {/* Timeline com linha vertical */}
      {timelineItems.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-2">
              Nenhuma atividade registrada
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registre interações, crie tarefas ou adicione propostas para começar a construir o histórico deste negócio.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          
          <div className="space-y-6">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Ícone com linha */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.tipo === 'criacao_contato' || item.tipo === 'criacao_negocio'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : item.tipo === 'proposta'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : item.tipo === 'tarefa'
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {tipoIcons[item.tipo] || tipoIcons.email}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 pb-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {negocio.empresa && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {negocio.empresa.nome_fantasia || negocio.empresa.razao_social}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFullDate(item.data_envio)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-1">
                          {tipoLabels[item.tipo] || item.tipo}
                        </h4>
                        {item.assunto && (
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {item.assunto}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {item.conteudo}
                        </p>
                        {item.valor && (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">
                            {formatCurrency(item.valor)}
                          </p>
                        )}
                        {item.status && (
                          <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'aceita'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : item.status === 'rejeitada'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      {item.podeDeletar && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatRelativeTime(item.data_envio)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

