import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

function RoutePending() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background:
          'radial-gradient(circle at 18% 0%, #efe6d4 0%, transparent 36%), radial-gradient(circle at 86% 22%, #ebe2cf 0%, transparent 34%), #f6f2e8',
        fontFamily: "'Source Serif 4', 'Georgia', serif",
        color: '#5d5d55',
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          border: '3px solid #d4d0c4',
          borderTopColor: '#c06b31',
          borderRadius: '50%',
          animation: 'tr-spin 0.7s linear infinite',
        }}
      />
      <style>{'@keyframes tr-spin { to { transform: rotate(360deg) } }'}</style>
      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading…</span>
    </div>
  )
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RoutePending,
    defaultPendingMs: 200,
    defaultPendingMinMs: 300,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
