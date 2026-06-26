import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import {
  DEFAULT_UI_LOCALE,
  UiLocaleProvider,
  isUiLocale,
  type UiLocale,
} from "../lib/i18n"

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params, location }) => {
    const raw = params.locale
    if (raw !== undefined && !isUiLocale(raw)) {
      const stripped = location.pathname.replace(/^\/[^/]+/, "") || "/"
      throw redirect({ href: stripped })
    }
    const locale: UiLocale = isUiLocale(raw) ? raw : DEFAULT_UI_LOCALE
    return { locale }
  },
  component: LocaleLayout,
})

function LocaleLayout() {
  const { locale } = Route.useParams()
  const resolved: UiLocale = isUiLocale(locale) ? locale : DEFAULT_UI_LOCALE
  return (
    <UiLocaleProvider locale={resolved}>
      <Outlet />
    </UiLocaleProvider>
  )
}
