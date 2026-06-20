import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import type { Experience, Project, Education, Certification, Language, Profile } from '../lib/types'
import { getDefaultSectionLabelsForTemplate } from '../lib/types'
import { useActiveProfile, useCvData, resetCv, toggleSection, togglePageBreak, moveSection, DEFAULT_SECTION_ORDER, setColors, setSectionLabels, addCustomSection, removeCustomSection, setFullData } from '../lib/cv-store'
import { getTemplate, loadTemplateComponent, type TemplateComponent } from '../lib/templates'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export const Route = createFileRoute('/cv/edit')({
  component: EditPage,
})


// ── Nav ──────────────────────────────────────────────────────────────────────

function TopBar({
  profileName,
  templateName,
  saveStatus,
  isCompact,
  activePane,
  onPaneChange,
  onReset,
}: {
  profileName: string
  templateName: string
  saveStatus: string
  isCompact: boolean
  activePane: 'form' | 'preview'
  onPaneChange: (pane: 'form' | 'preview') => void
  onReset: () => void
}) {
  return (
    <header style={{ ...s.topBar, ...(isCompact ? s.topBarCompact : {}) }}>
      <div style={{ ...s.topBarLeft, ...(isCompact ? s.topBarLeftCompact : {}) }}>
        <h1 style={s.topBarTitle}>CV Editor</h1>
        <nav style={{ ...s.topBarNav, ...(isCompact ? s.topBarNavCompact : {}) }}>
          <NavLink to="/cvs" label="CVs" />
          <NavLink to="/templates" label="Templates" />
          <NavLink to="/cv/edit" label="Edit" active />
          <NavLink to="/cv/print" label="Preview" />
        </nav>
      </div>
      <div style={{ ...s.topBarActions, ...(isCompact ? s.topBarActionsCompact : {}) }}>
        {saveStatus && <span style={s.saveStatus}>{saveStatus}</span>}
        <span style={s.templateBadge}>{profileName}</span>
        <span style={s.templateBadge}>{templateName}</span>
        {isCompact && (
          <div style={s.viewSwitch}>
            <button
              type="button"
              style={activePane === 'form' ? s.viewSwitchBtnActive : s.viewSwitchBtn}
              onClick={() => onPaneChange('form')}
            >
              Form
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
              Preview
            </button>
          </div>
        )}
        <button type="button" style={s.btnSecondary} onClick={onReset}>
          Reset
        </button>
      </div>
    </header>
  )
}

function NavLink({ to, label, active }: { to: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        color: active ? 'var(--ink)' : 'var(--muted)',
        padding: '0.35rem 0.75rem',
        borderRadius: '0.25rem',
        border: active ? '1px solid var(--line)' : '1px solid transparent',
        background: active ? 'var(--paper)' : 'transparent',
      }}
    >
      {label}
    </Link>
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
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
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
  return (
    <section id={anchorId} style={isHidden ? { ...s.card, ...s.anchorCard, opacity: 0.7 } : { ...s.card, ...s.anchorCard }}>
      <div style={s.sectionHeader}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <h2 style={s.cardTitle}>{title}</h2>
          {!isHidden && addButton}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isHidden && <span style={s.hiddenBadge}>Hidden from PDF</span>}
          {!isHidden && (
            <button type="button" style={hasBreak ? s.btnBreakActive : s.btnBreak} onClick={() => togglePageBreak(sectionKey)} title="Start this section on a new page">
              ⏎ Page break
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.15rem' }}>
            <button
              type="button"
              style={{ ...s.btnMove, ...(isFirst ? { opacity: 0.3, cursor: 'default' } : {}) }}
              disabled={isFirst}
              onClick={() => moveSection(sectionKey, 'up')}
              title="Move up"
              aria-label="Move section up"
            >↑</button>
            <button
              type="button"
              style={{ ...s.btnMove, ...(isLast ? { opacity: 0.3, cursor: 'default' } : {}) }}
              disabled={isLast}
              onClick={() => moveSection(sectionKey, 'down')}
              title="Move down"
              aria-label="Move section down"
            >↓</button>
          </div>
          <button type="button" style={s.btnToggle} onClick={() => toggleSection(sectionKey)}>
            {isHidden ? 'Show in PDF' : 'Hide'}
          </button>
        </div>
      </div>
      {!isHidden && children}
    </section>
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
  const colors = activeProfile.colors ?? {}
  const activeUpdatedAt = activeProfile.updatedAt
  const cv = useCvData()
  const debouncedCv = useDebounce(cv, 500)
  const [saveStatus, setSaveStatus] = useState('All changes saved')
  const lastUpdatedAtRef = useRef(activeUpdatedAt)
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState('')
  const [activePane, setActivePane] = useState<'form' | 'preview'>('form')
  const [Doc, setDoc] = useState<TemplateComponent | null>(null)
  const [isCompactLayout, setIsCompactLayout] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1100 : false,
  )

  const template = getTemplate(templateId)

  useEffect(() => {
    if (lastUpdatedAtRef.current === activeUpdatedAt) return
    lastUpdatedAtRef.current = activeUpdatedAt
    setSaveStatus('Saving...')
    const timer = window.setTimeout(() => setSaveStatus('All changes saved'), 750)
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

  function scrollToSection(anchorId: string) {
    document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleReset() {
    if (confirm('Reset all CV data to defaults? This cannot be undone.')) {
      resetCv()
    }
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

  const showSkills = cv.kind === 'classic' || cv.kind === 'modern' || cv.kind === 'compact'
  const showProjects = cv.kind === 'classic' || cv.kind === 'modern'
  const showCertifications = cv.kind === 'executive'
  const showLanguages = true

  const TEMPLATE_SECTIONS: Record<string, string[]> = {
    classic: ['skills', 'experience', 'projects', 'education', 'languages'],
    modern: ['skills', 'experience', 'projects', 'education', 'languages'],
    executive: ['experience', 'education', 'certifications', 'languages'],
    compact: ['skills', 'languages', 'experience', 'education'],
  }
  const customIds = (fullData.customSections ?? []).map((s) => s.id)
  const templateSections = [...(TEMPLATE_SECTIONS[templateId] ?? TEMPLATE_SECTIONS.classic), ...customIds]
  const orderedSections = [...templateSections].sort((a, b) => {
    const ai = sectionOrder.indexOf(a); const bi = sectionOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  const sectionNavItems = [
    { key: 'profile', title: 'Profile', anchorId: 'section-profile' },
    { key: 'colors', title: 'Colors', anchorId: 'section-colors' },
    { key: 'labels', title: 'Section Labels', anchorId: 'section-labels' },
    ...orderedSections.map((key) => {
      if (key === 'skills' && showSkills) return { key, title: 'Core Skills', anchorId: `section-${key}` }
      if (key === 'languages' && showLanguages) return { key, title: 'Languages', anchorId: `section-${key}` }
      if (key === 'experience') return { key, title: 'Experience', anchorId: `section-${key}` }
      if (key === 'projects' && showProjects) return { key, title: 'Selected Projects', anchorId: `section-${key}` }
      if (key === 'education') return { key, title: 'Education', anchorId: `section-${key}` }
      if (key === 'certifications' && showCertifications) return { key, title: 'Certifications', anchorId: `section-${key}` }
      const custom = (fullData.customSections ?? []).find((s) => s.id === key)
      if (custom) return { key, title: custom.title || 'Custom Section', anchorId: `section-${key}` }
      return null
    }).filter((item): item is { key: string; title: string; anchorId: string } => item !== null),
  ]

  const previewDoc = useMemo(() => (Doc ? <Doc cv={debouncedCv} /> : null), [debouncedCv, Doc])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        profileName={profileName}
        templateName={template.name}
        saveStatus={saveStatus}
        isCompact={isCompactLayout}
        activePane={activePane}
        onPaneChange={setActivePane}
        onReset={handleReset}
      />

      <div style={{ ...s.split, ...(isCompactLayout ? s.splitCompact : {}) }}>
        {/* Form panel */}
        {(!isCompactLayout || activePane === 'form') && (
          <main style={{ ...s.formPanel, ...(isCompactLayout ? s.formPanelCompact : {}) }}>
          <section style={{ ...s.sectionNavigatorCard, ...(isCompactLayout ? s.sectionNavigatorCardCompact : {}) }}>
            <div style={s.sectionNavigatorHead}>Quick Jump</div>
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
            <h2 style={s.cardTitle}>Profile</h2>
            <div style={s.fieldGrid}>
              <Field label="Full Name">
                <Input value={fullData.profile.name} onChange={(v) => updateProfile('name', v)} />
              </Field>
              <Field label="Job Title">
                <Input value={fullData.profile.title} onChange={(v) => updateProfile('title', v)} />
              </Field>
              <Field label="Location">
                <Input value={fullData.profile.location} onChange={(v) => updateProfile('location', v)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={fullData.profile.email} onChange={(v) => updateProfile('email', v)} />
              </Field>
              <Field label="Website">
                <Input value={fullData.profile.website} onChange={(v) => updateProfile('website', v)} />
              </Field>
            </div>
            <Field label="Summary" fullWidth>
              <Textarea value={fullData.profile.summary} onChange={(v) => updateProfile('summary', v)} rows={3} />
            </Field>
          </section>

          {/* Colors */}
          <section id="section-colors" style={{ ...s.card, ...s.anchorCard }}>
            <h2 style={s.cardTitle}>Colors</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
              {template.colorSlots.map((slot) => {
                const current = colors[slot.key] ?? slot.default
                return (
                  <div key={slot.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
                    <label style={{ ...s.fieldLabel, whiteSpace: 'nowrap' }}>{slot.label}</label>
                    <input
                      type="color"
                      value={current}
                      onChange={(e) => setColors({ ...colors, [slot.key]: e.target.value })}
                      style={{ width: 40, height: 40, padding: 2, border: '1px solid var(--line)', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                      title={slot.label}
                    />
                    <button
                      type="button"
                      style={{ ...s.btnGhost, fontSize: '0.7rem', padding: '0.1rem 0.4rem', visibility: current !== slot.default ? 'visible' : 'hidden' }}
                      onClick={() => { const next = { ...colors }; delete next[slot.key]; setColors(next) }}
                    >
                      Reset
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section Labels */}
          <section id="section-labels" style={{ ...s.card, ...s.anchorCard }}>
            <h2 style={s.cardTitle}>Section Labels</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(getDefaultSectionLabelsForTemplate(templateId, locale)).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={s.fieldLabel}>{label}</label>
                  <input
                    type="text"
                    value={sectionLabels[key] ?? ''}
                    placeholder={label}
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
              <CollapsibleSection key="skills" title="Core Skills" sectionKey="skills" anchorId="section-skills" {...sharedProps}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {fullData.skills.map((skill, i) => (
                    <div key={i} style={s.skillTag}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(i, e.target.value)}
                        style={s.skillTagInput}
                      />
                      <button type="button" style={s.removeBtn} onClick={() => removeSkill(i)} aria-label="Remove skill">×</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="New skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                    style={{ ...s.input, flex: 1, maxWidth: 200 }}
                  />
                  <button type="button" style={s.btnAdd} onClick={addSkill}>Add</button>
                </div>
              </CollapsibleSection>
            )

            if (key === 'languages' && showLanguages) return (
              <CollapsibleSection key="languages" title="Languages" sectionKey="languages" anchorId="section-languages" {...sharedProps}>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.8rem' }}>
                  First language row is used as Mother Tongue in the PDF table. Reorder rows to change it.
                </p>
                {fullData.languages.map((lang, i) => (
                  <div key={lang.id} style={s.itemBlock}>
                    <div style={s.itemHeader}>
                      <span style={s.itemNumber}>#{i + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          style={{ ...s.btnMove, ...(i === 0 ? { opacity: 0.3, cursor: 'default' } : {}) }}
                          disabled={i === 0}
                          onClick={() => moveLanguage(i, 'up')}
                          title="Move up"
                        >↑</button>
                        <button
                          type="button"
                          style={{ ...s.btnMove, ...(i === fullData.languages.length - 1 ? { opacity: 0.3, cursor: 'default' } : {}) }}
                          disabled={i === fullData.languages.length - 1}
                          onClick={() => moveLanguage(i, 'down')}
                          title="Move down"
                        >↓</button>
                        <button type="button" style={s.removeBtnText} onClick={() => removeLanguage(i)}>Remove</button>
                      </div>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Language">
                        <Input value={lang.language} onChange={(v) => updateLanguage(i, 'language', v)} />
                      </Field>
                      <Field label="Used as">
                        <div style={{ ...s.input, display: 'flex', alignItems: 'center', minHeight: 34, color: i === 0 ? 'var(--green)' : 'var(--muted)' }}>
                          {i === 0 ? 'Mother Tongue (first row)' : 'Other language'}
                        </div>
                      </Field>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Listening">
                        <select value={lang.listening ?? lang.proficiency ?? 'B1'} onChange={(e) => updateLanguage(i, 'listening', e.target.value)} style={s.input}>
                          {CEFR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </Field>
                      <Field label="Reading">
                        <select value={lang.reading ?? lang.proficiency ?? 'B1'} onChange={(e) => updateLanguage(i, 'reading', e.target.value)} style={s.input}>
                          {CEFR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </Field>
                      <Field label="Dialog">
                        <select value={lang.dialog ?? lang.proficiency ?? 'B1'} onChange={(e) => updateLanguage(i, 'dialog', e.target.value)} style={s.input}>
                          {CEFR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </Field>
                      <Field label="Reproduce">
                        <select value={lang.reproduce ?? lang.proficiency ?? 'B1'} onChange={(e) => updateLanguage(i, 'reproduce', e.target.value)} style={s.input}>
                          {CEFR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </Field>
                      <Field label="Writing">
                        <select value={lang.writing ?? lang.proficiency ?? 'B1'} onChange={(e) => updateLanguage(i, 'writing', e.target.value)} style={s.input}>
                          {CEFR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Language name..."
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                    style={{ ...s.input, flex: 1, maxWidth: 200 }}
                  />
                  <button type="button" style={s.btnAdd} onClick={addLanguage}>Add</button>
                </div>
              </CollapsibleSection>
            )

            if (key === 'experience') return (
              <CollapsibleSection key="experience" title="Experience" sectionKey="experience" anchorId="section-experience" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addExperience}>+ Add</button>}
              >
                {fullData.experiences.map((exp, i) => (
                  <div key={exp.id} style={s.itemBlock}>
                    <div style={s.itemHeader}>
                      <span style={s.itemNumber}>#{i + 1}</span>
                      <button type="button" style={s.removeBtnText} onClick={() => removeExperience(i)}>Remove</button>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Role"><Input value={exp.role} onChange={(v) => updateExperience(i, 'role', v)} /></Field>
                      <Field label="Company"><Input value={exp.company} onChange={(v) => updateExperience(i, 'company', v)} /></Field>
                      <Field label="Period"><Input value={exp.period} placeholder="e.g. 2022 - Present" onChange={(v) => updateExperience(i, 'period', v)} /></Field>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={s.fieldLabel}>Highlights</span>
                      {exp.highlights.map((h, hi) => (
                        <div key={hi} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input type="text" value={h} placeholder="Bullet point..." onChange={(e) => updateHighlight(i, hi, e.target.value)} style={{ ...s.input, flex: 1 }} />
                          <button type="button" style={s.removeBtn} onClick={() => removeHighlight(i, hi)} aria-label="Remove highlight">×</button>
                        </div>
                      ))}
                      <button type="button" style={s.btnGhost} onClick={() => addHighlight(i)}>+ Add bullet</button>
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            )

            if (key === 'projects' && showProjects) return (
              <CollapsibleSection key="projects" title="Selected Projects" sectionKey="projects" anchorId="section-projects" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addProject}>+ Add</button>}
              >
                {fullData.projects.map((project, i) => (
                  <div key={project.id} style={s.itemBlock}>
                    <div style={s.itemHeader}>
                      <span style={s.itemNumber}>#{i + 1}</span>
                      <button type="button" style={s.removeBtnText} onClick={() => removeProject(i)}>Remove</button>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Name"><Input value={project.name} onChange={(v) => updateProject(i, 'name', v)} /></Field>
                      <Field label="Tech Stack"><Input value={project.stack} placeholder="e.g. React, TypeScript" onChange={(v) => updateProject(i, 'stack', v)} /></Field>
                    </div>
                    <Field label="Description" fullWidth>
                      <Textarea value={project.description} onChange={(v) => updateProject(i, 'description', v)} rows={2} />
                    </Field>
                  </div>
                ))}
              </CollapsibleSection>
            )

            if (key === 'education') return (
              <CollapsibleSection key="education" title="Education" sectionKey="education" anchorId="section-education" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addEducation}>+ Add</button>}
              >
                {fullData.education.map((edu, i) => (
                  <div key={edu.id} style={s.itemBlock}>
                    <div style={s.itemHeader}>
                      <span style={s.itemNumber}>#{i + 1}</span>
                      <button type="button" style={s.removeBtnText} onClick={() => removeEducation(i)}>Remove</button>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Degree"><Input value={edu.degree} onChange={(v) => updateEducation(i, 'degree', v)} /></Field>
                      <Field label="Institution"><Input value={edu.institution} onChange={(v) => updateEducation(i, 'institution', v)} /></Field>
                      <Field label="Period"><Input value={edu.period} placeholder="e.g. 2011 - 2014" onChange={(v) => updateEducation(i, 'period', v)} /></Field>
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            )

            if (key === 'certifications' && showCertifications) return (
              <CollapsibleSection key="certifications" title="Certifications" sectionKey="certifications" anchorId="section-certifications" {...sharedProps}
                addButton={<button type="button" style={s.btnAdd} onClick={addCertification}>+ Add</button>}
              >
                {fullData.certifications.map((cert, i) => (
                  <div key={cert.id} style={s.itemBlock}>
                    <div style={s.itemHeader}>
                      <span style={s.itemNumber}>#{i + 1}</span>
                      <button type="button" style={s.removeBtnText} onClick={() => removeCertification(i)}>Remove</button>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Name" fullWidth>
                        <Input value={cert.name} placeholder="e.g. AWS Certified Solutions Architect" onChange={(v) => updateCertification(i, 'name', v)} />
                      </Field>
                      <Field label="Issuer"><Input value={cert.issuer} placeholder="e.g. Amazon Web Services" onChange={(v) => updateCertification(i, 'issuer', v)} /></Field>
                      <Field label="Year"><Input value={cert.year} placeholder="e.g. 2023" onChange={(v) => updateCertification(i, 'year', v)} /></Field>
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            )

            const custom = (fullData.customSections ?? []).find((s) => s.id === key)
            if (custom) return (
              <CollapsibleSection
                key={key}
                title={custom.title || 'Custom Section'}
                sectionKey={key}
                anchorId={`section-${key}`}
                hiddenSections={hiddenSections}
                pageBreaks={pageBreaks}
                isFirst={isFirst}
                isLast={isLast}
                addButton={
                  <button type="button" style={s.removeBtnText} onClick={() => { removeCustomSection(key) }}>Delete section</button>
                }
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <Field label="Section Title" fullWidth>
                    <Input
                      value={custom.title}
                      placeholder="e.g. Volunteer Work"
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
                  <span style={s.fieldLabel}>Bullets</span>
                  {custom.bullets.map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input
                        type="text"
                        value={b}
                        placeholder="Bullet point..."
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
                        aria-label="Remove bullet"
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
                    }}
                  >+ Add bullet</button>
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
              onClick={() => { addCustomSection() }}
            >+ Add Custom Section</button>
          </div>
          </main>
        )}

        {/* Live preview panel */}
        {(!isCompactLayout || activePane === 'preview') && (
          <aside style={{ ...s.previewPanel, ...(isCompactLayout ? s.previewPanelCompact : {}) }}>
          <div style={s.previewLabel}>Live Preview · {template.name}</div>
          {!previewDoc ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading template…</div>
          ) : (
            <BlobProvider document={previewDoc}>
              {({ url, loading, error }) => {
                if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>Rendering preview…</div>
                if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#9c2f1f', fontSize: '0.85rem' }}>Error rendering preview</div>
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
                    title="CV Preview"
                  />
                )
              }}
            </BlobProvider>
          )}
          </aside>
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
    background: '#fffdf7',
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
  topBarNav: {
    display: 'flex',
    gap: '0.25rem',
  },
  topBarNavCompact: {
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '0.1rem',
  },
  topBarTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
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
  btnSecondary: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
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
