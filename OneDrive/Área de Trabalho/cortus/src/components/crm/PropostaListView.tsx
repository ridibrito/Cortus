"use client";
import { Proposta } from '@/types/crm.types'
import Button from '@/components/ui/button/Button'
import { PencilIcon, TrashBinIcon } from '@/icons'

interface PropostaListViewProps {
  propostas: Proposta[]
  onEdit?: (proposta: Proposta) => void
  onDelete?: (proposta: Proposta) => void
}

const statusColors = {
  rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  enviada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  aceita: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  rejeitada: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

export default function PropostaListView({ propostas, onEdit, onDelete }: PropostaListViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  }

  if (propostas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma proposta encontrada
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Negócio
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Validade
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Criada em
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {propostas.map((proposta) => (
            <tr
              key={proposta.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white/90">
                {proposta.negocio?.lead?.nome || 'Sem negócio'}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white/90">
                {formatCurrency(proposta.valor)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[proposta.status]}`}
                >
                  {proposta.status.charAt(0).toUpperCase() + proposta.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(proposta.validade)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(proposta.created_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(proposta)}
                      className="p-1.5"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(proposta)}
                      className="p-1.5"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

