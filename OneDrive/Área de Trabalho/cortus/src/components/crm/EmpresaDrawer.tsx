"use client";
import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEmpresaSchema, updateEmpresaSchema, CreateEmpresaInput, UpdateEmpresaInput } from '@/lib/validations/crm.schema'
import { useCreateEmpresa, useUpdateEmpresa, useDeleteEmpresa } from '@/hooks/useEmpresa'
import { Empresa } from '@/types/crm.types'
import Drawer from '@/components/ui/drawer/Drawer'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import Select from '@/components/form/Select'
import { useState } from 'react'

interface EmpresaDrawerProps {
  isOpen: boolean
  onClose: () => void
  empresa?: Empresa | null
  onSuccess?: () => void
}

export default function EmpresaDrawer({ isOpen, onClose, empresa, onSuccess }: EmpresaDrawerProps) {
  const isEditMode = !!empresa
  const createEmpresaMutation = useCreateEmpresa()
  const updateEmpresaMutation = useUpdateEmpresa()
  const deleteEmpresaMutation = useDeleteEmpresa()
  const [isDeleting, setIsDeleting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateEmpresaInput | UpdateEmpresaInput>({
    resolver: zodResolver(isEditMode ? updateEmpresaSchema : createEmpresaSchema),
    mode: 'onChange',
  })

  const tamanhoValue = watch('tamanho')

  // Reset form when empresa changes
  useEffect(() => {
    if (empresa) {
      reset({
        nome_fantasia: empresa.nome_fantasia,
        razao_social: empresa.razao_social || '',
        cnpj: empresa.cnpj || '',
        segmento: empresa.segmento || '',
        site: empresa.site || '',
        cidade: empresa.cidade || '',
        tamanho: empresa.tamanho || undefined,
        responsavel_id: empresa.responsavel_id || '',
      })
    } else {
      reset({
        nome_fantasia: '',
        razao_social: '',
        cnpj: '',
        segmento: '',
        site: '',
        cidade: '',
        tamanho: undefined,
        responsavel_id: '',
      })
    }
  }, [empresa, reset, isOpen])

  const onSubmit = async (data: CreateEmpresaInput | UpdateEmpresaInput) => {
    try {
      if (isEditMode && empresa) {
        await updateEmpresaMutation.mutateAsync({
          id: empresa.id,
          data: data as UpdateEmpresaInput,
        })
      } else {
        await createEmpresaMutation.mutateAsync(data as CreateEmpresaInput)
      }
      
      onSuccess?.()
      onClose()
      reset()
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error)
      alert(error.message || 'Erro ao salvar empresa')
    }
  }

  const handleDelete = async () => {
    if (!empresa || !confirm('Tem certeza que deseja excluir esta empresa?')) return

    setIsDeleting(true)
    try {
      await deleteEmpresaMutation.mutateAsync(empresa.id)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error)
      alert(error.message || 'Erro ao excluir empresa')
    } finally {
      setIsDeleting(false)
    }
  }

  const tamanhoOptions = [
    { value: 'pequena', label: 'Pequena' },
    { value: 'media', label: 'Média' },
    { value: 'grande', label: 'Grande' },
  ]

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Empresa' : 'Nova Empresa'}
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
              disabled={isSubmitting || createEmpresaMutation.isPending || updateEmpresaMutation.isPending}
            >
              {isSubmitting || createEmpresaMutation.isPending || updateEmpresaMutation.isPending
                ? 'Salvando...'
                : isEditMode
                ? 'Salvar Alterações'
                : 'Criar Empresa'}
            </Button>
          </div>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label>
            Nome Fantasia <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Nome comercial"
            {...register('nome_fantasia')}
          />
          {errors.nome_fantasia && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.nome_fantasia.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Razão Social</Label>
          <Input
            type="text"
            placeholder="Razão social"
            {...register('razao_social')}
          />
          {errors.razao_social && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.razao_social.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>CNPJ</Label>
          <Input
            type="text"
            placeholder="00.000.000/0000-00"
            {...register('cnpj')}
          />
          {errors.cnpj && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.cnpj.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Segmento</Label>
          <Input
            type="text"
            placeholder="Setor de atuação"
            {...register('segmento')}
          />
          {errors.segmento && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.segmento.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Site</Label>
          <Input
            type="url"
            placeholder="https://exemplo.com"
            {...register('site')}
          />
          {errors.site && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.site.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Cidade</Label>
          <Input
            type="text"
            placeholder="Cidade"
            {...register('cidade')}
          />
          {errors.cidade && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.cidade.message as string}
            </p>
          )}
        </div>

        <div>
          <Label>Tamanho</Label>
          <div className="relative">
            <Select
              options={tamanhoOptions}
              placeholder="Selecione o tamanho"
              value={tamanhoValue || ''}
              onChange={(value) => setValue('tamanho', value as 'pequena' | 'media' | 'grande')}
            />
          </div>
          {errors.tamanho && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.tamanho.message as string}
            </p>
          )}
        </div>
      </form>
    </Drawer>
  )
}

