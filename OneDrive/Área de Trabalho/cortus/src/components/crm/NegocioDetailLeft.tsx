"use client";
import { Negocio } from '@/types/crm.types'
import AvatarText from '@/components/ui/avatar/AvatarText'
import AvatarUpload from './AvatarUpload'
import Button from '@/components/ui/button/Button'
import { PencilIcon, ArrowRightIcon, EnvelopeIcon, ChatIcon } from '@/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import NegocioDrawer from './NegocioDrawer'
import { formatCurrency, formatCPF, formatCNPJ, formatPhone } from '@/lib/utils/format'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'

interface NegocioDetailLeftProps {
  negocio: Negocio
}

export default function NegocioDetailLeft({ negocio }: NegocioDetailLeftProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const etapaLabels: Record<string, string> = {
    prospecting: 'Prospecção',
    proposal: 'Proposta',
    negotiation: 'Negociação',
    closed: 'Fechado',
  }

  const statusLabels: Record<string, string> = {
    aberto: 'Aberto',
    ganho: 'Ganho',
    perdido: 'Perdido',
  }

  const formatWhatsAppLink = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, '')
    return `https://wa.me/55${cleaned}`
  }

  const formatEmailLink = (email: string, assunto?: string) => {
    const params = assunto ? `?subject=${encodeURIComponent(assunto)}` : ''
    return `mailto:${email}${params}`
  }

  const displayName = negocio.contato?.tipo === 'empresa' 
    ? (negocio.contato.nome_fantasia || negocio.contato.nome)
    : negocio.contato?.nome || 'Negócio'

  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {negocio.contato ? (
                <AvatarText 
                  name={displayName} 
                  avatarUrl={negocio.contato.avatar_url}
                  className="h-12 w-12 text-lg flex-shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {displayName}
                </h2>
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
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            startIcon={<PencilIcon className="w-4 h-4" />}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Dados Básicos */}
      <div className="p-6 space-y-6">
        {/* DADOS BÁSICOS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Dados Básicos
            </h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Título
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Cliente
              </label>
              {negocio.contato ? (
                <Link href={`/crm/contatos/${negocio.contato_id}`}>
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <AvatarText 
                      name={displayName} 
                      avatarUrl={negocio.contato.avatar_url}
                      className="h-8 w-8 text-xs flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {displayName}
                      </p>
                      {negocio.contato.cargo && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {negocio.contato.cargo}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Sem contato</span>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Valor
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(negocio.valor)}
              </p>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        {negocio.contato && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Informações de Contato
              </h3>
            </div>

            <div className="space-y-3">
              {negocio.contato.email && (
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={formatEmailLink(negocio.contato.email)}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {negocio.contato.email}
                  </a>
                </div>
              )}

              {negocio.contato.telefone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${negocio.contato.telefone}`}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {formatPhone(negocio.contato.telefone)}
                    </a>
                    {negocio.contato.telefone && (
                      <a
                        href={formatWhatsAppLink(negocio.contato.telefone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <ChatIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {negocio.contato.cpf && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    CPF
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCPF(negocio.contato.cpf)}
                  </p>
                </div>
              )}

              {negocio.contato.cnpj && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    CNPJ
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCNPJ(negocio.contato.cnpj)}
                  </p>
                </div>
              )}

              {negocio.contato.cargo && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Cargo
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {negocio.contato.cargo}
                  </p>
                </div>
              )}
            </div>

            <Link href={`/crm/contatos/${negocio.contato_id}`} className="block mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                endIcon={<ArrowRightIcon className="w-4 h-4" />}
              >
                Ver Contato Completo
              </Button>
            </Link>
          </div>
        )}

        {/* OUTRAS INFORMAÇÕES */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Outras Informações
            </h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {negocio.responsavel && (
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Responsável
                </label>
                <div className="flex items-center gap-2">
                  <AvatarText 
                    name={negocio.responsavel.nome} 
                    avatarUrl={negocio.responsavel.avatar_url}
                    className="h-6 w-6 text-xs flex-shrink-0" 
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {negocio.responsavel.nome}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Início
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(negocio.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Etapa
              </label>
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {etapaLabels[negocio.etapa] || negocio.etapa}
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Status
              </label>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                negocio.status === 'ganho' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : negocio.status === 'perdido'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {statusLabels[negocio.status] || negocio.status}
              </span>
            </div>

            {negocio.probabilidade > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Probabilidade
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${negocio.probabilidade}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {negocio.probabilidade}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empresa */}
        {negocio.empresa && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Empresa
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {negocio.empresa.nome_fantasia || negocio.empresa.razao_social}
                </span>
              </div>
              {negocio.empresa.razao_social && negocio.empresa.nome_fantasia && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {negocio.empresa.razao_social}
                </p>
              )}
              <Link href={`/crm/empresas/${negocio.empresa_id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  endIcon={<ArrowRightIcon className="w-4 h-4" />}
                >
                  Ver Empresa Completa
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Observações do Negócio */}
        {negocio.observacoes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Observações do Negócio
              </h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {negocio.observacoes}
            </p>
          </div>
        )}
      </div>

      {/* Drawer para edição */}
      <NegocioDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        negocio={negocio}
        onSuccess={() => {
          setIsDrawerOpen(false)
          queryClient.invalidateQueries({ queryKey: ['negocio', negocio.id] })
        }}
      />
    </div>
  )
}
