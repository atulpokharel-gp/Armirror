import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'hi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

type Messages = Record<string, unknown>

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as Locale)) notFound()
  const messages = ((await import(`../messages/${locale}.json`)) as { default: Messages }).default
  return {
    locale,
    messages,
  }
})
