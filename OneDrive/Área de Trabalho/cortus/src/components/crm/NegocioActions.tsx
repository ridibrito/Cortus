"use client";
import { Negocio } from '@/types/crm.types'
import Button from '@/components/ui/button/Button'
import { useUpdateNegocio } from '@/hooks/useNegocio'
import { useRouter } from 'next/navigation'

interface NegocioActionsProps {
  negocio: Negocio
  onSuccess?: () => void
}

export default function NegocioActions({ negocio, onSuccess }: NegocioActionsProps) {
  const updateNegocioMutation = useUpdateNegocio()
  const router = useRouter()

  const handleWin = async () => {
    if (!confirm('Tem certeza que deseja marcar este negócio como ganho?')) return

    try {
      await updateNegocioMutation.mutateAsync({
        id: negocio.id,
        data: {
          status: 'ganho',
          etapa: 'closed',
        },
      })
      onSuccess?.()
    } catch (error: any) {
      console.error('Erro ao ganhar negócio:', error)
      alert(error.message || 'Erro ao atualizar negócio')
    }
  }

  const handleLose = async () => {
    if (!confirm('Tem certeza que deseja marcar este negócio como perdido?')) return

    try {
      await updateNegocioMutation.mutateAsync({
        id: negocio.id,
        data: {
          status: 'perdido',
          etapa: 'closed',
        },
      })
      onSuccess?.()
    } catch (error: any) {
      console.error('Erro ao perder negócio:', error)
      alert(error.message || 'Erro ao atualizar negócio')
    }
  }

  const handleReschedule = () => {
    // TODO: Implementar funcionalidade de remanejar negócio
    alert('Funcionalidade de remanejar negócio em desenvolvimento')
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={handleWin}
        className="bg-green-600 hover:bg-green-700 text-white"
        disabled={negocio.status === 'ganho' || updateNegocioMutation.isPending}
      >
        Ganhar
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleLose}
        className="bg-red-600 hover:bg-red-700 text-white"
        disabled={negocio.status === 'perdido' || updateNegocioMutation.isPending}
      >
        Perder
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReschedule}
        disabled={updateNegocioMutation.isPending}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Remanejar negócio
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={updateNegocioMutation.isPending}
      >
        Opções
      </Button>
    </div>
  )
}

