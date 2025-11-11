import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'

/**
 * Rota de debug para verificar o estado da autenticação
 * Útil para diagnosticar problemas de sincronização Supabase ↔ Prisma
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação Supabase
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    const debug = {
      supabase: {
        authenticated: !!authUser,
        error: authError?.message || null,
        user_id: authUser?.id || null,
        email: authUser?.email || null,
      },
      prisma: {
        user_found: false,
        user_id: null,
        org_id: null,
        supabase_user_id_synced: false,
      },
    }

    if (authUser?.email) {
      // Buscar usuário no Prisma
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        select: {
          id: true,
          email: true,
          org_id: true,
          supabase_user_id: true,
        },
      })

      if (dbUser) {
        debug.prisma.user_found = true
        debug.prisma.user_id = dbUser.id
        debug.prisma.org_id = dbUser.org_id
        debug.prisma.supabase_user_id_synced = dbUser.supabase_user_id === authUser.id
      }
    }

    return NextResponse.json({ debug })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Erro ao verificar autenticação',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

