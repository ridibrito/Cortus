import { NextResponse } from 'next/server'
import { ensureUserExists } from '@/lib/auth/helpers'
import { prisma, withPrismaRetry } from '@/lib/prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ empresa_id: string }> }
) {
  try {
    // Garantir que o usuário existe no Prisma com organização
    const { user, error: ensureError } = await ensureUserExists()

    if (ensureError || !user) {
      console.error('[GET /api/crm/contatos/by-empresa/[empresa_id]] Erro ao garantir existência do usuário:', ensureError)
      return NextResponse.json(
        { 
          error: 'Erro de autenticação',
          details: ensureError || 'Não foi possível garantir a existência do usuário'
        },
        { status: 401 }
      )
    }

    const { empresa_id } = await params

    // Buscar contato empresa com esse empresa_id usando retry
    const contatoEmpresa = await withPrismaRetry(async () => {
      return await prisma.contato.findFirst({
        where: {
          empresa_id: empresa_id,
          tipo: 'empresa',
          org_id: user.org_id,
        },
        include: {
          empresa: true,
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      })
    })

    if (contatoEmpresa) {
      return NextResponse.json({ contato: contatoEmpresa })
    }

    // Se não encontrou, buscar a empresa e criar o contato empresa automaticamente
    const empresa = await withPrismaRetry(async () => {
      return await prisma.empresa.findFirst({
        where: {
          id: empresa_id,
          org_id: user.org_id,
        },
      })
    })

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Criar contato empresa automaticamente usando retry
    const novoContatoEmpresa = await withPrismaRetry(async () => {
      return await prisma.contato.create({
        data: {
          org_id: user.org_id,
          nome: empresa.nome_fantasia || empresa.razao_social || 'Empresa',
          tipo: 'empresa',
          empresa_id: empresa_id,
          nome_fantasia: empresa.nome_fantasia,
          razao_social: empresa.razao_social || null,
          cpf: empresa.cnpj || null,
          responsavel_id: empresa.responsavel_id || null,
        },
        include: {
          empresa: true,
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      })
    })

    return NextResponse.json({ contato: novoContatoEmpresa })
  } catch (error: any) {
    console.error('Erro ao buscar/criar contato empresa:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar contato empresa' },
      { status: 500 }
    )
  }
}

