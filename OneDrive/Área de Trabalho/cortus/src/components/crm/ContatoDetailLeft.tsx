"use client";
import { Contato } from '@/types/crm.types'
import AvatarText from '@/components/ui/avatar/AvatarText'
import AvatarUpload from './AvatarUpload'
import Button from '@/components/ui/button/Button'
import { PencilIcon, TrashBinIcon, EnvelopeIcon, UserCircleIcon, ArrowRightIcon, ChatIcon, PlusIcon } from '@/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ContatoDrawer from './ContatoDrawer'
import { useContatos, useUpdateContato, useContatoByEmpresaId, useDeleteContato } from '@/hooks/useContato'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useNegocios } from '@/hooks/useNegocio'
import { formatCPF, formatCNPJ, formatPhone, formatCurrency } from '@/lib/utils/format'
import SearchSelect from '@/components/form/SearchSelect'
import { Modal } from '@/components/ui/modal'

interface ContatoDetailLeftProps {
  contato: Contato
}

export default function ContatoDetailLeft({ contato }: ContatoDetailLeftProps) {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const [selectedContatoId, setSelectedContatoId] = useState<string>('')
  const deleteContatoMutation = useDeleteContato()
  const updateContatoMutation = useUpdateContato()
  const queryClient = useQueryClient()
  const { data: negocios = [] } = useNegocios()
  
  // Buscar todos os contatos pessoa física para vincular
  const { data: todosContatosPessoa = [] } = useContatos({ tipo: 'pessoa' })
  
  // Buscar contatos vinculados
  // Se for empresa: buscar apenas pessoas vinculadas à empresa (usando empresa_id do contato)
  // Se for pessoa: buscar outras pessoas da mesma empresa (excluindo a própria pessoa)
  const { data: contatosVinculados = [] } = useContatos(
    contato.tipo === 'empresa' && contato.empresa_id
      ? { empresa_id: contato.empresa_id, tipo: 'pessoa' } // Apenas pessoas quando for empresa
      : contato.tipo === 'pessoa' && contato.empresa?.id
      ? { empresa_id: contato.empresa.id, tipo: 'pessoa' } // Apenas pessoas quando for pessoa
      : undefined
  )

  // Buscar o contato empresa correspondente quando uma pessoa física tem empresa vinculada
  // Usar endpoint específico que busca ou cria automaticamente o contato empresa
  const { data: contatoEmpresa, isLoading: isLoadingEmpresas } = useContatoByEmpresaId(
    contato.tipo === 'pessoa' && contato.empresa_id ? contato.empresa_id : null
  )

  // Debug: verificar se encontrou o contato empresa
  if (contato.tipo === 'pessoa' && contato.empresa_id && !isLoadingEmpresas) {
    console.log('Debug - Empresa ID:', contato.empresa_id)
    console.log('Debug - Contato empresa encontrado:', contatoEmpresa)
  }

  // Filtrar para excluir o próprio contato quando for pessoa e garantir que apenas pessoas físicas apareçam
  const contatosFiltrados = contatosVinculados
    .filter(c => c.tipo === 'pessoa') // Garantir que apenas pessoas físicas apareçam
    .filter(c => contato.tipo === 'pessoa' ? c.id !== contato.id : true) // Excluir o próprio contato quando for pessoa

  // Filtrar contatos que já estão vinculados à empresa
  const contatosDisponiveis = todosContatosPessoa.filter(
    c => !contatosFiltrados.some(cv => cv.id === c.id)
  )

  // Filtrar negócios deste contato
  const negociosDoContato = negocios.filter(n => n.contato_id === contato.id)
  const valorTotalNegocios = negociosDoContato.reduce((sum, n) => sum + Number(n.valor), 0)
  const negociosGanhos = negociosDoContato.filter(n => n.status === 'ganho').length
  const negociosEmAndamento = negociosDoContato.filter(n => n.status === 'aberto').length

  const handleEdit = () => {
    setIsDrawerOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return

    try {
      await deleteContatoMutation.mutateAsync(contato.id)
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
      router.push('/crm/contatos')
    } catch (error: any) {
      console.error('Erro ao excluir contato:', error)
      alert(error.message || 'Erro ao excluir contato')
    }
  }

  const handleLinkContato = async () => {
    if (!selectedContatoId || !contato.empresa_id) return

    try {
      const contatoParaVincular = todosContatosPessoa.find(c => c.id === selectedContatoId)
      if (!contatoParaVincular) return

      await updateContatoMutation.mutateAsync({
        id: selectedContatoId,
        data: {
          empresa_id: contato.empresa_id,
        },
      })
      
      queryClient.invalidateQueries({ queryKey: ['contatos'] })
      queryClient.invalidateQueries({ queryKey: ['contato', contato.id] })
      setIsLinkModalOpen(false)
      setSelectedContatoId('')
    } catch (error: any) {
      console.error('Erro ao vincular contato:', error)
      alert(error.message || 'Erro ao vincular contato')
    }
  }

  const handleCreateContato = () => {
    setIsCreateDrawerOpen(true)
  }

  const formatWhatsAppLink = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, '')
    return `https://wa.me/55${cleaned}`
  }

  const formatEmailLink = (email: string, assunto?: string) => {
    const params = assunto ? `?subject=${encodeURIComponent(assunto)}` : ''
    return `mailto:${email}${params}`
  }

  const displayName = contato.tipo === 'empresa' 
    ? (contato.nome_fantasia || contato.nome)
    : contato.nome

  const contatosOptions = contatosDisponiveis.map(c => ({
    value: c.id,
    label: `${c.nome}${c.cargo ? ` - ${c.cargo}` : ''}`,
  }))

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            {contato.tipo === 'pessoa' ? (
              <AvatarUpload
                currentAvatarUrl={contato.avatar_url}
                name={displayName}
                tipo="pessoa"
                contatoId={contato.id}
                onUploadSuccess={(url) => {
                  queryClient.invalidateQueries({ queryKey: ['contato', contato.id] })
                }}
                size="md"
              />
            ) : (
              <AvatarUpload
                currentAvatarUrl={contato.avatar_url}
                name={displayName}
                tipo="empresa"
                contatoId={contato.id}
                onUploadSuccess={(url) => {
                  queryClient.invalidateQueries({ queryKey: ['contato', contato.id] })
                }}
                size="md"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90 truncate">
                    {displayName}
                  </h2>
                  {contato.tipo === 'empresa' && contato.razao_social && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {contato.razao_social}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={handleEdit}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Editar contato"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Excluir contato"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap gap-2 mt-4">
            {contato.email && (
              <a
                href={formatEmailLink(contato.email)}
                className="flex-1 min-w-[calc(33.333%-0.5rem)] sm:min-w-0"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm"
                  startIcon={<EnvelopeIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                >
                  <span className="truncate">Email</span>
                </Button>
              </a>
            )}
            {contato.telefone && (
              <a
                href={formatWhatsAppLink(contato.telefone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[calc(33.333%-0.5rem)] sm:min-w-0"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                  startIcon={
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  }
                >
                  <span className="truncate">WhatsApp</span>
                </Button>
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[calc(33.333%-0.5rem)] sm:min-w-0 text-xs sm:text-sm"
              startIcon={<ChatIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
              onClick={() => {
                // TODO: Implementar função de chat
                alert('Função de chat em desenvolvimento')
              }}
            >
              <span className="truncate">Chat</span>
            </Button>
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        {negociosDoContato.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              Resumo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total de Negócios</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white/90">{negociosDoContato.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valor Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white/90">{formatCurrency(valorTotalNegocios)}</p>
              </div>
              {negociosGanhos > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Negócios Ganhos</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{negociosGanhos}</p>
                </div>
              )}
              {negociosEmAndamento > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Em Andamento</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{negociosEmAndamento}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dados Básicos */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Dados Básicos
            </h3>
            <div className="space-y-4">
              {contato.tipo === 'pessoa' ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nome</p>
                    <p className="text-sm text-gray-900 dark:text-white/90">{contato.nome}</p>
                  </div>
                  {contato.cpf && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPF</p>
                      <p className="text-sm text-gray-900 dark:text-white/90">{formatCPF(contato.cpf)}</p>
                    </div>
                  )}
                  {contato.cargo && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cargo</p>
                      <p className="text-sm text-gray-900 dark:text-white/90">{contato.cargo}</p>
                    </div>
                  )}
                  {contato.empresa && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Empresa</p>
                      {isLoadingEmpresas ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Carregando...
                        </p>
                      ) : contatoEmpresa ? (
                        <Link
                          href={`/crm/contatos/${contatoEmpresa.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          {contato.empresa.nome_fantasia || contato.empresa.razao_social || contatoEmpresa.nome}
                          <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-white/90">
                          {contato.empresa.nome_fantasia || contato.empresa.razao_social}
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (Contato empresa não encontrado)
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {contato.nome_fantasia && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nome Fantasia</p>
                      <p className="text-sm text-gray-900 dark:text-white/90">{contato.nome_fantasia}</p>
                    </div>
                  )}
                  {contato.razao_social && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Razão Social</p>
                      <p className="text-sm text-gray-900 dark:text-white/90">{contato.razao_social}</p>
                    </div>
                  )}
                  {contato.cpf && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CNPJ</p>
                      <p className="text-sm text-gray-900 dark:text-white/90">{formatCNPJ(contato.cpf)}</p>
                    </div>
                  )}
                </>
              )}

                      {contato.telefone && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefone</p>
                          <p className="text-sm text-gray-900 dark:text-white/90">
                            {formatPhone(contato.telefone)}
                          </p>
                        </div>
                      )}

              {contato.email && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">E-mail</p>
                  <a
                    href={formatEmailLink(contato.email)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    {contato.email}
                  </a>
                </div>
              )}

              {contato.responsavel && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Responsável</p>
                  <p className="text-sm text-gray-900 dark:text-white/90">{contato.responsavel.nome}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contatos Vinculados - Sempre mostrar quando for empresa */}
          {contato.tipo === 'empresa' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pessoas Vinculadas {contatosFiltrados.length > 0 && `(${contatosFiltrados.length})`}
                </h3>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleCreateContato}
                  startIcon={<PlusIcon className="w-3 h-3" />}
                >
                  Nova Pessoa
                </Button>
              </div>
              
              {contatosFiltrados.length === 0 ? (
                <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <UserCircleIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Nenhuma pessoa vinculada a esta empresa
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setIsLinkModalOpen(true)}
                      startIcon={<PlusIcon className="w-3 h-3" />}
                    >
                      Vincular Contato
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={handleCreateContato}
                      startIcon={<PlusIcon className="w-3 h-3" />}
                    >
                      Criar Novo Contato
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {contatosFiltrados.slice(0, 5).map((contatoVinculado) => (
                      <Link
                        key={contatoVinculado.id}
                        href={`/crm/contatos/${contatoVinculado.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <AvatarText 
                          name={contatoVinculado.nome} 
                          avatarUrl={contatoVinculado.avatar_url}
                          className="h-8 w-8 text-xs flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {contatoVinculado.nome}
                          </p>
                          {contatoVinculado.cargo && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {contatoVinculado.cargo}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {contatoVinculado.email && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                window.location.href = formatEmailLink(contatoVinculado.email!)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Enviar e-mail"
                            >
                              <EnvelopeIcon className="w-4 h-4" />
                            </button>
                          )}
                          {contatoVinculado.telefone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                window.open(formatWhatsAppLink(contatoVinculado.telefone!), '_blank', 'noopener,noreferrer')
                              }}
                              className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="WhatsApp"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {contatosFiltrados.length > 5 && (
                    <Link
                      href={`/crm/contatos?empresa_id=${contato.empresa_id || ''}`}
                      className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Ver mais {contatosFiltrados.length - 5} pessoas
                    </Link>
                  )}
                </>
              )}
            </div>
          )}

          {/* Contatos Vinculados (quando houver uma empresa vinculada) */}
          {contato.tipo === 'pessoa' && contato.empresa && contatosFiltrados.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Outras Pessoas da Empresa ({contatosFiltrados.length})
                </h3>
                <Link
                  href={`/crm/contatos?empresa_id=${contato.empresa.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Ver todas
                </Link>
              </div>
              <div className="space-y-2">
                {contatosFiltrados
                  .slice(0, 5)
                  .map((contatoVinculado) => (
                  <Link
                    key={contatoVinculado.id}
                    href={`/crm/contatos/${contatoVinculado.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <AvatarText 
                      name={contatoVinculado.nome} 
                      className="h-8 w-8 text-xs flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {contatoVinculado.nome}
                      </p>
                      {contatoVinculado.cargo && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contatoVinculado.cargo}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {contatoVinculado.email && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            window.location.href = formatEmailLink(contatoVinculado.email!)
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Enviar e-mail"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                        </button>
                      )}
                      {contatoVinculado.telefone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            window.open(formatWhatsAppLink(contatoVinculado.telefone!), '_blank', 'noopener,noreferrer')
                          }}
                          className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          title="WhatsApp"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {contatosFiltrados.length > 5 && (
                <Link
                  href={`/crm/contatos?empresa_id=${contato.empresa.id}`}
                  className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Ver mais {contatosFiltrados.length - 5} pessoas
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer de edição */}
      <ContatoDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        contato={contato}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['contato', contato.id] })
          setIsDrawerOpen(false)
        }}
      />

      {/* Drawer de criação de novo contato */}
      <ContatoDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        tipoInicial="pessoa"
        empresaId={contato.empresa_id || undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['contatos'] })
          queryClient.invalidateQueries({ queryKey: ['contato', contato.id] })
          setIsCreateDrawerOpen(false)
        }}
      />

      {/* Modal para vincular contato existente */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false)
          setSelectedContatoId('')
        }}
        className="max-w-md p-6"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90 mb-2">
            Vincular Contato à Empresa
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione um contato pessoa física para vincular a esta empresa.
          </p>
          <div>
            <SearchSelect
              options={contatosOptions}
              value={selectedContatoId}
              onChange={(value) => setSelectedContatoId(value)}
              placeholder="Buscar contato..."
              searchPlaceholder="Digite para buscar..."
            />
          </div>
          {contatosOptions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Todos os contatos pessoa física já estão vinculados a esta empresa.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setIsLinkModalOpen(false)
                setSelectedContatoId('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleLinkContato}
              disabled={!selectedContatoId || updateContatoMutation.isPending}
            >
              {updateContatoMutation.isPending ? 'Vinculando...' : 'Vincular'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

