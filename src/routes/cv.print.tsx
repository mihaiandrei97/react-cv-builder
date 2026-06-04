import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useMemo, memo, useCallback, useEffect, useState } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { useActiveProfile, useCvData } from '../lib/cv-store'
import { getTemplate, loadTemplateComponent, type TemplateComponent } from '../lib/templates'

export const Route = createFileRoute('/cv/print')({
  component: PrintPage,
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#fffdf7',
          borderBottom: '1px solid var(--line)',
          boxShadow: '0 2px 8px rgba(34,34,34,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>CV Preview</h1>
          <nav style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }}>
            <NavLink to="/templates" label="Templates" />
            <NavLink to="/cv/edit" label="Edit" />
            <NavLink to="/cv/print" label="Preview" active />
            <NavLink to="/profiles" label="Profiles" />
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--accent)',
              background: '#fdf0e6',
              border: '1px solid #f0c89a',
              borderRadius: '0.25rem',
              padding: '0.2rem 0.55rem',
            }}
          >
            {template.name}
          </span>
          <button
            type="button"
            onClick={downloadPdf}
            style={{
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
            }}
          >
            Download PDF
          </button>
        </div>
      </header>

      {/* PDF viewer */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1rem 4rem',
          gap: '1rem',
          background: 'radial-gradient(circle at 20% 20%, #ece9de 0%, #ece9de 20%, transparent 20%), linear-gradient(160deg, #f6f3e8 0%, #efeadd 55%, #e6e0d3 100%)',
        }}
      >
        {docElement ? (
          <PdfViewer docElement={docElement} onUrl={handleUrl} />
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading template…</p>
        )}
      </main>
    </div>
  )
}
