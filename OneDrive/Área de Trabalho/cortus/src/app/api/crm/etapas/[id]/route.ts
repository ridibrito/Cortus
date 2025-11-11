import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { pipelineService } from '@/services/crm/pipeline.service'
import { z } from 'zod'

const updateEtapaSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  ordem: z.number().optional(),
  probabilidade: z.number().min(0).max(100).optional(),
  is_final: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Erro de autenticação', details: ensureError },
        { status: 401 }
      )
    }

    const { id } = await params
    // Buscar etapa através do pipeline
    // Por enquanto, retornar erro pois não temos método direto
    return NextResponse.json(
      { error: 'Use GET /api/crm/pipelines/[id] para buscar etapas' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[GET /api/crm/etapas/[id]] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar etapa', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Erro de autenticação', details: ensureError },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateEtapaSchema.parse(body)

    const etapa = await pipelineService.updateEtapa(id, validatedData)
    return NextResponse.json({ etapa })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[PUT /api/crm/etapas/[id]] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar etapa', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Erro de autenticação', details: ensureError },
        { status: 401 }
      )
    }

    const { id } = await params
    await pipelineService.deleteEtapa(id)

    return NextResponse.json({ message: 'Etapa deletada com sucesso' })
  } catch (error: any) {
    console.error('[DELETE /api/crm/etapas/[id]] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar etapa', details: error.message },
      { status: 500 }
    )
  }
}

