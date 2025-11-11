"use client";
import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContatoSchema, updateContatoSchema, CreateContatoInput, UpdateContatoInput } from '@/lib/validations/crm.schema'
import { useCreateContato, useUpdateContato, useDeleteContato } from '@/hooks/useContato'
import { useEmpresas } from '@/hooks/useEmpresa'
import { Contato } from '@/types/crm.types'
import Drawer from '@/components/ui/drawer/Drawer'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import TextArea from '@/components/form/input/TextArea'
import Select from '@/components/form/Select'
import SearchSelect from '@/components/form/SearchSelect'
import { useState } from 'react'
import { UserCircleIcon } from '@/icons'
import AvatarUpload from './AvatarUpload'

interface ContatoDrawerProps {
  isOpen: boolean
  onClose: () => void
  contato?: Contato | null
  onSuccess?: () => void
  tipoInicial?: 'pessoa' | 'empresa'
  empresaId?: string // Para pré-preencher empresa ao criar novo contato
}

export default function ContatoDrawer({ isOpen, onClose, contato, onSuccess, tipoInicial = 'pessoa', empresaId }: ContatoDrawerProps) {
  const isEditMode = !!contato
  const createContatoMutation = useCreateContato()
  const updateContatoMutation = useUpdateContato()
  const deleteContatoMutation = useDeleteContato()
  const [isDeleting, setIsDeleting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { data: empresas = [], isLoading: isLoadingEmpresas, error: empresasError } = useEmpresas()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateContatoInput | UpdateContatoInput>({
    resolver: zodResolver(isEditMode ? updateContatoSchema : createContatoSchema),
    mode: 'onChange',
  })

  const tipoValue = watch('tipo')
  const empresaIdValue = watch('empresa_id')
  const nomeFantasiaValue = watch('nome_fantasia')
  const razaoSocialValue = watch('razao_social')

  // Debug: log empresas
  useEffect(() => {
    if (isOpen) {
      console.log('Empresas carregadas:', empresas)
      console.log('Erro ao carregar empresas:', empresasError)
      console.log('Carregando empresas:', isLoadingEmpresas)
    }
  }, [empresas, empresasError, isLoadingEmpresas, isOpen])

  // Reset form when contato changes
  useEffect(() => {
    if (contato) {
      reset({
        nome: contato.nome,
        email: contato.email || '',
        telefone: contato.telefone || '',
        cargo: contato.cargo || '',
        tipo: contato.tipo,
        cpf: contato.cpf || '',
        razao_social: contato.razao_social || '',
        nome_fantasia: contato.nome_fantasia || '',
        empresa_id: contato.empresa_id || '',
        responsavel_id: contato.responsavel_id || '',
        avatar_url: contato.avatar_url || '',
      })
    } else {
      reset({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        tipo: tipoInicial,
        cpf: '',
        razao_social: '',
        nome_fantasia: '',
        empresa_id: empresaId || '',
        responsavel_id: '',
        avatar_url: '',
      })
    }
  }, [contato, reset, isOpen, tipoInicial, empresaId])

  // Sincronizar nome quando tipo for empresa
  useEffect(() => {
    if (tipoValue === 'empresa') {
      const novoNome = nomeFantasiaValue || razaoSocialValue || ''
      
      // Atualiza o nome automaticamente quando nome_fantasia ou razao_social mudarem
      if (novoNome) {
        setValue('nome', novoNome, { shouldValidate: true })
      }
    }
  }, [tipoValue, nomeFantasiaValue, razaoSocialValue, setValue])

  const onSubmit = async (data: CreateContatoInput | UpdateContatoInput) => {
    try {
      // Ajustar nome baseado no tipo ANTES da validação
      const submitData = { ...data }
      
      if (tipoValue === 'empresa') {
        // Se for empresa, usar nome_fantasia ou razao_social como nome
        if (!submitData.nome || submitData.nome.trim() === '') {
          if (submitData.nome_fantasia && submitData.nome_fantasia.trim() !== '') {
            submitData.nome = submitData.nome_fantasia
          } else if (submitData.razao_social && submitData.razao_social.trim() !== '') {
            submitData.nome = submitData.razao_social
          } else {
            // Se não tiver nenhum dos dois, usar um valor padrão para passar na validação
            // mas isso não deveria acontecer se os campos obrigatórios estiverem corretos
            submitData.nome = submitData.nome_fantasia || submitData.razao_social || 'Empresa'
          }
        }
      }
      
      if (isEditMode && contato) {
        await updateContatoMutation.mutateAsync({
          id: contato.id,
          data: submitData as UpdateContatoInput,
        })
      } else {
        await createContatoMutation.mutateAsync(submitData as CreateContatoInput)
      }
      
      onSuccess?.()
      onClose()
      reset()
    } catch (error: any) {
      console.error('Erro ao salvar contato:', error)
      alert(error.message || 'Erro ao salvar contato')
    }
  }

  const handleDelete = async () => {
    if (!contato || !confirm('Tem certeza que deseja excluir este contato?')) return

    setIsDeleting(true)
    try {
      await deleteContatoMutation.mutateAsync(contato.id)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao excluir contato:', error)
      alert(error.message || 'Erro ao excluir contato')
    } finally {
      setIsDeleting(false)
    }
  }

  const empresaOptions = empresas.map(empresa => ({
    value: empresa.id,
    label: empresa.nome_fantasia || empresa.razao_social || 'Sem nome',
  }))

  const tipoOptions = [
    { value: 'pessoa', label: 'Pessoa' },
    { value: 'empresa', label: 'Empresa' },
  ]

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Contato' : 'Novo Contato'}
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
              disabled={isSubmitting || createContatoMutation.isPending || updateContatoMutation.isPending}
            >
              {isSubmitting || createContatoMutation.isPending || updateContatoMutation.isPending
                ? 'Salvando...'
                : isEditMode
                ? 'Salvar Alterações'
                : 'Criar Contato'}
            </Button>
          </div>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Upload de Avatar */}
        {isEditMode && contato && (
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <AvatarUpload
              currentAvatarUrl={watch('avatar_url') || contato.avatar_url}
              name={watch('nome') || contato.nome || (tipoValue === 'empresa' ? (watch('nome_fantasia') || watch('razao_social') || 'Empresa') : 'Contato')}
              tipo={tipoValue || contato.tipo || tipoInicial}
              contatoId={contato.id}
              onUploadSuccess={(url) => {
                setValue('avatar_url', url, { shouldValidate: true })
              }}
              size="lg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Clique no ícone da câmera para fazer upload de uma foto
            </p>
          </div>
        )}

        {/* Seleção de Tipo - Destaque */}
        {!isEditMode && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <Label className="text-base font-semibold mb-3 block">O que você deseja criar?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('tipo', 'pessoa', { shouldValidate: true })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoValue === 'pessoa'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <UserCircleIcon className={`w-8 h-8 ${tipoValue === 'pessoa' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  <span className={`font-medium ${tipoValue === 'pessoa' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Pessoa Física
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Criar contato pessoal</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue('tipo', 'empresa', { shouldValidate: true })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoValue === 'empresa'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className={`w-8 h-8 ${tipoValue === 'empresa' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className={`font-medium ${tipoValue === 'empresa' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Empresa
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Criar empresa</span>
                </div>
              </button>
            </div>
            {errors.tipo && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.tipo.message as string}
              </p>
            )}
          </div>
        )}

        {/* Tipo em modo de edição */}
        {isEditMode && (
          <div>
            <Label>Tipo</Label>
            <div className="relative">
              <Select
                options={tipoOptions}
                placeholder="Selecione o tipo"
                value={tipoValue || 'pessoa'}
                onChange={(value) => setValue('tipo', value as 'pessoa' | 'empresa', { shouldValidate: true })}
              />
            </div>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.tipo.message as string}
              </p>
            )}
          </div>
        )}

        {tipoValue === 'pessoa' ? (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                Dados da Pessoa
              </h3>
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  {...register('nome')}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.nome.message as string}
                  </p>
                )}
              </div>

              <div>
                <Label>CPF</Label>
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                />
                {errors.cpf && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.cpf.message as string}
                  </p>
                )}
              </div>

              <div>
                <Label>Cargo</Label>
                <Input
                  type="text"
                  placeholder="Cargo / função"
                  {...register('cargo')}
                />
                {errors.cargo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.cargo.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                Vincular a Empresa
              </h3>
              <div>
                <Label>Empresa</Label>
                <div className="relative">
                  {isLoadingEmpresas ? (
                    <div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Carregando empresas...
                    </div>
                  ) : empresasError ? (
                    <div className="h-11 w-full rounded-lg border border-red-300 dark:border-red-700 px-4 py-2.5 flex items-center text-sm text-red-600 dark:text-red-400">
                      Erro ao carregar empresas
                    </div>
                  ) : empresaOptions.length === 0 ? (
                    <div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma empresa cadastrada. Crie uma empresa primeiro.
                    </div>
                  ) : (
                    <SearchSelect
                      options={empresaOptions}
                      placeholder="Selecione a empresa desta pessoa"
                      value={empresaIdValue || ''}
                      onChange={(value) => setValue('empresa_id', value)}
                      searchPlaceholder="Buscar empresa..."
                    />
                  )}
                </div>
                {errors.empresa_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.empresa_id.message as string}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Uma pessoa física pode estar vinculada a apenas uma empresa. Se a empresa ainda não existe, crie-a primeiro.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                Dados da Empresa
              </h3>
              <div>
                <Label>Nome Fantasia *</Label>
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
                  {...register('cpf')}
                />
                {errors.cpf && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.cpf.message as string}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
            Contato
          </h3>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              type="tel"
              placeholder="(00) 00000-0000"
              {...register('telefone')}
            />
            {errors.telefone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.telefone.message as string}
              </p>
            )}
          </div>
        </div>
      </form>
    </Drawer>
  )
}

