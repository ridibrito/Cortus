"use client";
import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createNegocioSchema, updateNegocioSchema, CreateNegocioInput, UpdateNegocioInput } from '@/lib/validations/crm.schema'
import { useCreateNegocio, useUpdateNegocio, useDeleteNegocio } from '@/hooks/useNegocio'
import { useContatos, useCreateContato } from '@/hooks/useContato'
import { Negocio } from '@/types/crm.types'
import Drawer from '@/components/ui/drawer/Drawer'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import TextArea from '@/components/form/input/TextArea'
import Select from '@/components/form/Select'
import { useState } from 'react'
import { formatCurrencyInput, parseCurrency } from '@/lib/utils/format'
import { PlusIcon } from '@/icons'

interface NegocioDrawerProps {
  isOpen: boolean
  onClose: () => void
  negocio?: Negocio | null
  onSuccess?: () => void
  contatoId?: string
  empresaId?: string
}

export default function NegocioDrawer({ isOpen, onClose, negocio, onSuccess, contatoId, empresaId }: NegocioDrawerProps) {
  const isEditMode = !!negocio
  const createNegocioMutation = useCreateNegocio()
  const updateNegocioMutation = useUpdateNegocio()
  const deleteNegocioMutation = useDeleteNegocio()
  const createContatoMutation = useCreateContato()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCreateContato, setShowCreateContato] = useState(false)
  const [newContatoNome, setNewContatoNome] = useState('')
  const [newContatoEmail, setNewContatoEmail] = useState('')
  const [newContatoTelefone, setNewContatoTelefone] = useState('')
  const [isCreatingContato, setIsCreatingContato] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { data: contatos = [], refetch: refetchContatos } = useContatos()
  const { data: empresas = [] } = useContatos({ tipo: 'empresa' })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateNegocioInput | UpdateNegocioInput>({
    resolver: zodResolver(isEditMode ? updateNegocioSchema : createNegocioSchema),
    mode: 'onChange',
  })

  const etapaValue = watch('etapa')
  const statusValue = watch('status')
  const contatoIdValue = watch('contato_id')
  const valorValue = watch('valor')
  const [valorFormatado, setValorFormatado] = useState('')

  // Sincronizar valor formatado quando valor muda
  useEffect(() => {
    if (valorValue !== undefined && valorValue !== null) {
      if (valorValue > 0) {
        setValorFormatado(formatCurrencyInput(valorValue))
      } else {
        setValorFormatado('')
      }
    }
  }, [valorValue])

  // Quando um contato é selecionado, sugerir empresa automaticamente
  useEffect(() => {
    if (contatoIdValue && !isEditMode) {
      const contatoSelecionado = contatos.find(c => c.id === contatoIdValue)
      if (contatoSelecionado?.empresa_id) {
        setValue('empresa_id', contatoSelecionado.empresa_id)
      }
    }
  }, [contatoIdValue, contatos, setValue, isEditMode])

  // Reset form when negocio changes
  useEffect(() => {
    if (negocio) {
      reset({
        contato_id: negocio.contato_id,
        empresa_id: negocio.empresa_id || '',
        valor: negocio.valor,
        etapa: negocio.etapa,
        status: negocio.status,
        probabilidade: negocio.probabilidade || 0,
        observacoes: negocio.observacoes || '',
        responsavel_id: negocio.responsavel_id || '',
      })
    } else {
      reset({
        contato_id: contatoId || '',
        empresa_id: empresaId || '',
        valor: 0,
        etapa: 'prospecting',
        probabilidade: 0,
        observacoes: '',
        responsavel_id: '',
      })
      setValorFormatado('')
    }
  }, [negocio, reset, isOpen, contatoId, empresaId])

  const onSubmit = async (data: CreateNegocioInput | UpdateNegocioInput) => {
    try {
      if (isEditMode && negocio) {
        await updateNegocioMutation.mutateAsync({
          id: negocio.id,
          data: data as UpdateNegocioInput,
        })
      } else {
        if (!data.contato_id) {
          alert('Contato é obrigatório')
          return
        }
        await createNegocioMutation.mutateAsync(data as CreateNegocioInput)
      }
      
      onSuccess?.()
      onClose()
      reset()
    } catch (error: any) {
      console.error('Erro ao salvar negócio:', error)
      alert(error.message || 'Erro ao salvar negócio')
    }
  }

  const handleDelete = async () => {
    if (!negocio || !confirm('Tem certeza que deseja excluir este negócio?')) return

    setIsDeleting(true)
    try {
      await deleteNegocioMutation.mutateAsync(negocio.id)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao excluir negócio:', error)
      alert(error.message || 'Erro ao excluir negócio')
    } finally {
      setIsDeleting(false)
    }
  }

  const contatoOptions = contatos.map(contato => ({
    value: contato.id,
    label: `${contato.nome}${contato.email ? ` (${contato.email})` : ''}${contato.empresa ? ` - ${contato.empresa.nome_fantasia}` : ''}`,
  }))

  const empresaOptions = empresas.map(empresa => ({
    value: empresa.id,
    label: empresa.nome_fantasia || empresa.nome,
  }))

  const etapaOptions = [
    { value: 'prospecting', label: 'Prospecção' },
    { value: 'proposal', label: 'Proposta' },
    { value: 'negotiation', label: 'Negociação' },
    { value: 'closed', label: 'Fechado' },
  ]

  const statusOptions = [
    { value: 'aberto', label: 'Aberto' },
    { value: 'ganho', label: 'Ganho' },
    { value: 'perdido', label: 'Perdido' },
  ]

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Negócio' : 'Novo Negócio'}
      footer={
        <div className="flex items-center justify-between w-full">
          {isEditMode && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isSubmitting || createNegocioMutation.isPending || updateNegocioMutation.isPending}
            >
              {isSubmitting || createNegocioMutation.isPending || updateNegocioMutation.isPending
                ? 'Salvando...'
                : isEditMode
                ? 'Salvar Alterações'
                : 'Criar Negócio'}
            </Button>
          </div>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isEditMode && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>
                Contato <span className="text-error-500">*</span>
              </Label>
              {!showCreateContato && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateContato(true)}
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Criar Contato
                </Button>
              )}
            </div>
            
            {showCreateContato ? (
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Criar Novo Contato
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateContato(false)
                      setNewContatoNome('')
                      setNewContatoEmail('')
                      setNewContatoTelefone('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
                <div>
                  <Label>Nome <span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="Nome do contato"
                    value={newContatoNome}
                    onChange={(e) => setNewContatoNome(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newContatoEmail}
                    onChange={(e) => setNewContatoEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={newContatoTelefone}
                    onChange={(e) => setNewContatoTelefone(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    if (!newContatoNome.trim()) {
                      alert('Nome é obrigatório')
                      return
                    }
                    setIsCreatingContato(true)
                    try {
                      const novoContato = await createContatoMutation.mutateAsync({
                        nome: newContatoNome,
                        email: newContatoEmail || undefined,
                        telefone: newContatoTelefone || undefined,
                        tipo: 'pessoa',
                      })
                      await refetchContatos()
                      setValue('contato_id', novoContato.id)
                      setShowCreateContato(false)
                      setNewContatoNome('')
                      setNewContatoEmail('')
                      setNewContatoTelefone('')
                    } catch (error: any) {
                      alert(error.message || 'Erro ao criar contato')
                    } finally {
                      setIsCreatingContato(false)
                    }
                  }}
                  disabled={isCreatingContato || !newContatoNome.trim()}
                >
                  {isCreatingContato ? 'Criando...' : 'Criar e Selecionar'}
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Select
                    options={contatoOptions}
                    placeholder="Selecione um contato"
                    value={contatoIdValue || ''}
                    onChange={(value) => setValue('contato_id', value)}
                    disabled={!!contatoId}
                  />
                </div>
                {contatoId && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Contato pré-selecionado: {contatos.find(c => c.id === contatoId)?.nome}
                  </p>
                )}
                {errors.contato_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.contato_id.message as string}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div>
          <Label>Empresa</Label>
          <div className="relative">
            <Select
              options={empresaOptions}
              placeholder="Selecione uma empresa (opcional)"
              value={watch('empresa_id') || ''}
              onChange={(value) => setValue('empresa_id', value)}
            />
          </div>
          {errors.empresa_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.empresa_id.message as string}
            </p>
          )}
          {contatoIdValue && !isEditMode && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {contatos.find(c => c.id === contatoIdValue)?.empresa 
                ? `Empresa sugerida: ${contatos.find(c => c.id === contatoIdValue)?.empresa?.nome_fantasia}`
                : 'O contato selecionado não possui empresa vinculada'}
            </p>
          )}
        </div>

        <div>
          <Label>
            Valor <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              R$
            </span>
            <Input
              type="text"
              placeholder="0,00"
              value={valorFormatado}
              onChange={(e) => {
                const inputValue = e.target.value
                // Remove tudo exceto números
                const cleaned = inputValue.replace(/\D/g, '')
                
                if (cleaned === '') {
                  setValorFormatado('')
                  setValue('valor', 0)
                  return
                }
                
                // Converte para número (centavos para reais)
                const numValue = parseFloat(cleaned) / 100
                
                // Formata o valor
                const formatted = formatCurrencyInput(numValue)
                setValorFormatado(formatted)
                
                // Atualiza o valor numérico no form
                setValue('valor', numValue, { shouldValidate: true })
              }}
              className="pl-10"
            />
          </div>
          {errors.valor && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.valor.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Etapa</Label>
          <div className="relative">
            <Select
              options={etapaOptions}
              placeholder="Selecione a etapa"
              value={etapaValue || 'prospecting'}
              onChange={(value) => setValue('etapa', value as any)}
            />
          </div>
          {errors.etapa && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.etapa.message as string}
            </p>
          )}
        </div>

        {isEditMode && (
          <div>
            <Label>Status</Label>
            <div className="relative">
              <Select
                options={statusOptions}
                placeholder="Selecione o status"
                value={statusValue || 'aberto'}
                onChange={(value) => setValue('status', value as any)}
              />
            </div>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.status.message as string}
              </p>
            )}
          </div>
        )}

        <div>
          <Label>Probabilidade (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="0"
            {...register('probabilidade', { valueAsNumber: true })}
          />
          {errors.probabilidade && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.probabilidade.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Observações</Label>
          <TextArea
            placeholder="Observações sobre o negócio..."
            rows={4}
            {...register('observacoes')}
          />
          {errors.observacoes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.observacoes.message as string}
            </p>
          )}
        </div>
      </form>
    </Drawer>
  )
}

