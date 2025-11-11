"use client";
import { Contato } from '@/types/crm.types'
import AvatarText from '@/components/ui/avatar/AvatarText'

interface ContatoCardProps {
  contato: Contato
  onDelete?: (id: string) => void
  onEdit?: (contato: Contato) => void
}

const tipoColors = {
  pessoa: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  empresa: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
}

export default function ContatoCard({ contato, onEdit, onDelete }: ContatoCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onEdit?.(contato)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <AvatarText 
              name={contato.nome} 
              avatarUrl={contato.avatar_url}
              className="h-10 w-10 text-sm flex-shrink-0" 
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {contato.nome}
              </h3>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                {contato.email && (
                  <span className="flex items-center gap-1">
                    <span>{contato.email}</span>
                  </span>
                )}
                {contato.telefone && (
                  <span className="flex items-center gap-1">
                    <span>{contato.telefone}</span>
                  </span>
                )}
                {contato.cargo && (
                  <span className="flex items-center gap-1">
                    <span>{contato.cargo}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${tipoColors[contato.tipo]}`}
            >
              {contato.tipo.charAt(0).toUpperCase() + contato.tipo.slice(1)}
            </span>
            {contato.empresa && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {contato.empresa.nome_fantasia}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

