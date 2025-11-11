"use client";
import { useState } from 'react'
import { useContatos } from '@/hooks/useContato'
import ContatoListView from '@/components/crm/ContatoListView'
import ContatoDrawer from '@/components/crm/ContatoDrawer'
import Button from '@/components/ui/button/Button'
import { PlusIcon } from '@/icons'
import { Contato } from '@/types/crm.types'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteContato } from '@/hooks/useContato'
import Input from '@/components/form/input/InputField'

type TabType = 'pessoa' | 'empresa'

export default function ContatosPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pessoa')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: contatosPessoa = [], isLoading: isLoadingPessoa, error: errorPessoa } = useContatos({
    tipo: 'pessoa',
    search: searchTerm || undefined,
  })
  const { data: contatosEmpresa = [], isLoading: isLoadingEmpresa, error: errorEmpresa } = useContatos({
    tipo: 'empresa',
    search: searchTerm || undefined,
  })

  // Logs para debug
  console.log('[ContatosPage] Estado:', {
    contatosPessoa: contatosPessoa.length,
    contatosEmpresa: contatosEmpresa.length,
    isLoadingPessoa,
    isLoadingEmpresa,
    errorPessoa,
    errorEmpresa,
    activeTab
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedContato, setSelectedContato] = useState<Contato | null>(null)
  const queryClient = useQueryClient()
  const deleteContatoMutation = useDeleteContato()

  const isLoading = activeTab === 'pessoa' ? isLoadingPessoa : isLoadingEmpresa
  const error = activeTab === 'pessoa' ? errorPessoa : errorEmpresa
  const contatos = activeTab === 'pessoa' ? contatosPessoa : contatosEmpresa

  const handleCreateClick = () => {
    setSelectedContato(null)
    setIsDrawerOpen(true)
  }

  const handleEditClick = (contato: Contato) => {
    setSelectedContato(contato)
    setIsDrawerOpen(true)
  }

  const handleDeleteClick = async (contato: Contato) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return

    try {
      await deleteContatoMutation.mutateAsync(contato.id)
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
    } catch (error: any) {
      console.error('Erro ao excluir contato:', error)
      alert(error.message || 'Erro ao excluir contato')
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      // Excluir cada contato sequencialmente
      for (const id of ids) {
        await deleteContatoMutation.mutateAsync(id)
      }
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
    } catch (error: any) {
      console.error('Erro ao excluir contatos:', error)
      alert(error.message || 'Erro ao excluir contatos')
    }
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedContato(null)
  }

  const handleDrawerSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['contatos'] })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Carregando contatos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar contatos. Tente novamente.
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
            Contatos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie seus contatos e empresas
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateClick}
          className="flex items-center gap-2"
          type="button"
        >
          <PlusIcon className="w-4 h-4" />
          {activeTab === 'empresa' ? 'Nova Empresa' : 'Novo Contato'}
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Buscar contatos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pessoa')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pessoa'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Pessoas Físicas ({contatosPessoa.length})
          </button>
          <button
            onClick={() => setActiveTab('empresa')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'empresa'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Empresas ({contatosEmpresa.length})
          </button>
        </nav>
      </div>

      {/* Tabela */}
      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <ContatoListView
          contatos={contatos}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      <ContatoDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        contato={selectedContato}
        onSuccess={handleDrawerSuccess}
        tipoInicial={activeTab}
      />
    </div>
  )
}
