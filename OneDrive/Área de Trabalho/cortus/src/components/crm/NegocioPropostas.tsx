"use client";
import { Negocio } from '@/types/crm.types'
import { usePropostas } from '@/hooks/useProposta'
import Link from 'next/link'
import { ArrowRightIcon } from '@/icons'
import Button from '@/components/ui/button/Button'
import { formatCurrency } from '@/lib/utils/format'

interface NegocioPropostasProps {
  negocio: Negocio
}

const statusColors = {
  rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  enviada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  aceita: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  rejeitada: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

const statusLabels = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aceita: 'Aceita',
  rejeitada: 'Rejeitada',
}

export default function NegocioPropostas({ negocio }: NegocioPropostasProps) {
  const { data: propostas = [], isLoading } = usePropostas({
    negocio_id: negocio.id,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
        Propostas ({propostas.length})
      </h3>

      {propostas.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-2">
              Nenhuma proposta encontrada
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              As propostas criadas para este negócio aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {propostas.map((proposta) => (
            <div
              key={proposta.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white/90">
                      Proposta #{proposta.id.slice(0, 8)}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[proposta.status]}`}>
                      {statusLabels[proposta.status]}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white/90 mb-1">
                    {formatCurrency(Number(proposta.valor))}
                  </p>
                  {proposta.validade && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Válida até: {new Date(proposta.validade).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

