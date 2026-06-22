import { type CvProfile, makeDefaultFullCv } from './types'

export type ProfilesState = {
  schemaVersion: number
  profiles: CvProfile[]
  activeProfileId: string
}

const STORAGE_KEY = 'cv-profiles'
const CURRENT_SCHEMA_VERSION = 1

function sanitizeProfiles(state: ProfilesState, defaultSectionOrder: string[]): ProfilesState {
  const profiles = (state.profiles ?? []).map((p) => ({
    ...p,
    locale: p.locale ?? 'en',
    data: p.data ?? makeDefaultFullCv(p.locale ?? 'en'),
    sectionLabels: p.sectionLabels ?? {},
    hiddenSections: p.hiddenSections ?? [],
    pageBreaks: p.pageBreaks ?? [],
    sectionOrder: p.sectionOrder ?? [...defaultSectionOrder],
    colors: p.colors ?? {},
  }))

  for (const p of profiles) {
    p.data = {
      ...p.data,
      skills: p.data.skills ?? [],
      experiences: p.data.experiences ?? [],
      projects: p.data.projects ?? [],
      education: p.data.education ?? [],
      certifications: p.data.certifications ?? [],
      languages: p.data.languages ?? [],
      customSections: p.data.customSections ?? [],
    }
  }

  const activeProfileId = profiles.some((p) => p.id === state.activeProfileId)
    ? state.activeProfileId
    : (profiles[0]?.id ?? '')

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profiles,
    activeProfileId,
  }
}

export function loadProfilesState(options: {
  defaultSectionOrder: string[]
}): ProfilesState {
  const { defaultSectionOrder } = options

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfilesState>
      return sanitizeProfiles({
        schemaVersion: parsed.schemaVersion ?? CURRENT_SCHEMA_VERSION,
        profiles: parsed.profiles ?? [],
        activeProfileId: parsed.activeProfileId ?? '',
      }, defaultSectionOrder)
    }
  } catch {}

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profiles: [],
    activeProfileId: '',
  }
}

export function saveProfilesState(state: ProfilesState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createDebouncedStateSaver<T>(save: (state: T) => void, delayMs = 400) {
  let timer: number | null = null

  return (state: T, immediate = false) => {
    if (timer !== null) {
      window.clearTimeout(timer)
      timer = null
    }

    if (immediate) {
      save(state)
      return
    }

    timer = window.setTimeout(() => {
      save(state)
      timer = null
    }, delayMs)
  }
}
