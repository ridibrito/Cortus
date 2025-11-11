import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tarefaService } from '@/services/crm/tarefa.service'
import { z } from 'zod'

const updateTarefaSchema = z.object({
  projeto_id: z.string().optional(),
  contato_id: z.string().optional(),
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional(),
  responsavel_id: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
  status: z.enum(['pendente', 'em_andamento', 'concluida']).optional(),
  prazo: z
    .union([
      z.string().datetime(),
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/), // datetime-local format
      z.date(),
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (val instanceof Date) return val.toISOString()
      // Se for datetime-local (sem segundos), adiciona :00
      if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString()
      }
      return val
    }),
  concluida_em: z
    .union([
      z.string().datetime(),
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/), // datetime-local format
      z.date(),
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (val instanceof Date) return val.toISOString()
      // Se for datetime-local (sem segundos), adiciona :00
      if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString()
      }
      return val
    }),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params
    const tarefa = await tarefaService.findById(id)

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ tarefa })
  } catch (error: any) {
    console.error('Erro ao buscar tarefa:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar tarefa' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateTarefaSchema.parse(body)

    const tarefa = await tarefaService.update(id, validatedData)

    return NextResponse.json({ tarefa })
  } catch (error: any) {
    console.error('Erro ao atualizar tarefa:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar tarefa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params
    await tarefaService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar tarefa' },
      { status: 500 }
    )
  }
}

