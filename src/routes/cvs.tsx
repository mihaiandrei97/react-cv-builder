import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  useProfiles,
  useActiveProfileId,
  addProfile,
  switchProfile,
} from '../lib/cv-store'
import { TEMPLATES } from '../lib/templates'
import type { CvLocale } from '../lib/types'

export const Route = createFileRoute('/cvs')({
  component: CvsPage,
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

function formatRelativeDate(ts: number) {
  const diffMs = Date.now() - ts
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts))
}

function CvsPage() {
  const profiles = useProfiles()
  const activeProfileId = useActiveProfileId()
  const navigate = useNavigate()

  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLocale, setNewLocale] = useState<CvLocale>('en')

  function handleSelect(id: string) {
    switchProfile(id)
    navigate({ to: '/templates' })
  }

  function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) return
    const id = addProfile(trimmed, newLocale)
    setCreatingNew(false)
    setNewName('')
    setNewLocale('en')
    navigate({ to: '/templates' })
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header
        style={{
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Your CVs</h1>
          <nav style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }}>
            <NavLink to="/cvs" label="CVs" active />
            <NavLink to="/templates" label="Templates" />
            <NavLink to="/cv/edit" label="Edit" />
            <NavLink to="/cv/print" label="Preview" />
          </nav>
        </div>
        <Link
          to="/"
          style={{
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            color: 'var(--muted)',
            textDecoration: 'none',
            border: '1px solid var(--line)',
            borderRadius: '0.25rem',
            padding: '0.35rem 0.6rem',
          }}
        >
          Home
        </Link>
      </header>

      {/* Grid */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
          padding: '2.5rem 2rem 4rem',
          maxWidth: 1000,
          margin: '0 auto',
          width: '100%',
          flex: 1,
          alignContent: 'start',
        }}
      >
        {profiles.map((p) => {
          const tpl = TEMPLATES.find((t) => t.id === p.templateId) ?? TEMPLATES[0]
          const isActive = p.id === activeProfileId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              style={{
                fontFamily: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
                background: '#fffdf7',
                border: `2px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                borderRadius: '0.65rem',
                padding: '1.1rem 1.2rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: isActive
                  ? '0 8px 22px rgba(192,107,49,0.16)'
                  : '0 4px 12px rgba(34,34,34,0.07)',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* top accent bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: isActive
                    ? 'linear-gradient(90deg, #c06b31, #e7b98f)'
                    : 'linear-gradient(90deg, #d4d0c4, #e8e3d8)',
                }}
              />

              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: 'var(--accent)',
                    borderRadius: '999px',
                    padding: '0.15rem 0.45rem',
                  }}
                >
                  Active
                </span>
              )}

              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', paddingRight: isActive ? '3.5rem' : 0 }}>
                {p.name}
              </span>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  background: '#fdf0e6',
                  border: '1px solid #f0c89a',
                  borderRadius: '999px',
                  padding: '0.15rem 0.55rem',
                  alignSelf: 'flex-start',
                }}
              >
                {tpl.name}
              </span>

              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Updated {formatRelativeDate(p.updatedAt ?? p.createdAt ?? 0)}
              </span>
            </button>
          )
        })}

        {/* New CV card */}
        {creatingNew ? (
          <div
            style={{
              background: '#fffdf7',
              border: '2px solid var(--accent)',
              borderRadius: '0.65rem',
              padding: '1.1rem 1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <input
              autoFocus
              type="text"
              placeholder="Profile name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') { setCreatingNew(false); setNewName(''); setNewLocale('en') }
              }}
              style={{
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                border: '1px solid var(--line)',
                borderRadius: '0.35rem',
                padding: '0.5rem 0.75rem',
                outline: 'none',
                background: '#fff',
                color: 'var(--ink)',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', borderRadius: '0.35rem', overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                {(['en', 'ro'] as CvLocale[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setNewLocale(loc)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '0.75rem',
                      fontWeight: newLocale === loc ? 700 : 600,
                      color: newLocale === loc ? 'var(--ink)' : 'var(--muted)',
                      background: newLocale === loc ? '#fffdf7' : 'transparent',
                      border: 0,
                      borderRight: loc === 'en' ? '1px solid var(--line)' : 0,
                      padding: '0.3rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'var(--green)',
                  border: 'none',
                  borderRadius: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  cursor: newName.trim() ? 'pointer' : 'default',
                  opacity: newName.trim() ? 1 : 0.5,
                  flex: 1,
                }}
              >
                Create &amp; open
              </button>
              <button
                type="button"
                onClick={() => { setCreatingNew(false); setNewName(''); setNewLocale('en') }}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.82rem',
                  color: 'var(--muted)',
                  background: 'none',
                  border: '1px solid var(--line)',
                  borderRadius: '0.35rem',
                  padding: '0.45rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreatingNew(true)}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--muted)',
              background: 'transparent',
              border: '2px dashed var(--line)',
              borderRadius: '0.65rem',
              padding: '1.1rem 1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: 80,
              justifyContent: 'center',
            }}
          >
            + New CV
          </button>
        )}
      </main>

      <footer style={{ padding: '0 2rem 2rem', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <Link
          to="/profiles"
          style={{
            fontSize: '0.78rem',
            color: 'var(--muted)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--line)',
          }}
        >
          Advanced profile management →
        </Link>
      </footer>
    </div>
  )
}
