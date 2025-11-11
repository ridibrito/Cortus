"use client";
import { Empresa } from '@/types/crm.types'
import Button from '@/components/ui/button/Button'
import { PencilIcon, TrashBinIcon } from '@/icons'

interface EmpresaListViewProps {
  empresas: Empresa[]
  onEdit?: (empresa: Empresa) => void
  onDelete?: (empresa: Empresa) => void
}

const tamanhoColors = {
  pequena: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  grande: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

export default function EmpresaListView({ empresas, onEdit, onDelete }: EmpresaListViewProps) {
  if (empresas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma empresa encontrada
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
              Nome Fantasia
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Razão Social
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              CNPJ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Segmento
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Tamanho
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Cidade
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {empresas.map((empresa) => (
            <tr
              key={empresa.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white/90">
                {empresa.nome_fantasia}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {empresa.razao_social || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {empresa.cnpj || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {empresa.segmento || '-'}
              </td>
              <td className="px-4 py-3">
                {empresa.tamanho && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${tamanhoColors[empresa.tamanho]}`}
                  >
                    {empresa.tamanho.charAt(0).toUpperCase() + empresa.tamanho.slice(1)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {empresa.cidade || '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(empresa)}
                      className="p-1.5"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(empresa)}
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

