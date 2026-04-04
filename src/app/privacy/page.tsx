import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.privacy')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacyPage')
  const tFooter = await getTranslations('footer')
  const tNav = await getTranslations('nav')

  const sections = [
    'dataCollected',
    'howWeUse',
    'dataSecurity',
    'yourRights',
    'contact',
  ] as const

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Nav */}
      <nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5"
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={16} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg">StyleMirror AR</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
            {tNav('signIn')}
          </Link>
          <Link
            href="/sign-up"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {tNav('getStarted')}
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-36 pb-24">
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-white/40 text-sm mb-12">{t('lastUpdated')}</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          {sections.map((sectionKey) => (
            <section key={sectionKey} aria-labelledby={`privacy-${sectionKey}`}>
              <h2
                id={`privacy-${sectionKey}`}
                className="text-xl font-semibold text-white mb-3"
              >
                {t(`sections.${sectionKey}.heading`)}
              </h2>
              <p>{t(`sections.${sectionKey}.body`)}</p>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-white/40 text-sm">
        <nav aria-label="Footer links" className="flex items-center justify-center gap-6 mb-4">
          <Link href="/features" className="hover:text-white/70 transition-colors">
            {tFooter('links.features')}
          </Link>
          <Link href="/privacy" className="hover:text-white/70 transition-colors">
            {tFooter('links.privacy')}
          </Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">
            {tFooter('links.terms')}
          </Link>
        </nav>
        <p>{tFooter('copyright')}</p>
      </footer>
    </div>
  )
}
