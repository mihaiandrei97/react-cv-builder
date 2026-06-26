import { Link } from '@tanstack/react-router'
import { LocaleSwitcher } from './LocaleSwitcher'

type Step = 'templates' | 'edit' | 'preview'

const STEPS = [
  { key: 'templates', label: 'Templates', to: '/{-$locale}/templates' },
  { key: 'edit', label: 'Edit', to: '/{-$locale}/cv/edit' },
  { key: 'preview', label: 'Preview', to: '/{-$locale}/cv/print' },
] as const

const backLink: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  border: '1px solid var(--line)',
  borderRadius: '0.25rem',
  padding: '0.3rem 0.6rem',
  background: 'rgba(255, 253, 247, 0.6)',
}

const stepsNav: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
}

const stepInactive: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  padding: '0.3rem 0.65rem',
  borderRadius: '999px',
}

const stepActive: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--accent)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  padding: '0.3rem 0.65rem',
  borderRadius: '999px',
  background: '#fdf0e6',
  border: '1px solid #f0c89a',
}

const arrow: React.CSSProperties = {
  color: 'var(--line)',
  fontSize: '0.75rem',
  userSelect: 'none',
}

export function WorkflowNav({ active }: { active: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', minWidth: 0 }}>
      <Link to="/{-$locale}/cvs" style={backLink}>
        ← CVs
      </Link>
      <nav style={stepsNav}>
        {STEPS.map((step, i) => (
          <span key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {i > 0 && <span style={arrow}>→</span>}
            <Link to={step.to} style={step.key === active ? stepActive : stepInactive}>
              {step.label}
            </Link>
          </span>
        ))}
      </nav>
      <LocaleSwitcher />
    </div>
  )
}
