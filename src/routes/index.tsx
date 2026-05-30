import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'grid',
      placeContent: 'center',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 700,
        margin: 0,
      }}>
        TanStack CV Builder
      </h1>
      <p style={{ color: 'var(--muted)', margin: 0 }}>
        Pick a template, fill in your details, and export a print-ready PDF.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/templates"
          style={{
            fontWeight: 700,
            textDecoration: 'none',
            color: '#fff',
            background: 'var(--green)',
            padding: '0.6rem 1.25rem',
            borderRadius: '0.25rem',
          }}
        >
          Choose Template
        </Link>
        <Link
          to="/cv/edit"
          style={{
            fontWeight: 600,
            textDecoration: 'none',
            color: 'var(--muted)',
            border: '1px solid var(--line)',
            padding: '0.6rem 1.25rem',
            borderRadius: '0.25rem',
          }}
        >
          Open Editor
        </Link>
      </div>
    </main>
  )
}
