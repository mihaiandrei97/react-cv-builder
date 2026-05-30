import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { type FullCvData, type CvData, DEFAULT_FULL_CV, projectCv } from './types'

// Deep clone helper
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// localStorage helpers
function loadFullCv(): FullCvData {
  try {
    const raw = localStorage.getItem('cv-data')
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FullCvData>
      // Migrate: fill in fields added after initial save
      return {
        ...deepClone(DEFAULT_FULL_CV),
        ...parsed,
      }
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

type CvContextValue = {
  cv: CvData
  fullData: FullCvData
  setFullData: React.Dispatch<React.SetStateAction<FullCvData>>
  templateId: string
  setTemplateId: (id: string) => void
  saveCv: () => void
  saveTemplatePref: (id: string) => void
  resetCv: () => void
}

const CvContext = createContext<CvContextValue | null>(null)

export function CvProvider({ children }: { children: React.ReactNode }) {
  const [fullData, setFullData] = useState<FullCvData>(() => loadFullCv())
  const [templateId, setTemplateIdState] = useState<string>(() => loadTemplatePref())

  const cv = useMemo(() => projectCv(fullData, templateId), [fullData, templateId])

  const saveCv = useCallback(() => {
    setFullData((current) => {
      localStorage.setItem('cv-data', JSON.stringify(current))
      return current
    })
  }, [])

  const saveTemplatePref = useCallback((id: string) => {
    localStorage.setItem('cv-template', JSON.stringify(id))
    setTemplateIdState(id)
  }, [])

  const resetCv = useCallback(() => {
    const fresh = deepClone(DEFAULT_FULL_CV)
    setFullData(fresh)
    localStorage.setItem('cv-data', JSON.stringify(fresh))
  }, [])

  const setTemplateId = useCallback((id: string) => {
    setTemplateIdState(id)
  }, [])

  return (
    <CvContext.Provider value={{ cv, fullData, setFullData, templateId, setTemplateId, saveCv, saveTemplatePref, resetCv }}>
      {children}
    </CvContext.Provider>
  )
}

export function useCv() {
  const ctx = useContext(CvContext)
  if (!ctx) throw new Error('useCv must be used within CvProvider')
  return ctx
}
