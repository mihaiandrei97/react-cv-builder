import React, { createContext, useContext, useState, useCallback } from 'react'
import { type CvData, DEFAULT_CV } from './types'

// Deep clone helper
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// localStorage helpers
function loadCv(): CvData {
  try {
    const raw = localStorage.getItem('cv-data')
    if (raw) return JSON.parse(raw) as CvData
  } catch {}
  return deepClone(DEFAULT_CV)
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
  setCv: React.Dispatch<React.SetStateAction<CvData>>
  templateId: string
  setTemplateId: (id: string) => void
  saveCv: () => void
  saveTemplatePref: (id: string) => void
  resetCv: () => void
}

const CvContext = createContext<CvContextValue | null>(null)

export function CvProvider({ children }: { children: React.ReactNode }) {
  const [cv, setCv] = useState<CvData>(() => loadCv())
  const [templateId, setTemplateIdState] = useState<string>(() => loadTemplatePref())

  const saveCv = useCallback(() => {
    setCv((current) => {
      localStorage.setItem('cv-data', JSON.stringify(current))
      return current
    })
  }, [])

  const saveTemplatePref = useCallback((id: string) => {
    localStorage.setItem('cv-template', JSON.stringify(id))
    setTemplateIdState(id)
  }, [])

  const resetCv = useCallback(() => {
    const fresh = deepClone(DEFAULT_CV)
    setCv(fresh)
    localStorage.setItem('cv-data', JSON.stringify(fresh))
  }, [])

  const setTemplateId = useCallback((id: string) => {
    setTemplateIdState(id)
  }, [])

  return (
    <CvContext.Provider value={{ cv, setCv, templateId, setTemplateId, saveCv, saveTemplatePref, resetCv }}>
      {children}
    </CvContext.Provider>
  )
}

export function useCv() {
  const ctx = useContext(CvContext)
  if (!ctx) throw new Error('useCv must be used within CvProvider')
  return ctx
}
