import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import { TEMPLATES } from '../lib/templates'
import { useSelector } from '@tanstack/react-store'
import { cvStore, saveTemplatePref, switchProfile, addProfile } from '../lib/cv-store'
import { projectCv, type CvData, type CvProfile } from '../lib/types'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

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

const A4_WIDTH = 794
const A4_HEIGHT = 1123 // A4 at 96dpi ≈ 1123px

function TemplateCard({
  tpl,
  isActive,
  cv,
  onSelect,
}: {
  tpl: (typeof TEMPLATES)[0]
  isActive: boolean
  cv: CvData
  onSelect: () => void
}) {
  const Doc = tpl.component
  return (
    <div
      style={{
        background: '#fffdf7',
        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(34,34,34,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        position: 'relative',
      }}
    >
      {/* Active ribbon */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: -22,
            width: 90,
            textAlign: 'center',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0.25rem 0',
            transform: 'rotate(45deg)',
            transformOrigin: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          Active
        </div>
      )}
      {/* Preview */}
      <BlobProvider document={<Doc cv={cv} />}>
        {({ url, loading }) => (
          <div
            style={{
              width: '100%',
              aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
              overflow: 'hidden',
              position: 'relative',
              background: '#e8e4da',
            }}
          >
            {loading || !url ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--muted)',
                }}
              >
                Rendering…
              </div>
            ) : (
              <IframePreview url={url} />
            )}
          </div>
        )}
      </BlobProvider>

      {/* Footer */}
      <div
        style={{
          padding: '1rem 1.2rem',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{tpl.name}</span>
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--muted)',
              maxWidth: 240,
              lineHeight: 1.4,
            }}
          >
            {tpl.description}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onSelect}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#fff',
              background: 'var(--green)',
              border: 0,
              borderRadius: '0.25rem',
              padding: '0.5rem 0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Use template
          </button>
        </div>
      </div>
    </div>
  )
}

function IframePreview({ url }: { url: string }) {
  return (
    <iframe
      src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        pointerEvents: 'none',
      }}
      title="PDF Preview"
    />
  )
}

// ── Profile strip ─────────────────────────────────────────────────────────────

function ProfilePill({
  profile,
  isActive,
  onClick,
}: {
  profile: CvProfile
  isActive: boolean
  onClick: () => void
}) {
  const tpl = TEMPLATES.find((t) => t.id === profile.templateId) ?? TEMPLATES[0]
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        alignItems: 'flex-start',
        padding: '0.65rem 0.9rem',
        borderRadius: '0.4rem',
        border: `1px solid ${isActive ? '#f0c89a' : 'var(--line)'}`,
        background: isActive ? 'linear-gradient(180deg, #fff7ef 0%, #fdf0e6 100%)' : '#fffdf7',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
        minWidth: 130,
        textAlign: 'left',
        boxShadow: isActive ? '0 6px 14px rgba(192,107,49,0.14)' : 'none',
      }}
    >
      <span
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isActive ? 'var(--accent)' : 'var(--muted)',
        }}
      >
        {isActive ? 'Active profile' : 'Profile'}
      </span>
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>
        {profile.name}
      </span>
      <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--accent)' : 'var(--muted)' }}>
        {tpl.name}
      </span>
    </button>
  )
}

function ProfileStrip() {
  const profiles = useSelector(cvStore, (s) => s.profiles)
  const activeProfileId = useSelector(cvStore, (s) => s.activeProfileId)
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')

  function handleCreate() {
    const trimmed = newName.trim()
    if (trimmed) addProfile(trimmed)
    setCreatingNew(false)
    setNewName('')
  }

  return (
    <div
      style={{
        borderBottom: '1px solid var(--line)',
        background: '#fffdf7',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
        Profile
      </span>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', alignItems: 'center', paddingBottom: 2, flex: 1 }}>
        {profiles.map((p) => (
          <ProfilePill
            key={p.id}
            profile={p}
            isActive={p.id === activeProfileId}
            onClick={() => switchProfile(p.id)}
          />
        ))}

        {creatingNew ? (
          <input
            autoFocus
            type="text"
            placeholder="Profile name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setCreatingNew(false); setNewName('') }
            }}
            onBlur={handleCreate}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              border: '2px solid var(--accent)',
              borderRadius: '0.4rem',
              padding: '0.6rem 0.9rem',
              outline: 'none',
              background: '#fff',
              color: 'var(--ink)',
              width: 160,
              flexShrink: 0,
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreatingNew(true)}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--muted)',
              background: 'transparent',
              border: '2px dashed var(--line)',
              borderRadius: '0.4rem',
              padding: '0.6rem 0.9rem',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            + New
          </button>
        )}
      </div>
      <Link
        to="/profiles"
        style={{
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--muted)',
          textDecoration: 'none',
          flexShrink: 0,
          border: '1px solid var(--line)',
          borderRadius: '0.3rem',
          padding: '0.3rem 0.55rem',
        }}
      >
        Profiles →
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function TemplatesPage() {
  const fullData = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).data)
  const templateId = useSelector(cvStore, (s) => (s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]).templateId)
  const navigate = useNavigate()

  function selectTemplate(id: string) {
    saveTemplatePref(id)
    navigate({ to: '/cv/edit' })
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Choose a Template</h1>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            <NavLink to="/templates" label="Templates" active />
            <NavLink to="/cv/edit" label="Edit" />
            <NavLink to="/cv/print" label="Preview" />
            <NavLink to="/profiles" label="Profiles" />
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

      {/* Profile strip */}
      <ProfileStrip />

      {/* Grid */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '2rem',
          padding: '2.5rem 2rem 4rem',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          background: 'linear-gradient(160deg, #f6f3e8 0%, #efeadd 55%, #e6e0d3 100%)',
          flex: 1,
        }}
      >
        {TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            isActive={templateId === tpl.id}
            cv={projectCv(fullData, tpl.id)}
            onSelect={() => selectTemplate(tpl.id)}
          />
        ))}
      </main>
    </div>
  )
}
