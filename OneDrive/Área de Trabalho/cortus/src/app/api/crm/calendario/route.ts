import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calendarioService } from '@/services/crm/calendario.service'
import { z } from 'zod'

const createCalendarioSchema = z.object({
  usuario_id: z.string().min(1, 'ID do usuário é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  data_inicio: z.string().datetime().or(z.date()),
  data_fim: z.string().datetime().or(z.date()),
  evento_externo_id: z.string().optional(),
  tipo: z.enum(['reuniao', 'lembrete', 'evento', 'tarefa']).optional(),
  localizacao: z.string().optional(),
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
    const usuario_id = searchParams.get('usuario_id') || undefined
    const tipo = searchParams.get('tipo') as 'reuniao' | 'lembrete' | 'evento' | 'tarefa' | undefined
    const data_inicio = searchParams.get('data_inicio') ? new Date(searchParams.get('data_inicio')!) : undefined
    const data_fim = searchParams.get('data_fim') ? new Date(searchParams.get('data_fim')!) : undefined

    const eventos = await calendarioService.findAll({
      usuario_id,
      tipo,
      data_inicio,
      data_fim,
    })

    return NextResponse.json({ eventos })
  } catch (error: any) {
    console.error('Erro ao buscar eventos do calendário:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar eventos do calendário' },
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
    const validatedData = createCalendarioSchema.parse(body)

    const evento = await calendarioService.create(validatedData)

    return NextResponse.json({ evento }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar evento no calendário:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar evento no calendário' },
      { status: 500 }
    )
  }
}

