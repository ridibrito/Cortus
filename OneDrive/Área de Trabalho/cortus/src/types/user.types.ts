export interface UserProfile {
  id: string
  org_id: string
  nome: string
  email: string
  avatar_url: string | null
  ativo: boolean
  created_at: Date
  updated_at: Date
  org: {
    id: string
    nome: string
    plano: string
    logo_url: string | null
  }
  user_roles: Array<{
    role: {
      id: string
      nome: string
      descricao: string | null
    }
  }>
}

