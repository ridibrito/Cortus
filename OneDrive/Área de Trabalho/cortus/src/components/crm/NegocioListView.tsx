"use client";
import React from 'react'
import { Negocio } from '@/types/crm.types'
import { formatCurrency } from '@/lib/utils/format'
import Link from 'next/link'
import Button from '@/components/ui/button/Button'
import { ArrowRightIcon } from '@/icons'
import AvatarText from '@/components/ui/avatar/AvatarText'

interface NegocioListViewProps {
  negocios: Negocio[]
  onEdit?: (negocio: Negocio) => void
}

const statusColors = {
  aberto: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  ganho: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  perdido: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

const statusLabels = {
  aberto: 'Em Andamento',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

const etapaLabels: Record<string, string> = {
  prospecting: 'Prospecção',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed: 'Fechado',
}

export default function NegocioListView({ negocios, onEdit }: NegocioListViewProps) {
  if (negocios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum negócio encontrado
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {negocios.map((negocio) => (
        <div
          key={negocio.id}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <AvatarText
                name={negocio.contato?.nome || 'Sem contato'}
                avatarUrl={negocio.contato?.avatar_url}
                className="w-10 h-10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white/90">
                    {negocio.contato?.nome || 'Sem contato'}
                  </h4>
                  {negocio.empresa && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      • {negocio.empresa.nome_fantasia}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valor:
                    </span>
                    <span className="ml-1 text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(negocio.valor)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Etapa:
                    </span>
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                      {negocio.etapa_rel?.nome || etapaLabels[negocio.etapa] || negocio.etapa}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Probabilidade:
                    </span>
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                      {negocio.probabilidade}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[negocio.status]}`}
              >
                {statusLabels[negocio.status]}
              </span>
              <Link href={`/crm/negocios/${negocio.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  endIcon={<ArrowRightIcon className="w-4 h-4" />}
                >
                  Ver Detalhes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

