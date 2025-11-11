'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/user.types'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const supabase = createClient()

  const fetchUserProfile = async (userEmail: string) => {
    setProfileLoading(true)
    try {
      console.log('[AuthContext] Buscando perfil do usuário...', userEmail)
      const response = await fetch('/api/user')
      
      console.log('[AuthContext] Resposta recebida:', response.status, response.statusText)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        console.error('[AuthContext] Erro ao buscar perfil do usuário:', error)
        
        // Se o usuário não foi encontrado no Prisma, pode ser que o signup não foi completado
        if (response.status === 404) {
          console.warn('[AuthContext] Usuário não encontrado no Prisma. Pode ser necessário completar o cadastro.')
        }
        setProfileLoading(false)
        return
      }
      
      const data = await response.json()
      console.log('[AuthContext] Dados do usuário recebidos:', data)
      
      if (!data.user) {
        console.error('[AuthContext] Resposta não contém dados do usuário')
        setProfileLoading(false)
        return
      }
      
      setUserProfile(data.user)
      console.log('[AuthContext] Perfil do usuário atualizado com sucesso')
    } catch (error: any) {
      console.error('[AuthContext] Erro ao buscar perfil do usuário:', error)
      console.error('[AuthContext] Stack trace:', error.stack)
      console.error('[AuthContext] Mensagem:', error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user?.email) {
          await fetchUserProfile(session.user.email)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user?.email) {
        await fetchUserProfile(session.user.email)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const refreshUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    
    if (user?.email) {
      await fetchUserProfile(user.email)
    }
  }

  const refreshUserProfile = async () => {
    if (user?.email) {
      await fetchUserProfile(user.email)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading: loading || profileLoading, 
      signOut, 
      refreshUser, 
      refreshUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

