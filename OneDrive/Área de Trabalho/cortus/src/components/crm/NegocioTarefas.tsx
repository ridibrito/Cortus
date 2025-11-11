"use client";
import { Negocio } from '@/types/crm.types'
import { useTarefas } from '@/hooks/useTarefa'
import { formatDateTime } from '@/lib/utils/format'

interface NegocioTarefasProps {
  negocio: Negocio
}

export default function NegocioTarefas({ negocio }: NegocioTarefasProps) {
  const { data: tarefas = [], isLoading } = useTarefas({
    contato_id: negocio.contato_id,
  })

  const tarefasAbertas = tarefas.filter(t => t.status !== 'concluida')

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
        Tarefas em aberto ({tarefasAbertas.length})
      </h3>

      {tarefasAbertas.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-2">
              Nenhuma tarefa agendada
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clique aqui para criar.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tarefasAbertas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white/90 mb-1">
                    {tarefa.titulo}
                  </h4>
                  {tarefa.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {tarefa.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {tarefa.prazo && (
                      <span>
                        Prazo: {formatDateTime(tarefa.prazo)}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full ${
                      tarefa.prioridade === 'alta'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : tarefa.prioridade === 'media'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {tarefa.prioridade}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

