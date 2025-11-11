import { prisma, withPrismaRetry } from '@/lib/prisma/client'
import { getCurrentUserOrgId } from '@/lib/auth/helpers'
import { CreateContatoDto, UpdateContatoDto, Contato } from '@/types/crm.types'

export class ContatoRepository {
  /**
   * Cria um novo contato
   * 
   * Regras de negócio:
   * - Empresas podem ter N contatos pessoa física (1:N)
   * - Pessoas físicas só podem ter 1 empresa (N:1)
   * - Quando tipo é "empresa", cria também um registro na tabela Empresa
   */
  async create(data: CreateContatoDto): Promise<Contato> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Se for uma empresa, criar também um registro na tabela Empresa
    let empresaId = data.empresa_id && data.empresa_id !== '' ? data.empresa_id : null
    
    if (data.tipo === 'empresa') {
      // Criar empresa na tabela Empresa
      const empresaCriada = await withPrismaRetry(async () => {
        return await prisma.empresa.create({
          data: {
            org_id: orgId,
            nome_fantasia: data.nome_fantasia || data.nome,
            razao_social: data.razao_social || null,
            cnpj: data.cpf || null, // Usar CPF como CNPJ temporariamente
            responsavel_id: data.responsavel_id || null,
          },
        })
      })
      empresaId = empresaCriada.id
    } else if (empresaId && data.tipo === 'pessoa') {
      // Se empresa_id foi fornecido para uma pessoa física, verificar se a empresa existe
      // e pertence à mesma organização. Uma pessoa só pode ter uma empresa (garantido pelo schema).
      const empresa = await withPrismaRetry(async () => {
        return await prisma.empresa.findFirst({
          where: {
            id: empresaId,
            org_id: orgId,
          },
        })
      })

      if (!empresa) {
        throw new Error('Empresa não encontrada ou não pertence à sua organização')
      }
    }
    
    return await withPrismaRetry(async () => {
      return await prisma.contato.create({
      data: {
        ...data,
        org_id: orgId,
        email: data.email || null,
        telefone: data.telefone || null,
        cargo: data.cargo || null,
        cpf: data.cpf || null,
        razao_social: data.razao_social || null,
        nome_fantasia: data.nome_fantasia || null,
        empresa_id: empresaId,
        responsavel_id: data.responsavel_id || null,
        avatar_url: data.avatar_url || null,
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
    }) as Contato
    })
  }

  async findById(id: string): Promise<Contato | null> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    return await withPrismaRetry(async () => {
      return await prisma.contato.findFirst({
        where: {
          id,
          org_id: orgId,
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
      }) as Contato | null
    })
  }

  async findAll(filters?: {
    tipo?: 'pessoa' | 'empresa'
    empresa_id?: string
    responsavel_id?: string
    search?: string
  }): Promise<Contato[]> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Construir objeto where de forma mais simples e direta
    const where: any = {
      org_id: orgId,
    }

    // Adicionar filtro de tipo se especificado
    if (filters?.tipo) {
      where.tipo = filters.tipo
    }

    // Adicionar condições de busca se especificadas
    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { nome_fantasia: { contains: filters.search, mode: 'insensitive' } },
        { razao_social: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { telefone: { contains: filters.search, mode: 'insensitive' } },
        { cargo: { contains: filters.search, mode: 'insensitive' } },
        { cpf: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Adicionar filtros adicionais
    if (filters?.empresa_id) {
      where.empresa_id = filters.empresa_id
    }

    if (filters?.responsavel_id) {
      where.responsavel_id = filters.responsavel_id
    }

    console.log('[ContatoRepository.findAll] Buscando contatos com filtros:', {
      orgId,
      filters,
      where: JSON.stringify(where, null, 2)
    })

    // Usar withPrismaRetry para lidar com erros de prepared statement
    let result: Contato[]
    try {
      result = await withPrismaRetry(async () => {
        return await prisma.contato.findMany({
          where,
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
          orderBy: {
            created_at: 'desc',
          },
        }) as Contato[]
      })
    } catch (error: any) {
      console.error('[ContatoRepository.findAll] Erro ao executar query Prisma:', {
        errorMessage: error.message,
        errorCode: error.code,
        where: JSON.stringify(where, null, 2),
        whereConditionsLength: whereConditions.length,
        whereConditions: JSON.stringify(whereConditions, null, 2),
      })
      throw error
    }

    console.log('[ContatoRepository.findAll] Resultado:', {
      total: result.length,
      contatos: result.map(c => ({ id: c.id, nome: c.nome, tipo: c.tipo, org_id: c.org_id }))
    })

    return result
  }

  /**
   * Atualiza um contato existente
   * 
   * Regras de negócio:
   * - Empresas podem ter N contatos pessoa física (1:N)
   * - Pessoas físicas só podem ter 1 empresa (N:1)
   * - Quando tipo é "empresa", atualiza também o registro na tabela Empresa
   */
  async update(id: string, data: UpdateContatoDto): Promise<Contato> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se o contato pertence à mesma organização
    const contato = await withPrismaRetry(async () => {
      return await prisma.contato.findFirst({
        where: {
          id,
          org_id: orgId,
        },
        include: {
          empresa: true,
        },
      })
    })

    if (!contato) {
      throw new Error('Contato não encontrado')
    }

    let empresaId = data.empresa_id === undefined ? contato.empresa_id : (data.empresa_id === '' ? null : data.empresa_id)

    // Se for uma empresa, atualizar também o registro na tabela Empresa
    if (data.tipo === 'empresa' || contato.tipo === 'empresa') {
      if (contato.empresa_id) {
        // Atualizar empresa existente
        await withPrismaRetry(async () => {
          return await prisma.empresa.update({
            where: { id: contato.empresa_id },
            data: {
              nome_fantasia: data.nome_fantasia !== undefined ? data.nome_fantasia : contato.nome_fantasia || contato.nome,
              razao_social: data.razao_social !== undefined ? data.razao_social : contato.razao_social || null,
              cnpj: data.cpf !== undefined ? data.cpf : contato.cpf || null,
              responsavel_id: data.responsavel_id !== undefined ? data.responsavel_id : contato.responsavel_id || null,
            },
          })
        })
        empresaId = contato.empresa_id
      } else {
        // Criar empresa se não existir
        const empresaCriada = await withPrismaRetry(async () => {
          return await prisma.empresa.create({
            data: {
              org_id: orgId,
              nome_fantasia: data.nome_fantasia || contato.nome_fantasia || contato.nome,
              razao_social: data.razao_social || contato.razao_social || null,
              cnpj: data.cpf || contato.cpf || null,
              responsavel_id: data.responsavel_id || contato.responsavel_id || null,
            },
          })
        })
        empresaId = empresaCriada.id
      }
    } else if (empresaId && (data.tipo === 'pessoa' || contato.tipo === 'pessoa')) {
      // Se empresa_id foi fornecido para uma pessoa física, verificar se a empresa existe
      // e pertence à mesma organização. Uma pessoa só pode ter uma empresa (garantido pelo schema).
      const empresa = await withPrismaRetry(async () => {
        return await prisma.empresa.findFirst({
          where: {
            id: empresaId,
            org_id: orgId,
          },
        })
      })

      if (!empresa) {
        throw new Error('Empresa não encontrada ou não pertence à sua organização')
      }
    }

    return await withPrismaRetry(async () => {
      return await prisma.contato.update({
        where: { id },
        data: {
          ...data,
          email: data.email === undefined ? contato.email : data.email || null,
          telefone: data.telefone === undefined ? contato.telefone : data.telefone || null,
          cargo: data.cargo === undefined ? contato.cargo : data.cargo || null,
          cpf: data.cpf === undefined ? contato.cpf : data.cpf || null,
          razao_social: data.razao_social === undefined ? contato.razao_social : data.razao_social || null,
          nome_fantasia: data.nome_fantasia === undefined ? contato.nome_fantasia : data.nome_fantasia || null,
          empresa_id: empresaId,
          responsavel_id: data.responsavel_id === undefined ? contato.responsavel_id : data.responsavel_id || null,
          avatar_url: data.avatar_url === undefined ? contato.avatar_url : data.avatar_url || null,
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
      }) as Contato
    })
  }

  async delete(id: string): Promise<void> {
    const orgId = await getCurrentUserOrgId()
    
    if (!orgId) {
      throw new Error('Organização não encontrada. Verifique sua autenticação.')
    }
    
    // Verificar se o contato pertence à mesma organização
    const contato = await withPrismaRetry(async () => {
      return await prisma.contato.findFirst({
        where: {
          id,
          org_id: orgId,
        },
      })
    })

    if (!contato) {
      throw new Error('Contato não encontrado')
    }

    await withPrismaRetry(async () => {
      return await prisma.contato.delete({
        where: { id },
      })
    })
  }
}

export const contatoRepository = new ContatoRepository()

