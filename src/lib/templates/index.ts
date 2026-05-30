import React from 'react'
import type { CvData } from '../types'
import { ClassicDocument } from './Classic'
import { ModernDocument } from './Modern'

export type TemplateDefinition = {
  id: string
  name: string
  description: string
  component: (props: { cv: CvData }) => React.ReactNode
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Warm serif typography with a traditional two-column header and parchment tones.',
    component: ClassicDocument,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark sidebar layout with sky-blue accents and clean sans-serif type.',
    component: ModernDocument,
  },
]

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
