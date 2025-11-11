import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'
import { contatoService } from '@/services/crm/contato.service'
import { prisma } from '@/lib/prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentUserOrgId()

    if (!orgId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const contatoId = params.id

    if (!contatoId) {
      return NextResponse.json({ error: 'ID do contato não fornecido' }, { status: 400 })
    }

    // Verificar se o contato existe e pertence à organização
    const contato = await contatoService.findById(contatoId)
    if (!contato) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPEG, PNG ou WebP' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      )
    }

    // Se já existe um avatar, deletar o antigo
    if (contato.avatar_url) {
      try {
        // Extrair o path do avatar antigo da URL
        const oldUrl = new URL(contato.avatar_url)
        const oldPath = oldUrl.pathname.split('/storage/v1/object/public/avatars/')[1]
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([oldPath])
        }
      } catch (error) {
        // Ignorar erros ao deletar avatar antigo
        console.warn('Erro ao deletar avatar antigo:', error)
      }
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${contatoId}-${Date.now()}.${fileExt}`
    const filePath = `contatos/${orgId}/${fileName}`

    // Upload para Supabase Storage no bucket 'avatars'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Atualizar o contato com a URL do avatar usando SQL direto
    // (temporário até o Prisma Client ser regenerado)
    await prisma.$executeRaw`
      UPDATE contatos 
      SET avatar_url = ${avatarUrl}, updated_at = NOW()
      WHERE id = ${contatoId}::uuid AND org_id = ${orgId}::uuid
    `

    // Buscar o contato atualizado
    const contatoAtualizado = await contatoService.findById(contatoId)

    return NextResponse.json({
      url: avatarUrl,
      path: filePath,
      contato: contatoAtualizado,
    })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar upload' },
      { status: 500 }
    )
  }
}

