# CV Builder

A multi-template CV/Resume builder built with React, TanStack Router, and `@react-pdf/renderer`.

The app lets you edit your CV in a live form, preview it as a real PDF, and export a print-ready file. It also supports multiple local profiles, section controls, and template-specific styling.

## Features

- Four built-in templates: Classic, Modern, Executive, Compact
- Live CV editor with per-section controls
- PDF preview and one-click download
- Multiple profiles (create, switch, rename, duplicate, delete)
- Profile import/export for backup and portability
- Section controls:
  - hide/show sections per profile
  - reorder sections
  - add page breaks before sections
  - custom section labels
- Template color customization
- Local-first persistence (no backend required)

## Tech Stack

- React 19
- TypeScript
- TanStack Router (file-based routes)
- TanStack Store (state management)
- `@react-pdf/renderer` (PDF generation + preview)
- Vite
- Vitest (test runner)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install and run

```bash
pnpm install
pnpm dev
```

App runs at: `http://localhost:3000`

## Available Scripts

- `pnpm dev` - start local dev server on port 3000
- `pnpm build` - build production bundle
- `pnpm preview` - preview production build locally
- `pnpm test` - run tests with Vitest

## Main Routes

- `/` - landing page
- `/templates` - choose template and profile
- `/cv/edit` - CV editor
- `/cv/print` - PDF preview and download
- `/profiles` - profile management

## Data and Persistence

- Profiles are persisted in `localStorage` under key `cv-profiles`.
- The app includes backward compatibility for legacy keys:
  - `cv-data`
  - `cv-template`
- No server storage is used by default.

## Project Structure

```text
src/
  lib/
    cv-store.ts         # central state/actions
    persistence.ts      # localStorage persistence + migration path
    templates/          # PDF templates and metadata
    types.ts            # CV domain types + default data
  routes/
    index.tsx           # home
    templates.tsx       # template selection
    cv.edit.tsx         # editor
    cv.print.tsx        # PDF preview/download
    profiles.tsx        # profile management
```

## How Templates Work

- Template metadata is defined in `src/lib/templates/index.ts`.
- Each template exports:
  - `id`, `name`, `description`
  - a PDF document component
  - configurable color slots
- The active template determines how full profile data is projected into template-specific CV data.

## Development Notes

- Router types are generated via TanStack route tree generation.
- State updates are persisted with a debounced saver for smoother editing.
- PDF previews are rendered through `BlobProvider` and embedded in an iframe.

## Testing

Run test suite:

```bash
pnpm test
```

## License

No license file is currently defined in this repository.
