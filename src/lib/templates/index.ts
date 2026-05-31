import React from 'react'
import type { CvData } from '../types'
import { ClassicDocument, COLOR_SLOTS as CLASSIC_SLOTS } from './Classic'
import { ModernDocument, COLOR_SLOTS as MODERN_SLOTS } from './Modern'
import { ExecutiveDocument, COLOR_SLOTS as EXECUTIVE_SLOTS } from './Executive'
import { CompactDocument, COLOR_SLOTS as COMPACT_SLOTS } from './Compact'

export type ColorSlot = { key: string; label: string; default: string }

export type TemplateDefinition = {
  id: string
  name: string
  description: string
  component: (props: { cv: CvData }) => React.ReactNode
  colorSlots: ColorSlot[]
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Warm serif typography with a traditional two-column header and parchment tones.',
    component: ClassicDocument as TemplateDefinition['component'],
    colorSlots: CLASSIC_SLOTS,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark sidebar layout with sky-blue accents and clean sans-serif type.',
    component: ModernDocument as TemplateDefinition['component'],
    colorSlots: MODERN_SLOTS,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Authoritative full-width serif layout with certifications — built for senior roles.',
    component: ExecutiveDocument as TemplateDefinition['component'],
    colorSlots: EXECUTIVE_SLOTS,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Two-column layout with a blue header bar, skills sidebar, and language section.',
    component: CompactDocument as TemplateDefinition['component'],
    colorSlots: COMPACT_SLOTS,
  },
]

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
