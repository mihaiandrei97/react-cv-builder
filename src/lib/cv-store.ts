import { createStore } from '@tanstack/react-store'
import { type FullCvData, type CvData, DEFAULT_FULL_CV, projectCv } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function loadFullCv(): FullCvData {
  try {
    const raw = localStorage.getItem('cv-data')
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FullCvData>
      return { ...deepClone(DEFAULT_FULL_CV), ...parsed }
    }
  } catch {}
  return deepClone(DEFAULT_FULL_CV)
}

function loadTemplatePref(): string {
  try {
    const raw = localStorage.getItem('cv-template')
    if (raw) return JSON.parse(raw) as string
  } catch {}
  return 'classic'
}

// ── Stores ────────────────────────────────────────────────────────────────────

type CvStoreState = { fullData: FullCvData; templateId: string }

export const cvStore = createStore<CvStoreState>({
  fullData: loadFullCv(),
  templateId: loadTemplatePref(),
})

/** Derived store: automatically recomputes whenever cvStore changes. */
export const cvDerived = createStore<CvData>(() =>
  projectCv(cvStore.state.fullData, cvStore.state.templateId),
)

// ── Mutations ─────────────────────────────────────────────────────────────────

export function setFullData(updater: (prev: FullCvData) => FullCvData) {
  cvStore.setState((state) => ({ ...state, fullData: updater(state.fullData) }))
}

export function saveCv() {
  localStorage.setItem('cv-data', JSON.stringify(cvStore.state.fullData))
}

export function saveTemplatePref(id: string) {
  localStorage.setItem('cv-template', JSON.stringify(id))
  cvStore.setState((state) => ({ ...state, templateId: id }))
}

export function resetCv() {
  const fresh = deepClone(DEFAULT_FULL_CV)
  cvStore.setState((state) => ({ ...state, fullData: fresh }))
  localStorage.setItem('cv-data', JSON.stringify(fresh))
}
