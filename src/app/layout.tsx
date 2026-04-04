import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import './globals.css'
import { Providers } from '@/components/providers'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home')
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['fashion', 'AR', 'try-on', 'AI styling', 'virtual fitting room'],
    openGraph: {
      title: 'StyleMirror AR',
      description: 'Try Before You Buy – In Augmented Reality',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'StyleMirror AR',
      description: 'Try Before You Buy – In Augmented Reality',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://stylemirror.ai'),
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-[#080810] text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
