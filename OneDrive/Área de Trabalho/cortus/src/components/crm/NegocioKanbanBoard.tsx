"use client";
import React from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Negocio, Pipeline, Etapa } from '@/types/crm.types'
import NegocioKanbanCard from './NegocioKanbanCard'
import { useUpdateNegocio } from '@/hooks/useNegocio'
import { usePipelines } from '@/hooks/usePipeline'

interface NegocioKanbanBoardProps {
  negocios: Negocio[]
  onEdit?: (negocio: Negocio) => void
  pipelineId?: string | null
}

interface KanbanColumnProps {
  id: string
  title: string
  cor?: string | null
  negocios: Negocio[]
  onEdit?: (negocio: Negocio) => void
}

function KanbanColumn({ id, title, cor, negocios, onEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  // Usar cor customizada se disponível, senão usar cor padrão baseada no ID
  const getColumnColor = () => {
    if (cor) {
      return `bg-[${cor}]/10 border-[${cor}]/20`
    }
    // Cores padrão baseadas no ID
    const colorMap: Record<string, string> = {
      prospecting: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
      proposal: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800',
      negotiation: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800',
      closed: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
    }
    return colorMap[id] || 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800'
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 ${isOver ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {negocios.length} {negocios.length === 1 ? 'negócio' : 'negócios'}
        </span>
      </div>
      <SortableContext items={negocios.map(n => n.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px]">
          {negocios.map((negocio) => (
            <SortableNegocioCard key={negocio.id} negocio={negocio} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function SortableNegocioCard({ negocio, onEdit }: { negocio: Negocio; onEdit?: (negocio: Negocio) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: negocio.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NegocioKanbanCard negocio={negocio} onEdit={onEdit} />
    </div>
  )
}

export default function NegocioKanbanBoard({ negocios, onEdit, pipelineId }: NegocioKanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const updateNegocioMutation = useUpdateNegocio()
  const { data: pipelines = [] } = usePipelines()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Buscar pipeline selecionado ou pipeline padrão
  const selectedPipeline = React.useMemo(() => {
    if (pipelineId) {
      return pipelines.find(p => p.id === pipelineId)
    }
    return pipelines.find(p => p.is_padrao) || pipelines[0]
  }, [pipelines, pipelineId])

  // Se não houver pipeline customizado, usar etapas padrão
  const columns = React.useMemo(() => {
    if (selectedPipeline?.etapas && selectedPipeline.etapas.length > 0) {
      return selectedPipeline.etapas.map(etapa => ({
        id: etapa.id,
        title: etapa.nome,
        cor: etapa.cor,
        ordem: etapa.ordem,
      })).sort((a, b) => a.ordem - b.ordem)
    }
    // Etapas padrão
    return [
      { id: 'prospecting', title: 'Prospecção', cor: null, ordem: 0 },
      { id: 'proposal', title: 'Proposta', cor: null, ordem: 1 },
      { id: 'negotiation', title: 'Negociação', cor: null, ordem: 2 },
      { id: 'closed', title: 'Fechado', cor: null, ordem: 3 },
    ]
  }, [selectedPipeline])

  const negociosByEtapa = React.useMemo(() => {
    const result: Record<string, Negocio[]> = {}
    
    columns.forEach(col => {
      if (selectedPipeline?.etapas && selectedPipeline.etapas.length > 0) {
        // Usar etapa_id para pipelines customizados
        result[col.id] = negocios.filter(negocio => negocio.etapa_id === col.id)
      } else {
        // Usar etapa string para etapas padrão
        result[col.id] = negocios.filter(negocio => negocio.etapa === col.id)
      }
    })
    
    return result
  }, [negocios, columns, selectedPipeline])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const negocioId = active.id as string
    const newEtapaId = over.id as string

    // Encontrar o negócio atual
    const negocio = negocios.find(n => n.id === negocioId)
    if (!negocio) return

    // Verificar se a etapa mudou
    const currentEtapaId = selectedPipeline?.etapas && selectedPipeline.etapas.length > 0
      ? negocio.etapa_id
      : negocio.etapa

    if (currentEtapaId === newEtapaId) return

    // Atualizar o negócio
    try {
      if (selectedPipeline?.etapas && selectedPipeline.etapas.length > 0) {
        // Pipeline customizado: usar etapa_id
        await updateNegocioMutation.mutateAsync({
          id: negocioId,
          data: { etapa_id: newEtapaId },
        })
      } else {
        // Pipeline padrão: usar etapa string
        await updateNegocioMutation.mutateAsync({
          id: negocioId,
          data: { etapa: newEtapaId as 'prospecting' | 'proposal' | 'negotiation' | 'closed' },
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar etapa do negócio:', error)
    }
  }

  const activeNegocio = activeId ? negocios.find(n => n.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const colorClass = column.cor
            ? `bg-[${column.cor}]/10 border-[${column.cor}]/20`
            : column.id === 'prospecting'
            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
            : column.id === 'proposal'
            ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
            : column.id === 'negotiation'
            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
            : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'

          return (
            <div
              key={column.id}
              className={`flex-1 min-w-[280px] p-4 rounded-lg border-2 ${colorClass}`}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                cor={column.cor}
                negocios={negociosByEtapa[column.id] || []}
                onEdit={onEdit}
              />
            </div>
          )
        })}
      </div>
      <DragOverlay>
        {activeNegocio ? (
          <div className="opacity-90">
            <NegocioKanbanCard negocio={activeNegocio} onEdit={onEdit} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
