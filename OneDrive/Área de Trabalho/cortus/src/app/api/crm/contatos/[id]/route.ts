import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { contatoService } from '@/services/crm/contato.service'
import { updateContatoSchema } from '@/lib/validations/crm.schema'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/contatos/[id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const contato = await contatoService.findById(params.id)

    if (!contato) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ contato })
  } catch (error: any) {
    console.error('Erro ao buscar contato:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar contato' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[PUT /api/crm/contatos/[id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateContatoSchema.parse(body)

    const contato = await contatoService.update(params.id, validatedData)

    return NextResponse.json({ contato })
  } catch (error: any) {
    console.error('Erro ao atualizar contato:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar contato' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[DELETE /api/crm/contatos/[id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    await contatoService.delete(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar contato:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar contato' },
      { status: 500 }
    )
  }
}

