import { NextResponse } from 'next/server'
import { PropostaService } from '@/services/crm/proposta.service'
import { updatePropostaSchema } from '@/lib/validations/crm.schema'

const propostaService = new PropostaService()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID da proposta é obrigatório' },
        { status: 400 }
      )
    }

    const proposta = await propostaService.getPropostaById(id)

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ proposta })
  } catch (error: any) {
    console.error('Erro ao buscar proposta:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar proposta' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID da proposta é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updatePropostaSchema.parse(body)

    const proposta = await propostaService.updateProposta(id, validatedData)

    return NextResponse.json({ proposta })
  } catch (error: any) {
    console.error('Erro ao atualizar proposta:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar proposta' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID da proposta é obrigatório' },
        { status: 400 }
      )
    }

    await propostaService.deleteProposta(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar proposta:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar proposta' },
      { status: 500 }
    )
  }
}

