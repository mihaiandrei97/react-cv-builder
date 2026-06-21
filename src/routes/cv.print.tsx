import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRef, useMemo, memo, useCallback, useEffect, useState } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { useActiveProfile, useCvData, cvStore } from '../lib/cv-store'
import { getTemplate, loadTemplateComponent, type TemplateComponent } from '../lib/templates'
import { WorkflowNav } from '../components/WorkflowNav'

export const Route = createFileRoute('/cv/print')({
  beforeLoad: () => {
    if (cvStore.state.profiles.length === 0) throw redirect({ to: '/cvs' })
  },
  component: PrintPage,
})

const PdfViewer = memo(function PdfViewer({
  docElement,
  onUrl,
}: {
  docElement: ReactElement<DocumentProps>
  onUrl: (url: string | null) => void
}) {
  return (
    <BlobProvider document={docElement}>
      {({ url, loading, error }) => {
        if (loading) return <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Rendering PDF…</p>
        if (error) return <p style={{ color: '#9c2f1f', fontSize: '0.9rem' }}>Error rendering PDF: {error.message}</p>
        if (!url) return null
        onUrl(url)
        return (
            <iframe
              src={`${url}#toolbar=0&navpanes=0`}
              style={{
                width: '100%',
                maxWidth: 794,
                height: 'calc(100vh - 100px)',
                minHeight: 600,
                border: 'none',
                borderRadius: '0.25rem',
                boxShadow: '0 20px 45px rgba(34,34,34,0.12)',
              }}
              title="CV PDF Preview"
            />
        )
      }}
    </BlobProvider>
  )
})

function PrintPage() {
  const cv = useCvData()
  const activeProfile = useActiveProfile()
  const templateId = activeProfile.templateId
  const profileName = activeProfile.name
  const blobUrlRef = useRef<string | null>(null)
  const [Doc, setDoc] = useState<TemplateComponent | null>(null)

  const template = getTemplate(templateId)
  const docElement = useMemo(() => (Doc ? <Doc cv={cv} /> : null), [Doc, cv])

  useEffect(() => {
    let cancelled = false
    setDoc(null)
    loadTemplateComponent(templateId).then((component) => {
      if (!cancelled) setDoc(() => component)
    })

    return () => {
      cancelled = true
    }
  }, [templateId])

  const handleUrl = useCallback((url: string | null) => {
    blobUrlRef.current = url
  }, [])

  useEffect(() => {
    if (!docElement) handleUrl(null)
  }, [docElement, handleUrl])

  function downloadPdf() {
    if (!blobUrlRef.current) return
    const a = document.createElement('a')
    a.href = blobUrlRef.current
    const safeName = profileName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    a.download = `${safeName || 'cv'}.pdf`
    a.click()
  }

  return (
    <div style={s.page}>
      {/* Top bar */}
      <header style={s.header}>
        <WorkflowNav active="preview" />
        <div style={s.headerActions}>
          <span style={s.templateBadge}>{template.name}</span>
          <button type="button" onClick={downloadPdf} style={s.btnPrimary}>
            Download PDF
          </button>
        </div>
      </header>

      {/* PDF viewer */}
      <main style={s.main}>
        {docElement ? (
          <PdfViewer docElement={docElement} onUrl={handleUrl} />
        ) : (
          <p style={s.loading}>Loading template…</p>
        )}
      </main>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
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
    whiteSpace: 'nowrap',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem 4rem',
    gap: '1rem',
    background:
      'radial-gradient(circle at 20% 20%, #ece9de 0%, #ece9de 20%, transparent 20%), linear-gradient(160deg, #f6f3e8 0%, #efeadd 55%, #e6e0d3 100%)',
  },
  loading: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
  },
}
