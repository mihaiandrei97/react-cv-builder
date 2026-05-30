import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BlobProvider } from '@react-pdf/renderer'
import { TEMPLATES } from '../lib/templates'
import { useSelector } from '@tanstack/react-store'
import { cvStore, saveTemplatePref } from '../lib/cv-store'
import { projectCv, type CvData } from '../lib/types'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

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

function TemplatesPage() {
  const fullData = useSelector(cvStore, (s) => s.fullData)
  const templateId = useSelector(cvStore, (s) => s.templateId)
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
          alignItems: 'center',
          gap: '1rem',
          padding: '0.85rem 2rem',
          background: '#fffdf7',
          borderBottom: '1px solid var(--line)',
          boxShadow: '0 2px 8px rgba(34,34,34,0.08)',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            color: 'var(--muted)',
            textDecoration: 'none',
          }}
        >
          ← Back
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, flex: 1, textAlign: 'center' }}>
          Choose a Template
        </h1>
        <span style={{ width: '2rem' }} />
      </header>

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
