import { en, type TranslationKey } from "./dictionaries/en"
import { ro } from "./dictionaries/ro"

export type UiLocale = "en" | "ro"

export const UI_LOCALES: readonly UiLocale[] = ["en", "ro"] as const
export const DEFAULT_UI_LOCALE: UiLocale = "en"

export type Dictionary = { [K in TranslationKey]: string }

export type TranslationVars = Record<string, string | number>

export type TFunction = (
  key: TranslationKey,
  vars?: TranslationVars,
) => string

export function isUiLocale(value: unknown): value is UiLocale {
  return typeof value === "string" && (UI_LOCALES as readonly string[]).includes(value)
}

export function translate(
  locale: UiLocale,
  key: TranslationKey,
  vars?: TranslationVars,
): string {
  const dict: Dictionary = locale === "ro" ? ro : en
  let value: string = dict[key] ?? en[key] ?? (key as string)
  if (vars) {
    for (const [name, raw] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${name}\\}`, "g"), String(raw))
    }
  }
  return value
}

export { en, ro }
export type { TranslationKey }

// ── Template / color slot helpers ────────────────────────────────────────────

export function templateName(t: TFunction, id: string): string {
  return t(`template.${id}.name` as TranslationKey)
}

export function templateDescription(t: TFunction, id: string): string {
  return t(`template.${id}.description` as TranslationKey)
}

export function colorSlotLabel(t: TFunction, key: string): string {
  return t(`template.color.${key}` as TranslationKey)
}

export function sectionLabel(t: TFunction, key: string): string {
  return t(`edit.nav.${key}` as TranslationKey)
}