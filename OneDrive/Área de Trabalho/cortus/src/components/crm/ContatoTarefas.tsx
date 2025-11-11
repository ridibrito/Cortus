"use client";
import { useState } from 'react'
import { Contato } from '@/types/crm.types'
import { useTarefas, useCreateTarefa, useUpdateTarefa, useDeleteTarefa } from '@/hooks/useTarefa'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import TextArea from '@/components/form/input/TextArea'

interface ContatoTarefasProps {
  contato: Contato
}

const tarefaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  prazo: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
})

type TarefaFormData = z.infer<typeof tarefaSchema>

const prioridadeColors = {
  baixa: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  alta: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const statusColors = {
  pendente: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  concluida: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ContatoTarefas({ contato }: ContatoTarefasProps) {
  const [showForm, setShowForm] = useState(false)
  const { data: tarefas = [], isLoading, refetch } = useTarefas({ contato_id: contato.id })
  const createTarefaMutation = useCreateTarefa()
  const updateTarefaMutation = useUpdateTarefa()
  const deleteTarefaMutation = useDeleteTarefa()

  const form = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      prazo: '',
      prioridade: 'media',
    },
  })

  const onSubmit = async (data: TarefaFormData) => {
    try {
      await createTarefaMutation.mutateAsync({
        contato_id: contato.id,
        titulo: data.titulo,
        descricao: data.descricao || undefined,
        prioridade: data.prioridade || 'media',
        status: 'pendente',
        prazo: data.prazo || undefined,
      })
      form.reset()
      setShowForm(false)
      refetch()
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error)
      alert(error.message || 'Erro ao criar tarefa')
    }
  }

  const handleToggleStatus = async (tarefaId: string, currentStatus: string) => {
    try {
      let newStatus: 'pendente' | 'em_andamento' | 'concluida'
      if (currentStatus === 'pendente') {
        newStatus = 'em_andamento'
      } else if (currentStatus === 'em_andamento') {
        newStatus = 'concluida'
      } else {
        newStatus = 'pendente'
      }

      await updateTarefaMutation.mutateAsync({
        id: tarefaId,
        data: {
          status: newStatus,
          concluida_em: newStatus === 'concluida' ? new Date().toISOString() : undefined,
        },
      })
      refetch()
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error)
      alert(error.message || 'Erro ao atualizar tarefa')
    }
  }

  const handleDelete = async (tarefaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      await deleteTarefaMutation.mutateAsync(tarefaId)
      refetch()
    } catch (error: any) {
      console.error('Erro ao excluir tarefa:', error)
      alert(error.message || 'Erro ao excluir tarefa')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          Tarefas ({tarefas.length})
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Nova Tarefa'}
        </Button>
      </div>

      {showForm && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Título da Tarefa *</Label>
              <Input
                placeholder="Ex: Ligar para o cliente amanhã"
                {...form.register('titulo')}
                error={form.formState.errors.titulo?.message}
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <TextArea
                rows={3}
                placeholder="Descreva a tarefa..."
                {...form.register('descricao')}
                error={form.formState.errors.descricao?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prazo</Label>
                <Input
                  type="datetime-local"
                  {...form.register('prazo')}
                  error={form.formState.errors.prazo?.message}
                />
              </div>
              <div>
                <Label>Prioridade</Label>
                <select
                  {...form.register('prioridade')}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.reset()
                  setShowForm(false)
                }}
                disabled={createTarefaMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createTarefaMutation.isPending}
              >
                {createTarefaMutation.isPending ? 'Salvando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Carregando tarefas...</p>
        </div>
      ) : tarefas.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Nenhuma tarefa encontrada para este contato.</p>
          <p className="text-xs mt-2">Clique em "Nova Tarefa" para criar uma.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tarefas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white/90">
                      {tarefa.titulo}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${prioridadeColors[tarefa.prioridade]}`}
                    >
                      {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[tarefa.status]}`}
                    >
                      {tarefa.status === 'pendente'
                        ? 'Pendente'
                        : tarefa.status === 'em_andamento'
                        ? 'Em Andamento'
                        : 'Concluída'}
                    </span>
                  </div>

                  {tarefa.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {tarefa.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {tarefa.prazo && (
                      <span>
                        Prazo: {formatDate(tarefa.prazo)}
                      </span>
                    )}
                    {tarefa.responsavel && (
                      <span>Responsável: {tarefa.responsavel.nome}</span>
                    )}
                    {tarefa.concluida_em && (
                      <span>
                        Concluída em: {formatDate(tarefa.concluida_em)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(tarefa.id, tarefa.status)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    disabled={updateTarefaMutation.isPending}
                  >
                    {tarefa.status === 'pendente'
                      ? 'Iniciar'
                      : tarefa.status === 'em_andamento'
                      ? 'Concluir'
                      : 'Reabrir'}
                  </button>
                  <button
                    onClick={() => handleDelete(tarefa.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    disabled={deleteTarefaMutation.isPending}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
