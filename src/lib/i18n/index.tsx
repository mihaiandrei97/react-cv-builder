import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { en, type TranslationKey } from "./dictionaries/en"
import { ro } from "./dictionaries/ro"

export type UiLocale = "en" | "ro"

export const UI_LOCALES: readonly UiLocale[] = ["en", "ro"] as const
export const DEFAULT_UI_LOCALE: UiLocale = "en"

export type Dictionary = { [K in TranslationKey]: string }

const dictionaries: Record<UiLocale, Dictionary> = { en, ro }

export type TranslationVars = Record<string, string | number>

export function isUiLocale(value: unknown): value is UiLocale {
  return typeof value === "string" && (UI_LOCALES as readonly string[]).includes(value)
}

export function translate(
  locale: UiLocale,
  key: TranslationKey,
  vars?: TranslationVars,
): string {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_UI_LOCALE]
  let value: string = dict[key] ?? en[key] ?? (key as string)
  if (vars) {
    for (const [name, raw] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${name}\\}`, "g"), String(raw))
    }
  }
  return value
}

// ── React context ────────────────────────────────────────────────────────────

const UiLocaleContext = createContext<UiLocale>(DEFAULT_UI_LOCALE)

export function UiLocaleProvider({
  locale,
  children,
}: {
  locale: UiLocale
  children: ReactNode
}) {
  const value = useMemo<UiLocale>(() => locale, [locale])
  return (
    <UiLocaleContext.Provider value={value}>{children}</UiLocaleContext.Provider>
  )
}

export function useUiLocale(): UiLocale {
  return useContext(UiLocaleContext)
}

export type TFunction = (
  key: TranslationKey,
  vars?: TranslationVars,
) => string

export function useT(): TFunction {
  const locale = useUiLocale()
  return useCallback<TFunction>(
    (key, vars) => translate(locale, key, vars),
    [locale],
  )
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
