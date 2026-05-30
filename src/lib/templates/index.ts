import React from 'react'
import type { CvData } from '../types'
import { ClassicDocument } from './Classic'
import { ModernDocument } from './Modern'
import { ExecutiveDocument } from './Executive'
import { CompactDocument } from './Compact'

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
    component: ClassicDocument as TemplateDefinition['component'],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark sidebar layout with sky-blue accents and clean sans-serif type.',
    component: ModernDocument as TemplateDefinition['component'],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Authoritative full-width serif layout with certifications — built for senior roles.',
    component: ExecutiveDocument as TemplateDefinition['component'],
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Two-column layout with a blue header bar, skills sidebar, and language section.',
    component: CompactDocument as TemplateDefinition['component'],
  },
]

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
