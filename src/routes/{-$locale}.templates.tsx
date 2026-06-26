import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { memo, useDeferredValue, useEffect, useMemo, useState, useCallback } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import { TEMPLATES, loadTemplateComponent, getTemplate, type TemplateComponent, type TemplateDefinition } from '../lib/templates'
import { useActiveProfile, saveTemplatePref, cvStore } from '../lib/cv-store'
import { projectCv, type CvData } from '../lib/types'
import { WorkflowNav } from '../components/WorkflowNav'
import { useT, type TFunction, templateName, templateDescription } from '../lib/i18n'

export const Route = createFileRoute('/{-$locale}/templates')({
  beforeLoad: () => {
    if (cvStore.state.profiles.length === 0) throw redirect({ to: '/{-$locale}/cvs' })
  },
  component: TemplatesPage,
})

const A4_WIDTH = 794
const A4_HEIGHT = 1123

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2px solid var(--line)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}

// ── Layout silhouette (tiny static preview for list items) ───────────────────

function slotColor(tpl: TemplateDefinition, key: string): string {
  return tpl.colorSlots.find((s) => s.key === key)?.default ?? '#888888'
}

function LayoutSilhouette({ tpl }: { tpl: TemplateDefinition }) {
  const W = 52
  const H = Math.round(W * (A4_HEIGHT / A4_WIDTH))
  const accent = slotColor(tpl, 'accent')
  const sidebarBg = slotColor(tpl, 'sidebarBg')
  const sidebarAccent = slotColor(tpl, 'sidebarAccent')

  const box: React.CSSProperties = {
    width: W,
    height: H,
    flexShrink: 0,
    borderRadius: 3,
    overflow: 'hidden',
    background: '#fffdf7',
    border: '1px solid var(--line)',
    position: 'relative',
    boxShadow: '0 1px 3px rgba(34,34,34,0.12)',
  }
  const ln = (w: string | number): React.CSSProperties => ({
    height: 2,
    width: w,
    background: 'rgba(34,34,34,0.15)',
    borderRadius: 1,
    flexShrink: 0,
  })
  const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2 }

  let content: React.ReactNode = null
  switch (tpl.id) {
    case 'classic':
      content = (
        <>
          <div style={{ height: '16%', background: accent, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ width: '40%', height: 3, background: 'rgba(255,255,255,0.75)', borderRadius: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, flex: 1 }}>
            <div style={{ ...col, flex: 3, gap: 2.5 }}>
              <div style={ln('100%')} />
              <div style={ln('88%')} />
              <div style={ln('92%')} />
            </div>
            <div style={{ ...col, flex: 2, gap: 2.5 }}>
              <div style={ln('100%')} />
              <div style={ln('70%')} />
            </div>
          </div>
        </>
      )
      break
    case 'modern':
      content = (
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: '34%', background: sidebarBg, padding: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ width: '75%', height: 3, background: sidebarAccent, borderRadius: 1 }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: sidebarAccent }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: sidebarAccent, opacity: 0.5 }} />
            <div style={{ width: '85%', height: 2, background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
            <div style={{ width: '60%', height: 2, background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
          </div>
          <div style={{ ...col, flex: 1, padding: 4, gap: 2.5 }}>
            <div style={ln('90%')} />
            <div style={ln('100%')} />
            <div style={ln('78%')} />
            <div style={ln('85%')} />
          </div>
        </div>
      )
      break
    case 'executive':
      content = (
        <>
          <div style={{ height: '13%', background: accent }} />
          <div style={{ ...col, alignItems: 'center', padding: '5px 6px', gap: 3 }}>
            <div style={ln(W * 0.5)} />
            <div style={ln(W * 0.7)} />
            <div style={ln(W * 0.55)} />
            <div style={ln(W * 0.65)} />
          </div>
        </>
      )
      break
    case 'compact':
      content = (
        <>
          <div style={{ height: '10%', background: accent }} />
          <div style={{ display: 'flex', gap: 4, padding: 4, flex: 1 }}>
            <div style={{ ...col, flex: 1, gap: 2 }}>
              <div style={ln('100%')} />
              <div style={ln('82%')} />
            </div>
            <div style={{ ...col, flex: 1, gap: 2 }}>
              <div style={ln('100%')} />
              <div style={ln('68%')} />
            </div>
          </div>
        </>
      )
      break
    case 'minimal':
      content = (
        <div style={{ ...col, alignItems: 'center', padding: '6px 6px', gap: 4 }}>
          <div style={{ width: '45%', height: 4, background: accent, borderRadius: 1 }} />
          <div style={{ width: '28%', height: 2, background: 'rgba(34,34,34,0.1)', borderRadius: 1 }} />
          <div style={ln(W * 0.72)} />
          <div style={ln(W * 0.6)} />
          <div style={ln(W * 0.66)} />
        </div>
      )
      break
    case 'sidebar':
      content = (
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ ...col, flex: 3, padding: 4, gap: 2.5 }}>
            <div style={ln('92%')} />
            <div style={ln('100%')} />
            <div style={ln('75%')} />
          </div>
          <div style={{ width: '38%', background: sidebarBg, padding: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <div style={{ width: '70%', height: 3, background: accent, borderRadius: 1 }} />
            <div style={ln('100%')} />
            <div style={ln('75%')} />
          </div>
        </div>
      )
      break
    case 'timeline':
      content = (
        <div style={{ display: 'flex', height: '100%', padding: 4, gap: 5 }}>
          <div style={{ width: 2, background: accent, borderRadius: 1, position: 'relative', marginTop: 5, marginBottom: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent, position: 'absolute', left: -1.5, top: 0 }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent, position: 'absolute', left: -1.5, top: '35%' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent, position: 'absolute', left: -1.5, top: '70%' }} />
          </div>
          <div style={{ ...col, flex: 1, gap: 2.5 }}>
            <div style={ln('95%')} />
            <div style={ln('100%')} />
            <div style={ln('78%')} />
            <div style={ln('70%')} />
          </div>
        </div>
      )
      break
  }

  return <div style={box}>{content}</div>
}

// ── List item ─────────────────────────────────────────────────────────────────

const activeBadgeStyle: React.CSSProperties = {
  fontSize: '0.58rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  background: 'rgba(192,107,49,0.12)',
  padding: '0.1rem 0.35rem',
  borderRadius: '0.2rem',
  whiteSpace: 'nowrap',
}

const TemplateListItem = memo(function TemplateListItem({
  tpl,
  isActive,
  isSelected,
  onSelect,
  compact,
  t,
}: {
  tpl: TemplateDefinition
  isActive: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  compact: boolean
  t: TFunction
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect(tpl.id)}
        aria-pressed={isSelected}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.45rem',
          border: `2px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
          borderRadius: '0.5rem',
          background: isSelected ? 'rgba(192,107,49,0.06)' : 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <LayoutSilhouette tpl={tpl} />
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isSelected ? 'var(--ink)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
          {templateName(t, tpl.id)}
        </span>
        {isActive && <span style={{ ...activeBadgeStyle, position: 'absolute', top: 2, right: 2 }}>●</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(tpl.id)}
      aria-pressed={isSelected}
      style={{
        display: 'flex',
        gap: '0.7rem',
        alignItems: 'flex-start',
        padding: '0.55rem 0.7rem',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
        borderRadius: '0.5rem',
        background: isSelected ? 'rgba(192,107,49,0.06)' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'inherit',
        transition: 'background 0.12s, border-color 0.12s',
      }}
    >
      <LayoutSilhouette tpl={tpl} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{templateName(t, tpl.id)}</span>
          {isActive && <span style={activeBadgeStyle}>{t('templates.active')}</span>}
        </div>
        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.4 }}>
          {templateDescription(t, tpl.id)}
        </p>
      </div>
    </button>
  )
})

// ── Detail pane ───────────────────────────────────────────────────────────────

const IframePreview = memo(function IframePreview({ url, title }: { url: string; title: string }) {
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
      title={title}
    />
  )
})

const TemplateDetail = memo(function TemplateDetail({
  tpl,
  cv,
  isStale,
  onUse,
  isCompact,
  t,
}: {
  tpl: TemplateDefinition
  cv: CvData
  isStale: boolean
  onUse: () => void
  isCompact: boolean
  t: TFunction
}) {
  const [Doc, setDoc] = useState<TemplateComponent | null>(null)

  useEffect(() => {
    let cancelled = false
    setDoc(null)
    loadTemplateComponent(tpl.id).then((component) => {
      if (!cancelled) setDoc(() => component)
    })
    return () => {
      cancelled = true
    }
  }, [tpl.id])

  const documentEl = useMemo(() => (Doc ? <Doc cv={cv} /> : null), [Doc, cv])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: 0 }}>
      <div style={s.detailHeader}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
          <h2 style={s.detailName}>{templateName(t, tpl.id)}</h2>
          <p style={s.detailDesc}>{templateDescription(t, tpl.id)}</p>
        </div>
        <button type="button" style={s.btnUse} onClick={onUse}>
          {t('templates.use')}
        </button>
      </div>
      <div style={s.previewArea}>
        <div style={isCompact ? s.previewFrameCompact : s.previewFrame}>
          {!Doc ? (
            <div style={s.loadingState}>
              <Spinner />
              {t('templates.loadingTemplate')}
            </div>
          ) : (
            <BlobProvider document={documentEl!}>
              {({ url, loading }) =>
                loading || !url ? (
                  <div style={s.loadingState}>
                    <Spinner />
                    {t('templates.rendering')}
                  </div>
                ) : (
                  <IframePreview url={url} title={t('templates.iframeTitle')} />
                )
              }
            </BlobProvider>
          )}
          {isStale && Doc && (
            <div style={s.staleOverlay}>
              <div style={s.staleBadge}>
                <Spinner size={12} />
                {t('templates.regenerating')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Page ──────────────────────────────────────────────────────────────────────

function TemplatesPage() {
  const activeProfile = useActiveProfile()
  const deferredProfile = useDeferredValue(activeProfile)
  const isStale = activeProfile !== deferredProfile
  const fullData = deferredProfile.data
  const sectionLabels = deferredProfile.sectionLabels
  const locale = deferredProfile.locale
  const activeTemplateId = activeProfile.templateId
  const navigate = useNavigate()
  const t = useT()

  const [selectedId, setSelectedId] = useState(activeTemplateId)
  const [isCompact, setIsCompact] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false,
  )

  const selectedTpl = getTemplate(selectedId)

  useEffect(() => {
    setSelectedId(activeTemplateId)
  }, [activeTemplateId])

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const id = 'spin-keyframes'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [])

  const cv = useMemo(
    () =>
      projectCv(
        fullData,
        selectedTpl.id,
        deferredProfile.hiddenSections ?? [],
        deferredProfile.pageBreaks ?? [],
        deferredProfile.sectionOrder ?? [],
        (deferredProfile.colors ?? {})[selectedTpl.id] ?? {},
        locale,
        sectionLabels,
      ),
    [fullData, selectedTpl.id, deferredProfile.hiddenSections, deferredProfile.pageBreaks, deferredProfile.sectionOrder, deferredProfile.colors, locale, sectionLabels],
  )

  const handleUse = useCallback(() => {
    saveTemplatePref(selectedTpl.id)
    navigate({ to: '/{-$locale}/cv/edit' })
  }, [selectedTpl.id, navigate])

  function handleListKey(e: React.KeyboardEvent) {
    const idx = TEMPLATES.findIndex((t) => t.id === selectedId)
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = TEMPLATES[Math.min(idx + 1, TEMPLATES.length - 1)]
      if (next) setSelectedId(next.id)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = TEMPLATES[Math.max(idx - 1, 0)]
      if (prev) setSelectedId(prev.id)
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <WorkflowNav active="templates" />
      </header>
      <main style={s.main}>
        <section style={s.heroStrip}>
          <div style={s.heroStat}>
            <span style={s.heroStatLabel}>{t('templates.statLabel')}</span>
            <strong style={s.heroStatValue}>{TEMPLATES.length}</strong>
          </div>
          <div style={s.heroDivider} />
          <div style={s.heroHint}>
            {t('templates.hint')}
          </div>
        </section>
        <div style={isCompact ? s.splitCompact : s.split}>
          <aside
            style={isCompact ? s.listPaneCompact : s.listPane}
            tabIndex={0}
            onKeyDown={handleListKey}
            aria-label={t('templates.listAriaLabel')}
          >
            {TEMPLATES.map((tpl) => (
              <TemplateListItem
                key={tpl.id}
                tpl={tpl}
                isActive={tpl.id === activeTemplateId}
                isSelected={tpl.id === selectedId}
                onSelect={setSelectedId}
                compact={isCompact}
                t={t}
              />
            ))}
          </aside>
          <section style={isCompact ? s.detailPaneCompact : s.detailPane}>
            <TemplateDetail
              tpl={selectedTpl}
              cv={cv}
              isStale={isStale}
              onUse={handleUse}
              isCompact={isCompact}
              t={t}
            />
          </section>
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
  main: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    padding: '2rem 2rem 4rem',
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
  split: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  splitCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  listPane: {
    width: 360,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    overflowY: 'auto',
    maxHeight: 'calc(100dvh - 200px)',
    paddingRight: '0.25rem',
    position: 'sticky',
    top: 70,
  },
  listPaneCompact: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    flexShrink: 0,
  },
  detailPane: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  detailPaneCompact: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    background: '#fffdf7',
    border: '1px solid var(--line)',
    borderRadius: '0.5rem',
    padding: '0.8rem 1rem',
    boxShadow: '0 2px 8px rgba(34,34,34,0.06)',
  },
  detailName: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--ink)',
  },
  detailDesc: {
    margin: 0,
    fontSize: '0.8rem',
    color: 'var(--muted)',
    maxWidth: 420,
    lineHeight: 1.4,
  },
  btnUse: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
    background: 'var(--green)',
    border: 0,
    borderRadius: '0.25rem',
    padding: '0.6rem 1.1rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  previewArea: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'auto',
    padding: '0.5rem 0',
  },
  previewFrame: {
    aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
    width: 'min(100%, 460px)',
    background: '#e8e4da',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 8px 28px rgba(34,34,34,0.14)',
  },
  previewFrameCompact: {
    aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
    width: '100%',
    maxWidth: 460,
    background: '#e8e4da',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 8px 28px rgba(34,34,34,0.14)',
    margin: '0 auto',
  },
  loadingState: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    fontSize: '0.8rem',
    color: 'var(--muted)',
  },
  staleOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(232, 228, 218, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  staleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#fffdf7',
    borderRadius: '0.35rem',
    padding: '0.5rem 0.9rem',
    boxShadow: '0 2px 10px rgba(34,34,34,0.12)',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--ink)',
  },
}
