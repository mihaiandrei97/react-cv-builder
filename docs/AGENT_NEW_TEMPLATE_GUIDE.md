# Agent Guide: Add a New CV Template

This document is a step-by-step runbook for coding agents that need to add a new template to this project.

## Goal

Add one new template that:

- Renders correctly in PDF preview and print.
- Appears in template selection.
- Works with color customization and section label customization.
- Respects hidden sections, page breaks, section order, and custom sections.

## Naming Inputs (decide first)

- `templateId`: lowercase id used in state and routing (example: `minimal`).
- `TemplateName`: display name (example: `Minimal`).
- `DocumentComponent`: React PDF component name (example: `MinimalDocument`).
- `CvTypeName`: TypeScript data shape name (example: `MinimalCvData`).

## Files To Change

1. `src/lib/templates/<TemplateName>.tsx` (new file)
2. `src/lib/templates/index.ts`
3. `src/lib/types.ts`
4. `src/routes/cv.edit.tsx`

## Step 1: Create Template File

Create `src/lib/templates/<TemplateName>.tsx` by copying a close existing template and adapting styles/structure.

Required exports:

- `export const COLOR_SLOTS: { key: string; label: string; default: string }[]`
- `export function <DocumentComponent>({ cv }: { cv: <CvTypeName> })`

Template requirements:

- Use `cv.colors[slotKey] ?? defaultValue` for colors.
- Use `cv.sectionLabels.<key> ?? '<Default Label>'` for visible section headings.
- Honor `cv.pageBreaks.includes('<sectionKey>')` where section page breaks are supported.
- Render `cv.customSections` consistently with other templates.

## Step 2: Register Template

Update `src/lib/templates/index.ts`:

- Import the new document component and `COLOR_SLOTS`.
- Add one entry to `TEMPLATES` with `id`, `name`, `description`, `component`, and `colorSlots`.

## Step 3: Extend Types and Projection

Update `src/lib/types.ts`:

- Add `<CvTypeName>` to the discriminated union with `kind: '<templateId>'`.
- Include all fields used by the template plus shared fields:
  - `customSections: CustomSection[]`
  - `pageBreaks: string[]`
  - `sectionOrder: string[]`
  - `colors: Record<string, string>`
  - `sectionLabels: Record<string, string>`
- Add the new type to `CvData` union.
- In `projectCv(...)`, add a new `case '<templateId>'` that maps from `FullCvData` and respects `hiddenSections`.

## Step 4: Enable Editing UI Integration

Update `src/routes/cv.edit.tsx`:

- In `TEMPLATE_SECTIONS`, add `'<templateId>': [...]` with the section keys shown by the template.
- In the Section Labels config map, add label slots for this template.
- If needed, expand template-specific toggles (like `showSkills`, `showProjects`, `showLanguages`, `showCertifications`) so edit cards match the new template.

## Section Key Conventions

Prefer these canonical keys for shared concepts:

- `profile`
- `skills`
- `experience`
- `projects`
- `education`
- `certifications`
- `languages`
- `contact`

For compatibility across template switching, avoid introducing alternate keys for the same concept unless required by design.

## Validation Checklist (must pass)

1. Run `pnpm -s build` successfully.
2. New template appears on `/templates` and can be selected.
3. Color controls in `/cv/edit` affect the new template.
4. Section label controls in `/cv/edit` affect headings in the new template.
5. Hide/show and page-break controls work for relevant sections.
6. Custom sections render in the new template.
7. PDF preview and print route render without runtime errors.

## Done Criteria

The task is complete only when all validation checks pass and all listed files are updated consistently.
