import { Link } from '@tanstack/react-router'
import { UI_LOCALES, type UiLocale } from '../lib/i18n'
import { useUiLocale } from '../lib/i18n/context'

const switcher: React.CSSProperties = {
  display: 'flex',
  borderRadius: '0.25rem',
  overflow: 'hidden',
  border: '1px solid var(--line)',
  flexShrink: 0,
}

const baseBtn: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.72rem',
  fontWeight: 700,
  padding: '0.25rem 0.5rem',
  border: 0,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  letterSpacing: '0.04em',
}

const activeBtn: React.CSSProperties = {
  ...baseBtn,
  color: 'var(--ink)',
  background: '#fffdf7',
}

const inactiveBtn: React.CSSProperties = {
  ...baseBtn,
  color: 'var(--muted)',
  background: 'transparent',
}

export function LocaleSwitcher() {
  const current = useUiLocale()

  return (
    <div style={switcher}>
      {UI_LOCALES.map((loc: UiLocale, i: number) => (
        <Link
          key={loc}
          to="."
          params={(prev: Record<string, string | undefined>) => ({
            ...prev,
            locale: loc === 'en' ? undefined : loc,
          })}
          style={{
            ...(loc === current ? activeBtn : inactiveBtn),
            borderRight: i < UI_LOCALES.length - 1 ? '1px solid var(--line)' : 0,
          }}
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
