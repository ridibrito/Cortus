"use client";
import { Negocio } from '@/types/crm.types'
import { UserCircleIcon } from '@/icons'

interface NegocioKanbanCardProps {
  negocio: Negocio
  onEdit?: (negocio: Negocio) => void
}

const statusColors = {
  aberto: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  ganho: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  perdido: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

export default function NegocioKanbanCard({ negocio, onEdit }: NegocioKanbanCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div
      className="p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onEdit?.(negocio)}
    >
      <div className="flex items-start gap-2">
        <div className="p-1.5 bg-green-100 rounded-md dark:bg-green-900/20 flex-shrink-0">
          <UserCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {negocio.contato?.nome || 'Sem contato'}
          </h4>
          {negocio.empresa && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
              {negocio.empresa.nome_fantasia}
            </p>
          )}
          <p className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">
            {formatCurrency(negocio.valor)}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[negocio.status]}`}
            >
              {negocio.status.charAt(0).toUpperCase() + negocio.status.slice(1)}
            </span>
            {negocio.probabilidade > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {negocio.probabilidade}%
              </span>
            )}
          </div>
          {negocio.responsavel && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
              {negocio.responsavel.nome}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

