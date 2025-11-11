import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { prisma, withPrismaRetry } from '@/lib/prisma/client'

/**
 * Rota para migrar contatos de uma organização para outra
 * Acesse: /api/debug/migrar-contatos?org_id_antigo=ff8eddd5-ea36-49d4-b444-d09b6fdea64f
 * 
 * ATENÇÃO: Esta rota deve ser usada apenas em desenvolvimento/testes
 */
export async function GET(request: Request) {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado', details: ensureError },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orgIdAntigo = searchParams.get('org_id_antigo')

    if (!orgIdAntigo) {
      return NextResponse.json(
        { 
          error: 'Parâmetro org_id_antigo é obrigatório',
          exemplo: '/api/debug/migrar-contatos?org_id_antigo=ff8eddd5-ea36-49d4-b444-d09b6fdea64f'
        },
        { status: 400 }
      )
    }

    const orgIdNovo = user.org_id

    // Verificar quantos contatos serão migrados
    const contatosParaMigrar = await withPrismaRetry(async () => {
      return await prisma.contato.findMany({
        where: {
          org_id: orgIdAntigo,
        },
        select: {
          id: true,
          nome: true,
          tipo: true,
        },
      })
    })

    if (contatosParaMigrar.length === 0) {
      return NextResponse.json({
        mensagem: 'Nenhum contato encontrado com o org_id especificado',
        orgIdAntigo,
        orgIdNovo,
      })
    }

    // Migrar contatos
    const resultado = await withPrismaRetry(async () => {
      return await prisma.contato.updateMany({
        where: {
          org_id: orgIdAntigo,
        },
        data: {
          org_id: orgIdNovo,
        },
      })
    })

    return NextResponse.json({
      mensagem: 'Migração concluída com sucesso',
      orgIdAntigo,
      orgIdNovo,
      contatosMigrados: resultado.count,
      contatos: contatosParaMigrar,
    })
  } catch (error: any) {
    console.error('[DEBUG /api/debug/migrar-contatos] Erro:', error)
    return NextResponse.json(
      {
        error: error.message || 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

