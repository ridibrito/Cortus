import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tarefaService } from '@/services/crm/tarefa.service'
import { z } from 'zod'

const createTarefaSchema = z.object({
  projeto_id: z.string().optional(),
  contato_id: z.string().optional(),
  titulo: z.string().min(1, 'Título é obrigatório'),
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
}).refine(
  (data) => data.projeto_id || data.contato_id,
  {
    message: 'É necessário fornecer projeto_id ou contato_id',
    path: ['projeto_id', 'contato_id'],
  }
)

const updateTarefaSchema = z.object({
  projeto_id: z.string().optional(),
  contato_id: z.string().optional(),
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional(),
  responsavel_id: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
  status: z.enum(['pendente', 'em_andamento', 'concluida']).optional(),
  prazo: z.string().datetime().optional().or(z.date().optional()),
  concluida_em: z.string().datetime().optional().or(z.date().optional()),
})

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const contato_id = searchParams.get('contato_id') || undefined
    const projeto_id = searchParams.get('projeto_id') || undefined
    const responsavel_id = searchParams.get('responsavel_id') || undefined
    const status = searchParams.get('status') as 'pendente' | 'em_andamento' | 'concluida' | undefined

    const tarefas = await tarefaService.findAll({
      contato_id,
      projeto_id,
      responsavel_id,
      status,
    })

    return NextResponse.json({ tarefas })
  } catch (error: any) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar tarefas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    console.log('[POST /api/crm/tarefas] Dados recebidos:', body)
    
    const validatedData = createTarefaSchema.parse(body)
    console.log('[POST /api/crm/tarefas] Dados validados:', validatedData)

    const tarefa = await tarefaService.create(validatedData)

    return NextResponse.json({ tarefa }, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/crm/tarefas] Erro ao criar tarefa:', error)
    console.error('[POST /api/crm/tarefas] Stack:', error?.stack)
    
    if (error.name === 'ZodError') {
      const errorMessages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: error.errors,
          message: errorMessages
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar tarefa' },
      { status: 500 }
    )
  }
}

