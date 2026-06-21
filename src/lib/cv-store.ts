import { createStore, useSelector } from '@tanstack/react-store'
import { type FullCvData, type CvData, type CvProfile, type CustomSection, type CvLocale, makeDefaultFullCv, projectCv } from './types'
import { type ProfilesState, loadProfilesState, saveProfilesState, createDebouncedStateSaver } from './persistence'

// ── Helpers ───────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export const DEFAULT_SECTION_ORDER = ['skills', 'experience', 'projects', 'education', 'certifications', 'languages']

function makeProfile(name: string, templateId = 'classic', data?: FullCvData, locale: CvLocale = 'en'): CvProfile {
  const cvData = data ? deepClone(data) : makeDefaultFullCv(locale)
  return {
    id: crypto.randomUUID(),
    name,
    templateId,
    locale,
    data: cvData,
    sectionLabels: {},
    hiddenSections: [],
    pageBreaks: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    colors: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────

function loadState(): ProfilesState {
  return loadProfilesState({
    defaultSectionOrder: DEFAULT_SECTION_ORDER,
  })
}

type CvContentState = {
  data: FullCvData
  templateId: string
  locale: CvLocale
  hiddenSections: string[]
  pageBreaks: string[]
  sectionOrder: string[]
  colors: Record<string, string>
  sectionLabels: Record<string, string>
  name: string
  updatedAt: number
}

function getCvContentState(state: ProfilesState): CvContentState {
  const active = state.profiles.find(p => p.id === state.activeProfileId) ?? state.profiles[0]
  return {
    data: active.data,
    templateId: active.templateId,
    locale: active.locale,
    hiddenSections: active.hiddenSections ?? [],
    pageBreaks: active.pageBreaks ?? [],
    sectionOrder: active.sectionOrder ?? DEFAULT_SECTION_ORDER,
    colors: (active.colors ?? {})[active.templateId] ?? {},
    sectionLabels: active.sectionLabels ?? {},
    name: active.name,
    updatedAt: active.updatedAt,
  }
}

// ── Stores ────────────────────────────────────────────────────────────────────

export const cvStore = createStore<ProfilesState>(loadState())

export const profileStore = createStore(() => {
  const { profiles, activeProfileId } = cvStore.state
  return { profiles, activeProfileId }
})

export const cvContentStore = createStore(() => getCvContentState(cvStore.state))

const schedulePersist = createDebouncedStateSaver<ProfilesState>(saveProfilesState, 400)

function commitState(updater: (state: ProfilesState) => ProfilesState, immediatePersist = false) {
  cvStore.setState((state) => {
    const next = updater(state)
    if (next === state) return state
    schedulePersist(next, immediatePersist)
    return next
  })
}

function withActiveProfile(state: ProfilesState, updater: (profile: CvProfile) => CvProfile): ProfilesState {
  const idx = state.profiles.findIndex((p) => p.id === state.activeProfileId)
  if (idx < 0) return state
  const current = state.profiles[idx]
  const nextProfile = updater(current)
  if (nextProfile === current) return state
  const profiles = [...state.profiles]
  profiles[idx] = nextProfile
  return { ...state, profiles }
}

function shallowEqualRecord(a: Record<string, string>, b: Record<string, string>) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => a[key] === b[key])
}

export type ProfileAction =
  | { type: 'profile.switch'; id: string }
  | { type: 'profile.add'; profile: CvProfile }
  | { type: 'profile.duplicate'; id: string }
  | { type: 'profile.rename'; id: string; name: string }
  | { type: 'profile.delete'; id: string }
  | { type: 'profile.import'; profile: CvProfile }

export type CvContentAction =
  | { type: 'fullData.update'; updater: (prev: FullCvData) => FullCvData }
  | { type: 'template.set'; templateId: string }
  | { type: 'cv.reset' }
  | { type: 'section.toggleVisibility'; section: string }
  | { type: 'section.togglePageBreak'; section: string }
  | { type: 'colors.set'; colors: Record<string, string> }
  | { type: 'sectionLabels.set'; sectionLabels: Record<string, string> }
  | { type: 'customSection.add'; id: string }
  | { type: 'customSection.remove'; id: string }
  | { type: 'section.move'; section: string; direction: 'up' | 'down' }

export type CvAction = ProfileAction | CvContentAction

function reduceProfiles(state: ProfilesState, action: ProfileAction): ProfilesState {
  switch (action.type) {
    case 'profile.switch': {
      if (state.activeProfileId === action.id) return state
      if (!state.profiles.some((p) => p.id === action.id)) return state
      return { ...state, activeProfileId: action.id }
    }

    case 'profile.add': {
      if (state.profiles.some((p) => p.id === action.profile.id)) return state
      return {
        ...state,
        profiles: [...state.profiles, action.profile],
        activeProfileId: action.profile.id,
      }
    }

    case 'profile.duplicate': {
      const source = state.profiles.find((p) => p.id === action.id)
      if (!source) return state
      const copy: CvProfile = {
        ...source,
        id: crypto.randomUUID(),
        name: `${source.name} (copy)`,
        data: deepClone(source.data),
        sectionLabels: { ...(source.sectionLabels ?? {}) },
        hiddenSections: [...(source.hiddenSections ?? [])],
        pageBreaks: [...(source.pageBreaks ?? [])],
        sectionOrder: [...(source.sectionOrder ?? DEFAULT_SECTION_ORDER)],
        colors: { ...(source.colors ?? {}) },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      return {
        ...state,
        profiles: [...state.profiles, copy],
        activeProfileId: copy.id,
      }
    }

    case 'profile.rename': {
      const name = action.name.trim()
      return {
        ...state,
        profiles: state.profiles.map((profile) => {
          if (profile.id !== action.id) return profile
          const nextName = name || profile.name
          if (nextName === profile.name) return profile
          return { ...profile, name: nextName }
        }),
      }
    }

    case 'profile.delete': {
      if (state.profiles.length <= 1) return state
      if (!state.profiles.some((p) => p.id === action.id)) return state
      const remaining = state.profiles.filter((p) => p.id !== action.id)
      const activeProfileId = state.activeProfileId === action.id ? remaining[0].id : state.activeProfileId
      return { ...state, profiles: remaining, activeProfileId }
    }

    case 'profile.import': {
      if (state.profiles.some((p) => p.id === action.profile.id)) return state
      return {
        ...state,
        profiles: [...state.profiles, action.profile],
        activeProfileId: action.profile.id,
      }
    }

    default:
      return state
  }
}

function reduceCvContent(state: ProfilesState, action: CvContentAction): ProfilesState {
  switch (action.type) {
    case 'fullData.update': {
      return withActiveProfile(state, (profile) => {
        const nextData = action.updater(profile.data)
        if (nextData === profile.data) return profile
        return {
          ...profile,
          data: nextData,
          updatedAt: Date.now(),
        }
      })
    }

    case 'template.set': {
      return withActiveProfile(state, (profile) => {
        if (profile.templateId === action.templateId) return profile
        return { ...profile, templateId: action.templateId, updatedAt: Date.now() }
      })
    }

    case 'cv.reset': {
      return withActiveProfile(state, (profile) => {
        return {
          ...profile,
          data: makeDefaultFullCv(profile.locale),
          sectionLabels: {},
          updatedAt: Date.now(),
        }
      })
    }

    case 'section.toggleVisibility': {
      return withActiveProfile(state, (profile) => {
        const hidden = profile.hiddenSections ?? []
        const hiddenSections = hidden.includes(action.section)
          ? hidden.filter((s) => s !== action.section)
          : [...hidden, action.section]
        return { ...profile, hiddenSections, updatedAt: Date.now() }
      })
    }

    case 'section.togglePageBreak': {
      return withActiveProfile(state, (profile) => {
        const breaks = profile.pageBreaks ?? []
        const pageBreaks = breaks.includes(action.section)
          ? breaks.filter((s) => s !== action.section)
          : [...breaks, action.section]
        return { ...profile, pageBreaks, updatedAt: Date.now() }
      })
    }

    case 'colors.set': {
      return withActiveProfile(state, (profile) => {
        const tid = profile.templateId
        const current = (profile.colors ?? {})[tid] ?? {}
        if (shallowEqualRecord(current, action.colors)) return profile
        return {
          ...profile,
          colors: { ...(profile.colors ?? {}), [tid]: action.colors },
          updatedAt: Date.now(),
        }
      })
    }

    case 'sectionLabels.set': {
      return withActiveProfile(state, (profile) => {
        if (shallowEqualRecord(profile.sectionLabels ?? {}, action.sectionLabels)) return profile
        return {
          ...profile,
          sectionLabels: action.sectionLabels,
          updatedAt: Date.now(),
        }
      })
    }

    case 'customSection.add': {
      return withActiveProfile(state, (profile) => {
        const customSections = profile.data.customSections ?? []
        if (customSections.some((s) => s.id === action.id)) return profile
        const section: CustomSection = {
          id: action.id,
          title: profile.locale === 'ro' ? 'Sectiune personalizata' : 'Custom Section',
          bullets: [''],
        }
        return {
          ...profile,
          data: { ...profile.data, customSections: [...customSections, section] },
          sectionOrder: [...(profile.sectionOrder ?? DEFAULT_SECTION_ORDER), action.id],
          updatedAt: Date.now(),
        }
      })
    }

    case 'customSection.remove': {
      return withActiveProfile(state, (profile) => {
        const customSections = profile.data.customSections ?? []
        if (!customSections.some((s) => s.id === action.id)) return profile
        return {
          ...profile,
          data: { ...profile.data, customSections: customSections.filter((s) => s.id !== action.id) },
          sectionOrder: (profile.sectionOrder ?? DEFAULT_SECTION_ORDER).filter((k) => k !== action.id),
          hiddenSections: (profile.hiddenSections ?? []).filter((k) => k !== action.id),
          updatedAt: Date.now(),
        }
      })
    }

    case 'section.move': {
      return withActiveProfile(state, (profile) => {
        const order = [...(profile.sectionOrder ?? DEFAULT_SECTION_ORDER)]
        const idx = order.indexOf(action.section)
        if (idx < 0) return profile
        const swapWith = action.direction === 'up' ? idx - 1 : idx + 1
        if (swapWith < 0 || swapWith >= order.length) return profile
        ;[order[idx], order[swapWith]] = [order[swapWith], order[idx]]
        return { ...profile, sectionOrder: order, updatedAt: Date.now() }
      })
    }

    default:
      return state
  }
}

function reduceState(state: ProfilesState, action: CvAction): ProfilesState {
  switch (action.type) {
    case 'profile.switch':
    case 'profile.add':
    case 'profile.duplicate':
    case 'profile.rename':
    case 'profile.delete':
    case 'profile.import':
      return reduceProfiles(state, action)
    default:
      return reduceCvContent(state, action)
  }
}

export function dispatch(action: CvAction, options?: { immediatePersist?: boolean }) {
  commitState((state) => reduceState(state, action), options?.immediatePersist ?? false)
}

/** Derived store: automatically recomputes only when CV content changes. */
export const cvDerived = createStore<CvData>(() => {
  const c = cvContentStore.state
  return projectCv(
    c.data,
    c.templateId,
    c.hiddenSections,
    c.pageBreaks,
    c.sectionOrder,
    c.colors,
    c.locale,
    c.sectionLabels,
  )
})

// ── Mutations ─────────────────────────────────────────────────────────────────

export function setFullData(updater: (prev: FullCvData) => FullCvData) {
  dispatch({ type: 'fullData.update', updater })
}

export function saveCv() {
  schedulePersist(cvStore.state, true)
}

export function saveTemplatePref(id: string) {
  dispatch({ type: 'template.set', templateId: id })
}

export function resetCv() {
  dispatch({ type: 'cv.reset' }, { immediatePersist: true })
}

export function switchProfile(id: string) {
  dispatch({ type: 'profile.switch', id })
}

export function addProfile(name: string, locale: CvLocale = 'en') {
  const profile = makeProfile(name.trim() || 'New CV', undefined, undefined, locale)
  dispatch({ type: 'profile.add', profile }, { immediatePersist: true })
  return profile.id
}

export function duplicateProfile(id: string) {
  dispatch({ type: 'profile.duplicate', id }, { immediatePersist: true })
}

export function renameProfile(id: string, name: string) {
  dispatch({ type: 'profile.rename', id, name })
}

export function deleteProfile(id: string) {
  dispatch({ type: 'profile.delete', id })
}

export function toggleSection(section: string) {
  dispatch({ type: 'section.toggleVisibility', section })
}

export function togglePageBreak(section: string) {
  dispatch({ type: 'section.togglePageBreak', section })
}

export function setColors(colors: Record<string, string>) {
  dispatch({ type: 'colors.set', colors })
}

export function setSectionLabels(sectionLabels: Record<string, string>) {
  dispatch({ type: 'sectionLabels.set', sectionLabels })
}

export function addCustomSection(): string {
  const id = crypto.randomUUID()
  dispatch({ type: 'customSection.add', id }, { immediatePersist: true })
  return id
}

export function removeCustomSection(id: string) {
  dispatch({ type: 'customSection.remove', id }, { immediatePersist: true })
}

export function moveSection(section: string, direction: 'up' | 'down') {
  dispatch({ type: 'section.move', section, direction })
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
          id: crypto.randomUUID(),
          name: parsed.name,
          data: parsed.data,
          sectionLabels: parsed.sectionLabels ?? {},
          hiddenSections: parsed.hiddenSections ?? [],
          pageBreaks: parsed.pageBreaks ?? [],
          sectionOrder: parsed.sectionOrder ?? DEFAULT_SECTION_ORDER,
          colors: parsed.colors ?? {},
          locale: parsed.locale ?? 'en',
          templateId: parsed.templateId ?? 'classic',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        dispatch({ type: 'profile.import', profile }, { immediatePersist: true })
        resolve(profile.id)
      } catch {
        reject(new Error('Could not parse backup file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useActiveProfile() {
  return useSelector(profileStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]))
}

export function useProfiles() {
  return useSelector(profileStore, (s) => s.profiles)
}

export function useActiveProfileId() {
  return useSelector(profileStore, (s) => s.activeProfileId)
}

export function useCvData() {
  return useSelector(cvDerived, (s) => s)
}
