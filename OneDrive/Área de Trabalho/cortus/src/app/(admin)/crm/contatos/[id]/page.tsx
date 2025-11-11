"use client";
import { use } from 'react'
import { useContato } from '@/hooks/useContato'
import ContatoDetailLeft from '@/components/crm/ContatoDetailLeft'
import ContatoDetailRight from '@/components/crm/ContatoDetailRight'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button/Button'
import { ChevronLeftIcon } from '@/icons'

interface ContatoDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ContatoDetailPage({ params }: ContatoDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: contato, isLoading, error } = useContato(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando contato...</p>
      </div>
    )
  }

  if (error || !contato) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/crm/contatos')}
          startIcon={<ChevronLeftIcon className="w-4 h-4" />}
        >
          Voltar para Contatos
        </Button>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            {error ? 'Erro ao carregar contato' : 'Contato não encontrado'}
          </p>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {error.message || 'Tente novamente mais tarde.'}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/crm/contatos')}
          startIcon={<ChevronLeftIcon className="w-4 h-4" />}
        >
          Voltar
        </Button>
      </div>

      {/* Layout de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        {/* Coluna Esquerda - Dados do Contato */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ContatoDetailLeft contato={contato} />
        </div>

        {/* Coluna Direita - Timeline e Interações */}
        <div>
          <ContatoDetailRight contato={contato} />
        </div>
      </div>
    </div>
  )
}

