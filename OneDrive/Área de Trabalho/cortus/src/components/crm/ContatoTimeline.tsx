"use client";
import { useState, useMemo } from 'react'
import { Contato } from '@/types/crm.types'
import { TrashBinIcon, EnvelopeIcon, PaperPlaneIcon } from '@/icons'
import { useComunicacoes, useDeleteComunicacao } from '@/hooks/useComunicacoes'
import InteracaoTabs from './InteracaoTabs'
import { useQueryClient } from '@tanstack/react-query'

// Função simples para formatar data relativa
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

interface ContatoTimelineProps {
  contato: Contato
}

const tipoIcons: Record<string, React.ReactNode> = {
  criacao: (
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
}

const tipoLabels: Record<string, string> = {
  criacao: 'Contato Criado',
  email: 'Nota de E-mail',
  ligacao: 'Nota de Ligação',
  reuniao: 'Nota de Reunião',
}

interface TimelineItem {
  id: string
  tipo: string
  conteudo: string
  assunto?: string | null
  destino?: string | null
  data_envio: Date
  podeDeletar?: boolean
}

export default function ContatoTimeline({ contato }: ContatoTimelineProps) {
  const queryClient = useQueryClient()
  const { data: comunicacoes = [], isLoading } = useComunicacoes({
    origem_id: contato.id,
    origem_tipo: 'contato',
  })
  const deleteComunicacaoMutation = useDeleteComunicacao()

  // Criar evento de criação do contato
  const eventoCriacao: TimelineItem = {
    id: `criacao-${contato.id}`,
    tipo: 'criacao',
    conteudo: `Contato ${contato.tipo === 'empresa' ? 'empresa' : 'pessoa'} criado${contato.responsavel ? ` por ${contato.responsavel.nome}` : ''}`,
    data_envio: new Date(contato.created_at),
    podeDeletar: false,
  }

  // Combinar eventos: criação + comunicações, ordenados por data (mais recente primeiro)
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [
      eventoCriacao,
      ...comunicacoes.map(c => ({
        id: c.id,
        tipo: c.tipo,
        conteudo: c.conteudo,
        assunto: c.assunto,
        destino: c.destino,
        data_envio: new Date(c.data_envio),
        podeDeletar: true,
      })),
    ]
    
    // Ordenar do mais recente para o mais antigo (mais recente no topo)
    return items.sort((a, b) => b.data_envio.getTime() - a.data_envio.getTime())
  }, [comunicacoes, eventoCriacao])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta interação?')) {
      try {
        await deleteComunicacaoMutation.mutateAsync(id)
      } catch (error) {
        console.error('Erro ao deletar interação:', error)
      }
    }
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['comunicacoes'] })
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          Linha do Tempo ({timelineItems.length})
        </h3>
      </div>

      {/* Tabs para registrar notas e criar tarefas */}
      <InteracaoTabs contatoId={contato.id} onSuccess={handleSuccess} />

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
              Nenhuma interação registrada
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use as abas acima para registrar notas sobre e-mails, ligações, reuniões ou criar tarefas.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-0">
          {/* Linha vertical da timeline */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
          
          <div className="space-y-4 relative z-0">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative flex items-start gap-4 z-0">
                {/* Ponto na linha */}
                <div className={`relative z-0 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 ${
                  item.tipo === 'criacao'
                    ? 'bg-green-500 text-white'
                    : item.tipo === 'email'
                    ? 'bg-blue-500 text-white'
                    : item.tipo === 'ligacao'
                    ? 'bg-orange-500 text-white'
                    : item.tipo === 'reuniao'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {tipoIcons[item.tipo] || tipoIcons.criacao}
                </div>
                
                {/* Conteúdo do evento */}
                <div className={`flex-1 z-0 ${
                  index === timelineItems.length - 1 ? '' : 'pb-4'
                }`}>
                  <div className={`p-4 rounded-lg z-0 ${
                    item.tipo === 'criacao'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
                            {tipoLabels[item.tipo] || item.tipo}
                          </span>
                          {item.assunto && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              • {item.assunto}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                          {item.conteudo}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {formatRelativeTime(item.data_envio)}
                          </span>
                          {item.destino && (
                            <>
                              <span>•</span>
                              <span>{item.destino}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {item.podeDeletar && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Excluir interação"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      )}
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
