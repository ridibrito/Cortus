"use client";
import { useState, useRef, useEffect } from 'react'
import { Contato } from '@/types/crm.types'
import Button from '@/components/ui/button/Button'
import { PencilIcon, TrashBinIcon, MoreDotIcon } from '@/icons'
import { Dropdown } from '@/components/ui/dropdown/Dropdown'
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem'
import Link from 'next/link'
import { formatPhone } from '@/lib/utils/format'
import AvatarText from '@/components/ui/avatar/AvatarText'

interface ContatoListViewProps {
  contatos: Contato[]
  onEdit?: (contato: Contato) => void
  onDelete?: (contato: Contato) => void
  onBulkDelete?: (ids: string[]) => void
}

const tipoColors = {
  pessoa: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  empresa: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
}

export default function ContatoListView({ contatos, onEdit, onDelete, onBulkDelete }: ContatoListViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement>>({})

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(contatos.map(c => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      if (confirm(`Tem certeza que deseja excluir ${selectedIds.size} contato(s)?`)) {
        onBulkDelete(Array.from(selectedIds))
        setSelectedIds(new Set())
      }
    }
  }

  const isAllSelected = contatos.length > 0 && selectedIds.size === contatos.length
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < contatos.length

  // Atualizar estado indeterminado do checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  // Limpar seleções de contatos que não existem mais
  useEffect(() => {
    const contatoIds = new Set(contatos.map(c => c.id))
    setSelectedIds(prev => {
      const filtered = new Set(Array.from(prev).filter(id => contatoIds.has(id)))
      return filtered
    })
  }, [contatos])

  if (contatos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum contato encontrado
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Barra de ações em massa */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 px-4 py-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedIds.size} contato(s) selecionado(s)
          </span>
          {onBulkDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              startIcon={<TrashBinIcon className="w-4 h-4" />}
            >
              Excluir Selecionados
            </Button>
          )}
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-12">
              <input
                type="checkbox"
                ref={selectAllRef}
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-white"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Nome / Nome Fantasia
            </th>
            {contatos[0]?.tipo === 'empresa' && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Razão Social
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Telefone
            </th>
            {contatos[0]?.tipo === 'pessoa' && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Cargo
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Tipo
            </th>
            {contatos[0]?.tipo === 'pessoa' && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Empresa
              </th>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-12">
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {contatos.map((contato) => (
            <tr
              key={contato.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                selectedIds.has(contato.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <td className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.has(contato.id)}
                  onChange={(e) => handleSelectOne(contato.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-white"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white/90">
                <Link
                  href={`/crm/contatos/${contato.id}`}
                  className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <AvatarText 
                    name={contato.tipo === 'empresa' ? (contato.nome_fantasia || contato.nome) : contato.nome} 
                    avatarUrl={contato.avatar_url}
                    className="h-8 w-8 text-xs flex-shrink-0" 
                  />
                  <span>
                    {contato.tipo === 'empresa' ? (contato.nome_fantasia || contato.nome) : contato.nome}
                  </span>
                </Link>
              </td>
              {contato.tipo === 'empresa' && (
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {contato.razao_social || '-'}
                </td>
              )}
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {contato.email || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {contato.telefone ? formatPhone(contato.telefone) : '-'}
              </td>
              {contato.tipo === 'pessoa' && (
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {contato.cargo || '-'}
                </td>
              )}
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${tipoColors[contato.tipo]}`}
                >
                  {contato.tipo === 'pessoa' ? 'Pessoa Física' : 'Empresa'}
                </span>
              </td>
              {contato.tipo === 'pessoa' && (
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {contato.empresa?.nome_fantasia || '-'}
                </td>
              )}
              <td className="px-4 py-3 text-right relative">
                <div className="flex items-center justify-end">
                  <div className="relative">
                    <button
                      ref={(el) => {
                        if (el) {
                          triggerRefs.current[contato.id] = el;
                        } else {
                          delete triggerRefs.current[contato.id];
                        }
                      }}
                      onClick={() => setOpenDropdownId(openDropdownId === contato.id ? null : contato.id)}
                      className="dropdown-toggle p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Mais opções"
                    >
                      <MoreDotIcon className="w-5 h-5" />
                    </button>
                    <Dropdown
                      isOpen={openDropdownId === contato.id}
                      onClose={() => setOpenDropdownId(null)}
                      className="w-40 p-1"
                      triggerRef={triggerRefs.current[contato.id] ? { current: triggerRefs.current[contato.id] } : undefined}
                    >
                      {onEdit && (
                        <DropdownItem
                          onClick={() => {
                            onEdit(contato)
                            setOpenDropdownId(null)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Editar
                        </DropdownItem>
                      )}
                      {onDelete && (
                        <DropdownItem
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este contato?')) {
                              onDelete(contato)
                            }
                            setOpenDropdownId(null)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                          Excluir
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

