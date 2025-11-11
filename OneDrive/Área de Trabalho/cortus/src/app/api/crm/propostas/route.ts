import { NextResponse } from 'next/server'
import { PropostaService } from '@/services/crm/proposta.service'
import { createPropostaSchema, updatePropostaSchema } from '@/lib/validations/crm.schema'

const propostaService = new PropostaService()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const negocio_id = searchParams.get('negocio_id') || undefined
    const status = searchParams.get('status') || undefined

    const propostas = await propostaService.getAllPropostas({
      negocio_id,
      status,
    })

    return NextResponse.json({ propostas })
  } catch (error: any) {
    console.error('Erro ao buscar propostas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar propostas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createPropostaSchema.parse(body)

    const proposta = await propostaService.createProposta(validatedData)

    return NextResponse.json({ proposta }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar proposta:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar proposta' },
      { status: 500 }
    )
  }
}

