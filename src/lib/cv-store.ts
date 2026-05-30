import { createStore } from '@tanstack/react-store'
import { type FullCvData, type CvData, type CvProfile, DEFAULT_FULL_CV, projectCv } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function makeProfile(name: string, templateId = 'classic', data?: FullCvData): CvProfile {
  return {
    id: crypto.randomUUID(),
    name,
    templateId,
    data: data ? deepClone(data) : deepClone(DEFAULT_FULL_CV),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────

type ProfilesState = { profiles: CvProfile[]; activeProfileId: string }

function loadState(): ProfilesState {
  try {
    const raw = localStorage.getItem('cv-profiles')
    if (raw) return JSON.parse(raw) as ProfilesState
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

function persist() {
  localStorage.setItem('cv-profiles', JSON.stringify(cvStore.state))
}

// ── Stores ────────────────────────────────────────────────────────────────────

export const cvStore = createStore<ProfilesState>(loadState())

/** Derived store: automatically recomputes whenever cvStore changes. */
export const cvDerived = createStore<CvData>(() => {
  const { profiles, activeProfileId } = cvStore.state
  const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0]
  return projectCv(active.data, active.templateId)
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
