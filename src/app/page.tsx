import Link from 'next/link'
import { ArrowRight, Sparkles, Camera, Users, Star, Zap, Shield, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LandingPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Nav */}
      <nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={16} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg">StyleMirror AR</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">
            {t('nav.features')}
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            {t('nav.howItWorks')}
          </a>
          <Link href="/pricing" className="hover:text-white transition-colors">
            {t('nav.pricing')}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
            {t('nav.signIn')}
          </Link>
          <Link
            href="/sign-up"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {t('nav.getStarted')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-8">
            <Sparkles size={14} aria-hidden="true" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 id="hero-heading" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            {t('hero.title')}
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
              {t('hero.titleAccent')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/30 text-lg"
            >
              {t('hero.ctaPrimary')}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 font-medium px-8 py-4 rounded-full transition-all text-lg"
            >
              <Camera size={20} aria-hidden="true" />
              {t('hero.ctaSecondary')}
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-16 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2" aria-hidden="true">
                {['#9333ea', '#ec4899', '#f59e0b'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#080810]"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span>{t('hero.socialProof.users')}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
              ))}
              <span className="ml-1">{t('hero.socialProof.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold mb-4">
            {t('features.heading')}
            <span className="block gradient-text">{t('features.headingAccent')}</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">{t('features.subheading')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(
            [
              {
                icon: Camera,
                key: 'arTryon',
                color: 'from-purple-500 to-pink-500',
                badge: 'aiVisualization' as const,
              },
              {
                icon: Users,
                key: 'familyProfiles',
                color: 'from-blue-500 to-cyan-500',
                badge: null,
              },
              {
                icon: Sparkles,
                key: 'colorAnalysis',
                color: 'from-yellow-500 to-orange-500',
                badge: 'aiEstimated' as const,
              },
              {
                icon: TrendingUp,
                key: 'smartRecs',
                color: 'from-green-500 to-teal-500',
                badge: 'aiEstimated' as const,
              },
              {
                icon: Shield,
                key: 'bodyModeling',
                color: 'from-pink-500 to-rose-500',
                badge: 'aiVisualization' as const,
              },
              {
                icon: Zap,
                key: 'priceComparison',
                color: 'from-violet-500 to-purple-500',
                badge: null,
              },
            ] as const
          ).map(({ icon: Icon, key, color, badge }) => (
            <article key={key} className="glass-card rounded-2xl p-6 hover:border-white/20 transition-all group">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon size={22} className="text-white" aria-hidden="true" />
              </div>
              {badge && (
                <span className="ai-badge mb-3 inline-flex">
                  <Sparkles size={10} aria-hidden="true" />
                  {t(`features.badges.${badge}`)}
                </span>
              )}
              <h3 className="font-semibold text-lg mb-2">{t(`features.items.${key}.title`)}</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(`features.items.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="py-24 px-6 bg-gradient-to-b from-transparent to-purple-950/10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="how-it-works-heading" className="text-4xl font-bold mb-4">
            {t('howItWorks.heading')}
          </h2>
          <p className="text-white/60 mb-16">{t('howItWorks.subheading')}</p>

          <ol className="grid md:grid-cols-3 gap-8">
            {(['step1', 'step2', 'step3'] as const).map((stepKey, idx) => (
              <li key={stepKey} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t(`howItWorks.steps.${stepKey}.title`)}
                </h3>
                <p className="text-white/60 text-sm">
                  {t(`howItWorks.steps.${stepKey}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-heading" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12">
          <Sparkles size={40} className="text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 id="cta-heading" className="text-4xl font-bold mb-4">
            {t('cta.heading')}
          </h2>
          <p className="text-white/60 mb-8">{t('cta.subheading')}</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-10 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all text-lg"
          >
            {t('cta.button')}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-white/40 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={12} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold text-white/60">StyleMirror AR</span>
        </div>
        <nav aria-label="Footer links" className="flex items-center justify-center gap-6 mb-4">
          <Link href="/features" className="hover:text-white/70 transition-colors">
            {t('footer.links.features')}
          </Link>
          <Link href="/privacy" className="hover:text-white/70 transition-colors">
            {t('footer.links.privacy')}
          </Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">
            {t('footer.links.terms')}
          </Link>
        </nav>
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  )
}
