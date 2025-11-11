import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, nome, sobrenome } = body

    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: `${nome} ${sobrenome || ''}`.trim(),
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar organização para o novo usuário
    const org = await prisma.org.create({
      data: {
        nome: `${nome}'s Organization`,
        plano: 'free',
      },
    })

    // Buscar ou criar role de admin padrão
    let adminRole = await prisma.role.findFirst({
      where: {
        nome: 'admin',
        org_id: null, // role global
        is_system: true,
      },
    })

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          nome: 'admin',
          descricao: 'Administrador do sistema',
          is_system: true,
        },
      })
    }

    // Criar usuário no Prisma vinculado à organização
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        nome: `${nome} ${sobrenome || ''}`.trim(),
        org_id: org.id,
        supabase_user_id: authData.user.id || undefined,
        ativo: true,
        user_roles: {
          create: {
            role_id: adminRole.id,
          },
        },
      },
      include: {
        org: {
          select: {
            id: true,
            nome: true,
            plano: true,
            logo_url: true,
          },
        },
        user_roles: {
          include: {
            role: {
              select: {
                id: true,
                nome: true,
                descricao: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      user,
      message: 'Usuário criado com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    console.error('Stack trace:', error.stack)
    console.error('Mensagem de erro:', error.message)
    
    // Se o erro for de email duplicado
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Verificar se é um erro do Prisma relacionado a campos obrigatórios
    if (error.message?.includes('Invalid input') || error.message?.includes('expected string')) {
      return NextResponse.json(
        { 
          error: 'Erro de validação de dados',
          details: 'Alguns dados obrigatórios estão faltando ou são inválidos.',
          message: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erro ao criar usuário. Tente novamente.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

