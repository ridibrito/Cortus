import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configurações para melhorar estabilidade de conexão
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Garantir desconexão adequada ao encerrar
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

// Função helper para executar queries com retry em caso de erro de conexão
export async function withPrismaRetry<T>(
  fn: () => Promise<T>,
  retries = 5 // Aumentado para 5 tentativas
): Promise<T> {
  let lastError: any = null
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Verificar se é um erro de prepared statement ou conexão
      // Verificar também no erro interno do Prisma
      const errorMessage = String(error?.message || '')
      const errorCode = String(error?.code || '')
      
      // Verificar estrutura aninhada do erro Prisma
      let errorString = ''
      try {
        errorString = JSON.stringify(error).toLowerCase()
      } catch {
        errorString = String(error).toLowerCase()
      }
      
      const hasPreparedStatementError = 
        errorString.includes('prepared statement') ||
        errorString.includes('does not exist') ||
        errorString.includes('26000') ||
        errorMessage.toLowerCase().includes('prepared statement') ||
        errorMessage.toLowerCase().includes('does not exist') ||
        errorMessage.toLowerCase().includes('26000') ||
        (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('invocation')) ||
        errorMessage.toLowerCase().includes('connectorerror') ||
        errorString.includes('connectorerror')
      
      const isConnectionError =
        hasPreparedStatementError ||
        errorCode === '26000' ||
        errorCode === 'P1001' ||
        errorCode === 'P1008' ||
        errorCode === 'P1017' ||
        errorCode === 'P2002' ||
        // Verificar também no erro do connector
        error?.kind?.kind === 'QueryError' ||
        (error?.kind?.kind === 'ConnectorError' && hasPreparedStatementError) ||
        // Capturar erros de "Invalid invocation" que podem ser relacionados a prepared statements
        (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('invocation') && errorString.includes('prepared'))

      if (isConnectionError && i < retries - 1) {
        const delay = Math.min(200 * Math.pow(1.5, i), 2000) // Exponential backoff, max 2s, começa com 200ms
        console.warn(`[Prisma] Erro de conexão detectado (${errorCode || 'unknown'}), tentando novamente em ${delay}ms (${i + 1}/${retries})...`, {
          errorMessage: errorMessage.substring(0, 200),
          errorString: errorString.substring(0, 300)
        })
        
        // Aguardar antes de tentar novamente (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // Se não for erro de conexão ou já tentamos todas as vezes, lançar o erro
      throw error
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  console.error(`[Prisma] Todas as ${retries} tentativas falharam. Último erro:`, lastError)
  throw lastError || new Error('Número máximo de tentativas excedido')
}

