"use client";
import { useState } from 'react'
import { Negocio } from '@/types/crm.types'
import NegocioTimeline from './NegocioTimeline'
import NegocioPropostas from './NegocioPropostas'
import NegocioTarefas from './NegocioTarefas'
import NegocioDocumentos from './NegocioDocumentos'
import { usePropostas } from '@/hooks/useProposta'

interface NegocioDetailRightProps {
  negocio: Negocio
}

type TabType = 'timeline' | 'propostas' | 'vendas' | 'documentos' | 'tarefas' | 'anexos' | 'formularios'

export default function NegocioDetailRight({ negocio }: NegocioDetailRightProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeline')
  const { data: propostas = [] } = usePropostas({ negocio_id: negocio.id })
  const propostasCount = propostas.length

  const tabs = [
    { id: 'timeline' as TabType, label: 'Linha do tempo' },
    { id: 'propostas' as TabType, label: 'Propostas', count: propostasCount },
    { id: 'vendas' as TabType, label: 'Vendas' },
    { id: 'documentos' as TabType, label: 'Documentos' },
    { id: 'tarefas' as TabType, label: 'Tarefas' },
    { id: 'anexos' as TabType, label: 'Anexos' },
    { id: 'formularios' as TabType, label: 'Formulários externos' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'timeline' && <NegocioTimeline negocio={negocio} />}
        {activeTab === 'propostas' && <NegocioPropostas negocio={negocio} />}
        {activeTab === 'vendas' && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Módulo de vendas em desenvolvimento</p>
          </div>
        )}
        {activeTab === 'documentos' && <NegocioDocumentos negocio={negocio} />}
        {activeTab === 'tarefas' && <NegocioTarefas negocio={negocio} />}
        {activeTab === 'anexos' && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Módulo de anexos em desenvolvimento</p>
          </div>
        )}
        {activeTab === 'formularios' && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Módulo de formulários externos em desenvolvimento</p>
          </div>
        )}
      </div>
    </div>
  )
}

