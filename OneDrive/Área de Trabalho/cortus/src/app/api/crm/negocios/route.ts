import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { NegocioService } from '@/services/crm/negocio.service'
import { createNegocioSchema, updateNegocioSchema } from '@/lib/validations/crm.schema'

const negocioService = new NegocioService()

export async function GET(request: Request) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/negocios] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const etapa = searchParams.get('etapa') || undefined
    const status = searchParams.get('status') || undefined
    const responsavel_id = searchParams.get('responsavel_id') || undefined
    const contato_id = searchParams.get('contato_id') || undefined

    const negocios = await negocioService.getAllNegocios({
      etapa,
      status,
      responsavel_id,
      contato_id,
    })

    return NextResponse.json({ negocios })
  } catch (error: any) {
    console.error('[GET /api/crm/negocios] Erro completo:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      error: error
    })
    
    // Se o erro for sobre organização não encontrada ou autenticação, retornar 401
    if (error.message?.includes('Organização não encontrada') || 
        error.message?.includes('autenticação') || 
        error.message?.includes('Usuário não autenticado')) {
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
        error: error.message || 'Erro ao buscar negócios',
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
      console.error('[POST /api/crm/negocios] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createNegocioSchema.parse(body)

    const negocio = await negocioService.createNegocio(validatedData)

    return NextResponse.json({ negocio }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar negócio:', error)
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
        error: error.message || 'Erro ao criar negócio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

