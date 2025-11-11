"use client";
import { useState } from 'react'
import { Contato } from '@/types/crm.types'
import ContatoTimeline from './ContatoTimeline'
import ContatoNegocios from './ContatoNegocios'
import ContatoPropostas from './ContatoPropostas'
import ContatoDocumentos from './ContatoDocumentos'
import ContatoTarefas from './ContatoTarefas'

interface ContatoDetailRightProps {
  contato: Contato
}

type TabType = 'timeline' | 'negocios' | 'propostas' | 'documentos' | 'tarefas'

export default function ContatoDetailRight({ contato }: ContatoDetailRightProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeline')

  const tabs = [
    { id: 'timeline' as TabType, label: 'Linha do Tempo' },
    { id: 'negocios' as TabType, label: 'Negócios' },
    { id: 'propostas' as TabType, label: 'Propostas' },
    { id: 'documentos' as TabType, label: 'Documentos' },
    { id: 'tarefas' as TabType, label: 'Tarefas' },
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
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'timeline' && <ContatoTimeline contato={contato} />}
        {activeTab === 'negocios' && <ContatoNegocios contato={contato} />}
        {activeTab === 'propostas' && <ContatoPropostas contato={contato} />}
        {activeTab === 'documentos' && <ContatoDocumentos contato={contato} />}
        {activeTab === 'tarefas' && <ContatoTarefas contato={contato} />}
      </div>
    </div>
  )
}

