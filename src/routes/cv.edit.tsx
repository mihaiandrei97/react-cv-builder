import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import type { CvData } from '../lib/types'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
import { useCv } from '../lib/cv-context'
import { getTemplate } from '../lib/templates'
import type { Experience, Project, Education } from '../lib/types'

export const Route = createFileRoute('/cv/edit')({
  component: EditPage,
})


// ── Nav ──────────────────────────────────────────────────────────────────────

function TopBar({
  templateName,
  saveStatus,
  onSave,
  onReset,
}: {
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
  type = 'text',
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
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

function EditPage() {
  const { cv, setCv, templateId, saveCv, resetCv } = useCv()
  const debouncedCv = useDebounce(cv, 500)
  const [saveStatus, setSaveStatus] = useState('')
  const [newSkill, setNewSkill] = useState('')

  const template = getTemplate(templateId)

  const save = useCallback(() => {
    saveCv()
    setSaveStatus('Saved')
    setTimeout(() => setSaveStatus(''), 2000)
  }, [saveCv])

  function handleReset() {
    if (confirm('Reset all CV data to defaults? This cannot be undone.')) {
      resetCv()
    }
  }

  // Profile mutations
  function updateProfile(field: keyof CvData['profile'], value: string) {
    setCv((prev) => ({ ...prev, profile: { ...prev.profile, [field]: value } }))
  }

  // Skills
  function addSkill() {
    const trimmed = newSkill.trim()
    if (!trimmed) return
    setCv((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }))
    setNewSkill('')
    save()
  }
  function removeSkill(i: number) {
    setCv((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))
    save()
  }
  function updateSkill(i: number, value: string) {
    setCv((prev) => {
      const skills = [...prev.skills]
      skills[i] = value
      return { ...prev, skills }
    })
  }

  // Experience
  function addExperience() {
    const entry: Experience = { id: crypto.randomUUID(), company: '', role: '', period: '', highlights: [''] }
    setCv((prev) => ({ ...prev, experiences: [...prev.experiences, entry] }))
    save()
  }
  function removeExperience(i: number) {
    setCv((prev) => ({ ...prev, experiences: prev.experiences.filter((_, idx) => idx !== i) }))
    save()
  }
  function updateExperience(i: number, field: keyof Omit<Experience, 'id' | 'highlights'>, value: string) {
    setCv((prev) => {
      const experiences = [...prev.experiences]
      experiences[i] = { ...experiences[i], [field]: value }
      return { ...prev, experiences }
    })
  }
  function addHighlight(expI: number) {
    setCv((prev) => {
      const experiences = [...prev.experiences]
      experiences[expI] = { ...experiences[expI], highlights: [...experiences[expI].highlights, ''] }
      return { ...prev, experiences }
    })
  }
  function removeHighlight(expI: number, hI: number) {
    setCv((prev) => {
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
    setCv((prev) => {
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
    setCv((prev) => ({ ...prev, projects: [...prev.projects, entry] }))
    save()
  }
  function removeProject(i: number) {
    setCv((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))
    save()
  }
  function updateProject(i: number, field: keyof Omit<Project, 'id'>, value: string) {
    setCv((prev) => {
      const projects = [...prev.projects]
      projects[i] = { ...projects[i], [field]: value }
      return { ...prev, projects }
    })
  }

  // Education
  function addEducation() {
    const entry: Education = { id: crypto.randomUUID(), degree: '', institution: '', period: '' }
    setCv((prev) => ({ ...prev, education: [...prev.education, entry] }))
    save()
  }
  function removeEducation(i: number) {
    setCv((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))
    save()
  }
  function updateEducation(i: number, field: keyof Omit<Education, 'id'>, value: string) {
    setCv((prev) => {
      const education = [...prev.education]
      education[i] = { ...education[i], [field]: value }
      return { ...prev, education }
    })
  }

  const Doc = template.component
  const previewDoc = useMemo(() => <Doc cv={debouncedCv} />, [debouncedCv, Doc])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
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
                <Input value={cv.profile.name} onChange={(v) => updateProfile('name', v)} />
              </Field>
              <Field label="Job Title">
                <Input value={cv.profile.title} onChange={(v) => updateProfile('title', v)} />
              </Field>
              <Field label="Location">
                <Input value={cv.profile.location} onChange={(v) => updateProfile('location', v)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={cv.profile.email} onChange={(v) => updateProfile('email', v)} />
              </Field>
              <Field label="Website">
                <Input value={cv.profile.website} onChange={(v) => updateProfile('website', v)} />
              </Field>
            </div>
            <Field label="Summary" fullWidth>
              <Textarea value={cv.profile.summary} onChange={(v) => updateProfile('summary', v)} rows={3} />
            </Field>
          </section>

          {/* Skills */}
          <section style={s.card}>
            <h2 style={s.cardTitle}>Core Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {cv.skills.map((skill, i) => (
                <div key={i} style={s.skillTag}>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(i, e.target.value)}
                    onBlur={save}
                    style={s.skillTagInput}
                  />
                  <button type="button" style={s.removeBtn} onClick={() => removeSkill(i)} aria-label="Remove skill">
                    ×
                  </button>
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
              <button type="button" style={s.btnAdd} onClick={addSkill}>
                Add
              </button>
            </div>
          </section>

          {/* Experience */}
          <section style={s.card}>
            <div style={s.sectionHeader}>
              <h2 style={s.cardTitle}>Experience</h2>
              <button type="button" style={s.btnAdd} onClick={addExperience}>+ Add</button>
            </div>
            {cv.experiences.map((exp, i) => (
              <div key={exp.id} style={s.itemBlock}>
                <div style={s.itemHeader}>
                  <span style={s.itemNumber}>#{i + 1}</span>
                  <button type="button" style={s.removeBtnText} onClick={() => removeExperience(i)}>Remove</button>
                </div>
                <div style={s.fieldGrid}>
                  <Field label="Role">
                    <Input value={exp.role} onChange={(v) => updateExperience(i, 'role', v)} />
                  </Field>
                  <Field label="Company">
                    <Input value={exp.company} onChange={(v) => updateExperience(i, 'company', v)} />
                  </Field>
                  <Field label="Period">
                    <Input value={exp.period} placeholder="e.g. 2022 - Present" onChange={(v) => updateExperience(i, 'period', v)} />
                  </Field>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={s.fieldLabel}>Highlights</span>
                  {exp.highlights.map((h, hi) => (
                    <div key={hi} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input
                        type="text"
                        value={h}
                        placeholder="Bullet point..."
                        onChange={(e) => updateHighlight(i, hi, e.target.value)}
                        onBlur={save}
                        style={{ ...s.input, flex: 1 }}
                      />
                      <button type="button" style={s.removeBtn} onClick={() => removeHighlight(i, hi)} aria-label="Remove highlight">
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" style={s.btnGhost} onClick={() => addHighlight(i)}>
                    + Add bullet
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section style={s.card}>
            <div style={s.sectionHeader}>
              <h2 style={s.cardTitle}>Selected Projects</h2>
              <button type="button" style={s.btnAdd} onClick={addProject}>+ Add</button>
            </div>
            {cv.projects.map((project, i) => (
              <div key={project.id} style={s.itemBlock}>
                <div style={s.itemHeader}>
                  <span style={s.itemNumber}>#{i + 1}</span>
                  <button type="button" style={s.removeBtnText} onClick={() => removeProject(i)}>Remove</button>
                </div>
                <div style={s.fieldGrid}>
                  <Field label="Name">
                    <Input value={project.name} onChange={(v) => updateProject(i, 'name', v)} />
                  </Field>
                  <Field label="Tech Stack">
                    <Input value={project.stack} placeholder="e.g. React, TypeScript" onChange={(v) => updateProject(i, 'stack', v)} />
                  </Field>
                </div>
                <Field label="Description" fullWidth>
                  <Textarea value={project.description} onChange={(v) => updateProject(i, 'description', v)} rows={2} />
                </Field>
              </div>
            ))}
          </section>

          {/* Education */}
          <section style={s.card}>
            <div style={s.sectionHeader}>
              <h2 style={s.cardTitle}>Education</h2>
              <button type="button" style={s.btnAdd} onClick={addEducation}>+ Add</button>
            </div>
            {cv.education.map((edu, i) => (
              <div key={edu.id} style={s.itemBlock}>
                <div style={s.itemHeader}>
                  <span style={s.itemNumber}>#{i + 1}</span>
                  <button type="button" style={s.removeBtnText} onClick={() => removeEducation(i)}>Remove</button>
                </div>
                <div style={s.fieldGrid}>
                  <Field label="Degree">
                    <Input value={edu.degree} onChange={(v) => updateEducation(i, 'degree', v)} />
                  </Field>
                  <Field label="Institution">
                    <Input value={edu.institution} onChange={(v) => updateEducation(i, 'institution', v)} />
                  </Field>
                  <Field label="Period">
                    <Input value={edu.period} placeholder="e.g. 2011 - 2014" onChange={(v) => updateEducation(i, 'period', v)} />
                  </Field>
                </div>
              </div>
            ))}
          </section>
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
