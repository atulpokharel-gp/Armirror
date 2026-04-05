import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'hi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

type Messages = Record<string, unknown>

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale
  const messages = ((await import(`../messages/${resolvedLocale}.json`)) as { default: Messages }).default
  return {
    locale: resolvedLocale,
    messages,
  }
})
