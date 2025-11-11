import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { empresaService } from '@/services/crm/empresa.service'
import { createEmpresaSchema, updateEmpresaSchema } from '@/lib/validations/crm.schema'

export async function GET(request: Request) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/empresas] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const segmento = searchParams.get('segmento') || undefined
    const tamanho = searchParams.get('tamanho') as 'pequena' | 'media' | 'grande' | undefined
    const responsavel_id = searchParams.get('responsavel_id') || undefined
    const search = searchParams.get('search') || undefined

    const empresas = await empresaService.findAll({
      segmento,
      tamanho,
      responsavel_id,
      search,
    })

    return NextResponse.json({ empresas })
  } catch (error: any) {
    console.error('[GET /api/crm/empresas] Erro completo:', {
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
        error: error.message || 'Erro ao buscar empresas',
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
      console.error('[POST /api/crm/empresas] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createEmpresaSchema.parse(body)

    const empresa = await empresaService.create(validatedData)

    return NextResponse.json({ empresa }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar empresa:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar empresa' },
      { status: 500 }
    )
  }
}

