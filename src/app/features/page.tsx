import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Camera,
  Users,
  Palette,
  Shirt,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.features')
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  }
}

export default async function FeaturesPage() {
  const t = await getTranslations('featuresPage')
  const tNav = await getTranslations('nav')
  const tFooter = await getTranslations('footer')

  const sections = [
    {
      key: 'tryOn' as const,
      icon: Camera,
      color: 'from-purple-500 to-pink-500',
      imagePosition: 'right',
    },
    {
      key: 'bodyModel' as const,
      icon: Shirt,
      color: 'from-blue-500 to-cyan-500',
      imagePosition: 'left',
    },
    {
      key: 'colorAnalysis' as const,
      icon: Palette,
      color: 'from-yellow-500 to-orange-500',
      imagePosition: 'right',
    },
    {
      key: 'familyProfiles' as const,
      icon: Users,
      color: 'from-green-500 to-teal-500',
      imagePosition: 'left',
    },
  ]

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
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="/features" className="text-white font-medium">
            {tNav('features')}
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            {tNav('pricing')}
          </Link>
        </div>
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

      {/* Hero */}
      <section
        aria-labelledby="features-hero-heading"
        className="relative pt-36 pb-24 px-6 text-center max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-8">
          <Sparkles size={14} aria-hidden="true" />
          <span>{t('hero.badge')}</span>
        </div>
        <h1 id="features-hero-heading" className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {t('hero.title')}
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
            {t('hero.titleAccent')}
          </span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('hero.description')}</p>
      </section>

      {/* Feature sections */}
      <div className="max-w-6xl mx-auto px-6 space-y-32 pb-32">
        {sections.map(({ key, icon: Icon, color, imagePosition }) => (
          <section
            key={key}
            aria-labelledby={`section-${key}-heading`}
            className={`flex flex-col ${imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}
          >
            <div className="flex-1">
              <div
                className={`inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/60 mb-4`}
              >
                <Icon size={12} aria-hidden="true" />
                {t(`sections.${key}.label`)}
              </div>
              <h2
                id={`section-${key}-heading`}
                className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
              >
                {t(`sections.${key}.title`)}
              </h2>
              <p className="text-white/60 mb-8 leading-relaxed">{t(`sections.${key}.description`)}</p>
              <ul className="space-y-3">
                {(t.raw(`sections.${key}.points`) as string[]).map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                    <Check
                      size={16}
                      className="text-green-400 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Decorative visual placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className={`w-72 h-72 rounded-3xl bg-gradient-to-br ${color} opacity-20 flex items-center justify-center`}
              >
                <Icon size={80} className="text-white opacity-60" aria-hidden="true" />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section aria-labelledby="features-cta-heading" className="py-24 px-6 bg-gradient-to-t from-purple-950/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="features-cta-heading" className="text-4xl font-bold mb-4">
            Ready to try it yourself?
          </h2>
          <p className="text-white/60 mb-8">
            Start for free — no credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-10 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all text-lg"
          >
            Get Started Free
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

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
