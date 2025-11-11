import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { comunicacaoService } from '@/services/crm/comunicacao.service'
import { z } from 'zod'

const createComunicacaoSchema = z.object({
  tipo: z.enum(['email', 'whatsapp', 'chat', 'nota', 'ligacao', 'reuniao']),
  origem_id: z.string().optional(),
  origem_tipo: z.string().optional(),
  destino: z.string().optional(),
  canal: z.string().optional(),
  assunto: z.string().optional(),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  status: z.enum(['enviado', 'falhou', 'pendente']).optional(),
  metadata: z.record(z.any()).optional(),
})

export async function GET(request: Request) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/comunicacoes] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const origem_id = searchParams.get('origem_id') || undefined
    const origem_tipo = searchParams.get('origem_tipo') || undefined
    const tipo = searchParams.get('tipo') || undefined

    const comunicacoes = await comunicacaoService.findAll({
      origem_id,
      origem_tipo,
      tipo,
    })

    return NextResponse.json({ comunicacoes })
  } catch (error: any) {
    console.error('Erro ao buscar comunicações:', error)
    console.error('Stack trace:', error.stack)
    
    // Se o erro for sobre organização não encontrada, retornar 401
    if (error.message?.includes('Organização não encontrada') || error.message?.includes('autenticação')) {
      return NextResponse.json(
        { 
          error: 'Organização não encontrada. Verifique sua autenticação.',
          details: 'O usuário não possui uma organização associada. Entre em contato com o suporte.'
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao buscar comunicações',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[POST /api/crm/comunicacoes] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createComunicacaoSchema.parse(body)

    const comunicacao = await comunicacaoService.create(validatedData)

    return NextResponse.json({ comunicacao }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar comunicação:', error)
    console.error('Stack trace:', error.stack)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    // Se o erro for sobre organização não encontrada, retornar 401
    if (error.message?.includes('Organização não encontrada') || error.message?.includes('autenticação')) {
      return NextResponse.json(
        { 
          error: 'Organização não encontrada. Verifique sua autenticação.',
          details: 'O usuário não possui uma organização associada. Entre em contato com o suporte.'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Erro ao criar comunicação',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

