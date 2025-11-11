import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { contatoService } from '@/services/crm/contato.service'
import { createContatoSchema, updateContatoSchema } from '@/lib/validations/crm.schema'

export async function GET(request: Request) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/contatos] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') as 'pessoa' | 'empresa' | undefined
    const empresa_id = searchParams.get('empresa_id') || undefined
    const responsavel_id = searchParams.get('responsavel_id') || undefined
    const search = searchParams.get('search') || undefined

    const contatos = await contatoService.findAll({
      tipo,
      empresa_id,
      responsavel_id,
      search,
    })

    console.log('[GET /api/crm/contatos] Contatos encontrados:', {
      total: contatos.length,
      tipo,
      orgId: user.org_id,
      contatos: contatos.map(c => ({ id: c.id, nome: c.nome, tipo: c.tipo }))
    })

    // Verificar se os dados estão sendo serializados corretamente
    const serialized = JSON.stringify({ contatos })
    console.log('[GET /api/crm/contatos] Tamanho da resposta serializada:', serialized.length, 'bytes')

    return NextResponse.json({ contatos })
  } catch (error: any) {
    console.error('Erro ao buscar contatos:', error)
    console.error('Stack:', error?.stack)
    console.error('Mensagem:', error?.message)
    
    // Se o erro for sobre organização não encontrada, retornar 401
    if (error.message?.includes('Organização não encontrada') || error.message?.includes('autenticação')) {
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
        error: error.message || 'Erro ao buscar contatos',
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
      console.error('[POST /api/crm/contatos] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createContatoSchema.parse(body)

    const contato = await contatoService.create(validatedData)

    return NextResponse.json({ contato }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar contato:', error)
    console.error('Stack trace:', error.stack)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    // Se o erro for sobre organização não encontrada, retornar 401
    if (error.message?.includes('Organização não encontrada') || error.message?.includes('autenticação')) {
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
        error: error.message || 'Erro ao criar contato',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

