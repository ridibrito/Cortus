// Types para o módulo CRM

// DEPRECATED: Lead será removido em versão futura, use Contato
export interface Lead {
  id: string
  org_id: string
  nome: string
  email?: string | null
  telefone?: string | null
  origem: string
  status: 'novo' | 'qualificado' | 'desqualificado'
  responsavel_id?: string | null
  score: number
  observacoes?: string | null
  created_at: Date
  updated_at: Date
  responsavel?: User | null
}

export interface Contato {
  id: string
  org_id: string
  nome: string
  email?: string | null
  telefone?: string | null
  cargo?: string | null
  tipo: 'pessoa' | 'empresa'
  cpf?: string | null
  razao_social?: string | null
  nome_fantasia?: string | null
  empresa_id?: string | null
  responsavel_id?: string | null
  avatar_url?: string | null
  created_at: Date
  updated_at: Date
  empresa?: Empresa | null
  responsavel?: User | null
  negocios?: Negocio[]
  calendarios?: Calendario[]
  calendario_participantes?: CalendarioParticipante[]
}

export interface Empresa {
  id: string
  org_id: string
  nome_fantasia: string
  razao_social?: string | null
  cnpj?: string | null
  segmento?: string | null
  site?: string | null
  cidade?: string | null
  tamanho?: 'pequena' | 'media' | 'grande' | null
  responsavel_id?: string | null
  created_at: Date
  updated_at: Date
  responsavel?: User | null
  contatos?: Contato[]
  negocios?: Negocio[]
  calendarios?: Calendario[]
}

// Pipelines e Etapas
export interface Pipeline {
  id: string
  org_id: string
  nome: string
  descricao?: string | null
  ativo: boolean
  is_padrao: boolean
  ordem: number
  created_at: Date
  updated_at: Date
  etapas?: Etapa[]
  negocios?: Negocio[]
}

export interface Etapa {
  id: string
  pipeline_id: string
  nome: string
  descricao?: string | null
  cor?: string | null
  ordem: number
  probabilidade: number
  is_final: boolean
  created_at: Date
  updated_at: Date
  pipeline?: Pipeline | null
  negocios?: Negocio[]
}

export interface CampoPersonalizado {
  id: string
  org_id: string
  pipeline_id?: string | null
  nome: string
  tipo: 'text' | 'number' | 'date' | 'select' | 'boolean'
  opcoes?: any | null // JSON para tipo select
  obrigatorio: boolean
  ordem: number
  ativo: boolean
  created_at: Date
  updated_at: Date
  pipeline?: Pipeline | null
}

export interface Negocio {
  id: string
  org_id: string
  pipeline_id?: string | null
  etapa_id?: string | null
  contato_id: string // OBRIGATÓRIO
  empresa_id?: string | null
  valor: number
  etapa: 'prospecting' | 'proposal' | 'negotiation' | 'closed' // DEPRECATED: usar etapa_id
  status: 'aberto' | 'ganho' | 'perdido'
  responsavel_id?: string | null
  probabilidade: number
  observacoes?: string | null
  campos_personalizados?: Record<string, any> | null
  created_at: Date
  updated_at: Date
  pipeline?: Pipeline | null
  etapa_rel?: Etapa | null
  contato?: Contato | null
  empresa?: Empresa | null
  responsavel?: User | null
  calendarios?: Calendario[]
}

export interface Proposta {
  id: string
  negocio_id: string
  modelo_id?: string | null
  valor: number
  status: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada'
  validade?: Date | null
  conteudo?: string | null
  created_at: Date
  updated_at: Date
  negocio?: Negocio | null
}

export interface User {
  id: string
  nome: string
  email: string
  avatar_url?: string | null
}

// DTOs para criação e atualização
export interface CreateContatoDto {
  nome: string
  email?: string
  telefone?: string
  cargo?: string
  tipo?: 'pessoa' | 'empresa'
  empresa_id?: string
  responsavel_id?: string
  avatar_url?: string
}

export interface UpdateContatoDto {
  nome?: string
  email?: string
  telefone?: string
  cargo?: string
  tipo?: 'pessoa' | 'empresa'
  empresa_id?: string
  responsavel_id?: string
  avatar_url?: string
}

export interface CreateEmpresaDto {
  nome_fantasia: string
  razao_social?: string
  cnpj?: string
  segmento?: string
  site?: string
  cidade?: string
  tamanho?: 'pequena' | 'media' | 'grande'
  responsavel_id?: string
}

export interface UpdateEmpresaDto {
  nome_fantasia?: string
  razao_social?: string
  cnpj?: string
  segmento?: string
  site?: string
  cidade?: string
  tamanho?: 'pequena' | 'media' | 'grande'
  responsavel_id?: string
}

export interface CreateNegocioDto {
  titulo?: string
  contato_id: string // OBRIGATÓRIO
  empresa_id?: string
  valor: number
  etapa?: 'prospecting' | 'proposal' | 'negotiation' | 'closed'
  probabilidade?: number
  observacoes?: string
  responsavel_id?: string
}

export interface UpdateNegocioDto {
  titulo?: string
  contato_id?: string
  empresa_id?: string
  valor?: number
  etapa?: 'prospecting' | 'proposal' | 'negotiation' | 'closed'
  status?: 'aberto' | 'ganho' | 'perdido'
  probabilidade?: number
  observacoes?: string
  responsavel_id?: string
}

export interface CreatePropostaDto {
  negocio_id: string
  modelo_id?: string
  valor: number
  validade?: Date
  conteudo?: string
}

export interface UpdatePropostaDto {
  modelo_id?: string
  valor?: number
  status?: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada'
  validade?: Date
  conteudo?: string
}

export interface Comunicacao {
  id: string
  org_id: string
  tipo: 'email' | 'whatsapp' | 'chat' | 'nota' | 'ligacao' | 'reuniao'
  origem_id?: string | null
  origem_tipo?: string | null // contato, negocio, projeto
  destino?: string | null
  canal?: string | null
  assunto?: string | null
  conteudo: string
  data_envio: Date
  status: 'enviado' | 'falhou' | 'pendente'
  metadata?: Record<string, any> | null
}

export interface CreateComunicacaoDto {
  tipo: 'email' | 'whatsapp' | 'chat' | 'nota' | 'ligacao' | 'reuniao'
  origem_id?: string
  origem_tipo?: string
  destino?: string
  canal?: string
  assunto?: string
  conteudo: string
  status?: 'enviado' | 'falhou' | 'pendente'
  metadata?: Record<string, any>
}

export interface Tarefa {
  id: string
  projeto_id?: string | null
  contato_id?: string | null
  titulo: string
  descricao?: string | null
  responsavel_id?: string | null
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluida'
  prazo?: Date | null
  concluida_em?: Date | null
  created_at: Date
  updated_at: Date
  projeto?: any | null
  contato?: Contato | null
  responsavel?: User | null
}

export interface CreateTarefaDto {
  projeto_id?: string
  contato_id?: string
  titulo: string
  descricao?: string
  responsavel_id?: string
  prioridade?: 'baixa' | 'media' | 'alta'
  status?: 'pendente' | 'em_andamento' | 'concluida'
  prazo?: Date | string
}

export interface UpdateTarefaDto {
  projeto_id?: string
  contato_id?: string
  titulo?: string
  descricao?: string
  responsavel_id?: string
  prioridade?: 'baixa' | 'media' | 'alta'
  status?: 'pendente' | 'em_andamento' | 'concluida'
  prazo?: Date | string
  concluida_em?: Date | string
}

export interface Calendario {
  id: string
  org_id: string
  usuario_id: string
  titulo: string
  descricao?: string | null
  data_inicio: Date
  data_fim: Date
  evento_externo_id?: string | null
  tipo: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
  localizacao?: string | null
  
  // Relacionamentos com entidades do CRM
  contato_id?: string | null
  empresa_id?: string | null
  negocio_id?: string | null
  projeto_id?: string | null
  
  // Campos para solicitação de reunião
  status: 'agendada' | 'pendente_confirmacao' | 'confirmada' | 'recusada' | 'cancelada'
  link_confirmacao?: string | null
  solicitada_em?: Date | null
  
  created_at: Date
  updated_at: Date
  
  usuario?: User | null
  contato?: Contato | null
  empresa?: Empresa | null
  negocio?: Negocio | null
  projeto?: Projeto | null
  participantes?: CalendarioParticipante[]
}

export interface CalendarioParticipante {
  id: string
  calendario_id: string
  tipo: 'usuario' | 'contato'
  usuario_id?: string | null
  contato_id?: string | null
  email?: string | null
  nome?: string | null
  status: 'pendente' | 'confirmado' | 'recusado'
  confirmado_em?: Date | null
  created_at: Date
  updated_at: Date
  
  calendario?: Calendario | null
  usuario?: User | null
  contato?: Contato | null
}

export interface CreateCalendarioDto {
  usuario_id: string
  titulo: string
  descricao?: string
  data_inicio: Date | string
  data_fim: Date | string
  evento_externo_id?: string
  tipo?: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
  localizacao?: string
  contato_id?: string
  empresa_id?: string
  negocio_id?: string
  projeto_id?: string
  status?: 'agendada' | 'pendente_confirmacao' | 'confirmada' | 'recusada' | 'cancelada'
  participantes?: CreateParticipanteDto[]
}

export interface CreateReuniaoDto {
  usuario_id: string
  titulo: string
  descricao?: string
  data_inicio: Date | string
  data_fim: Date | string
  localizacao?: string
  contato_id?: string
  empresa_id?: string
  negocio_id?: string
  projeto_id?: string
  participantes?: CreateParticipanteDto[]
  enviar_convite?: boolean
}

export interface CreateParticipanteDto {
  tipo: 'usuario' | 'contato'
  usuario_id?: string
  contato_id?: string
  email?: string
  nome?: string
}

export interface UpdateCalendarioDto {
  titulo?: string
  descricao?: string
  data_inicio?: Date | string
  data_fim?: Date | string
  evento_externo_id?: string
  tipo?: 'reuniao' | 'lembrete' | 'evento' | 'tarefa'
  localizacao?: string
  contato_id?: string
  empresa_id?: string
  negocio_id?: string
  projeto_id?: string
  status?: 'agendada' | 'pendente_confirmacao' | 'confirmada' | 'recusada' | 'cancelada'
}

export interface Projeto {
  id: string
  org_id: string
  contrato_id?: string | null
  nome: string
  descricao?: string | null
  status: 'planejamento' | 'em_andamento' | 'concluido'
  inicio?: Date | null
  fim?: Date | null
  responsavel_id?: string | null
  created_at: Date
  updated_at: Date
  responsavel?: User | null
  calendarios?: Calendario[]
}