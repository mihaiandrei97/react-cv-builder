import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import type { Experience, Project, Education, Certification, Language, Profile } from '../lib/types'
import { getDefaultSectionLabelsForTemplate } from '../lib/types'
import { useActiveProfile, useCvData, resetCv, toggleSection, togglePageBreak, moveSection, DEFAULT_SECTION_ORDER, setColors, setSectionLabels, addCustomSection, removeCustomSection, setFullData, cvStore, saveTemplatePref } from '../lib/cv-store'
import { getTemplate, loadTemplateComponent, type TemplateComponent, TEMPLATES } from '../lib/templates'
import { WorkflowNav } from '../components/WorkflowNav'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { type TFunction, templateName, templateDescription, colorSlotLabel, sectionLabel } from '../lib/i18n'
import { useT } from '../lib/i18n/context'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function cefrFields(t: TFunction) {
  return [
    { key: 'listening', label: t('edit.cefr.listen'), title: t('edit.cefr.listen.title') },
    { key: 'reading', label: t('edit.cefr.read'), title: t('edit.cefr.read.title') },
    { key: 'dialog', label: t('edit.cefr.speak'), title: t('edit.cefr.speak.title') },
    { key: 'reproduce', label: t('edit.cefr.produce'), title: t('edit.cefr.produce.title') },
    { key: 'writing', label: t('edit.cefr.write'), title: t('edit.cefr.write.title') },
  ] as const
}

export const Route = createFileRoute('/{-$locale}/cv/edit')({
  beforeLoad: () => {
    if (cvStore.state.profiles.length === 0) throw redirect({ to: '/{-$locale}/cvs' })
  },
  component: EditPage,
})


// ── Nav ──────────────────────────────────────────────────────────────────────

function TemplateSwitcher({
  currentTemplateId,
  isCompact,
}: {
  currentTemplateId: string
  isCompact: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const current = getTemplate(currentTemplateId)
  const t = useT()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        style={{ ...s.templateBadgeLink, ...(isCompact ? { flex: 1 } : {}) }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t('edit.template.change')}
      >
        {templateName(t, current.id)}
        <span style={s.templateBadgeHint}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={s.templateMenu} role="listbox">
          {TEMPLATES.map((tpl) => {
            const isActive = tpl.id === currentTemplateId
            return (
              <button
                key={tpl.id}
                type="button"
                role="option"
                aria-selected={isActive}
                style={isActive ? s.templateMenuItemActive : s.templateMenuItem}
                onClick={() => {
                  saveTemplatePref(tpl.id)
                  setOpen(false)
                }}
              >
                <span style={s.templateMenuItemName}>{templateName(t, tpl.id)}</span>
                <span style={s.templateMenuItemDesc}>{templateDescription(t, tpl.id)}</span>
                {isActive && <span style={s.templateMenuItemCheck}>✓</span>}
              </button>
            )
          })}
          <Link
            to="/{-$locale}/templates"
            style={s.templateMenuCompareLink}
            onClick={() => setOpen(false)}
          >
            {t('edit.template.compare')}
          </Link>
        </div>
      )}
    </div>
  )
}

function TopBar({
  templateId,
  saveStatus,
  isCompact,
  activePane,
  onPaneChange,
  onReset,
  onDownload,
}: {
  templateId: string
  saveStatus: string
  isCompact: boolean
  activePane: 'form' | 'preview'
  onPaneChange: (pane: 'form' | 'preview') => void
  onReset: () => void
  onDownload: () => void
}) {
  const t = useT()
  return (
    <header style={{ ...s.topBar, ...(isCompact ? s.topBarCompact : {}) }}>
      <div style={{ ...s.topBarLeft, ...(isCompact ? s.topBarLeftCompact : {}) }}>
        <WorkflowNav active="edit" />
      </div>
      <div style={{ ...s.topBarActions, ...(isCompact ? s.topBarActionsCompact : {}) }}>
        {saveStatus && <span style={s.saveStatus}>{saveStatus}</span>}
        <TemplateSwitcher currentTemplateId={templateId} isCompact={isCompact} />
        {isCompact && (
          <div style={s.viewSwitch}>
            <button
              type="button"
              style={activePane === 'form' ? s.viewSwitchBtnActive : s.viewSwitchBtn}
              onClick={() => onPaneChange('form')}
            >
              {t('edit.topbar.form')}
            </button>
            <button
              type="button"
              style={
                activePane === 'preview'
                  ? { ...s.viewSwitchBtnActive, borderRight: 0 }
                  : { ...s.viewSwitchBtn, borderRight: 0 }
              }
              onClick={() => onPaneChange('preview')}
            >
              {t('edit.topbar.preview')}
            </button>
          </div>
        )}
        <button type="button" style={s.btnDownload} onClick={onDownload}>
          {t('edit.topbar.download')}
        </button>
        <button type="button" style={s.btnGhostReset} onClick={onReset}>
          {t('edit.topbar.reset')}
        </button>
      </div>
    </header>
  )
}

// ── Form helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  fullWidth,
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <span style={s.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

function Input({
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  focusId,
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  type?: string
  placeholder?: string
  focusId?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      data-focus-id={focusId}
      style={s.input}
    />
  )
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...s.input, resize: 'vertical', lineHeight: '1.5' }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  sectionKey,
  anchorId,
  hiddenSections,
  pageBreaks,
  isFirst,
  isLast,
  addButton,
  children,
}: {
  title: string
  sectionKey: string
  anchorId?: string
  hiddenSections: string[]
  pageBreaks: string[]
  isFirst?: boolean
  isLast?: boolean
  addButton?: React.ReactNode
  children: React.ReactNode
}) {
  const isHidden = hiddenSections.includes(sectionKey)
  const hasBreak = pageBreaks.includes(sectionKey)
  const t = useT()
  return (
    <section id={anchorId} style={isHidden ? { ...s.card, ...s.anchorCard, opacity: 0.7 } : { ...s.card, ...s.anchorCard }}>
      <div style={s.sectionHeader}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <h2 style={s.cardTitle}>{title}</h2>
          {!isHidden && addButton}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isHidden && <span style={s.hiddenBadge}>{t('edit.section.hidden')}</span>}
          {!isHidden && (
            <button type="button" style={hasBreak ? s.btnBreakActive : s.btnBreak} onClick={() => togglePageBreak(sectionKey)} title={t('edit.section.pageBreak.title')}>
              {t('edit.section.pageBreak')}
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.15rem' }}>
            <button
              type="button"
              style={{ ...s.btnMove, ...(isFirst ? { opacity: 0.3, cursor: 'default' } : {}) }}
              disabled={isFirst}
              onClick={() => moveSection(sectionKey, 'up')}
              title={t('edit.moveUp')}
              aria-label={t('edit.section.moveUp.aria')}
            >↑</button>
            <button
              type="button"
              style={{ ...s.btnMove, ...(isLast ? { opacity: 0.3, cursor: 'default' } : {}) }}
              disabled={isLast}
              onClick={() => moveSection(sectionKey, 'down')}
              title={t('edit.moveDown')}
              aria-label={t('edit.section.moveDown.aria')}
            >↓</button>
          </div>
          <button type="button" style={s.btnToggle} onClick={() => toggleSection(sectionKey)}>
            {isHidden ? t('edit.section.show') : t('edit.section.hide')}
          </button>
        </div>
      </div>
      {!isHidden && children}
    </section>
  )
}

function ItemHeader({
  number,
  summary,
  isCollapsed,
  onToggleCollapse,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  number: number
  summary: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  const t = useT()
  return (
    <div style={s.itemHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
        <button
          type="button"
          style={s.btnChevron}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t('edit.item.expand') : t('edit.item.collapse')}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? '▸' : '▾'}
        </button>
        <span style={s.itemNumber}>#{number}</span>
        {isCollapsed && <span style={s.itemSummary}>{summary}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          type="button"
          style={{ ...s.btnMove, ...(isFirst ? { opacity: 0.3, cursor: 'default' } : {}) }}
          disabled={isFirst}
          onClick={onMoveUp}
          title={t('edit.moveUp')}
          aria-label={t('edit.item.moveUp.aria')}
        >↑</button>
        <button
          type="button"
          style={{ ...s.btnMove, ...(isLast ? { opacity: 0.3, cursor: 'default' } : {}) }}
          disabled={isLast}
          onClick={onMoveDown}
          title={t('edit.moveDown')}
          aria-label={t('edit.item.moveDown.aria')}
        >↓</button>
        <button type="button" style={s.removeBtnText} onClick={onRemove}>{t('edit.item.remove')}</button>
      </div>
    </div>
  )
}

function EditPage() {
  const CEFR_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
  const activeProfile = useActiveProfile()
  const locale = activeProfile.locale
  const fullData = activeProfile.data
  const sectionLabels = activeProfile.sectionLabels ?? {}
  const templateId = activeProfile.templateId
  const profileName = activeProfile.name
  const hiddenSections = activeProfile.hiddenSections ?? []
  const pageBreaks = activeProfile.pageBreaks ?? []
  const sectionOrder = activeProfile.sectionOrder ?? [...DEFAULT_SECTION_ORDER]
  const colors = (activeProfile.colors ?? {})[templateId] ?? {}
  const activeUpdatedAt = activeProfile.updatedAt
  const cv = useCvData()
  const debouncedCv = useDebounce(cv, 500)
  const t = useT()
  const [saveStatus, setSaveStatus] = useState(t('edit.save.saved'))
  const lastUpdatedAtRef = useRef(activeUpdatedAt)
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState('')
  const [activePane, setActivePane] = useState<'form' | 'preview'>('form')
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(() => new Set())
  const [resetOpen, setResetOpen] = useState(false)
  const focusTargetRef = useRef<string | null>(null)

  function toggleItemCollapse(id: string) {
    setCollapsedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandItem(id: string) {
    setCollapsedItems((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function requestFocus(id: string) {
    focusTargetRef.current = id
    setFocusNonce((n) => n + 1)
  }
  const [focusNonce, setFocusNonce] = useState(0)
  const [Doc, setDoc] = useState<TemplateComponent | null>(null)
  const [isCompactLayout, setIsCompactLayout] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1100 : false,
  )
  const blobUrlRef = useRef<string | null>(null)

  const template = getTemplate(templateId)

  useEffect(() => {
    if (lastUpdatedAtRef.current === activeUpdatedAt) return
    lastUpdatedAtRef.current = activeUpdatedAt
    setSaveStatus(t('edit.save.saving'))
    const timer = window.setTimeout(() => setSaveStatus(t('edit.save.saved')), 750)
    return () => window.clearTimeout(timer)
  }, [activeUpdatedAt])

  useEffect(() => {
    const onResize = () => {
      setIsCompactLayout(window.innerWidth <= 1100)
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isCompactLayout) {
      setActivePane('form')
    }
  }, [isCompactLayout])

  useEffect(() => {
    let cancelled = false
    setDoc(null)
    loadTemplateComponent(templateId).then((component) => {
      if (!cancelled) setDoc(() => component)
    })

    return () => {
      cancelled = true
    }
  }, [templateId])

  useEffect(() => {
    const target = focusTargetRef.current
    if (!target) return
    const el = document.querySelector<HTMLElement>(`[data-focus-id="${target}"]`)
    if (el) {
      el.focus()
      if (el instanceof HTMLInputElement) el.select()
    }
    focusTargetRef.current = null
  }, [focusNonce])

  function scrollToSection(anchorId: string) {
    document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleReset() {
    setResetOpen(true)
  }

  function downloadPdf() {
    if (!blobUrlRef.current) return
    const a = document.createElement('a')
    a.href = blobUrlRef.current
    const safeName = profileName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    a.download = `${safeName || 'cv'}.pdf`
    a.click()
  }

  // Profile mutations
  function updateProfile(field: keyof Profile, value: string) {
    setFullData((prev) => ({ ...prev, profile: { ...prev.profile, [field]: value } }))
  }

  // Skills
  function addSkill() {
    const trimmed = newSkill.trim()
    if (!trimmed) return
    setFullData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }))
    setNewSkill('')
  }
  function removeSkill(i: number) {
    setFullData((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))
  }
  function updateSkill(i: number, value: string) {
    setFullData((prev) => {
      const skills = [...prev.skills]
      skills[i] = value
      return { ...prev, skills }
    })
  }

  // Experience
  function addExperience() {
    const entry: Experience = { id: crypto.randomUUID(), company: '', role: '', period: '', highlights: [''] }
    setFullData((prev) => ({ ...prev, experiences: [...prev.experiences, entry] }))
    expandItem(entry.id)
    requestFocus(`exp-role-${entry.id}`)
  }
  function removeExperience(i: number) {
    setFullData((prev) => ({ ...prev, experiences: prev.experiences.filter((_, idx) => idx !== i) }))
  }
  function updateExperience(i: number, field: keyof Omit<Experience, 'id' | 'highlights'>, value: string) {
    setFullData((prev) => {
      const experiences = [...prev.experiences]
      experiences[i] = { ...experiences[i], [field]: value }
      return { ...prev, experiences }
    })
  }
  function addHighlight(expI: number) {
    setFullData((prev) => {
      const experiences = [...prev.experiences]
      experiences[expI] = { ...experiences[expI], highlights: [...experiences[expI].highlights, ''] }
      return { ...prev, experiences }
    })
    const exp = fullData.experiences[expI]
    if (exp) requestFocus(`exp-bullet-${exp.id}-${exp.highlights.length}`)
  }
  function removeHighlight(expI: number, hI: number) {
    setFullData((prev) => {
      const experiences = [...prev.experiences]
      experiences[expI] = {
        ...experiences[expI],
        highlights: experiences[expI].highlights.filter((_, idx) => idx !== hI),
      }
      return { ...prev, experiences }
    })
  }
  function updateHighlight(expI: number, hI: number, value: string) {
    setFullData((prev) => {
      const experiences = [...prev.experiences]
      const highlights = [...experiences[expI].highlights]
      highlights[hI] = value
      experiences[expI] = { ...experiences[expI], highlights }
      return { ...prev, experiences }
    })
  }

  // Projects
  function addProject() {
    const entry: Project = { id: crypto.randomUUID(), name: '', description: '', stack: '' }
    setFullData((prev) => ({ ...prev, projects: [...prev.projects, entry] }))
    expandItem(entry.id)
    requestFocus(`proj-name-${entry.id}`)
  }
  function removeProject(i: number) {
    setFullData((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))
  }
  function updateProject(i: number, field: keyof Omit<Project, 'id'>, value: string) {
    setFullData((prev) => {
      const projects = [...prev.projects]
      projects[i] = { ...projects[i], [field]: value }
      return { ...prev, projects }
    })
  }

  // Education
  function addEducation() {
    const entry: Education = { id: crypto.randomUUID(), degree: '', institution: '', period: '' }
    setFullData((prev) => ({ ...prev, education: [...prev.education, entry] }))
    expandItem(entry.id)
    requestFocus(`edu-degree-${entry.id}`)
  }
  function removeEducation(i: number) {
    setFullData((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))
  }
  function updateEducation(i: number, field: keyof Omit<Education, 'id'>, value: string) {
    setFullData((prev) => {
      const education = [...prev.education]
      education[i] = { ...education[i], [field]: value }
      return { ...prev, education }
    })
  }

  // Certifications
  function addCertification() {
    const entry: Certification = { id: crypto.randomUUID(), name: '', issuer: '', year: '' }
    setFullData((prev) => ({ ...prev, certifications: [...prev.certifications, entry] }))
    expandItem(entry.id)
    requestFocus(`cert-name-${entry.id}`)
  }
  function removeCertification(i: number) {
    setFullData((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }))
  }
  function updateCertification(i: number, field: keyof Omit<Certification, 'id'>, value: string) {
    setFullData((prev) => {
      const certifications = [...prev.certifications]
      certifications[i] = { ...certifications[i], [field]: value }
      return { ...prev, certifications }
    })
  }

  // Languages
  function addLanguage() {
    const trimmed = newLang.trim()
    if (!trimmed) return
    const entry: Language = {
      id: crypto.randomUUID(),
      language: trimmed,
      listening: 'B1',
      reading: 'B1',
      dialog: 'B1',
      reproduce: 'B1',
      writing: 'B1',
    }
    setFullData((prev) => ({ ...prev, languages: [...prev.languages, entry] }))
    expandItem(entry.id)
    requestFocus(`lang-name-${entry.id}`)
    setNewLang('')
  }
  function removeLanguage(i: number) {
    setFullData((prev) => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }))
  }
  function updateLanguage(i: number, field: keyof Omit<Language, 'id'>, value: string) {
    setFullData((prev) => {
      const languages = [...prev.languages]
      languages[i] = { ...languages[i], [field]: value }
      return { ...prev, languages }
    })
  }
  function moveLanguage(i: number, direction: 'up' | 'down') {
    setFullData((prev) => {
      const languages = [...prev.languages]
      const swapWith = direction === 'up' ? i - 1 : i + 1
      if (swapWith < 0 || swapWith >= languages.length) return prev
      ;[languages[i], languages[swapWith]] = [languages[swapWith], languages[i]]
      return { ...prev, languages }
    })
  }
  function moveExperience(i: number, direction: 'up' | 'down') {
    setFullData((prev) => {
      const experiences = [...prev.experiences]
      const swapWith = direction === 'up' ? i - 1 : i + 1
      if (swapWith < 0 || swapWith >= experiences.length) return prev
      ;[experiences[i], experiences[swapWith]] = [experiences[swapWith], experiences[i]]
      return { ...prev, experiences }
    })
  }
  function moveProject(i: number, direction: 'up' | 'down') {
    setFullData((prev) => {
      const projects = [...prev.projects]
      const swapWith = direction === 'up' ? i - 1 : i + 1
      if (swapWith < 0 || swapWith >= projects.length) return prev
      ;[projects[i], projects[swapWith]] = [projects[swapWith], projects[i]]
      return { ...prev, projects }
    })
  }
  function moveEducation(i: number, direction: 'up' | 'down') {
    setFullData((prev) => {
      const education = [...prev.education]
      const swapWith = direction === 'up' ? i - 1 : i + 1
      if (swapWith < 0 || swapWith >= education.length) return prev
      ;[education[i], education[swapWith]] = [education[swapWith], education[i]]
      return { ...prev, education }
    })
  }
  function moveCertification(i: number, direction: 'up' | 'down') {
    setFullData((prev) => {
      const certifications = [...prev.certifications]
      const swapWith = direction === 'up' ? i - 1 : i + 1
      if (swapWith < 0 || swapWith >= certifications.length) return prev
      ;[certifications[i], certifications[swapWith]] = [certifications[swapWith], certifications[i]]
      return { ...prev, certifications }
    })
  }

  const showSkills = cv.kind === 'classic' || cv.kind === 'modern' || cv.kind === 'compact' || cv.kind === 'minimal' || cv.kind === 'sidebar' || cv.kind === 'timeline'
  const showProjects = cv.kind === 'classic' || cv.kind === 'modern' || cv.kind === 'minimal' || cv.kind === 'sidebar' || cv.kind === 'timeline'
  const showCertifications = cv.kind === 'executive'
  const showLanguages = true

  const TEMPLATE_SECTIONS: Record<string, string[]> = {
    classic: ['skills', 'experience', 'projects', 'education', 'languages'],
    modern: ['skills', 'experience', 'projects', 'education', 'languages'],
    executive: ['experience', 'education', 'certifications', 'languages'],
    compact: ['skills', 'languages', 'experience', 'education'],
    minimal: ['skills', 'experience', 'projects', 'education', 'languages'],
    sidebar: ['skills', 'experience', 'projects', 'education', 'languages'],
    timeline: ['skills', 'experience', 'projects', 'education', 'languages'],
  }
  const customIds = (fullData.customSections ?? []).map((s) => s.id)
  const templateSections = [...(TEMPLATE_SECTIONS[templateId] ?? TEMPLATE_SECTIONS.classic), ...customIds]
  const orderedSections = [...templateSections].sort((a, b) => {
    const ai = sectionOrder.indexOf(a); const bi = sectionOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  const sectionNavItems = [
    { key: 'profile', title: t('edit.nav.profile'), anchorId: 'section-profile' },
    { key: 'colors', title: t('edit.nav.colors'), anchorId: 'section-colors' },
    { key: 'labels', title: t('edit.nav.labels'), anchorId: 'section-labels' },
    ...orderedSections.map((key) => {
      if (key === 'skills' && showSkills) return { key, title: t('edit.nav.skills'), anchorId: `section-${key}` }
      if (key === 'languages' && showLanguages) return { key, title: t('edit.nav.languages'), anchorId: `section-${key}` }
      if (key === 'experience') return { key, title: t('edit.nav.experience'), anchorId: `section-${key}` }
      if (key === 'projects' && showProjects) return { key, title: t('edit.nav.projects'), anchorId: `section-${key}` }
      if (key === 'education') return { key, title: t('edit.nav.education'), anchorId: `section-${key}` }
      if (key === 'certifications' && showCertifications) return { key, title: t('edit.nav.certifications'), anchorId: `section-${key}` }
      const custom = (fullData.customSections ?? []).find((s) => s.id === key)
      if (custom) return { key, title: custom.title || t('edit.nav.custom'), anchorId: `section-${key}` }
      return null
    }).filter((item): item is { key: string; title: string; anchorId: string } => item !== null),
  ]

  const previewDoc = useMemo(
    () => (Doc ? <Doc cv={debouncedCv} /> : null),
    [debouncedCv, Doc],
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        templateId={templateId}
        saveStatus={saveStatus}
        isCompact={isCompactLayout}
        activePane={activePane}
        onPaneChange={setActivePane}
        onReset={handleReset}
        onDownload={downloadPdf}
      />

      <div style={{ ...s.split, ...(isCompactLayout ? s.splitCompact : {}) }}>
        {/* Form panel */}
        {(!isCompactLayout || activePane === 'form') && (
          <main style={{ ...s.formPanel, ...(isCompactLayout ? s.formPanelCompact : {}) }}>
          <section style={{ ...s.sectionNavigatorCard, ...(isCompactLayout ? s.sectionNavigatorCardCompact : {}) }}>
            <div style={s.sectionNavigatorHead}>{t('edit.nav.quickJump')}</div>
            <div style={s.sectionNavigatorGrid}>
              {sectionNavItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  style={s.sectionNavButton}
                  onClick={() => scrollToSection(item.anchorId)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </section>

          {/* Profile */}
          <section id="section-profile" style={{ ...s.card, ...s.anchorCard }}>
            <h2 style={s.cardTitle}>{t('edit.profile.title')}</h2>
            <div style={s.fieldGrid}>
              <Field label={t('edit.profile.fullName')}>
                <Input value={fullData.profile.name} onChange={(v) => updateProfile('name', v)} />
              </Field>
              <Field label={t('edit.profile.jobTitle')}>
                <Input value={fullData.profile.title} onChange={(v) => updateProfile('title', v)} />
              </Field>
              <Field label={t('edit.profile.location')}>
                <Input value={fullData.profile.location} onChange={(v) => updateProfile('location', v)} />
              </Field>
              <Field label={t('edit.profile.email')}>
                <Input type="email" value={fullData.profile.email} onChange={(v) => updateProfile('email', v)} />
              </Field>
              <Field label={t('edit.profile.website')}>
                <Input value={fullData.profile.website} onChange={(v) => updateProfile('website', v)} />
              </Field>
            </div>
            <Field label={t('edit.profile.summary')} fullWidth>
              <Textarea value={fullData.profile.summary} onChange={(v) => updateProfile('summary', v)} rows={3} />
            </Field>
          </section>

          {/* Colors */}
          <section id="section-colors" style={{ ...s.card, ...s.anchorCard }}>
            <h2 style={s.cardTitle}>{t('edit.colors.title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {template.colorSlots.map((slot) => {
                const current = colors[slot.key] ?? slot.default
                const isModified = colors[slot.key] !== undefined && colors[slot.key] !== slot.default
                const presets = slot.presets ?? []
                const slotLabel = colorSlotLabel(t, slot.key)
                return (
                  <div key={slot.key} style={s.colorRow}>
                    <div style={s.colorLabelCol}>
                      <label style={s.fieldLabel}>{slotLabel}</label>
                      <div style={s.colorSwatchWrap}>
                        <input
                          type="color"
                          value={current}
                          onChange={(e) => setColors({ ...colors, [slot.key]: e.target.value })}
                          style={s.colorSwatch}
                          title={t('edit.colors.openPicker', { label: slotLabel })}
                          aria-label={t('edit.colors.picker.aria', { label: slotLabel })}
                        />
                        <input
                          type="text"
                          value={current.toUpperCase()}
                          onChange={(e) => {
                            const v = e.target.value.trim()
                            if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                              setColors({ ...colors, [slot.key]: v.toLowerCase() })
                            } else if (v === '' || v === '#') {
                              const next = { ...colors }; delete next[slot.key]; setColors(next)
                            }
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                          style={s.hexInput}
                          spellCheck={false}
                          aria-label={t('edit.colors.hex.aria', { label: slotLabel })}
                        />
                        <button
                          type="button"
                          style={{ ...s.btnGhost, fontSize: '0.7rem', padding: '0.15rem 0.5rem', visibility: isModified ? 'visible' : 'hidden' }}
                          onClick={() => { const next = { ...colors }; delete next[slot.key]; setColors(next) }}
                        >
                          {t('edit.colors.reset')}
                        </button>
                      </div>
                    </div>
                    {presets.length > 0 && (
                      <div style={s.presetRow}>
                        {presets.map((hex) => {
                          const active = current.toLowerCase() === hex.toLowerCase()
                          return (
                            <button
                              key={hex}
                              type="button"
                              style={{ ...s.presetChip, ...(active ? s.presetChipActive : {}), background: hex }}
                              onClick={() => setColors({ ...colors, [slot.key]: hex })}
                              title={hex.toUpperCase()}
                              aria-label={t('edit.colors.useHex.aria', { hex: hex.toUpperCase() })}
                              aria-pressed={active}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section Labels */}
          <section id="section-labels" style={{ ...s.card, ...s.anchorCard }}>
            <h2 style={s.cardTitle}>{t('edit.labels.title')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(getDefaultSectionLabelsForTemplate(templateId, locale)).map(([key]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={s.fieldLabel}>{sectionLabel(t, key)}</label>
                  <input
                    type="text"
                    value={sectionLabels[key] ?? ''}
                    placeholder={sectionLabel(t, key)}
                    onChange={(e) => setSectionLabels({ ...sectionLabels, [key]: e.target.value })}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        const next = { ...sectionLabels }
                        delete next[key]
                        setSectionLabels(next)
                      }
                    }}
                    style={s.input}
                  />
                </div>
              ))}
            </div>
          </section>

          {orderedSections.map((key, idx) => {
            const isFirst = idx === 0
            const isLast = idx === orderedSections.length - 1
            const sharedProps = { hiddenSections, pageBreaks, isFirst, isLast }

            if (key === 'skills' && showSkills) return (
              <CollapsibleSection key="skills" title={t('edit.nav.skills')} sectionKey="skills" anchorId="section-skills" {...sharedProps}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {fullData.skills.map((skill, i) => (
                    <div key={i} style={s.skillTag}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(i, e.target.value)}
                        style={s.skillTagInput}
                      />
                      <button type="button" style={s.removeBtn} onClick={() => removeSkill(i)} aria-label={t('edit.skills.remove.aria')}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={t('edit.skills.placeholder')}
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                    style={{ ...s.input, flex: 1, maxWidth: 200 }}
                  />
                  <button type="button" style={s.btnAdd} onClick={addSkill}>{t('edit.addBtn')}</button>
                </div>
              </CollapsibleSection>
            )

            if (key === 'languages' && showLanguages) return (
              <CollapsibleSection key="languages" title={t('edit.nav.languages')} sectionKey="languages" anchorId="section-languages" {...sharedProps}>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.8rem' }}>
                  {t('edit.languages.motherTongueNote')}
                </p>
                {fullData.languages.map((lang, i) => {
                  const isCollapsed = collapsedItems.has(lang.id)
                  const summary = `${lang.language || t('edit.untitled')}${i === 0 ? ` · ${t('edit.languages.motherTongueShort')}` : ''}`
                  return (
                    <div key={lang.id} style={s.itemBlock}>
                      <ItemHeader
                        number={i + 1}
                        summary={summary}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleItemCollapse(lang.id)}
                        isFirst={i === 0}
                        isLast={i === fullData.languages.length - 1}
                        onMoveUp={() => moveLanguage(i, 'up')}
                        onMoveDown={() => moveLanguage(i, 'down')}
                        onRemove={() => removeLanguage(i)}
                      />
                      {!isCollapsed && (
                        <>
                          <Field label={t('edit.languages.language')} fullWidth>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={lang.language}
                                data-focus-id={`lang-name-${lang.id}`}
                                onChange={(e) => updateLanguage(i, 'language', e.target.value)}
                                style={{ ...s.input, flex: 1 }}
                              />
                              {i === 0 && <span style={s.motherTongueBadge}>{t('edit.languages.motherTongue')}</span>}
                            </div>
                          </Field>
                          <div style={s.cefrRow}>
                            {cefrFields(t).map((f) => (
                              <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={s.cefrLabel} title={f.title}>{f.label}</span>
                                <select
                                  value={lang[f.key] ?? lang.proficiency ?? 'B1'}
                                  onChange={(e) => updateLanguage(i, f.key, e.target.value)}
                                  style={s.cefrSelect}
                                  title={f.title}
                                >
                                  {CEFR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={t('edit.languages.placeholder')}
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                    style={{ ...s.input, flex: 1, maxWidth: 200 }}
                  />
                  <button type="button" style={s.btnAdd} onClick={addLanguage}>{t('edit.addBtn')}</button>
                </div>
              </CollapsibleSection>
            )

            if (key === 'experience') return (
              <CollapsibleSection key="experience" title={t('edit.experience.title')} sectionKey="experience" anchorId="section-experience" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addExperience}>{t('edit.add')}</button>}
              >
                {fullData.experiences.map((exp, i) => {
                  const isCollapsed = collapsedItems.has(exp.id)
                  const summary = [exp.role, exp.company].filter(Boolean).join(' — ') || t('edit.untitled')
                  return (
                    <div key={exp.id} style={s.itemBlock}>
                      <ItemHeader
                        number={i + 1}
                        summary={summary}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleItemCollapse(exp.id)}
                        isFirst={i === 0}
                        isLast={i === fullData.experiences.length - 1}
                        onMoveUp={() => moveExperience(i, 'up')}
                        onMoveDown={() => moveExperience(i, 'down')}
                        onRemove={() => removeExperience(i)}
                      />
                      {!isCollapsed && (
                        <>
                          <div style={s.fieldGrid}>
                            <Field label={t('edit.experience.role')}><Input value={exp.role} focusId={`exp-role-${exp.id}`} onChange={(v) => updateExperience(i, 'role', v)} /></Field>
                            <Field label={t('edit.experience.company')}><Input value={exp.company} onChange={(v) => updateExperience(i, 'company', v)} /></Field>
                            <Field label={t('edit.period')}><Input value={exp.period} placeholder={t('edit.experience.period.placeholder')} onChange={(v) => updateExperience(i, 'period', v)} /></Field>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <span style={s.fieldLabel}>{t('edit.experience.highlights')}</span>
                            {exp.highlights.map((h, hi) => (
                              <div key={hi} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <input type="text" value={h} placeholder={t('edit.bullet.placeholder')} data-focus-id={`exp-bullet-${exp.id}-${hi}`} onChange={(e) => updateHighlight(i, hi, e.target.value)} style={{ ...s.input, flex: 1 }} />
                                <button type="button" style={s.removeBtn} onClick={() => removeHighlight(i, hi)} aria-label={t('edit.experience.bullet.remove.aria')}>×</button>
                              </div>
                            ))}
                            <button type="button" style={s.btnGhost} onClick={() => addHighlight(i)}>{t('edit.experience.addBullet')}</button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </CollapsibleSection>
            )

            if (key === 'projects' && showProjects) return (
              <CollapsibleSection key="projects" title={t('edit.projects.title')} sectionKey="projects" anchorId="section-projects" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addProject}>{t('edit.add')}</button>}
              >
                {fullData.projects.map((project, i) => {
                  const isCollapsed = collapsedItems.has(project.id)
                  const summary = project.name || t('edit.untitled')
                  return (
                    <div key={project.id} style={s.itemBlock}>
                      <ItemHeader
                        number={i + 1}
                        summary={summary}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleItemCollapse(project.id)}
                        isFirst={i === 0}
                        isLast={i === fullData.projects.length - 1}
                        onMoveUp={() => moveProject(i, 'up')}
                        onMoveDown={() => moveProject(i, 'down')}
                        onRemove={() => removeProject(i)}
                      />
                      {!isCollapsed && (
                        <>
                          <div style={s.fieldGrid}>
                            <Field label={t('edit.projects.name')}><Input value={project.name} focusId={`proj-name-${project.id}`} onChange={(v) => updateProject(i, 'name', v)} /></Field>
                            <Field label={t('edit.projects.stack')}><Input value={project.stack} placeholder={t('edit.projects.stack.placeholder')} onChange={(v) => updateProject(i, 'stack', v)} /></Field>
                          </div>
                          <Field label={t('edit.projects.description')} fullWidth>
                            <Textarea value={project.description} onChange={(v) => updateProject(i, 'description', v)} rows={2} />
                          </Field>
                        </>
                      )}
                    </div>
                  )
                })}
              </CollapsibleSection>
            )

            if (key === 'education') return (
              <CollapsibleSection key="education" title={t('edit.education.title')} sectionKey="education" anchorId="section-education" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addEducation}>{t('edit.add')}</button>}
              >
                {fullData.education.map((edu, i) => {
                  const isCollapsed = collapsedItems.has(edu.id)
                  const summary = [edu.degree, edu.institution].filter(Boolean).join(' — ') || t('edit.untitled')
                  return (
                    <div key={edu.id} style={s.itemBlock}>
                      <ItemHeader
                        number={i + 1}
                        summary={summary}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleItemCollapse(edu.id)}
                        isFirst={i === 0}
                        isLast={i === fullData.education.length - 1}
                        onMoveUp={() => moveEducation(i, 'up')}
                        onMoveDown={() => moveEducation(i, 'down')}
                        onRemove={() => removeEducation(i)}
                      />
                      {!isCollapsed && (
                        <div style={s.fieldGrid}>
                          <Field label={t('edit.education.degree')}><Input value={edu.degree} focusId={`edu-degree-${edu.id}`} onChange={(v) => updateEducation(i, 'degree', v)} /></Field>
                          <Field label={t('edit.education.institution')}><Input value={edu.institution} onChange={(v) => updateEducation(i, 'institution', v)} /></Field>
                          <Field label={t('edit.period')}><Input value={edu.period} placeholder={t('edit.education.period.placeholder')} onChange={(v) => updateEducation(i, 'period', v)} /></Field>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CollapsibleSection>
            )

            if (key === 'certifications' && showCertifications) return (
              <CollapsibleSection key="certifications" title={t('edit.certifications.title')} sectionKey="certifications" anchorId="section-certifications" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addCertification}>{t('edit.add')}</button>}
              >
                {fullData.certifications.map((cert, i) => {
                  const isCollapsed = collapsedItems.has(cert.id)
                  const summary = [cert.name, cert.issuer].filter(Boolean).join(' — ') || t('edit.untitled')
                  return (
                    <div key={cert.id} style={s.itemBlock}>
                      <ItemHeader
                        number={i + 1}
                        summary={summary}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleItemCollapse(cert.id)}
                        isFirst={i === 0}
                        isLast={i === fullData.certifications.length - 1}
                        onMoveUp={() => moveCertification(i, 'up')}
                        onMoveDown={() => moveCertification(i, 'down')}
                        onRemove={() => removeCertification(i)}
                      />
                      {!isCollapsed && (
                        <div style={s.fieldGrid}>
                          <Field label={t('edit.certifications.name')} fullWidth>
                            <Input value={cert.name} focusId={`cert-name-${cert.id}`} placeholder={t('edit.certifications.name.placeholder')} onChange={(v) => updateCertification(i, 'name', v)} />
                          </Field>
                          <Field label={t('edit.certifications.issuer')}><Input value={cert.issuer} placeholder={t('edit.certifications.issuer.placeholder')} onChange={(v) => updateCertification(i, 'issuer', v)} /></Field>
                          <Field label={t('edit.certifications.year')}><Input value={cert.year} placeholder={t('edit.certifications.year.placeholder')} onChange={(v) => updateCertification(i, 'year', v)} /></Field>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CollapsibleSection>
            )

            const custom = (fullData.customSections ?? []).find((s) => s.id === key)
            if (custom) return (
              <CollapsibleSection
                key={key}
                title={custom.title || t('edit.custom.title')}
                sectionKey={key}
                anchorId={`section-${key}`}
                hiddenSections={hiddenSections}
                pageBreaks={pageBreaks}
                isFirst={isFirst}
                isLast={isLast}
                addButton={
                  <button type="button" style={s.removeBtnText} onClick={() => { removeCustomSection(key) }}>{t('edit.custom.delete')}</button>
                }
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <Field label={t('edit.custom.sectionTitle')} fullWidth>
                    <Input
                      value={custom.title}
                      focusId={`custom-title-${custom.id}`}
                      placeholder={t('edit.custom.titlePlaceholder')}
                      onChange={(v) => {
                        setFullData((prev) => ({
                          ...prev,
                          customSections: prev.customSections.map((s) => s.id === key ? { ...s, title: v } : s),
                        }))
                      }}
                    />
                  </Field>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={s.fieldLabel}>{t('edit.custom.bullets')}</span>
                  {custom.bullets.map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input
                        type="text"
                        value={b}
                        data-focus-id={`custom-bullet-${custom.id}-${bi}`}
                        placeholder={t('edit.bullet.placeholder')}
                        onChange={(e) => {
                          setFullData((prev) => ({
                            ...prev,
                            customSections: prev.customSections.map((s) =>
                              s.id === key ? { ...s, bullets: s.bullets.map((x, xi) => xi === bi ? e.target.value : x) } : s
                            ),
                          }))
                        }}
                        style={{ ...s.input, flex: 1 }}
                      />
                      <button
                        type="button"
                        style={s.removeBtn}
                        onClick={() => {
                          setFullData((prev) => ({
                            ...prev,
                            customSections: prev.customSections.map((s) =>
                              s.id === key ? { ...s, bullets: s.bullets.filter((_, xi) => xi !== bi) } : s
                            ),
                          }))
                        }}
                        aria-label={t('edit.custom.bullet.remove.aria')}
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    style={s.btnGhost}
                    onClick={() => {
                      setFullData((prev) => ({
                        ...prev,
                        customSections: prev.customSections.map((s) =>
                          s.id === key ? { ...s, bullets: [...s.bullets, ''] } : s
                        ),
                      }))
                      requestFocus(`custom-bullet-${key}-${custom.bullets.length}`)
                    }}
                  >{t('edit.custom.addBullet')}</button>
                </div>
              </CollapsibleSection>
            )

            return null
          })}

          {/* Add custom section */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <button
              type="button"
              style={s.btnAdd}
              onClick={() => {
                const id = addCustomSection()
                requestFocus(`custom-title-${id}`)
              }}
              >{t('edit.custom.add')}</button>
          </div>
          </main>
        )}

        {/* Live preview panel */}
        {(!isCompactLayout || activePane === 'preview') && (
          <aside style={{ ...s.previewPanel, ...(isCompactLayout ? s.previewPanelCompact : {}) }}>
          <div style={s.previewLabel}>{t('edit.preview.label', { name: templateName(t, template.id) })}</div>
          {!previewDoc ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>{t('edit.preview.loading')}</div>
          ) : (
            <BlobProvider document={previewDoc}>
              {({ url, loading, error }) => {
                if (url) blobUrlRef.current = url
                if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>{t('edit.preview.rendering')}</div>
                if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#9c2f1f', fontSize: '0.85rem' }}>{t('edit.preview.error')}</div>
                if (!url) return null
                return (
                  <iframe
                    src={`${url}#toolbar=0&navpanes=0`}
                    style={{
                      width: '100%',
                      flex: 1,
                      border: 'none',
                      borderRadius: '0.25rem',
                      boxShadow: '0 20px 45px rgba(34,34,34,0.12)',
                    }}
                    title={t('edit.preview.iframeTitle')}
                  />
                )
              }}
            </BlobProvider>
          )}
          </aside>
        )}
      </div>
      <ConfirmDialog
        open={resetOpen}
        title={t('edit.topbar.reset')}
        message={t('edit.resetConfirm')}
        confirmLabel={t('common.confirmReset')}
        cancelLabel={t('common.cancel')}
        danger
        onConfirm={() => { resetCv(); setResetOpen(false) }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(255, 253, 247, 0.92)',
    backdropFilter: 'blur(6px)',
    borderBottom: '1px solid var(--line)',
    boxShadow: '0 2px 8px rgba(34,34,34,0.08)',
  },
  topBarCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
    padding: '0.7rem 0.9rem',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  topBarLeftCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.6rem',
  },
  topBarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  topBarActionsCompact: {
    flexWrap: 'wrap',
    gap: '0.45rem',
  },
  viewSwitch: {
    display: 'inline-flex',
    border: '1px solid var(--line)',
    borderRadius: '0.35rem',
    overflow: 'hidden',
  },
  viewSwitchBtn: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--muted)',
    background: 'transparent',
    border: 0,
    borderRight: '1px solid var(--line)',
    padding: '0.32rem 0.6rem',
    cursor: 'pointer',
  },
  viewSwitchBtnActive: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--ink)',
    background: '#fffdf7',
    border: 0,
    borderRight: '1px solid var(--line)',
    padding: '0.32rem 0.6rem',
    cursor: 'pointer',
  },
  saveStatus: {
    fontSize: '0.85rem',
    color: 'var(--green)',
    fontWeight: 600,
    border: '1px solid #b8d8cc',
    borderRadius: '999px',
    background: '#edf6f2',
    padding: '0.2rem 0.55rem',
  },
  templateBadge: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--accent)',
    background: '#fdf0e6',
    border: '1px solid #f0c89a',
    borderRadius: '0.25rem',
    padding: '0.2rem 0.55rem',
  },
  templateBadgeLink: {
    fontFamily: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--accent)',
    background: '#fdf0e6',
    border: '1px solid #f0c89a',
    borderRadius: '0.25rem',
    padding: '0.2rem 0.55rem',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  templateBadgeHint: {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#b8722f',
    opacity: 0.7,
  },
  templateMenu: {
    position: 'absolute',
    top: 'calc(100% + 0.4rem)',
    right: 0,
    minWidth: 280,
    maxWidth: 340,
    background: '#fffdf7',
    border: '1px solid var(--line)',
    borderRadius: '0.4rem',
    boxShadow: '0 12px 28px rgba(34,34,34,0.14)',
    padding: '0.35rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    zIndex: 20,
  },
  templateMenuItem: {
    fontFamily: 'inherit',
    textAlign: 'left',
    color: 'var(--ink)',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '0.3rem',
    padding: '0.55rem 0.7rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    position: 'relative',
  },
  templateMenuItemActive: {
    fontFamily: 'inherit',
    textAlign: 'left',
    color: 'var(--accent)',
    background: '#fdf0e6',
    border: '1px solid #f0c89a',
    borderRadius: '0.3rem',
    padding: '0.55rem 0.7rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    position: 'relative',
  },
  templateMenuItemName: {
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  templateMenuItemDesc: {
    fontSize: '0.72rem',
    color: 'var(--muted)',
    lineHeight: 1.4,
  },
  templateMenuItemCheck: {
    position: 'absolute',
    top: '0.55rem',
    right: '0.7rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--green)',
  },
  templateMenuCompareLink: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--muted)',
    textDecoration: 'none',
    background: 'transparent',
    border: 0,
    borderTop: '1px solid var(--line)',
    borderRadius: 0,
    padding: '0.5rem 0.7rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
  btnPrimary: {
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#fff',
    background: 'var(--green)',
    border: 0,
    borderRadius: '0.25rem',
    padding: '0.45rem 1rem',
    cursor: 'pointer',
  },
  btnDownload: {
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#fff',
    background: 'var(--green)',
    border: 0,
    borderRadius: '0.25rem',
    padding: '0.4rem 0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(45,93,76,0.18)',
  },
  btnGhostReset: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--muted)',
    background: 'transparent',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.4rem 0.5rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    textUnderlineOffset: '0.15em',
  },
  btnAdd: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--green)',
    background: 'transparent',
    border: '1px solid var(--green)',
    borderRadius: '0.25rem',
    padding: '0.3rem 0.7rem',
    cursor: 'pointer',
  },
  btnGhost: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px dashed var(--line)',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.6rem',
    cursor: 'pointer',
    marginTop: '0.25rem',
  },
  removeBtn: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    lineHeight: '1',
    color: 'var(--muted)',
    background: 'transparent',
    border: 0,
    padding: '0 0.35rem',
    cursor: 'pointer',
    flexShrink: 0,
  },
  removeBtnText: {
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    color: '#9c2f1f',
    background: 'transparent',
    border: 0,
    padding: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  split: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  splitCompact: {
    display: 'block',
    overflow: 'visible',
  },
  formPanel: {
    width: 560,
    flexShrink: 0,
    height: 'calc(100vh - 53px)',
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    borderRight: '1px solid var(--line)',
  },
  formPanelCompact: {
    width: '100%',
    height: 'auto',
    overflowY: 'visible',
    borderRight: 0,
    padding: '1rem 0.75rem 1.25rem',
  },
  sectionNavigatorCard: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: '#fff9ef',
    border: '1px solid #efdbbf',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    boxShadow: '0 8px 18px rgba(192,107,49,0.10)',
  },
  sectionNavigatorCardCompact: {
    position: 'static',
  },
  sectionNavigatorHead: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--accent)',
    marginBottom: '0.55rem',
  },
  sectionNavigatorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  sectionNavButton: {
    fontFamily: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--ink)',
    background: '#fffdf7',
    border: '1px solid var(--line)',
    borderRadius: '999px',
    padding: '0.25rem 0.6rem',
    cursor: 'pointer',
  },
  anchorCard: {
    scrollMarginTop: '6rem',
  },
  card: {
    background: '#fffdf7',
    border: '1px solid var(--line)',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    boxShadow: '0 2px 10px rgba(34,34,34,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--accent)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hiddenBadge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#9c2f1f',
    background: '#fdf2f0',
    border: '1px solid #f0b8b0',
    borderRadius: '999px',
    padding: '0.15rem 0.6rem',
  },
  btnToggle: {
    fontFamily: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.2rem 0.6rem',
    cursor: 'pointer',
  },
  btnBreak: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px dashed var(--line)',
    borderRadius: '0.25rem',
    padding: '0.2rem 0.6rem',
    cursor: 'pointer',
  },
  btnBreakActive: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--accent)',
    background: '#fdf0e6',
    border: '1px solid var(--accent)',
    borderRadius: '0.25rem',
    padding: '0.2rem 0.6rem',
    cursor: 'pointer',
  },
  btnMove: {
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    lineHeight: '1',
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: '0.2rem',
    padding: '0.15rem 0.4rem',
    cursor: 'pointer',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  fieldLabel: {
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--muted)',
  },
  input: {
    fontFamily: 'inherit',
    fontSize: '0.92rem',
    color: 'var(--ink)',
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.4rem 0.55rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  skillTag: {
    display: 'flex',
    alignItems: 'center',
    background: '#f0ece0',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    overflow: 'hidden',
  },
  skillTagInput: {
    fontFamily: 'inherit',
    fontSize: '0.88rem',
    background: 'transparent',
    border: 0,
    padding: '0.3rem 0.5rem',
    width: 110,
    color: 'var(--ink)',
  },
  itemBlock: {
    borderTop: '1px solid var(--line)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNumber: {
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--muted)',
  },
  btnChevron: {
    fontFamily: 'inherit',
    fontSize: '0.7rem',
    lineHeight: '1',
    color: 'var(--muted)',
    background: 'transparent',
    border: 0,
    padding: '0.15rem 0.25rem',
    cursor: 'pointer',
    flexShrink: 0,
  },
  itemSummary: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--ink)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
  },
  motherTongueBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--green)',
    background: '#edf6f2',
    border: '1px solid #b8d8cc',
    borderRadius: '999px',
    padding: '0.2rem 0.55rem',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  cefrRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.4rem',
  },
  cefrLabel: {
    fontSize: '0.66rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--muted)',
  },
  cefrSelect: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    color: 'var(--ink)',
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.3rem 0.3rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  colorRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--line)',
  },
  colorLabelCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  colorSwatchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 32,
    height: 32,
    padding: 2,
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    background: 'none',
    flexShrink: 0,
  },
  hexInput: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    color: 'var(--ink)',
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.35rem 0.5rem',
    width: 90,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  presetRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    alignItems: 'center',
  },
  presetChip: {
    width: 22,
    height: 22,
    padding: 0,
    border: '1px solid var(--line)',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  presetChipActive: {
    border: '2px solid var(--ink)',
    boxShadow: '0 0 0 2px var(--paper) inset',
  },
  previewPanel: {
    flex: 1,
    height: 'calc(100vh - 53px)',
    overflowY: 'auto',
    background: 'radial-gradient(circle at 20% 20%, #ece9de 0%, #ece9de 20%, transparent 20%), linear-gradient(160deg, #f6f3e8 0%, #efeadd 55%, #e6e0d3 100%)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  previewPanelCompact: {
    height: '70vh',
    minHeight: 420,
    padding: '0.85rem',
  },
  previewLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--muted)',
    textAlign: 'center',
  },
}
