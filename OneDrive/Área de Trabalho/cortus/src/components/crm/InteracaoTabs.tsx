"use client";
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import TextArea from '@/components/form/input/TextArea'
import { useCreateComunicacao } from '@/hooks/useComunicacoes'
import { useCreateTarefa } from '@/hooks/useTarefa'
import { useCreateEvento } from '@/hooks/useCalendario'
import { useAuth } from '@/context/AuthContext'
import { CreateComunicacaoDto } from '@/types/crm.types'
import { EnvelopeIcon, PaperPlaneIcon } from '@/icons'

interface InteracaoTabsProps {
  contatoId?: string
  negocioId?: string
  onSuccess?: () => void
}

const notaSchema = z.object({
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
})

const tarefaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  prazo: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
})

type NotaFormData = z.infer<typeof notaSchema>
type TarefaFormData = z.infer<typeof tarefaSchema>

const tiposInteracao = [
  {
    tipo: 'nota_email' as const,
    label: 'Nota de E-mail',
    icon: <EnvelopeIcon className="w-4 h-4" />,
    cor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    tipo: 'nota_ligacao' as const,
    label: 'Nota de Ligação',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    cor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    tipo: 'nota_reuniao' as const,
    label: 'Nota de Reunião',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    cor: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  },
  {
    tipo: 'tarefa' as const,
    label: 'Criar Tarefa',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    cor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
]

export default function InteracaoTabs({ contatoId, negocioId, onSuccess }: InteracaoTabsProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null)
  const createComunicacaoMutation = useCreateComunicacao()
  const createTarefaMutation = useCreateTarefa()
  const createEventoMutation = useCreateEvento()
  const { userProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTarefa = tipoSelecionado === 'tarefa'
  
  // Determinar origem_id e origem_tipo
  const origemId = negocioId || contatoId
  const origemTipo = negocioId ? 'negocio' : 'contato'

  const notaForm = useForm<NotaFormData>({
    resolver: zodResolver(notaSchema),
    defaultValues: {
      conteudo: '',
    },
  })

  const tarefaForm = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      prazo: '',
      prioridade: 'media',
    },
  })

  const onSubmitNota = async (data: NotaFormData) => {
    if (!tipoSelecionado || tipoSelecionado === 'tarefa') return

    try {
      setIsSubmitting(true)
      
      // Mapear tipo de nota para tipo de comunicação
      const tipoComunicacao = tipoSelecionado.replace('nota_', '') as 'email' | 'ligacao' | 'reuniao'
      
      const comunicacaoData: CreateComunicacaoDto = {
        tipo: tipoComunicacao,
        origem_id: origemId,
        origem_tipo: origemTipo,
        conteudo: data.conteudo,
        canal: tipoComunicacao,
        status: 'enviado',
      }

      await createComunicacaoMutation.mutateAsync(comunicacaoData)
      notaForm.reset()
      setTipoSelecionado(null)
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao criar nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitTarefa = async (data: TarefaFormData) => {
    if (!userProfile?.id) {
      alert('Erro: Usuário não encontrado. Faça login novamente.')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Criar a tarefa
      const tarefaData = {
        contato_id: contatoId || undefined,
        titulo: data.titulo,
        descricao: data.descricao || undefined,
        prioridade: data.prioridade || 'media',
        status: 'pendente' as const,
        prazo: data.prazo || undefined, // O schema Zod vai converter automaticamente
      }

      const tarefa = await createTarefaMutation.mutateAsync(tarefaData)

      // Se há prazo, criar evento no calendário
      if (data.prazo) {
        const prazoDate = new Date(data.prazo)
        const dataFim = new Date(prazoDate.getTime() + 60 * 60 * 1000) // Adiciona 1 hora

        await createEventoMutation.mutateAsync({
          usuario_id: userProfile.id,
          titulo: data.titulo,
          descricao: data.descricao || undefined,
          data_inicio: prazoDate.toISOString(),
          data_fim: dataFim.toISOString(),
          tipo: 'tarefa',
        })
      }

      tarefaForm.reset()
      setTipoSelecionado(null)
      onSuccess?.()
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error)
      alert(error.message || 'Erro ao criar tarefa. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    notaForm.reset()
    tarefaForm.reset()
    setTipoSelecionado(null)
  }

  return (
    <div className="space-y-4">
      {/* Tabs com ícones */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tiposInteracao.map((tipo) => (
          <button
            key={tipo.tipo}
            onClick={() => setTipoSelecionado(tipo.tipo)}
            className={`flex flex-col items-center gap-1.5 px-2.5 py-2 rounded-lg border-2 transition-all min-w-[90px] ${
              tipoSelecionado === tipo.tipo
                ? `${tipo.cor} border-current`
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={tipoSelecionado === tipo.tipo ? tipo.cor : 'text-gray-500 dark:text-gray-400'}>
              {tipo.icon}
            </div>
            <span className={`text-xs font-medium text-center ${
              tipoSelecionado === tipo.tipo
                ? 'text-current'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {tipo.label}
            </span>
          </button>
        ))}
      </div>

      {/* Formulário quando um tipo é selecionado */}
      {tipoSelecionado && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          {isTarefa ? (
            <form onSubmit={tarefaForm.handleSubmit(onSubmitTarefa)} className="space-y-4">
              <div>
                <Label>Título da Tarefa *</Label>
                <Input
                  placeholder="Ex: Ligar para o cliente amanhã"
                  {...tarefaForm.register('titulo')}
                  error={tarefaForm.formState.errors.titulo?.message}
                />
                {tarefaForm.formState.errors.titulo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {tarefaForm.formState.errors.titulo.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Descrição da Tarefa</Label>
                <TextArea
                  rows={4}
                  placeholder="Descreva a tarefa em detalhes..."
                  {...tarefaForm.register('descricao')}
                  error={tarefaForm.formState.errors.descricao?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prazo</Label>
                  <Input
                    type="datetime-local"
                    {...tarefaForm.register('prazo')}
                    error={tarefaForm.formState.errors.prazo?.message}
                  />
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <select
                    {...tarefaForm.register('prioridade')}
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
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Criar Tarefa'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={notaForm.handleSubmit(onSubmitNota)} className="space-y-4">
              <div>
                <Label>Registrar {tiposInteracao.find(t => t.tipo === tipoSelecionado)?.label}</Label>
                <TextArea
                  rows={4}
                  placeholder="Registre o que aconteceu nesta interação..."
                  {...notaForm.register('conteudo')}
                  error={notaForm.formState.errors.conteudo?.message}
                />
                {notaForm.formState.errors.conteudo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {notaForm.formState.errors.conteudo.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
