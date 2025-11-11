import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { pipelineService } from '@/services/crm/pipeline.service'
import { z } from 'zod'

const createPipelineSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  is_padrao: z.boolean().optional(),
  ordem: z.number().optional(),
})

const updatePipelineSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
  is_padrao: z.boolean().optional(),
  ordem: z.number().optional(),
})

const createEtapaSchema = z.object({
  pipeline_id: z.string().uuid('ID do pipeline inválido'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  ordem: z.number().optional(),
  probabilidade: z.number().min(0).max(100).optional(),
  is_final: z.boolean().optional(),
})

const updateEtapaSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  ordem: z.number().optional(),
  probabilidade: z.number().min(0).max(100).optional(),
  is_final: z.boolean().optional(),
})

export async function GET() {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Erro de autenticação', details: ensureError },
        { status: 401 }
      )
    }

    const pipelines = await pipelineService.getAllPipelines()
    return NextResponse.json({ pipelines })
  } catch (error: any) {
    console.error('[GET /api/crm/pipelines] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pipelines', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Erro de autenticação', details: ensureError },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPipelineSchema.parse(body)

    const pipeline = await pipelineService.createPipeline(validatedData)
    return NextResponse.json({ pipeline }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[POST /api/crm/pipelines] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pipeline', details: error.message },
      { status: 500 }
    )
  }
}

