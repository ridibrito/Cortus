import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { NegocioService } from '@/services/crm/negocio.service'
import { updateNegocioSchema } from '@/lib/validations/crm.schema'

const negocioService = new NegocioService()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/negocios/[id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do negócio é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[GET /api/crm/negocios/[id]] Buscando negócio:', {
      id,
      userId: user.id,
      orgId: user.org_id
    })

    const negocio = await negocioService.getNegocioById(id)
    
    console.log('[GET /api/crm/negocios/[id]] Resultado:', {
      encontrado: !!negocio,
      negocioId: negocio?.id
    })

    if (!negocio) {
      return NextResponse.json(
        { error: 'Negócio não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ negocio })
  } catch (error: any) {
    console.error('[GET /api/crm/negocios/[id]] Erro completo:', {
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
        error: error.message || 'Erro ao buscar negócio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[PUT /api/crm/negocios/[id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do negócio é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateNegocioSchema.parse(body)

    const negocio = await negocioService.updateNegocio(id, validatedData)

    return NextResponse.json({ negocio })
  } catch (error: any) {
    console.error('[PUT /api/crm/negocios/[id]] Erro completo:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      error: error
    })
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

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
        error: error.message || 'Erro ao atualizar negócio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[DELETE /api/crm/negocios/[id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do negócio é obrigatório' },
        { status: 400 }
      )
    }

    await negocioService.deleteNegocio(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/crm/negocios/[id]] Erro completo:', {
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
        error: error.message || 'Erro ao deletar negócio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

