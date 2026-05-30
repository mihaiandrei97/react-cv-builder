import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useSelector } from '@tanstack/react-store'
import {
  cvStore,
  addProfile,
  duplicateProfile,
  deleteProfile,
  renameProfile,
  switchProfile,
  exportProfile,
  importProfile,
} from '../lib/cv-store'
import { TEMPLATES } from '../lib/templates'
import type { CvProfile } from '../lib/types'

export const Route = createFileRoute('/profiles')({
  component: ProfilesPage,
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts))
}

// ── Profile card ──────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  isActive,
  canDelete,
  isRenaming,
  renameValue,
  onActivate,
  onDuplicate,
  onDelete,
  onExport,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
}: {
  profile: CvProfile
  isActive: boolean
  canDelete: boolean
  isRenaming: boolean
  renameValue: string
  onActivate: () => void
  onDuplicate: () => void
  onDelete: () => void
  onExport: () => void
  onRenameStart: () => void
  onRenameChange: (v: string) => void
  onRenameCommit: () => void
  onRenameCancel: () => void
}) {
  const tpl = TEMPLATES.find((t) => t.id === profile.templateId) ?? TEMPLATES[0]

  return (
    <div
      style={{
        background: '#fffdf7',
        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: '0.5rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: isActive ? '0 4px 16px rgba(34,34,34,0.10)' : '0 2px 8px rgba(34,34,34,0.05)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {/* Active ribbon */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
          }}
        >
          Active
        </div>
      )}

      {/* Name */}
      <div>
        {isRenaming ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameCommit()
              if (e.key === 'Escape') onRenameCancel()
            }}
            onBlur={onRenameCommit}
            style={{
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: 700,
              border: '1px solid var(--accent)',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              width: '100%',
              background: '#fff',
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
        ) : (
          <button
            type="button"
            title="Click to rename"
            onClick={onRenameStart}
            style={{
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--ink)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'text',
              textAlign: 'left',
              display: 'block',
              width: '100%',
            }}
          >
            {profile.name}
          </button>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--accent)',
            background: '#fdf0e6',
            border: '1px solid #f0c89a',
            borderRadius: '999px',
            padding: '0.15rem 0.6rem',
          }}
        >
          {tpl.name}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          Edited {formatDate(profile.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
        {!isActive && (
          <button type="button" style={s.btnPrimary} onClick={onActivate}>
            Edit this CV
          </button>
        )}
        {isActive && (
          <Link to="/cv/edit" style={s.btnPrimaryLink}>
            Open editor →
          </Link>
        )}
        <button type="button" style={s.btnSecondary} onClick={onDuplicate}>
          Duplicate
        </button>
        <button type="button" style={s.btnSecondary} onClick={onExport}>
          Export
        </button>
        {canDelete && (
          <button type="button" style={s.btnDanger} onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ProfilesPage() {
  const profiles = useSelector(cvStore, (s) => s.profiles)
  const activeProfileId = useSelector(cvStore, (s) => s.activeProfileId)
  const navigate = useNavigate()

  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!importInputRef.current) return
    importInputRef.current.value = ''
    if (!file) return
    setImportError(null)
    try {
      await importProfile(file)
      navigate({ to: '/cv/edit' })
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  function handleCreate() {
    if (!newName.trim()) {
      setCreatingNew(false)
      return
    }
    addProfile(newName.trim())
    setCreatingNew(false)
    setNewName('')
    navigate({ to: '/cv/edit' })
  }

  function handleDelete(id: string) {
    if (profiles.length <= 1) return
    if (confirm('Delete this profile? This cannot be undone.')) {
      deleteProfile(id)
    }
  }

  function handleRenameStart(id: string, currentName: string) {
    setRenamingId(id)
    setRenameValue(currentName)
  }

  function handleRenameCommit(id: string) {
    if (renameValue.trim()) renameProfile(id, renameValue.trim())
    setRenamingId(null)
  }

  function handleActivate(id: string) {
    switchProfile(id)
    navigate({ to: '/cv/edit' })
  }

  function handleDuplicate(id: string) {
    duplicateProfile(id)
    navigate({ to: '/cv/edit' })
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={s.backLink}>
            ← Home
          </Link>
          <h1 style={s.title}>CV Profiles</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button
            type="button"
            style={s.btnSecondary}
            onClick={() => importInputRef.current?.click()}
          >
            Import backup
          </button>
          {!creatingNew && (
            <button
              type="button"
              style={s.btnPrimary}
              onClick={() => {
                setCreatingNew(true)
                setNewName('')
              }}
            >
              + New Profile
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={s.main}>
        {importError && (
          <div style={{ background: '#fdf2f0', border: '1px solid #f0b8b0', borderRadius: '0.4rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#9c2f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{importError}</span>
            <button type="button" onClick={() => setImportError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c2f1f', fontSize: '1rem', lineHeight: 1 }}>×</button>
          </div>
        )}
        {/* New profile inline form */}
        {creatingNew && (
          <div style={s.newCard}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Profile name</span>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Frontend Dev, Freelance..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setCreatingNew(false)
              }}
              style={s.newInput}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" style={s.btnPrimary} onClick={handleCreate}>
                Create
              </button>
              <button
                type="button"
                style={s.btnSecondary}
                onClick={() => setCreatingNew(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile grid */}
        <div style={s.grid}>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeProfileId}
              canDelete={profiles.length > 1}
              isRenaming={renamingId === profile.id}
              renameValue={renameValue}
              onActivate={() => handleActivate(profile.id)}
              onDuplicate={() => handleDuplicate(profile.id)}
              onDelete={() => handleDelete(profile.id)}
              onExport={() => exportProfile(profile.id)}
              onRenameStart={() => handleRenameStart(profile.id, profile.name)}
              onRenameChange={setRenameValue}
              onRenameCommit={() => handleRenameCommit(profile.id)}
              onRenameCancel={() => setRenamingId(null)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.85rem 2rem',
    background: '#fffdf7',
    borderBottom: '1px solid var(--line)',
    boxShadow: '0 2px 8px rgba(34,34,34,0.08)',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  backLink: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    color: 'var(--muted)',
    textDecoration: 'none',
  },
  main: {
    flex: 1,
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  newCard: {
    background: '#fffdf7',
    border: '2px dashed var(--accent)',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  newInput: {
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.5rem 0.75rem',
    background: '#fff',
    color: 'var(--ink)',
    outline: 'none',
    width: '100%',
  },
  btnPrimary: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
    background: 'var(--green)',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  btnPrimaryLink: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
    background: 'var(--green)',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    display: 'inline-block',
  },
  btnSecondary: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--ink)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.45rem 0.9rem',
    cursor: 'pointer',
  },
  btnDanger: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#9c2f1f',
    background: 'transparent',
    border: '1px solid #f0b8b0',
    borderRadius: '0.25rem',
    padding: '0.45rem 0.9rem',
    cursor: 'pointer',
  },
}
