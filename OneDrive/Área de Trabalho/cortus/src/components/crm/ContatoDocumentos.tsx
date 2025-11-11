"use client";
import { Contato } from '@/types/crm.types'

interface ContatoDocumentosProps {
  contato: Contato
}

export default function ContatoDocumentos({ contato }: ContatoDocumentosProps) {
  // TODO: Implementar upload e listagem de documentos via Supabase Storage
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
        Documentos
      </h3>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>Nenhum documento anexado ainda.</p>
        <p className="text-xs mt-2">Os documentos anexados aparecerão aqui.</p>
      </div>
    </div>
  )
}

