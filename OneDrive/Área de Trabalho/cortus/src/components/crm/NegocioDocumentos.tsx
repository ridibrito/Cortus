"use client";
import { Negocio } from '@/types/crm.types'

interface NegocioDocumentosProps {
  negocio: Negocio
}

export default function NegocioDocumentos({ negocio }: NegocioDocumentosProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
        Documentos
      </h3>

      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-2">
            Nenhum documento encontrado
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Os documentos relacionados a este negócio aparecerão aqui.
          </p>
        </div>
      </div>
    </div>
  )
}

