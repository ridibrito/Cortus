"use client";
import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPropostaSchema, updatePropostaSchema, CreatePropostaInput, UpdatePropostaInput } from '@/lib/validations/crm.schema'
import { useCreateProposta, useUpdateProposta, useDeleteProposta } from '@/hooks/useProposta'
import { useNegocios } from '@/hooks/useNegocio'
import { Proposta } from '@/types/crm.types'
import Drawer from '@/components/ui/drawer/Drawer'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import TextArea from '@/components/form/input/TextArea'
import Select from '@/components/form/Select'
import { useState } from 'react'

interface PropostaDrawerProps {
  isOpen: boolean
  onClose: () => void
  proposta?: Proposta | null
  onSuccess?: () => void
}

export default function PropostaDrawer({ isOpen, onClose, proposta, onSuccess }: PropostaDrawerProps) {
  const isEditMode = !!proposta
  const createPropostaMutation = useCreateProposta()
  const updatePropostaMutation = useUpdateProposta()
  const deletePropostaMutation = useDeleteProposta()
  const [isDeleting, setIsDeleting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { data: negocios = [] } = useNegocios()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreatePropostaInput | UpdatePropostaInput>({
    resolver: zodResolver(isEditMode ? updatePropostaSchema : createPropostaSchema),
    mode: 'onChange',
  })

  const statusValue = watch('status')

  // Reset form when proposta changes
  useEffect(() => {
    if (proposta) {
      reset({
        negocio_id: proposta.negocio_id,
        modelo_id: proposta.modelo_id || '',
        valor: proposta.valor,
        status: proposta.status,
        validade: proposta.validade ? new Date(proposta.validade).toISOString().split('T')[0] : '',
        conteudo: proposta.conteudo || '',
      })
    } else {
      reset({
        negocio_id: '',
        modelo_id: '',
        valor: 0,
        validade: '',
        conteudo: '',
      })
    }
  }, [proposta, reset, isOpen])

  const onSubmit = async (data: CreatePropostaInput | UpdatePropostaInput) => {
    try {
      if (isEditMode && proposta) {
        await updatePropostaMutation.mutateAsync({
          id: proposta.id,
          data: data as UpdatePropostaInput,
        })
      } else {
        if (!data.negocio_id) {
          alert('Negócio é obrigatório')
          return
        }
        await createPropostaMutation.mutateAsync(data as CreatePropostaInput)
      }
      
      onSuccess?.()
      onClose()
      reset()
    } catch (error: any) {
      console.error('Erro ao salvar proposta:', error)
      alert(error.message || 'Erro ao salvar proposta')
    }
  }

  const handleDelete = async () => {
    if (!proposta || !confirm('Tem certeza que deseja excluir esta proposta?')) return

    setIsDeleting(true)
    try {
      await deletePropostaMutation.mutateAsync(proposta.id)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao excluir proposta:', error)
      alert(error.message || 'Erro ao excluir proposta')
    } finally {
      setIsDeleting(false)
    }
  }

  const negocioOptions = negocios.map(negocio => ({
    value: negocio.id,
    label: `${negocio.lead?.nome || 'Sem lead'} - ${new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(negocio.valor)}`,
  }))

  const statusOptions = [
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'enviada', label: 'Enviada' },
    { value: 'aceita', label: 'Aceita' },
    { value: 'rejeitada', label: 'Rejeitada' },
  ]

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Proposta' : 'Nova Proposta'}
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
              disabled={isSubmitting || createPropostaMutation.isPending || updatePropostaMutation.isPending}
            >
              {isSubmitting || createPropostaMutation.isPending || updatePropostaMutation.isPending
                ? 'Salvando...'
                : isEditMode
                ? 'Salvar Alterações'
                : 'Criar Proposta'}
            </Button>
          </div>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isEditMode && (
          <div>
            <Label>
              Negócio <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Select
                options={negocioOptions}
                placeholder="Selecione um negócio"
                value={watch('negocio_id') || ''}
                onChange={(value) => setValue('negocio_id', value)}
              />
            </div>
            {errors.negocio_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.negocio_id.message as string}
              </p>
            )}
          </div>
        )}

        <div>
          <Label>Modelo ID</Label>
          <Input
            type="text"
            placeholder="ID do modelo (opcional)"
            {...register('modelo_id')}
          />
          {errors.modelo_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.modelo_id.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>
            Valor <span className="text-error-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('valor', { valueAsNumber: true })}
          />
          {errors.valor && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.valor.message as string}
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
                value={statusValue || 'rascunho'}
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
          <Label>Validade</Label>
          <Input
            type="date"
            {...register('validade')}
          />
          {errors.validade && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.validade.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Conteúdo</Label>
          <TextArea
            placeholder="Conteúdo da proposta..."
            rows={8}
            {...register('conteudo')}
          />
          {errors.conteudo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.conteudo.message as string}
            </p>
          )}
        </div>
      </form>
    </Drawer>
  )
}

