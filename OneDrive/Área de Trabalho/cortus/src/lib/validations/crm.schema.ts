import { z } from 'zod'

// DEPRECATED: Schemas de Lead mantidos temporariamente para compatibilidade
// Serão removidos em versão futura
export const createLeadSchema = z.preprocess(
  (data: any) => {
    return {
      ...data,
      email: data.email === undefined ? '' : data.email || '',
      telefone: data.telefone === undefined ? '' : data.telefone || '',
      observacoes: data.observacoes === undefined ? '' : data.observacoes || '',
      responsavel_id: data.responsavel_id === undefined ? '' : data.responsavel_id || '',
    }
  },
  z
    .object({
      nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
      email: z
        .string()
        .refine((val) => val === '' || z.string().email().safeParse(val).success, {
          message: 'Email inválido',
        })
        .transform((val) => (val === '' ? undefined : val)),
      telefone: z.string().transform((val) => (val === '' ? undefined : val)),
      origem: z.string().min(1, 'Origem é obrigatória'),
      observacoes: z.string().transform((val) => (val === '' ? undefined : val)),
      responsavel_id: z
        .string()
        .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
          message: 'ID inválido',
        })
        .transform((val) => (val === '' ? undefined : val)),
    })
    .partial({
      email: true,
      telefone: true,
      observacoes: true,
      responsavel_id: true,
    })
)

export const updateLeadSchema = z.preprocess(
  (data: any) => {
    return {
      ...data,
      email: data.email === undefined ? '' : data.email || '',
      telefone: data.telefone === undefined ? '' : data.telefone || '',
      observacoes: data.observacoes === undefined ? '' : data.observacoes || '',
      responsavel_id: data.responsavel_id === undefined ? '' : data.responsavel_id || '',
    }
  },
  z
    .object({
      nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
      email: z
        .string()
        .refine((val) => val === '' || z.string().email().safeParse(val).success, {
          message: 'Email inválido',
        })
        .transform((val) => (val === '' ? undefined : val)),
      telefone: z.string().transform((val) => (val === '' ? undefined : val)),
      origem: z.string().min(1, 'Origem é obrigatória'),
      status: z.enum(['novo', 'qualificado', 'desqualificado']),
      observacoes: z.string().transform((val) => (val === '' ? undefined : val)),
      responsavel_id: z
        .string()
        .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
          message: 'ID inválido',
        })
        .transform((val) => (val === '' ? undefined : val)),
      score: z.number().min(0).max(100),
    })
    .partial()
)

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>

export type CreatePropostaInput = z.infer<typeof createPropostaSchema>
export type UpdatePropostaInput = z.infer<typeof updatePropostaSchema>

// Schema de validação para Contato
export const createContatoSchema = z.preprocess(
  (data: any) => {
    const processed = {
      ...data,
      email: data.email === undefined ? '' : data.email || '',
      telefone: data.telefone === undefined ? '' : data.telefone || '',
      cargo: data.cargo === undefined ? '' : data.cargo || '',
      cpf: data.cpf === undefined ? '' : data.cpf || '',
      razao_social: data.razao_social === undefined ? '' : data.razao_social || '',
      nome_fantasia: data.nome_fantasia === undefined ? '' : data.nome_fantasia || '',
      empresa_id: data.empresa_id === undefined ? '' : data.empresa_id || '',
      responsavel_id: data.responsavel_id === undefined ? '' : data.responsavel_id || '',
    }
    
    // Se tipo for empresa e não tiver nome, usar nome_fantasia ou razao_social
    if (processed.tipo === 'empresa' && (!processed.nome || processed.nome.trim() === '')) {
      processed.nome = processed.nome_fantasia || processed.razao_social || ''
    }
    
    return processed
  },
  z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z
      .string()
      .refine((val) => val === '' || z.string().email().safeParse(val).success, {
        message: 'Email inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
    telefone: z.string().transform((val) => (val === '' ? undefined : val)),
    cargo: z.string().transform((val) => (val === '' ? undefined : val)),
    tipo: z.enum(['pessoa', 'empresa']).default('pessoa'),
    cpf: z.string().transform((val) => (val === '' ? undefined : val)),
    razao_social: z.string().transform((val) => (val === '' ? undefined : val)),
    nome_fantasia: z.string().transform((val) => (val === '' ? undefined : val)),
    empresa_id: z
      .string()
      .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
        message: 'ID inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
    responsavel_id: z
      .string()
      .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
        message: 'ID inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
    avatar_url: z.string().url().optional().or(z.literal('')).transform((val) => (val === '' ? undefined : val)),
  })
  .partial({
    email: true,
    telefone: true,
    cargo: true,
    cpf: true,
    razao_social: true,
    nome_fantasia: true,
    empresa_id: true,
    responsavel_id: true,
    avatar_url: true,
  })
)

export const updateContatoSchema = z.preprocess(
  (data: any) => {
    const processed = {
      ...data,
      email: data.email === undefined ? '' : data.email || '',
      telefone: data.telefone === undefined ? '' : data.telefone || '',
      cargo: data.cargo === undefined ? '' : data.cargo || '',
      cpf: data.cpf === undefined ? '' : data.cpf || '',
      razao_social: data.razao_social === undefined ? '' : data.razao_social || '',
      nome_fantasia: data.nome_fantasia === undefined ? '' : data.nome_fantasia || '',
      empresa_id: data.empresa_id === undefined ? '' : data.empresa_id || '',
      responsavel_id: data.responsavel_id === undefined ? '' : data.responsavel_id || '',
      avatar_url: data.avatar_url === undefined ? '' : data.avatar_url || '',
    }
    
    // Se tipo for empresa e não tiver nome, usar nome_fantasia ou razao_social
    if (processed.tipo === 'empresa' && (!processed.nome || processed.nome.trim() === '')) {
      processed.nome = processed.nome_fantasia || processed.razao_social || ''
    }
    
    return processed
  },
  z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z
      .string()
      .refine((val) => val === '' || z.string().email().safeParse(val).success, {
        message: 'Email inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
    telefone: z.string().transform((val) => (val === '' ? undefined : val)),
    cargo: z.string().transform((val) => (val === '' ? undefined : val)),
    tipo: z.enum(['pessoa', 'empresa']),
    cpf: z.string().transform((val) => (val === '' ? undefined : val)),
    razao_social: z.string().transform((val) => (val === '' ? undefined : val)),
    nome_fantasia: z.string().transform((val) => (val === '' ? undefined : val)),
    empresa_id: z
      .string()
      .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
        message: 'ID inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
    responsavel_id: z
      .string()
      .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
        message: 'ID inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
    avatar_url: z.string().url().optional().or(z.literal('')).transform((val) => (val === '' ? undefined : val)),
  })
  .partial()
)

export type CreateContatoInput = z.infer<typeof createContatoSchema>
export type UpdateContatoInput = z.infer<typeof updateContatoSchema>

// Schema de validação para Empresa
export const createEmpresaSchema = z.preprocess(
  (data: any) => {
    return {
      ...data,
      razao_social: data.razao_social === undefined ? '' : data.razao_social || '',
      cnpj: data.cnpj === undefined ? '' : data.cnpj || '',
      segmento: data.segmento === undefined ? '' : data.segmento || '',
      site: data.site === undefined ? '' : data.site || '',
      cidade: data.cidade === undefined ? '' : data.cidade || '',
      responsavel_id: data.responsavel_id === undefined ? '' : data.responsavel_id || '',
    }
  },
  z.object({
    nome_fantasia: z.string().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
    razao_social: z.string().transform((val) => (val === '' ? undefined : val)),
    cnpj: z.string().transform((val) => (val === '' ? undefined : val)),
    segmento: z.string().transform((val) => (val === '' ? undefined : val)),
    site: z.string().transform((val) => (val === '' ? undefined : val)),
    cidade: z.string().transform((val) => (val === '' ? undefined : val)),
    tamanho: z.enum(['pequena', 'media', 'grande']).optional(),
    responsavel_id: z
      .string()
      .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
        message: 'ID inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
  })
  .partial({
    razao_social: true,
    cnpj: true,
    segmento: true,
    site: true,
    cidade: true,
    tamanho: true,
    responsavel_id: true,
  })
)

export const updateEmpresaSchema = z.preprocess(
  (data: any) => {
    return {
      ...data,
      razao_social: data.razao_social === undefined ? '' : data.razao_social || '',
      cnpj: data.cnpj === undefined ? '' : data.cnpj || '',
      segmento: data.segmento === undefined ? '' : data.segmento || '',
      site: data.site === undefined ? '' : data.site || '',
      cidade: data.cidade === undefined ? '' : data.cidade || '',
      responsavel_id: data.responsavel_id === undefined ? '' : data.responsavel_id || '',
    }
  },
  z.object({
    nome_fantasia: z.string().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
    razao_social: z.string().transform((val) => (val === '' ? undefined : val)),
    cnpj: z.string().transform((val) => (val === '' ? undefined : val)),
    segmento: z.string().transform((val) => (val === '' ? undefined : val)),
    site: z.string().transform((val) => (val === '' ? undefined : val)),
    cidade: z.string().transform((val) => (val === '' ? undefined : val)),
    tamanho: z.enum(['pequena', 'media', 'grande']),
    responsavel_id: z
      .string()
      .refine((val) => val === '' || z.string().uuid().safeParse(val).success, {
        message: 'ID inválido',
      })
      .transform((val) => (val === '' ? undefined : val)),
  })
  .partial()
)

export type CreateEmpresaInput = z.infer<typeof createEmpresaSchema>
export type UpdateEmpresaInput = z.infer<typeof updateEmpresaSchema>

// Schema de validação para Negócio
export const createNegocioSchema = z.object({
  contato_id: z.string().uuid('ID do contato inválido'),
  empresa_id: z.string().uuid().optional().or(z.literal('')),
  pipeline_id: z.string().uuid().optional().or(z.literal('')),
  etapa_id: z.string().uuid().optional().or(z.literal('')),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  etapa: z.enum(['prospecting', 'proposal', 'negotiation', 'closed']).optional(),
  probabilidade: z.number().min(0).max(100).optional(),
  observacoes: z.string().optional(),
  responsavel_id: z.string().uuid().optional().or(z.literal('')),
})

export const updateNegocioSchema = z.object({
  contato_id: z.string().uuid().optional(),
  empresa_id: z.string().optional().or(z.literal('')),
  pipeline_id: z.string().uuid().optional().or(z.literal('')),
  etapa_id: z.string().uuid().optional().or(z.literal('')),
  valor: z.number().min(0, 'Valor deve ser positivo').optional(),
  etapa: z.enum(['prospecting', 'proposal', 'negotiation', 'closed']).optional(),
  status: z.enum(['aberto', 'ganho', 'perdido']).optional(),
  probabilidade: z.number().min(0).max(100).optional(),
  observacoes: z.string().optional(),
  responsavel_id: z.string().uuid().optional().or(z.literal('')),
})

export type CreateNegocioInput = z.infer<typeof createNegocioSchema>
export type UpdateNegocioInput = z.infer<typeof updateNegocioSchema>

// Schema de validação para Proposta
export const createPropostaSchema = z.preprocess(
  (data: any) => {
    // Converter validade de string para Date se necessário
    if (data.validade && typeof data.validade === 'string' && data.validade !== '') {
      return {
        ...data,
        validade: new Date(data.validade),
      }
    }
    return data
  },
  z.object({
    negocio_id: z.string().uuid('ID do negócio inválido'),
    modelo_id: z.string().optional().or(z.literal('')),
    valor: z.number().min(0, 'Valor deve ser positivo'),
    validade: z.date().optional(),
    conteudo: z.string().optional(),
  })
)

export const updatePropostaSchema = z.preprocess(
  (data: any) => {
    // Converter validade de string para Date se necessário
    if (data.validade && typeof data.validade === 'string' && data.validade !== '') {
      return {
        ...data,
        validade: new Date(data.validade),
      }
    }
    return data
  },
  z.object({
    modelo_id: z.string().optional().or(z.literal('')),
    valor: z.number().min(0, 'Valor deve ser positivo').optional(),
    status: z.enum(['rascunho', 'enviada', 'aceita', 'rejeitada']).optional(),
    validade: z.date().optional(),
    conteudo: z.string().optional(),
  })
)

export type CreatePropostaInput = z.infer<typeof createPropostaSchema>
export type UpdatePropostaInput = z.infer<typeof updatePropostaSchema>

// Schema de validação para Participante
export const createParticipanteSchema = z.object({
  tipo: z.enum(['usuario', 'contato'], {
    required_error: 'Tipo de participante é obrigatório',
  }),
  usuario_id: z.string().uuid().optional(),
  contato_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  nome: z.string().optional(),
}).refine(
  (data) => {
    if (data.tipo === 'usuario') {
      return !!data.usuario_id
    }
    if (data.tipo === 'contato') {
      return !!data.contato_id || (!!data.email && !!data.nome)
    }
    return false
  },
  {
    message: 'Deve fornecer usuario_id para tipo usuario, ou contato_id/email+nome para tipo contato',
  }
)

export const addParticipanteSchema = createParticipanteSchema

// Schema base para Calendário/Evento (sem preprocess para permitir extend)
const calendarioBaseSchema = z.object({
  usuario_id: z.string().uuid('ID do usuário inválido'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  data_inicio: z.date({ required_error: 'Data de início é obrigatória' }),
  data_fim: z.date({ required_error: 'Data de fim é obrigatória' }),
  evento_externo_id: z.string().optional(),
  tipo: z.enum(['reuniao', 'lembrete', 'evento', 'tarefa']).default('reuniao'),
  localizacao: z.string().optional(),
  contato_id: z.string().uuid().optional(),
  empresa_id: z.string().uuid().optional(),
  negocio_id: z.string().uuid().optional(),
  projeto_id: z.string().uuid().optional(),
  status: z.enum(['agendada', 'pendente_confirmacao', 'confirmada', 'recusada', 'cancelada']).default('agendada'),
  participantes: z.array(createParticipanteSchema).optional(),
}).refine(
  (data) => data.data_fim > data.data_inicio,
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['data_fim'],
  }
)

// Schema de validação para Calendário/Evento
export const createCalendarioSchema = z.preprocess(
  (data: any) => {
    // Converter datas de string para Date se necessário
    const processed = { ...data }
    if (data.data_inicio && typeof data.data_inicio === 'string') {
      processed.data_inicio = new Date(data.data_inicio)
    }
    if (data.data_fim && typeof data.data_fim === 'string') {
      processed.data_fim = new Date(data.data_fim)
    }
    return processed
  },
  calendarioBaseSchema
)

// Schema de validação para Reunião (com opção de enviar convite)
export const createReuniaoSchema = calendarioBaseSchema.safeExtend({
  enviar_convite: z.boolean().default(false),
})

// Schema de validação para atualizar Calendário
export const updateCalendarioSchema = z.preprocess(
  (data: any) => {
    const processed = { ...data }
    if (data.data_inicio && typeof data.data_inicio === 'string') {
      processed.data_inicio = new Date(data.data_inicio)
    }
    if (data.data_fim && typeof data.data_fim === 'string') {
      processed.data_fim = new Date(data.data_fim)
    }
    return processed
  },
  z.object({
    titulo: z.string().min(1, 'Título é obrigatório').optional(),
    descricao: z.string().optional(),
    data_inicio: z.date().optional(),
    data_fim: z.date().optional(),
    evento_externo_id: z.string().optional(),
    tipo: z.enum(['reuniao', 'lembrete', 'evento', 'tarefa']).optional(),
    localizacao: z.string().optional(),
    contato_id: z.string().uuid().optional(),
    empresa_id: z.string().uuid().optional(),
    negocio_id: z.string().uuid().optional(),
    projeto_id: z.string().uuid().optional(),
    status: z.enum(['agendada', 'pendente_confirmacao', 'confirmada', 'recusada', 'cancelada']).optional(),
  }).refine(
    (data) => {
      if (data.data_inicio && data.data_fim) {
        return data.data_fim > data.data_inicio
      }
      return true
    },
    {
      message: 'Data de fim deve ser posterior à data de início',
      path: ['data_fim'],
    }
  )
)

// Schema para confirmar/recusar reunião
export const confirmarReuniaoSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  status: z.enum(['confirmada', 'recusada'], {
    required_error: 'Status deve ser confirmada ou recusada',
  }),
})

export type CreateParticipanteInput = z.infer<typeof createParticipanteSchema>
export type CreateCalendarioInput = z.infer<typeof createCalendarioSchema>
export type CreateReuniaoInput = z.infer<typeof createReuniaoSchema>
export type UpdateCalendarioInput = z.infer<typeof updateCalendarioSchema>
export type ConfirmarReuniaoInput = z.infer<typeof confirmarReuniaoSchema>