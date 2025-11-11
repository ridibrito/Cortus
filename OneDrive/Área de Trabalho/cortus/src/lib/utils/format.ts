/**
 * Utilitários para formatação de dados brasileiros
 */

/**
 * Formata CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata telefone brasileiro ((00) 00000-0000 ou (00) 0000-0000)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // Celular: (00) 00000-0000
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    // Fixo: (00) 0000-0000
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Formata valor monetário em R$
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata valor monetário para input (sem símbolo R$)
 */
export function formatCurrencyInput(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value
  if (isNaN(numValue)) return ''
  if (numValue === 0) return '0,00'
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

/**
 * Converte string formatada de moeda para número
 */
export function parseCurrency(value: string): number {
  // Remove tudo exceto números
  const cleaned = value.replace(/\D/g, '')
  if (!cleaned) return 0
  
  // Divide por 100 para converter centavos em reais
  return parseFloat(cleaned) / 100
}

/**
 * Formata data em formato brasileiro
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Formata data e hora em formato brasileiro
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Formata data relativa (há X dias, hoje, etc)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Hoje'
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `Há ${diffInDays} dias`
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `Há ${Math.floor(diffInDays / 30)} meses`
  return `Há ${Math.floor(diffInDays / 365)} anos`
}

