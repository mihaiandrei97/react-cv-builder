import { type CvProfile, type FullCvData, DEFAULT_FULL_CV } from './types'

export type ProfilesState = {
  schemaVersion: number
  profiles: CvProfile[]
  activeProfileId: string
}

const STORAGE_KEY = 'cv-profiles'
const LEGACY_DATA_KEY = 'cv-data'
const LEGACY_TEMPLATE_KEY = 'cv-template'
const CURRENT_SCHEMA_VERSION = 1

type MakeProfile = (name: string, templateId?: string, data?: FullCvData) => CvProfile

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function sanitizeProfiles(state: ProfilesState, defaultSectionOrder: string[]): ProfilesState {
  const profiles = (state.profiles ?? []).map((p) => ({
    ...p,
    hiddenSections: p.hiddenSections ?? [],
    pageBreaks: p.pageBreaks ?? [],
    sectionOrder: p.sectionOrder ?? [...defaultSectionOrder],
    colors: p.colors ?? {},
    sectionLabels: p.sectionLabels ?? {},
    data: { ...p.data, customSections: p.data.customSections ?? [] },
  }))

  const activeProfileId = profiles.some((p) => p.id === state.activeProfileId)
    ? state.activeProfileId
    : (profiles[0]?.id ?? '')

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profiles,
    activeProfileId,
  }
}

function tryLoadLegacyState(makeProfile: MakeProfile): ProfilesState {
  let data = deepClone(DEFAULT_FULL_CV)
  let templateId = 'classic'

  try {
    const rawData = localStorage.getItem(LEGACY_DATA_KEY)
    if (rawData) data = { ...data, ...JSON.parse(rawData) }
  } catch {}

  try {
    const rawTemplate = localStorage.getItem(LEGACY_TEMPLATE_KEY)
    if (rawTemplate) templateId = JSON.parse(rawTemplate) as string
  } catch {}

  const profile = makeProfile('My CV', templateId, data)
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profiles: [profile],
    activeProfileId: profile.id,
  }
}

export function loadProfilesState(options: {
  makeProfile: MakeProfile
  defaultSectionOrder: string[]
}): ProfilesState {
  const { makeProfile, defaultSectionOrder } = options

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfilesState>
      const legacyCompatible: ProfilesState = {
        schemaVersion: parsed.schemaVersion ?? CURRENT_SCHEMA_VERSION,
        profiles: parsed.profiles ?? [],
        activeProfileId: parsed.activeProfileId ?? '',
      }
      return sanitizeProfiles(legacyCompatible, defaultSectionOrder)
    }
  } catch {}

  return sanitizeProfiles(tryLoadLegacyState(makeProfile), defaultSectionOrder)
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
