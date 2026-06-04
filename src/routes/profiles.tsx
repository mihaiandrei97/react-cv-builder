import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import {
  useProfiles,
  useActiveProfileId,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts))
}

function formatRelativeDate(ts: number) {
  const diffMs = Date.now() - ts
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(ts)
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
        border: `1px solid ${isActive ? '#edbf91' : 'var(--line)'}`,
        borderRadius: '0.7rem',
        padding: '1.15rem 1.15rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        boxShadow: isActive ? '0 16px 28px rgba(192,107,49,0.17)' : '0 5px 14px rgba(34,34,34,0.06)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '0 auto auto 0',
          width: '100%',
          height: 4,
          background: isActive
            ? 'linear-gradient(90deg, #c06b31 0%, #d9894d 55%, #e7b98f 100%)'
            : 'linear-gradient(90deg, #d4d0c4 0%, #e8e3d8 100%)',
        }}
      />

      {/* Active ribbon */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.58rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.5rem',
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
              cursor: 'pointer',
              textAlign: 'left',
              display: 'block',
              width: '100%',
              letterSpacing: '-0.01em',
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
            fontWeight: 700,
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
          Updated {formatRelativeDate(profile.updatedAt)}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          borderTop: '1px dashed #ddd7ca',
          borderBottom: '1px dashed #ddd7ca',
          padding: '0.5rem 0',
        }}
      >
        <span>Created {formatDate(profile.createdAt)}</span>
      </div>

      {/* Actions */}
      <div style={s.cardActionStack}>
        {!isActive && (
          <button type="button" style={{ ...s.btnPrimary, ...s.btnFull }} onClick={onActivate}>
            Switch to this profile
          </button>
        )}
        {isActive && (
          <Link to="/cv/edit" style={{ ...s.btnPrimaryLink, ...s.btnFull }}>
            Open editor -&gt;
          </Link>
        )}
        <div style={s.cardActionRow}>
          <button type="button" style={{ ...s.btnSecondary, ...s.btnGrow }} onClick={onDuplicate}>
            Duplicate
          </button>
          <button type="button" style={{ ...s.btnSecondary, ...s.btnGrow }} onClick={onExport}>
            Export
          </button>
          {canDelete && (
            <button type="button" style={s.btnDanger} onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ProfilesPage() {
  const profiles = useProfiles()
  const activeProfileId = useActiveProfileId()
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
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <h1 style={s.title}>CV Profiles</h1>
            <p style={s.subtitle}>Keep role-specific versions clean and ready.</p>
          </div>
          <nav style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }}>
            <NavLink to="/templates" label="Templates" />
            <NavLink to="/cv/edit" label="Edit" />
            <NavLink to="/cv/print" label="Preview" />
            <NavLink to="/profiles" label="Profiles" active />
          </nav>
        </div>
        <div style={s.headerActions}>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Link to="/" style={s.backLink}>
            Home
          </Link>
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
        <section style={s.heroStrip}>
          <div style={s.heroStat}>
            <span style={s.heroStatLabel}>Profiles</span>
            <strong style={s.heroStatValue}>{profiles.length}</strong>
          </div>
          <div style={s.heroDivider} />
          <div style={s.heroHint}>Tip: create one profile per role target to keep summaries and skills focused.</div>
        </section>

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
  page: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background:
      'radial-gradient(circle at 14% 0%, #efe6d4 0%, transparent 34%), radial-gradient(circle at 88% 18%, #e8e0ce 0%, transparent 32%), #f6f2e8',
  },
  header: {
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
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.78rem',
    color: 'var(--muted)',
  },
  backLink: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.35rem 0.6rem',
    color: 'var(--muted)',
    textDecoration: 'none',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  main: {
    flex: 1,
    maxWidth: 980,
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  heroStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'linear-gradient(180deg, #fff8ed 0%, #fdf0df 100%)',
    border: '1px solid #f0cfaa',
    borderRadius: '0.75rem',
    padding: '0.9rem 1rem',
    boxShadow: '0 8px 22px rgba(192,107,49,0.12)',
  },
  heroStat: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  heroStatLabel: {
    fontSize: '0.74rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--accent)',
  },
  heroStatValue: {
    fontSize: '1.35rem',
    color: 'var(--ink)',
    lineHeight: 1,
  },
  heroDivider: {
    width: 1,
    height: 28,
    background: '#e5c8a5',
  },
  heroHint: {
    fontSize: '0.82rem',
    color: 'var(--muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
    textAlign: 'center',
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
    textAlign: 'center',
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
  btnFull: {
    width: '100%',
  },
  btnGrow: {
    flex: 1,
  },
  cardActionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: 'auto',
  },
  cardActionRow: {
    display: 'flex',
    gap: '0.45rem',
    alignItems: 'center',
  },
}
