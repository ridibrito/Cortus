"use client";
import { Negocio } from '@/types/crm.types'

interface NegocioWorkflowProps {
  negocio: Negocio
  onEtapaChange?: (etapa: string) => void
}

const etapas = [
  { id: 'lead', label: 'Lead' },
  { id: 'tentando_contato', label: 'Tentando contato' },
  { id: 'em_contato', label: 'Em contato' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'reuniao_diagnostico', label: 'Reunião / Diagnóstico' },
  { id: 'negociacao_proposta', label: 'Negociação & Proposta' },
  { id: 'assinatura_contrato', label: 'Assinatura de contrato' },
]

const etapaMap: Record<string, string> = {
  prospecting: 'qualificacao',
  proposal: 'negociacao_proposta',
  negotiation: 'negociacao_proposta',
  closed: 'assinatura_contrato',
}

export default function NegocioWorkflow({ negocio, onEtapaChange }: NegocioWorkflowProps) {
  const etapaAtual = etapaMap[negocio.etapa] || 'qualificacao'
  const etapaIndex = etapas.findIndex(e => e.id === etapaAtual)

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        {etapas.map((etapa, index) => {
          const isActive = index === etapaIndex
          const isCompleted = index < etapaIndex
          const isUpcoming = index > etapaIndex

          return (
            <div key={etapa.id} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEtapaChange?.(etapa.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : isCompleted
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-white text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {etapa.label}
              </button>
              {index < etapas.length - 1 && (
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${
                    isCompleted
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

