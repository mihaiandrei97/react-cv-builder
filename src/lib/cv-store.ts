import { createStore } from '@tanstack/react-store'
import { type FullCvData, type CvData, type CvProfile, DEFAULT_FULL_CV, projectCv } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export const DEFAULT_SECTION_ORDER = ['skills', 'languages', 'experience', 'projects', 'education', 'certifications']

function makeProfile(name: string, templateId = 'classic', data?: FullCvData): CvProfile {
  return {
    id: crypto.randomUUID(),
    name,
    templateId,
    data: data ? deepClone(data) : deepClone(DEFAULT_FULL_CV),
    hiddenSections: [],
    pageBreaks: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    colors: {},
    sectionLabels: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────

type ProfilesState = { profiles: CvProfile[]; activeProfileId: string }

function loadState(): ProfilesState {
  try {
    const raw = localStorage.getItem('cv-profiles')
    if (raw) return sanitizeProfiles(JSON.parse(raw) as ProfilesState)
  } catch {}

  // Migrate from the old single-profile format
  let data = deepClone(DEFAULT_FULL_CV)
  let templateId = 'classic'
  try {
    const rawData = localStorage.getItem('cv-data')
    if (rawData) data = { ...data, ...JSON.parse(rawData) }
  } catch {}
  try {
    const rawTemplate = localStorage.getItem('cv-template')
    if (rawTemplate) templateId = JSON.parse(rawTemplate) as string
  } catch {}

  const profile = makeProfile('My CV', templateId, data)
  return { profiles: [profile], activeProfileId: profile.id }
}

function sanitizeProfiles(state: ProfilesState): ProfilesState {
  return {
    ...state,
    profiles: state.profiles.map((p) => ({
      ...p,
      hiddenSections: p.hiddenSections ?? [],
      pageBreaks: p.pageBreaks ?? [],
      sectionOrder: p.sectionOrder ?? [...DEFAULT_SECTION_ORDER],
      colors: p.colors ?? {},
      sectionLabels: p.sectionLabels ?? {},
    })),
  }
}

function persist() {
  localStorage.setItem('cv-profiles', JSON.stringify(cvStore.state))
}

// ── Stores ────────────────────────────────────────────────────────────────────

export const cvStore = createStore<ProfilesState>(loadState())

/** Derived store: automatically recomputes whenever cvStore changes. */
export const cvDerived = createStore<CvData>(() => {
  const { profiles, activeProfileId } = cvStore.state
  const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0]
  return projectCv(active.data, active.templateId, active.hiddenSections ?? [], active.pageBreaks ?? [], active.sectionOrder ?? DEFAULT_SECTION_ORDER, active.colors ?? {}, active.sectionLabels ?? {})
})

// ── Mutations ─────────────────────────────────────────────────────────────────

export function setFullData(updater: (prev: FullCvData) => FullCvData) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId
        ? { ...p, data: updater(p.data), updatedAt: Date.now() }
        : p,
    ),
  }))
}

export function saveCv() {
  persist()
}

export function saveTemplatePref(id: string) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? { ...p, templateId: id, updatedAt: Date.now() } : p,
    ),
  }))
  persist()
}

export function resetCv() {
  const fresh = deepClone(DEFAULT_FULL_CV)
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? { ...p, data: fresh, updatedAt: Date.now() } : p,
    ),
  }))
  persist()
}

export function switchProfile(id: string) {
  cvStore.setState((state) => ({ ...state, activeProfileId: id }))
  persist()
}

export function addProfile(name: string) {
  const profile = makeProfile(name.trim() || 'New CV')
  cvStore.setState((state) => ({
    profiles: [...state.profiles, profile],
    activeProfileId: profile.id,
  }))
  persist()
  return profile.id
}

export function duplicateProfile(id: string) {
  const source = cvStore.state.profiles.find((p) => p.id === id)
  if (!source) return
  const copy = makeProfile(`${source.name} (copy)`, source.templateId, source.data)
  cvStore.setState((state) => ({
    profiles: [...state.profiles, copy],
    activeProfileId: copy.id,
  }))
  persist()
}

export function renameProfile(id: string, name: string) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
  }))
  persist()
}

export function deleteProfile(id: string) {
  if (cvStore.state.profiles.length <= 1) return
  cvStore.setState((state) => {
    const remaining = state.profiles.filter((p) => p.id !== id)
    const activeProfileId =
      state.activeProfileId === id ? remaining[0].id : state.activeProfileId
    return { profiles: remaining, activeProfileId }
  })
  persist()
}

export function toggleSection(section: string) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) => {
      if (p.id !== state.activeProfileId) return p
      const hidden = p.hiddenSections ?? []
      const hiddenSections = hidden.includes(section)
        ? hidden.filter((s) => s !== section)
        : [...hidden, section]
      return { ...p, hiddenSections, updatedAt: Date.now() }
    }),
  }))
  persist()
}

export function togglePageBreak(section: string) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) => {
      if (p.id !== state.activeProfileId) return p
      const breaks = p.pageBreaks ?? []
      const pageBreaks = breaks.includes(section)
        ? breaks.filter((s) => s !== section)
        : [...breaks, section]
      return { ...p, pageBreaks, updatedAt: Date.now() }
    }),
  }))
  persist()
}

export function setColors(colors: Record<string, string>) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? { ...p, colors, updatedAt: Date.now() } : p
    ),
  }))
  persist()
}

export function setSectionLabels(sectionLabels: Record<string, string>) {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? { ...p, sectionLabels, updatedAt: Date.now() } : p
    ),
  }))
  persist()
}

export function moveSection(section: string, direction: 'up' | 'down') {
  cvStore.setState((state) => ({
    ...state,
    profiles: state.profiles.map((p) => {
      if (p.id !== state.activeProfileId) return p
      const order = [...(p.sectionOrder ?? DEFAULT_SECTION_ORDER)]
      const idx = order.indexOf(section)
      if (idx < 0) return p
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= order.length) return p
      ;[order[idx], order[swapWith]] = [order[swapWith], order[idx]]
      return { ...p, sectionOrder: order, updatedAt: Date.now() }
    }),
  }))
  persist()
}

export function exportProfile(id: string) {
  const profile = cvStore.state.profiles.find((p) => p.id === id)
  if (!profile) return
  const json = JSON.stringify(profile, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-cv-backup.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importProfile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        // Basic shape validation
        if (
          typeof parsed !== 'object' ||
          typeof parsed.name !== 'string' ||
          typeof parsed.templateId !== 'string' ||
          typeof parsed.data !== 'object'
        ) {
          reject(new Error('Invalid backup file format.'))
          return
        }
        const profile: CvProfile = {
          ...parsed,
          id: crypto.randomUUID(), // fresh ID to avoid collisions
          name: parsed.name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        cvStore.setState((state) => ({
          profiles: [...state.profiles, profile],
          activeProfileId: profile.id,
        }))
        persist()
        resolve(profile.id)
      } catch {
        reject(new Error('Could not parse backup file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
