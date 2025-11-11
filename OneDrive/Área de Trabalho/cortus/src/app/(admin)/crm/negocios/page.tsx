"use client";
import { useState } from 'react'
import { useNegocios } from '@/hooks/useNegocio'
import NegocioKanbanBoard from '@/components/crm/NegocioKanbanBoard'
import NegocioListView from '@/components/crm/NegocioListView'
import NegocioDrawer from '@/components/crm/NegocioDrawer'
import Button from '@/components/ui/button/Button'
import { PlusIcon } from '@/icons'
import { Negocio } from '@/types/crm.types'
import { useQueryClient } from '@tanstack/react-query'

type ViewMode = 'kanban' | 'lista'

export default function NegociosPage() {
  const { data: negocios = [], isLoading, error } = useNegocios()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const queryClient = useQueryClient()

  const handleCreateClick = () => {
    setSelectedNegocio(null)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (negocio: Negocio) => {
    setSelectedNegocio(negocio)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedNegocio(null)
  }

  const handleDrawerSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['negocios'] })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Carregando negócios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar negócios. Tente novamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Negócios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie seus negócios e oportunidades de vendas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Kanban
            </Button>
            <Button
              variant={viewMode === 'lista' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('lista')}
              className="flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Lista
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateClick}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Novo Negócio
          </Button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {viewMode === 'kanban' ? (
          <NegocioKanbanBoard negocios={negocios} onEdit={handleEditClick} />
        ) : (
          <NegocioListView negocios={negocios} onEdit={handleEditClick} />
        )}
      </div>

      <NegocioDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        negocio={selectedNegocio}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  )
}

