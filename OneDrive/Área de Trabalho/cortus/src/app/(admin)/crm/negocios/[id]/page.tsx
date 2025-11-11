"use client";
import { use } from 'react'
import { useNegocio } from '@/hooks/useNegocio'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button/Button'
import { ChevronLeftIcon } from '@/icons'
import NegocioDetailLeft from '@/components/crm/NegocioDetailLeft'
import NegocioDetailRight from '@/components/crm/NegocioDetailRight'
import NegocioWorkflow from '@/components/crm/NegocioWorkflow'
import NegocioActions from '@/components/crm/NegocioActions'
import { useQueryClient } from '@tanstack/react-query'
import AvatarText from '@/components/ui/avatar/AvatarText'

interface NegocioDetailPageProps {
  params: Promise<{ id: string }>
}

export default function NegocioDetailPage({ params }: NegocioDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: negocio, isLoading, error } = useNegocio(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando negócio...</p>
      </div>
    )
  }

  if (error || !negocio) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/crm/negocios')}
          startIcon={<ChevronLeftIcon className="w-4 h-4" />}
        >
          Voltar para Negócios
        </Button>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            {error ? 'Erro ao carregar negócio' : 'Negócio não encontrado'}
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

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['negocio', id] })
    queryClient.invalidateQueries({ queryKey: ['negocios'] })
  }

  const handleEtapaChange = async (etapa: string) => {
    // TODO: Implementar mudança de etapa
    console.log('Mudar etapa para:', etapa)
  }

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/crm/negocios')}
          startIcon={<ChevronLeftIcon className="w-4 h-4" />}
        >
          Voltar
        </Button>
      </div>

      {/* Header do Negócio */}
      <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {negocio.contato ? (
              <AvatarText 
                name={negocio.contato.tipo === 'empresa' 
                  ? (negocio.contato.nome_fantasia || negocio.contato.nome)
                  : negocio.contato.nome} 
                avatarUrl={negocio.contato.avatar_url}
                className="h-12 w-12 text-lg flex-shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                {(negocio.contato?.nome?.charAt(0) || 'N').toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {negocio.contato?.tipo === 'empresa' 
                  ? (negocio.contato.nome_fantasia || negocio.contato.nome)
                  : negocio.contato?.nome || 'Negócio'}
              </h1>
              {negocio.contato?.tipo === 'empresa' && negocio.contato.razao_social && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {negocio.contato.razao_social}
                </p>
              )}
              {negocio.empresa && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {negocio.empresa.nome_fantasia || negocio.empresa.razao_social}
                  </span>
                </div>
              )}
            </div>
          </div>
          <NegocioActions negocio={negocio} onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Workflow Bar */}
      <NegocioWorkflow negocio={negocio} onEtapaChange={handleEtapaChange} />

      {/* Layout de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        {/* Coluna Esquerda - Dados do Negócio */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <NegocioDetailLeft negocio={negocio} />
        </div>

        {/* Coluna Direita - Timeline e Interações */}
        <div>
          <NegocioDetailRight negocio={negocio} />
        </div>
      </div>
    </div>
  )
}
