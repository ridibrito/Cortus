"use client";
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  name: string
  tipo: 'pessoa' | 'empresa'
  contatoId?: string
  onUploadSuccess: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-20 w-20',
  lg: 'h-24 w-24',
}

export default function AvatarUpload({
  currentAvatarUrl,
  name,
  tipo,
  contatoId,
  onUploadSuccess,
  size = 'md',
  className = '',
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null)
  }, [currentAvatarUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !contatoId) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo inválido. Use JPEG, PNG ou WebP')
      return
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Fazer upload
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/crm/contatos/${contatoId}/upload-avatar`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await response.json()
      setPreviewUrl(data.url)
      onUploadSuccess(data.url)
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      alert(error.message || 'Erro ao fazer upload da imagem')
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    if (contatoId && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const isRounded = tipo === 'pessoa'
  const containerClass = isRounded ? 'rounded-full' : 'rounded-lg'

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!contatoId || isUploading}
      />
      
      {previewUrl ? (
        <div className={`relative ${sizeClasses[size]} ${containerClass} overflow-hidden border-2 border-gray-200 dark:border-gray-700`}>
          <Image
            src={previewUrl}
            alt={name}
            fill
            className="object-cover"
            sizes={`${size === 'sm' ? '64px' : size === 'md' ? '80px' : '96px'}`}
          />
        </div>
      ) : (
        <div className={`${sizeClasses[size]} ${containerClass} bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700`}>
          {tipo === 'pessoa' ? (
            <span className="text-gray-400 dark:text-gray-500 text-lg font-medium">
              {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          ) : (
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>
      )}

      {contatoId && (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className={`absolute bottom-0 right-0 ${size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-7 w-7'} ${isRounded ? 'rounded-full' : 'rounded'} bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Alterar foto"
        >
          {isUploading ? (
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
