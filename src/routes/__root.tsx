import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'CV Builder | Resume PDF Generator' },
      {
        name: 'description',
        content: 'Pick a template, fill in your details, and download a print-ready PDF - no account needed.',
      },
      { property: 'og:title', content: 'A CV worth keeping.' },
      {
        property: 'og:description',
        content: 'Pick a template, fill in your details, and download a print-ready PDF - no account needed.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/logo512.png?v=2' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'A CV worth keeping.' },
      {
        name: 'twitter:description',
        content: 'Pick a template, fill in your details, and download a print-ready PDF - no account needed.',
      },
      { name: 'twitter:image', content: '/logo512.png?v=2' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/logo192.png?v=2' },
      { rel: 'apple-touch-icon', href: '/logo192.png?v=2' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
