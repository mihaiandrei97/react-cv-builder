import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import {
  DEFAULT_UI_LOCALE,
  translate,
  type TFunction,
  type TranslationKey,
  type TranslationVars,
  type UiLocale,
} from "./index"

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
    <UiLocaleContext.Provider value={value}>
      {children}
    </UiLocaleContext.Provider>
  )
}

export function useUiLocale(): UiLocale {
  return useContext(UiLocaleContext)
}

export function useT(): TFunction {
  const locale = useUiLocale()
  return useCallback<TFunction>(
    (key: TranslationKey, vars?: TranslationVars) =>
      translate(locale, key, vars),
    [locale],
  )
}