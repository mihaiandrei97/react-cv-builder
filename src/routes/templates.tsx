import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import { TEMPLATES, loadTemplateComponent, type TemplateComponent } from '../lib/templates'
import { useActiveProfile, saveTemplatePref, cvStore } from '../lib/cv-store'
import { projectCv, type CvData } from '../lib/types'
import { WorkflowNav } from '../components/WorkflowNav'

export const Route = createFileRoute('/templates')({
  beforeLoad: () => {
    if (cvStore.state.profiles.length === 0) throw redirect({ to: '/cvs' })
  },
  component: TemplatesPage,
})

const A4_WIDTH = 794
const A4_HEIGHT = 1123 // A4 at 96dpi ≈ 1123px

const TemplateCard = memo(function TemplateCard({
  tpl,
  isActive,
  cv,
  onSelect,
  isStale,
  index,
}: {
  tpl: (typeof TEMPLATES)[0]
  isActive: boolean
  cv: CvData
  onSelect: () => void
  isStale: boolean
  index: number
}) {
  const [Doc, setDoc] = useState<TemplateComponent | null>(null)
  const [ready, setReady] = useState(false)
  const [wasVisible, setWasVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    loadTemplateComponent(tpl.id).then((component) => {
      if (!cancelled) setDoc(() => component)
    })
    return () => {
      cancelled = true
    }
  }, [tpl.id])

  // Lazy-mount: only render PDF when card enters viewport.
  // rootMargin pre-renders 300px before visible so scrolling feels instant.
  // Once visible, wasVisible stays true permanently — BlobProvider stays
  // mounted so scrolling back up doesn't trigger a re-render.
  useEffect(() => {
    const el = cardRef.current
    if (!el || !('IntersectionObserver' in window)) {
      setWasVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setWasVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Stagger BlobProvider mount so PDFs render one-by-one, not all at once.
  // Active template renders immediately (0ms); others stagger by index.
  useEffect(() => {
    if (!wasVisible) return
    const delay = isActive ? 0 : Math.min(40 * index, 400)
    const timer = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(timer)
  }, [wasVisible, index, isActive])

  const documentEl = useMemo(() => (Doc ? <Doc cv={cv} /> : null), [Doc, cv])
  const canRender = wasVisible && ready && Doc

  return (
    <div
      ref={cardRef}
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
        <div
          style={{
            width: '100%',
            aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
            overflow: 'hidden',
            position: 'relative',
            background: '#e8e4da',
          }}
        >
          {!canRender ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                fontSize: '0.8rem',
                color: 'var(--muted)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 22,
                  height: 22,
                  border: '2px solid var(--line)',
                  borderTop: '2px solid var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              {Doc ? 'Rendering…' : 'Loading template…'}
            </div>
          ) : (
            <BlobProvider document={documentEl!}>
              {({ url, loading }) =>
                loading || !url ? (
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
                )
              }
              </BlobProvider>
          )}
          {isStale && canRender && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(232, 228, 218, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
              }}
            >
              <div
                style={{
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
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    border: '2px solid var(--line)',
                    borderTop: '2px solid var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Regenerating…
              </div>
            </div>
          )}
      </div>

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
})

const IframePreview = memo(function IframePreview({ url }: { url: string }) {
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
})

// ── Page ──────────────────────────────────────────────────────────────────────

function TemplatesPage() {
  const activeProfile = useActiveProfile()
  const deferredProfile = useDeferredValue(activeProfile)
  const isStale = activeProfile !== deferredProfile
  const fullData = deferredProfile.data

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
  const sectionLabels = deferredProfile.sectionLabels
  const locale = deferredProfile.locale
  const activeTemplateId = activeProfile.templateId
  const navigate = useNavigate()

  const templateEntries = useMemo(() => TEMPLATES.map((tpl) => ({
    tpl,
    cv: projectCv(
      fullData,
      tpl.id,
      deferredProfile.hiddenSections ?? [],
      deferredProfile.pageBreaks ?? [],
      deferredProfile.sectionOrder ?? [],
      (deferredProfile.colors ?? {})[tpl.id] ?? {},
      locale,
      sectionLabels,
    ),
    isActive: activeTemplateId === tpl.id,
    onSelect: () => {
      saveTemplatePref(tpl.id)
      navigate({ to: '/cv/edit' })
    },
  })), [fullData, locale, sectionLabels, activeTemplateId, navigate])

  return (
    <div style={s.page}>
      {/* Top bar */}
      <header style={s.header}>
        <WorkflowNav active="templates" />
      </header>

      {/* Grid */}
      <main style={s.main}>
        <section style={s.heroStrip}>
          <div style={s.heroStat}>
            <span style={s.heroStatLabel}>Templates</span>
            <strong style={s.heroStatValue}>{TEMPLATES.length}</strong>
          </div>
          <div style={s.heroDivider} />
          <div style={s.heroHint}>
            Previews render live from your active CV. Pick one to make it the current layout.
          </div>
        </section>
        <div style={s.grid}>
          {templateEntries.map((entry, i) => (
            <TemplateCard
              key={entry.tpl.id}
              tpl={entry.tpl}
              isActive={entry.isActive}
              cv={entry.cv}
              onSelect={entry.onSelect}
              isStale={isStale}
              index={i}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

// ── Page styles ───────────────────────────────────────────────────────────────

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '2rem',
  },
}
