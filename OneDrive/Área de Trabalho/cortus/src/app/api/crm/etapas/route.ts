import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { pipelineService } from '@/services/crm/pipeline.service'
import { z } from 'zod'

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

const reorderEtapasSchema = z.object({
  etapa_ids: z.array(z.string().uuid()).min(1, 'É necessário pelo menos uma etapa'),
})

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
    const validatedData = createEtapaSchema.parse(body)

    const etapa = await pipelineService.createEtapa(validatedData)
    return NextResponse.json({ etapa }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[POST /api/crm/etapas] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar etapa', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Erro de autenticação', details: ensureError },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Ação especial para reordenar etapas
    if (action === 'reorder') {
      const body = await request.json()
      const { pipeline_id, etapa_ids } = reorderEtapasSchema.parse(body)

      await pipelineService.reorderEtapas(pipeline_id, etapa_ids)
      return NextResponse.json({ message: 'Etapas reordenadas com sucesso' })
    }

    // Atualização normal de etapa
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID da etapa é obrigatório' },
        { status: 400 }
      )
    }

    const validatedData = updateEtapaSchema.parse(data)
    const etapa = await pipelineService.updateEtapa(id, validatedData)
    return NextResponse.json({ etapa })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[PUT /api/crm/etapas] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar etapa', details: error.message },
      { status: 500 }
    )
  }
}

