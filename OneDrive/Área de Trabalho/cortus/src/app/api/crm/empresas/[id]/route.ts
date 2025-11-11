import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { empresaService } from '@/services/crm/empresa.service'
import { updateEmpresaSchema } from '@/lib/validations/crm.schema'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const empresa = await empresaService.findById(params.id)

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ empresa })
  } catch (error: any) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar empresa' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateEmpresaSchema.parse(body)

    const empresa = await empresaService.update(params.id, validatedData)

    return NextResponse.json({ empresa })
  } catch (error: any) {
    console.error('Erro ao atualizar empresa:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar empresa' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    await empresaService.delete(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar empresa:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar empresa' },
      { status: 500 }
    )
  }
}

