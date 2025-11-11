import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { pipelineService } from '@/services/crm/pipeline.service'
import { z } from 'zod'

const updatePipelineSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
  is_padrao: z.boolean().optional(),
  ordem: z.number().optional(),
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
    const pipeline = await pipelineService.getPipelineById(id)

    if (!pipeline) {
      return NextResponse.json(
        { error: 'Pipeline não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ pipeline })
  } catch (error: any) {
    console.error('[GET /api/crm/pipelines/[id]] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pipeline', details: error.message },
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
    const validatedData = updatePipelineSchema.parse(body)

    const pipeline = await pipelineService.updatePipeline(id, validatedData)
    return NextResponse.json({ pipeline })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[PUT /api/crm/pipelines/[id]] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pipeline', details: error.message },
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
    await pipelineService.deletePipeline(id)

    return NextResponse.json({ message: 'Pipeline deletado com sucesso' })
  } catch (error: any) {
    console.error('[DELETE /api/crm/pipelines/[id]] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar pipeline', details: error.message },
      { status: 500 }
    )
  }
}

