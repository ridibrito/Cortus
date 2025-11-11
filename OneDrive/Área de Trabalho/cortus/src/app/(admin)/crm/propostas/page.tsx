"use client";
import { useState } from 'react'
import { usePropostas } from '@/hooks/useProposta'
import PropostaListView from '@/components/crm/PropostaListView'
import PropostaDrawer from '@/components/crm/PropostaDrawer'
import Button from '@/components/ui/button/Button'
import { PlusIcon } from '@/icons'
import { Proposta } from '@/types/crm.types'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteProposta } from '@/hooks/useProposta'

export default function PropostasPage() {
  const { data: propostas = [], isLoading, error } = usePropostas()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null)
  const queryClient = useQueryClient()
  const deletePropostaMutation = useDeleteProposta()

  const handleCreateClick = () => {
    setSelectedProposta(null)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (proposta: Proposta) => {
    setSelectedProposta(proposta)
    setIsDrawerOpen(true)
  }

  const handleDeleteClick = async (proposta: Proposta) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return

    try {
      await deletePropostaMutation.mutateAsync(proposta.id)
      queryClient.invalidateQueries({ queryKey: ['propostas'] })
    } catch (error: any) {
      console.error('Erro ao excluir proposta:', error)
      alert(error.message || 'Erro ao excluir proposta')
    }
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedProposta(null)
  }

  const handleDrawerSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['propostas'] })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Carregando propostas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar propostas. Tente novamente.
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
            Propostas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Crie e gerencie suas propostas comerciais
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateClick}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Nova Proposta
        </Button>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <PropostaListView
          propostas={propostas}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <PropostaDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        proposta={selectedProposta}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  )
}
