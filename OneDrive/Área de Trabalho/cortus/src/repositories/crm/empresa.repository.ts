import { prisma, withPrismaRetry } from '@/lib/prisma/client'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'
import { CreateEmpresaDto, UpdateEmpresaDto, Empresa } from '@/types/crm.types'

export class EmpresaRepository {
  async create(data: CreateEmpresaDto): Promise<Empresa> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    return await withPrismaRetry(async () => {
      return await prisma.empresa.create({
        data: {
          ...data,
          org_id: orgId,
          razao_social: data.razao_social || null,
          cnpj: data.cnpj || null,
          segmento: data.segmento || null,
          site: data.site || null,
          cidade: data.cidade || null,
          tamanho: data.tamanho || null,
          responsavel_id: data.responsavel_id || null,
        },
        include: {
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
    }) as Empresa
  }

  async findById(id: string): Promise<Empresa | null> {
    const orgId = await getCurrentUserOrgId()
    
    return await withPrismaRetry(async () => {
      return await prisma.empresa.findFirst({
        where: {
          id,
          org_id: orgId,
        },
        include: {
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar_url: true,
            },
          },
          contatos: {
            include: {
              responsavel: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  avatar_url: true,
                },
              },
            },
          },
          negocios: {
            include: {
              contato: true,
            },
          },
        },
      })
    }) as Empresa | null
  }

  async findAll(filters?: {
    segmento?: string
    tamanho?: 'pequena' | 'media' | 'grande'
    responsavel_id?: string
    search?: string
  }): Promise<Empresa[]> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    const where: any = {
      org_id: orgId,
    }

    if (filters?.segmento) {
      where.segmento = filters.segmento
    }

    if (filters?.tamanho) {
      where.tamanho = filters.tamanho
    }

    if (filters?.responsavel_id) {
      where.responsavel_id = filters.responsavel_id
    }

    if (filters?.search) {
      // Quando há busca, precisamos usar AND para combinar org_id com OR
      where.AND = [
        { org_id: orgId },
        {
          OR: [
            { nome_fantasia: { contains: filters.search, mode: 'insensitive' } },
            { razao_social: { contains: filters.search, mode: 'insensitive' } },
            { cnpj: { contains: filters.search, mode: 'insensitive' } },
            { segmento: { contains: filters.search, mode: 'insensitive' } },
          ]
        }
      ]
      delete where.org_id
    }

    return await withPrismaRetry(async () => {
      return await prisma.empresa.findMany({
        where,
        include: {
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      })
    }) as Promise<Empresa[]>
  }

  async update(id: string, data: UpdateEmpresaDto): Promise<Empresa> {
    const orgId = await getCurrentUserOrgId()
    
    // Verificar se a empresa pertence à mesma organização
    const empresa = await withPrismaRetry(async () => {
      return await prisma.empresa.findFirst({
        where: {
          id,
          org_id: orgId,
        },
      })
    })

    if (!empresa) {
      throw new Error('Empresa não encontrada')
    }

    return await withPrismaRetry(async () => {
      return await prisma.empresa.update({
        where: { id },
        data: {
          ...data,
          razao_social: data.razao_social === undefined ? empresa.razao_social : data.razao_social || null,
          cnpj: data.cnpj === undefined ? empresa.cnpj : data.cnpj || null,
          segmento: data.segmento === undefined ? empresa.segmento : data.segmento || null,
          site: data.site === undefined ? empresa.site : data.site || null,
          cidade: data.cidade === undefined ? empresa.cidade : data.cidade || null,
          tamanho: data.tamanho === undefined ? empresa.tamanho : data.tamanho || null,
          responsavel_id: data.responsavel_id === undefined ? empresa.responsavel_id : data.responsavel_id || null,
        },
        include: {
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
    }) as Empresa
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    
    // Verificar se a empresa pertence à mesma organização
    const empresa = await withPrismaRetry(async () => {
      return await prisma.empresa.findFirst({
        where: {
          id,
          org_id: orgId,
        },
      })
    })

    if (!empresa) {
      throw new Error('Empresa não encontrada')
    }

    await withPrismaRetry(async () => {
      return await prisma.empresa.delete({
        where: { id },
      })
    })
  }
}

export const empresaRepository = new EmpresaRepository()

