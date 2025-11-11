"use client";
import React from 'react'

type ViewType = 'kanban' | 'lista' | 'cards'

interface ViewToggleProps {
  view: ViewType
  onChange: (view: ViewType) => void
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
      <button
        onClick={() => onChange('kanban')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          view === 'kanban'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          Kanban
        </div>
      </button>
      <button
        onClick={() => onChange('lista')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          view === 'lista'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          Lista
        </div>
      </button>
      <button
        onClick={() => onChange('cards')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          view === 'cards'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Cards
        </div>
      </button>
    </div>
  )
}

