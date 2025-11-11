import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { comunicacaoService } from '@/services/crm/comunicacao.service'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params
    await comunicacaoService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar comunicação:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar comunicação' },
      { status: 500 }
    )
  }
}

