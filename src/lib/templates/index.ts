import React from 'react'
import type { CvData } from '../types'

export type ColorSlot = { key: string; label: string; default: string; presets?: string[] }
export type TemplateComponent = (props: { cv: CvData }) => React.ReactNode
export type TemplateId = 'classic' | 'modern' | 'executive' | 'compact' | 'minimal' | 'sidebar' | 'timeline'

export type TemplateDefinition = {
  id: TemplateId
  name: string
  description: string
  colorSlots: ColorSlot[]
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Warm serif typography with a traditional two-column header and parchment tones.',
    colorSlots: [
      {
        key: 'accent', label: 'Accent', default: '#c06b31',
        presets: ['#c06b31', '#a14a1f', '#7a4a2a', '#3f6b4a', '#1a5c8a', '#5b3a8a'],
      },
      {
        key: 'ink', label: 'Text', default: '#222222',
        presets: ['#222222', '#1a1a18', '#2d2d2d', '#3a3a3a', '#1a1a2e', '#2b1a1a'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#5d5d55',
        presets: ['#5d5d55', '#6b6b62', '#4a4a44', '#757575', '#5a5a52', '#665c4d'],
      },
    ],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark sidebar layout with sky-blue accents and clean sans-serif type.',
    colorSlots: [
      {
        key: 'sidebarBg', label: 'Sidebar', default: '#1e2b3c',
        presets: ['#1e2b3c', '#0f172a', '#1a1a1a', '#2c1e3c', '#1e3c2c', '#3c1e1e'],
      },
      {
        key: 'sidebarAccent', label: 'Sidebar Accent', default: '#7dd3fc',
        presets: ['#7dd3fc', '#fbbf24', '#a7f3d0', '#f0abfc', '#fed7aa', '#bfdbfe'],
      },
      {
        key: 'accent', label: 'Accent', default: '#0ea5e9',
        presets: ['#0ea5e9', '#2563eb', '#7c3aed', '#db2777', '#16a34a', '#ea580c'],
      },
      {
        key: 'ink', label: 'Text', default: '#0f172a',
        presets: ['#0f172a', '#111111', '#1e293b', '#1a1a1a', '#222222', '#0c1a2e'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#64748b',
        presets: ['#64748b', '#475569', '#94a3b8', '#5a5a52', '#71717a', '#525252'],
      },
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Authoritative full-width serif layout with certifications — built for senior roles.',
    colorSlots: [
      {
        key: 'accent', label: 'Accent', default: '#8b3a1e',
        presets: ['#8b3a1e', '#1a3a5c', '#3a4a2a', '#5c1a3a', '#4a3a1a', '#1a5c5c'],
      },
      {
        key: 'ink', label: 'Text', default: '#1a1a18',
        presets: ['#1a1a18', '#111111', '#222222', '#2d2d2d', '#1a1a2e', '#2b1a1a'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#5a5a52',
        presets: ['#5a5a52', '#6b6b62', '#4a4a44', '#757575', '#5d5d55', '#665c4d'],
      },
    ],
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Two-column layout with a blue header bar, skills sidebar, and language section.',
    colorSlots: [
      {
        key: 'accent', label: 'Accent', default: '#1a5c8a',
        presets: ['#1a5c8a', '#0f766e', '#7c3aed', '#be123c', '#c2410c', '#15803d'],
      },
      {
        key: 'ink', label: 'Text', default: '#111111',
        presets: ['#111111', '#1a1a1a', '#222222', '#1e293b', '#1a1a18', '#2d2d2d'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#606060',
        presets: ['#606060', '#5a5a52', '#6b6b62', '#757575', '#64748b', '#71717a'],
      },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Airy single-column layout with centered header, hairline rules, and inline skills.',
    colorSlots: [
      {
        key: 'accent', label: 'Accent', default: '#44403c',
        presets: ['#44403c', '#1c1c1a', '#3a3a3a', '#5a5a52', '#6b6b62', '#2d2d2d'],
      },
      {
        key: 'ink', label: 'Text', default: '#1c1c1a',
        presets: ['#1c1c1a', '#111111', '#222222', '#1a1a18', '#2d2d2d', '#1e293b'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#6b6b62',
        presets: ['#6b6b62', '#5a5a52', '#757575', '#64748b', '#71717a', '#525252'],
      },
    ],
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Light cream sidebar on the right with contact, skills, and languages; main content on the left.',
    colorSlots: [
      {
        key: 'sidebarBg', label: 'Sidebar', default: '#f6f1e7',
        presets: ['#f6f1e7', '#f0ebe0', '#eef2f7', '#f0e8f0', '#e8f0ea', '#f7eaea'],
      },
      {
        key: 'accent', label: 'Accent', default: '#1f3a5f',
        presets: ['#1f3a5f', '#0f766e', '#7c3aed', '#be123c', '#c2410c', '#15803d'],
      },
      {
        key: 'ink', label: 'Text', default: '#1c1c1a',
        presets: ['#1c1c1a', '#111111', '#222222', '#1a1a18', '#2d2d2d', '#1e293b'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#6b6b62',
        presets: ['#6b6b62', '#5a5a52', '#757575', '#64748b', '#71717a', '#525252'],
      },
    ],
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Centered header with a vertical accent timeline and dot markers for experience entries.',
    colorSlots: [
      {
        key: 'accent', label: 'Accent', default: '#0f766e',
        presets: ['#0f766e', '#1f3a5f', '#7c3aed', '#be123c', '#c2410c', '#1a5c8a'],
      },
      {
        key: 'ink', label: 'Text', default: '#1c1c1a',
        presets: ['#1c1c1a', '#111111', '#222222', '#1a1a18', '#2d2d2d', '#1e293b'],
      },
      {
        key: 'muted', label: 'Secondary Text', default: '#6b6b62',
        presets: ['#6b6b62', '#5a5a52', '#757575', '#64748b', '#71717a', '#525252'],
      },
    ],
  },
]

const componentCache: Partial<Record<TemplateId, Promise<TemplateComponent>>> = {}

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!
}

export function loadTemplateComponent(id: string): Promise<TemplateComponent> {
  const templateId = getTemplate(id).id
  if (!componentCache[templateId]) {
    componentCache[templateId] = (() => {
      switch (templateId) {
        case 'classic':
          return import('./Classic').then((m) => m.ClassicDocument as TemplateComponent)
        case 'modern':
          return import('./Modern').then((m) => m.ModernDocument as TemplateComponent)
        case 'executive':
          return import('./Executive').then((m) => m.ExecutiveDocument as TemplateComponent)
        case 'compact':
          return import('./Compact').then((m) => m.CompactDocument as TemplateComponent)
        case 'minimal':
          return import('./Minimal').then((m) => m.MinimalDocument as TemplateComponent)
        case 'sidebar':
          return import('./Sidebar').then((m) => m.SidebarDocument as TemplateComponent)
        case 'timeline':
          return import('./Timeline').then((m) => m.TimelineDocument as TemplateComponent)
      }
    })()
  }
  return componentCache[templateId]!
}
