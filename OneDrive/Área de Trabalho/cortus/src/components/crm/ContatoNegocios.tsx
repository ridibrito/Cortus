"use client";
import { Contato } from '@/types/crm.types'
import { useNegocios } from '@/hooks/useNegocio'
import Button from '@/components/ui/button/Button'
import { PlusIcon, ArrowRightIcon } from '@/icons'
import Link from 'next/link'
import { useState } from 'react'
import NegocioDrawer from './NegocioDrawer'
import { formatCurrency } from '@/lib/utils/format'
import { useQueryClient } from '@tanstack/react-query'

interface ContatoNegociosProps {
  contato: Contato
}

const etapaLabels = {
  prospecting: 'Prospecção',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed: 'Fechado',
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

export default function ContatoNegocios({ contato }: ContatoNegociosProps) {
  const { data: negocios = [], isLoading } = useNegocios({ contato_id: contato.id })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const queryClient = useQueryClient()
  
  // Os negócios já vêm filtrados pela API
  const negociosDoContato = negocios

  const handleDrawerSuccess = () => {
    // Invalidar queries de negócios para atualizar a lista
    queryClient.invalidateQueries({ queryKey: ['negocios'] })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
          Negócios ({negociosDoContato.length})
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsDrawerOpen(true)}
          startIcon={<PlusIcon className="w-4 h-4" />}
        >
          Novo Negócio
        </Button>
      </div>

      {negociosDoContato.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-2">
              Nenhum negócio encontrado
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Comece criando o primeiro negócio para este contato e acompanhe todo o processo de vendas.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              startIcon={<PlusIcon className="w-4 h-4" />}
            >
              Criar Primeiro Negócio
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {negociosDoContato.map((negocio) => (
            <div
              key={negocio.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white/90 mb-1">
                    {negocio.contato?.nome || 'Negócio'}
                  </h4>
                  <p className="text-lg font-bold text-gray-900 dark:text-white/90">
                    {formatCurrency(Number(negocio.valor))}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[negocio.status]}`}>
                  {statusLabels[negocio.status]}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {etapaLabels[negocio.etapa]} • {negocio.probabilidade}% probabilidade
                </span>
                <Link href={`/crm/negocios/${negocio.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    endIcon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    Ver Negócio
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <NegocioDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        contatoId={contato.id}
        empresaId={contato.empresa_id || undefined}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  )
}

