import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { prisma, withPrismaRetry } from '@/lib/prisma/client'

/**
 * Rota de debug para verificar contatos no banco
 * Acesse: /api/debug/contatos
 */
export async function GET() {
  try {
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado', details: ensureError },
        { status: 401 }
      )
    }

    // Buscar TODOS os contatos da organização sem filtros
    const todosContatos = await withPrismaRetry(async () => {
      return await prisma.contato.findMany({
        where: {
          org_id: user.org_id,
        },
        select: {
          id: true,
          nome: true,
          tipo: true,
          org_id: true,
          email: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      })
    })

    // Contar por tipo
    const porTipo = {
      pessoa: todosContatos.filter(c => c.tipo === 'pessoa').length,
      empresa: todosContatos.filter(c => c.tipo === 'empresa').length,
      total: todosContatos.length,
    }

    // Verificar se há contatos sem tipo definido
    const semTipo = todosContatos.filter(c => !c.tipo || c.tipo === null).length
    const tiposUnicos = [...new Set(todosContatos.map(c => c.tipo).filter(Boolean))]

    return NextResponse.json({
      orgId: user.org_id,
      usuario: {
        id: user.id,
        email: user.email,
        nome: user.nome,
      },
      estatisticas: {
        ...porTipo,
        semTipo,
        tiposUnicos,
      },
      contatos: todosContatos,
      debug: {
        totalContatos: todosContatos.length,
        orgIdUsuario: user.org_id,
        contatosComOrgIdDiferente: todosContatos.filter(c => c.org_id !== user.org_id).length,
      },
    })
  } catch (error: any) {
    console.error('[DEBUG /api/debug/contatos] Erro:', error)
    return NextResponse.json(
      {
        error: error.message || 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

