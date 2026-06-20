import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

const steps = [
  { num: '01', label: 'Pick a template', desc: 'Choose from clean, professional layouts.' },
  { num: '02', label: 'Fill in your details', desc: 'Edit everything in a live form editor.' },
  { num: '03', label: 'Export to PDF', desc: 'Download a print-ready PDF instantly.' },
]

function Home() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem 4rem',
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, #e8e2d3 0%, transparent 70%), var(--paper)',
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            background: '#fdf0e6',
            border: '1px solid #f0c89a',
            borderRadius: '999px',
            padding: '0.25rem 0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          CV Builder
        </span>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            margin: '0 0 1rem',
            letterSpacing: '-0.02em',
          }}
        >
          A CV{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>worth</em>{' '}
          keeping.
        </h1>

        <p
          style={{
            color: 'var(--muted)',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            margin: '0 0 2rem',
          }}
        >
          Pick a template, fill in your details, and download a print-ready PDF — no account needed.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/cvs"
            style={{
              fontWeight: 700,
              textDecoration: 'none',
              color: '#fff',
              background: 'var(--green)',
              padding: '0.7rem 1.5rem',
              borderRadius: '0.3rem',
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(45,93,76,0.18)',
            }}
          >
            Get started →
          </Link>
        </div>
      </div>

      {/* Steps */}
      <div
        style={{
          display: 'flex',
          gap: '1px',
          marginTop: '4rem',
          background: 'var(--line)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          width: '100%',
          maxWidth: 680,
          boxShadow: '0 4px 20px rgba(34,34,34,0.06)',
        }}
      >
        {steps.map(({ num, label, desc }) => (
          <div
            key={num}
            style={{
              flex: 1,
              background: 'var(--paper)',
              padding: '1.4rem 1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                fontStyle: 'normal',
              }}
            >
              {num}
            </span>
            <strong style={{ fontSize: '0.9rem', fontWeight: 700 }}>{label}</strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
