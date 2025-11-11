import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { prisma, withPrismaRetry } from '@/lib/prisma/client'

/**
 * Rota para limpar negócios sem vínculo válido com contatos
 * Acesse: /api/debug/limpar-negocios-sem-vinculo
 * 
 * ATENÇÃO: Esta rota deve ser usada apenas em desenvolvimento/testes
 * Ela deleta negócios que não têm contato_id válido ou cujo contato não existe mais
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

    const orgId = user.org_id

    // Buscar todos os negócios da organização
    const todosNegocios = await withPrismaRetry(async () => {
      return await prisma.negocio.findMany({
        where: {
          org_id: orgId,
        },
        select: {
          id: true,
          contato_id: true,
          valor: true,
          created_at: true,
        },
      })
    })

    console.log(`[Limpar Negócios] Total de negócios encontrados: ${todosNegocios.length}`)

    // Verificar quais negócios têm contato_id inválido ou contato inexistente
    const negociosParaDeletar: string[] = []
    const negociosValidos: string[] = []

    for (const negocio of todosNegocios) {
      if (!negocio.contato_id) {
        console.log(`[Limpar Negócios] Negócio ${negocio.id} sem contato_id`)
        negociosParaDeletar.push(negocio.id)
        continue
      }

      // Verificar se o contato existe e pertence à mesma organização
      const contato = await withPrismaRetry(async () => {
        return await prisma.contato.findFirst({
          where: {
            id: negocio.contato_id,
            org_id: orgId,
          },
          select: {
            id: true,
            nome: true,
          },
        })
      })

      if (!contato) {
        console.log(`[Limpar Negócios] Negócio ${negocio.id} com contato_id ${negocio.contato_id} não encontrado ou de outra organização`)
        negociosParaDeletar.push(negocio.id)
      } else {
        negociosValidos.push(negocio.id)
      }
    }

    console.log(`[Limpar Negócios] Negócios válidos: ${negociosValidos.length}`)
    console.log(`[Limpar Negócios] Negócios para deletar: ${negociosParaDeletar.length}`)

    // Deletar negócios sem vínculo válido
    let deletados = 0
    if (negociosParaDeletar.length > 0) {
      for (const negocioId of negociosParaDeletar) {
        try {
          await withPrismaRetry(async () => {
            return await prisma.negocio.delete({
              where: { id: negocioId },
            })
          })
          deletados++
        } catch (error: any) {
          console.error(`[Limpar Negócios] Erro ao deletar negócio ${negocioId}:`, error.message)
        }
      }
    }

    return NextResponse.json({
      sucesso: true,
      orgId,
      estatisticas: {
        totalNegocios: todosNegocios.length,
        negociosValidos: negociosValidos.length,
        negociosParaDeletar: negociosParaDeletar.length,
        deletados,
      },
      negociosDeletados: negociosParaDeletar.slice(0, 10), // Mostrar apenas os primeiros 10 IDs
      mensagem: `${deletados} negócio(s) sem vínculo válido foram deletados.`,
    })
  } catch (error: any) {
    console.error('[Limpar Negócios] Erro:', error)
    return NextResponse.json(
      {
        error: 'Erro ao limpar negócios',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

