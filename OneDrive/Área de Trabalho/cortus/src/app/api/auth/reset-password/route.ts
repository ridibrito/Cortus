import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Enviar email de recuperação de senha
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') || 'http://localhost:3000'}/auth/update-password`,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Sempre retornar sucesso por segurança (não revelar se o email existe)
    return NextResponse.json({
      success: true,
      message: 'Se o email existir, você receberá um link de recuperação',
    })
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

