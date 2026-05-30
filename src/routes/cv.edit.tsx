import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import type { Experience, Project, Education, Certification, Language, Profile } from '../lib/types'
import { useSelector } from '@tanstack/react-store'
import { cvStore, cvDerived, setFullData, saveCv, resetCv, toggleSection, togglePageBreak, moveSection, DEFAULT_SECTION_ORDER } from '../lib/cv-store'
import { getTemplate } from '../lib/templates'

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
  onSave,
  onReset,
}: {
  profileName: string
  templateName: string
  saveStatus: string
  onSave: () => void
  onReset: () => void
}) {
  return (
    <header style={s.topBar}>
      <div style={s.topBarLeft}>
        <h1 style={s.topBarTitle}>CV Editor</h1>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          <NavLink to="/templates" label="Templates" />
          <NavLink to="/cv/edit" label="Edit" active />
          <NavLink to="/cv/print" label="Preview" />
        </nav>
      </div>
      <div style={s.topBarActions}>
        {saveStatus && <span style={s.saveStatus}>{saveStatus}</span>}
        <span style={s.templateBadge}>{profileName}</span>
        <span style={s.templateBadge}>{templateName}</span>
        <button type="button" style={s.btnSecondary} onClick={onReset}>
          Reset
        </button>
        <button type="button" style={s.btnPrimary} onClick={onSave}>
          Save
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
  hiddenSections,
  pageBreaks,
  isFirst,
  isLast,
  addButton,
  children,
}: {
  title: string
  sectionKey: string
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
    <section style={isHidden ? { ...s.card, opacity: 0.7 } : s.card}>
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
  const fullData = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).data)
  const templateId = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).templateId)
  const profileName = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).name)
  const hiddenSections = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).hiddenSections ?? [])
  const pageBreaks = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).pageBreaks ?? [])
  const sectionOrder = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).sectionOrder ?? [...DEFAULT_SECTION_ORDER])
  const cv = useSelector(cvDerived, (s) => s)
  const debouncedCv = useDebounce(cv, 500)
  const [saveStatus, setSaveStatus] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState('')

  const template = getTemplate(templateId)

  function save() {
    saveCv()
    setSaveStatus('Saved')
    setTimeout(() => setSaveStatus(''), 2000)
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
    save()
  }
  function removeSkill(i: number) {
    setFullData((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))
    save()
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
    save()
  }
  function removeExperience(i: number) {
    setFullData((prev) => ({ ...prev, experiences: prev.experiences.filter((_, idx) => idx !== i) }))
    save()
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
    save()
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
    save()
  }
  function removeProject(i: number) {
    setFullData((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))
    save()
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
    save()
  }
  function removeEducation(i: number) {
    setFullData((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))
    save()
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
    save()
  }
  function removeCertification(i: number) {
    setFullData((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }))
    save()
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
    const entry: Language = { id: crypto.randomUUID(), language: trimmed, proficiency: '' }
    setFullData((prev) => ({ ...prev, languages: [...prev.languages, entry] }))
    setNewLang('')
    save()
  }
  function removeLanguage(i: number) {
    setFullData((prev) => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }))
    save()
  }
  function updateLanguage(i: number, field: keyof Omit<Language, 'id'>, value: string) {
    setFullData((prev) => {
      const languages = [...prev.languages]
      languages[i] = { ...languages[i], [field]: value }
      return { ...prev, languages }
    })
  }

  const showSkills = cv.kind === 'classic' || cv.kind === 'modern' || cv.kind === 'compact'
  const showProjects = cv.kind === 'classic' || cv.kind === 'modern'
  const showCertifications = cv.kind === 'executive'
  const showLanguages = cv.kind === 'compact'

  const TEMPLATE_SECTIONS: Record<string, string[]> = {
    classic: ['skills', 'experience', 'projects', 'education'],
    modern: ['skills', 'experience', 'projects', 'education'],
    executive: ['experience', 'education', 'certifications'],
    compact: ['skills', 'languages', 'experience', 'education'],
  }
  const templateSections = TEMPLATE_SECTIONS[templateId] ?? TEMPLATE_SECTIONS.classic
  const orderedSections = [...templateSections].sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b))

  const Doc = template.component
  const previewDoc = useMemo(() => <Doc cv={debouncedCv} />, [debouncedCv, Doc])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        profileName={profileName}
        templateName={template.name}
        saveStatus={saveStatus}
        onSave={save}
        onReset={handleReset}
      />

      <div style={s.split}>
        {/* Form panel */}
        <main style={s.formPanel}>
          {/* Profile */}
          <section style={s.card}>
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

          {orderedSections.map((key, idx) => {
            const isFirst = idx === 0
            const isLast = idx === orderedSections.length - 1
            const sharedProps = { hiddenSections, pageBreaks, isFirst, isLast }

            if (key === 'skills' && showSkills) return (
              <CollapsibleSection key="skills" title="Core Skills" sectionKey="skills" {...sharedProps}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {fullData.skills.map((skill, i) => (
                    <div key={i} style={s.skillTag}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(i, e.target.value)}
                        onBlur={save}
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
              <CollapsibleSection key="languages" title="Languages" sectionKey="languages" {...sharedProps}>
                {fullData.languages.map((lang, i) => (
                  <div key={lang.id} style={s.itemBlock}>
                    <div style={s.itemHeader}>
                      <span style={s.itemNumber}>#{i + 1}</span>
                      <button type="button" style={s.removeBtnText} onClick={() => removeLanguage(i)}>Remove</button>
                    </div>
                    <div style={s.fieldGrid}>
                      <Field label="Language">
                        <Input value={lang.language} onChange={(v) => updateLanguage(i, 'language', v)} onBlur={save} />
                      </Field>
                      <Field label="Proficiency">
                        <Input value={lang.proficiency} placeholder="e.g. Native, Fluent" onChange={(v) => updateLanguage(i, 'proficiency', v)} onBlur={save} />
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
              <CollapsibleSection key="experience" title="Experience" sectionKey="experience" {...sharedProps}
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
                          <input type="text" value={h} placeholder="Bullet point..." onChange={(e) => updateHighlight(i, hi, e.target.value)} onBlur={save} style={{ ...s.input, flex: 1 }} />
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
              <CollapsibleSection key="projects" title="Selected Projects" sectionKey="projects" {...sharedProps}
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
              <CollapsibleSection key="education" title="Education" sectionKey="education" {...sharedProps}
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
              <CollapsibleSection key="certifications" title="Certifications" sectionKey="certifications" {...sharedProps}
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
                        <Input value={cert.name} placeholder="e.g. AWS Certified Solutions Architect" onChange={(v) => updateCertification(i, 'name', v)} onBlur={save} />
                      </Field>
                      <Field label="Issuer"><Input value={cert.issuer} placeholder="e.g. Amazon Web Services" onChange={(v) => updateCertification(i, 'issuer', v)} onBlur={save} /></Field>
                      <Field label="Year"><Input value={cert.year} placeholder="e.g. 2023" onChange={(v) => updateCertification(i, 'year', v)} onBlur={save} /></Field>
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            )

            return null
          })}
        </main>

        {/* Live preview panel */}
        <aside style={s.previewPanel}>
          <div style={s.previewLabel}>Live Preview · {template.name}</div>
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
        </aside>
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
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
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
  saveStatus: {
    fontSize: '0.85rem',
    color: 'var(--green)',
    fontWeight: 600,
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
  previewLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--muted)',
    textAlign: 'center',
  },
}
