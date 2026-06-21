import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  useProfiles,
  useActiveProfileId,
  addProfile,
  switchProfile,
  duplicateProfile,
  deleteProfile,
  renameProfile,
  exportProfile,
  importProfile,
} from '../lib/cv-store'
import { TEMPLATES } from '../lib/templates'
import type { CvLocale, CvProfile } from '../lib/types'

export const Route = createFileRoute('/cvs')({
  component: CvsPage,
})

function formatRelativeDate(ts: number) {
  const diffMs = Date.now() - ts
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts))
}

function getInitial(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return 'CV'
  return trimmed.charAt(0).toUpperCase()
}

function CvCard({
  profile,
  isActive,
  canDelete,
  isRenaming,
  renameValue,
  onOpen,
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
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onExport: () => void
  onRenameStart: () => void
  onRenameChange: (v: string) => void
  onRenameCommit: () => void
  onRenameCancel: () => void
}) {
  const tpl = TEMPLATES.find((t) => t.id === profile.templateId) ?? TEMPLATES[0]
  const initial = getInitial(profile.name)

  return (
    <div style={isActive ? s.cardActive : s.card} className="cv-card">
      <div style={isActive ? s.cardBarActive : s.cardBar} />

      {isActive && <span style={s.activeBadge}>Active</span>}

      <div style={s.cardHead}>
        <span style={isActive ? s.monogramActive : s.monogram}>{initial}</span>
        <div style={s.cardHeadText}>
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
              style={s.renameInput}
            />
          ) : (
            <button
              type="button"
              title="Click to rename"
              onClick={onRenameStart}
              style={s.nameBtn}
            >
              {profile.name}
            </button>
          )}
          <span style={s.cardUpdated}>
            Updated {formatRelativeDate(profile.updatedAt ?? profile.createdAt ?? 0)}
          </span>
        </div>
      </div>

      <div style={s.cardTags}>
        <span style={s.tagTemplate}>{tpl.name}</span>
        <span style={s.tagLocale}>{profile.locale.toUpperCase()}</span>
      </div>

      <div style={s.cardFooter}>
        <button type="button" style={s.btnPrimary} onClick={onOpen}>
          {isActive ? 'Open →' : 'Switch & open →'}
        </button>
        <div style={s.cardActionRow}>
          <button type="button" style={s.btnGhostSm} onClick={onDuplicate} title="Duplicate">
            Duplicate
          </button>
          <button type="button" style={s.btnGhostSm} onClick={onExport} title="Export JSON backup">
            Export
          </button>
          {canDelete && (
            <button type="button" style={s.btnDangerSm} onClick={onDelete} title="Delete">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CvsPage() {
  const profiles = useProfiles()
  const activeProfileId = useActiveProfileId()
  const navigate = useNavigate()

  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLocale, setNewLocale] = useState<CvLocale>('en')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profiles.length > 0) return
    setCreatingNew(true)
  }, [profiles.length])

  useEffect(() => {
    const id = 'cvs-card-hover'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = [
      '.cv-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }',
      '.cv-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(34,34,34,0.12); }',
      '.cv-card-new { transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background 0.18s ease; }',
      '.cv-card-new:hover { transform: translateY(-3px); border-color: var(--accent); background: #fffaf3; }',
    ].join('\n')
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [])

  function handleOpen(id: string) {
    switchProfile(id)
    navigate({ to: '/cv/edit' })
  }

  function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) return
    addProfile(trimmed, newLocale)
    setCreatingNew(false)
    setNewName('')
    setNewLocale('en')
    navigate({ to: '/templates' })
  }

  function handleDelete(id: string) {
    if (profiles.length <= 1) return
    if (confirm('Delete this CV? This cannot be undone.')) {
      deleteProfile(id)
    }
  }

  function handleDuplicate(id: string) {
    duplicateProfile(id)
  }

  function handleRenameStart(id: string, currentName: string) {
    setRenamingId(id)
    setRenameValue(currentName)
  }

  function handleRenameCommit(id: string) {
    if (renameValue.trim()) renameProfile(id, renameValue.trim())
    setRenamingId(null)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!importInputRef.current) return
    importInputRef.current.value = ''
    if (!file) return
    setImportError(null)
    try {
      await importProfile(file)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <div style={s.page}>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <header style={s.header}>
        <div style={s.titleStack}>
          <h1 style={s.title}>Your CVs</h1>
          <p style={s.subtitle}>Pick up where you left off, or start something new.</p>
        </div>
      </header>

      <main style={s.main}>
        {profiles.length === 0 ? (
          <section style={s.emptyState}>
            <div style={s.emptyIcon}>✦</div>
            <h2 style={s.emptyTitle}>No CVs yet</h2>
            <p style={s.emptyHint}>
              Create your first CV to pick a template and start filling in your details.
            </p>
            {creatingNew ? (
              <div style={{ ...s.newCard, width: '100%', maxWidth: 460 }}>
                <span style={s.newTitle}>New CV</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Frontend Dev, Freelance…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') {
                      setCreatingNew(false)
                      setNewName('')
                      setNewLocale('en')
                    }
                  }}
                  style={s.newInput}
                />
                <div style={s.newRow}>
                  <div style={s.localeToggle}>
                    {(['en', 'ro'] as CvLocale[]).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setNewLocale(loc)}
                        style={{
                          ...(newLocale === loc ? s.localeBtnActive : s.localeBtn),
                          borderRight: loc === 'en' ? '1px solid var(--line)' : 0,
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
                    style={newName.trim() ? s.btnPrimary : s.btnPrimaryDisabled}
                  >
                    Create &amp; open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingNew(false)
                      setNewName('')
                      setNewLocale('en')
                    }}
                    style={s.btnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingNew(true)}
                style={s.btnPrimary}
              >
                + Create your first CV
              </button>
            )}
            <button
              type="button"
              style={s.importLink}
              onClick={() => importInputRef.current?.click()}
            >
              Or import a backup
            </button>
          </section>
        ) : (
          <>
            <section style={s.heroStrip}>
              <div style={s.heroStat}>
                <span style={s.heroStatLabel}>CVs</span>
                <strong style={s.heroStatValue}>{profiles.length}</strong>
              </div>
              <div style={s.heroDivider} />
              <div style={s.heroHint}>
                Tip: keep one CV per role target — tune the summary and skills for each.
              </div>
            </section>

            {importError && (
              <div style={s.errorBanner}>
                <span>{importError}</span>
                <button type="button" onClick={() => setImportError(null)} style={s.errorClose}>
                  ×
                </button>
              </div>
            )}

            {creatingNew && (
              <div style={s.newCard}>
                <span style={s.newTitle}>New CV</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Frontend Dev, Freelance…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') {
                      setCreatingNew(false)
                      setNewName('')
                      setNewLocale('en')
                    }
                  }}
                  style={s.newInput}
                />
                <div style={s.newRow}>
                  <div style={s.localeToggle}>
                    {(['en', 'ro'] as CvLocale[]).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setNewLocale(loc)}
                        style={{
                          ...(newLocale === loc ? s.localeBtnActive : s.localeBtn),
                          borderRight: loc === 'en' ? '1px solid var(--line)' : 0,
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
                    style={newName.trim() ? s.btnPrimary : s.btnPrimaryDisabled}
                  >
                    Create &amp; open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingNew(false)
                      setNewName('')
                      setNewLocale('en')
                    }}
                    style={s.btnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={s.grid}>
              {profiles.map((p) => (
                <CvCard
                  key={p.id}
                  profile={p}
                  isActive={p.id === activeProfileId}
                  canDelete={profiles.length > 1}
                  isRenaming={renamingId === p.id}
                  renameValue={renameValue}
                  onOpen={() => handleOpen(p.id)}
                  onDuplicate={() => handleDuplicate(p.id)}
                  onDelete={() => handleDelete(p.id)}
                  onExport={() => exportProfile(p.id)}
                  onRenameStart={() => handleRenameStart(p.id, p.name)}
                  onRenameChange={setRenameValue}
                  onRenameCommit={() => handleRenameCommit(p.id)}
                  onRenameCancel={() => setRenamingId(null)}
                />
              ))}

              {!creatingNew && (
                <button
                  type="button"
                  onClick={() => setCreatingNew(true)}
                  style={s.newTile}
                  className="cv-card-new"
                >
                  <span style={s.newTilePlus}>+</span>
                  <span style={s.newTileLabel}>New CV</span>
                  <span style={s.newTileHint}>Start from a fresh template</span>
                </button>
              )}
            </div>

            <footer style={s.footer}>
              <button type="button" style={s.importLink} onClick={() => importInputRef.current?.click()}>
                Import backup
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background:
      'radial-gradient(circle at 18% 0%, #efe6d4 0%, transparent 36%), radial-gradient(circle at 86% 22%, #ebe2cf 0%, transparent 34%), #f6f2e8',
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
  titleStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
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
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  btnPrimaryDisabled: {
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#fff',
    background: 'var(--green)',
    border: 'none',
    borderRadius: '0.35rem',
    padding: '0.45rem 0.75rem',
    cursor: 'default',
    opacity: 0.5,
    flex: 1,
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
  main: {
    flex: 1,
    maxWidth: 1000,
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
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
    flexWrap: 'wrap',
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
    flex: 1,
    minWidth: 200,
  },
  errorBanner: {
    background: '#fdf2f0',
    border: '1px solid #f0b8b0',
    borderRadius: '0.4rem',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: '#9c2f1f',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9c2f1f',
    fontSize: '1rem',
    lineHeight: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
    alignContent: 'start',
  },
  card: {
    background: '#fffdf7',
    border: '1px solid var(--line)',
    borderRadius: '0.7rem',
    padding: '1.15rem 1.15rem 1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(34,34,34,0.06)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 188,
  },
  cardActive: {
    background: '#fffdf7',
    border: '1px solid #edbf91',
    borderRadius: '0.7rem',
    padding: '1.15rem 1.15rem 1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 16px 28px rgba(192,107,49,0.17)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 188,
  },
  cardBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #d4d0c4 0%, #e8e3d8 100%)',
  },
  cardBarActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #c06b31 0%, #d9894d 55%, #e7b98f 100%)',
  },
  activeBadge: {
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
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingRight: '3.5rem',
  },
  monogram: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: '0.45rem',
    fontFamily: 'inherit',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--muted)',
    background: 'linear-gradient(180deg, #f3eee0 0%, #e8e1cf 100%)',
    border: '1px solid var(--line)',
  },
  monogramActive: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: '0.45rem',
    fontFamily: 'inherit',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(180deg, #c06b31 0%, #a8581f 100%)',
    border: '1px solid #a8581f',
  },
  cardHeadText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    minWidth: 0,
  },
  nameBtn: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink)',
    letterSpacing: '-0.01em',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'block',
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  renameInput: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink)',
    border: '1px solid var(--accent)',
    borderRadius: '0.25rem',
    padding: '0.15rem 0.4rem',
    width: '100%',
    background: '#fff',
    outline: 'none',
  },
  cardUpdated: {
    fontSize: '0.72rem',
    color: 'var(--muted)',
  },
  cardTags: {
    display: 'flex',
    gap: '0.4rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tagTemplate: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--accent)',
    background: '#fdf0e6',
    border: '1px solid #f0c89a',
    borderRadius: '999px',
    padding: '0.15rem 0.55rem',
  },
  tagLocale: {
    fontSize: '0.67rem',
    fontWeight: 700,
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: '999px',
    padding: '0.15rem 0.5rem',
  },
  cardFooter: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardActionRow: {
    display: 'flex',
    gap: '0.45rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  btnGhostSm: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--muted)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    padding: '0.3rem 0.55rem',
    cursor: 'pointer',
  },
  btnDangerSm: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#9c2f1f',
    background: 'transparent',
    border: '1px solid #f0b8b0',
    borderRadius: '0.25rem',
    padding: '0.3rem 0.55rem',
    cursor: 'pointer',
  },
  newCard: {
    background: '#fffdf7',
    border: '2px dashed var(--accent)',
    borderRadius: '0.7rem',
    padding: '1.15rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  newTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: 'var(--ink)',
  },
  newInput: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    border: '1px solid var(--line)',
    borderRadius: '0.35rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    background: '#fff',
    color: 'var(--ink)',
    width: '100%',
  },
  newRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  localeToggle: {
    display: 'flex',
    borderRadius: '0.35rem',
    overflow: 'hidden',
    border: '1px solid var(--line)',
    flexShrink: 0,
  },
  localeBtn: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--muted)',
    background: 'transparent',
    border: 0,
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
  },
  localeBtnActive: {
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--ink)',
    background: '#fffdf7',
    border: 0,
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
  },
  newTile: {
    fontFamily: 'inherit',
    background: 'transparent',
    border: '2px dashed var(--line)',
    borderRadius: '0.7rem',
    padding: '1.15rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    color: 'var(--muted)',
    minHeight: 188,
  },
  newTilePlus: {
    fontSize: '1.9rem',
    fontWeight: 400,
    lineHeight: 1,
    color: 'var(--accent)',
    marginBottom: '0.15rem',
  },
  newTileLabel: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--ink)',
  },
  newTileHint: {
    fontSize: '0.75rem',
    color: 'var(--muted)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.5rem 0 0',
  },
  importLink: {
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--muted)',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid transparent',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '4rem 1.5rem 5rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '2.4rem',
    color: 'var(--accent)',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: 'var(--ink)',
  },
  emptyHint: {
    margin: 0,
    fontSize: '0.92rem',
    color: 'var(--muted)',
    lineHeight: 1.55,
    maxWidth: 440,
  },
}
