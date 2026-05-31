import React from 'react'
import type { CvData } from '../types'

export type ColorSlot = { key: string; label: string; default: string }
export type TemplateComponent = (props: { cv: CvData }) => React.ReactNode
export type TemplateId = 'classic' | 'modern' | 'executive' | 'compact'

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
      { key: 'accent', label: 'Accent', default: '#c06b31' },
      { key: 'paper', label: 'Background', default: '#fcfcf8' },
    ],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark sidebar layout with sky-blue accents and clean sans-serif type.',
    colorSlots: [
      { key: 'sidebarBg', label: 'Sidebar', default: '#1e2b3c' },
      { key: 'sidebarAccent', label: 'Sidebar Accent', default: '#7dd3fc' },
      { key: 'accent', label: 'Accent', default: '#0ea5e9' },
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Authoritative full-width serif layout with certifications — built for senior roles.',
    colorSlots: [
      { key: 'accent', label: 'Accent', default: '#8b3a1e' },
      { key: 'paper', label: 'Background', default: '#fafaf7' },
    ],
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Two-column layout with a blue header bar, skills sidebar, and language section.',
    colorSlots: [{ key: 'accent', label: 'Accent', default: '#1a5c8a' }],
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
      }
    })()
  }
  return componentCache[templateId]!
}
