import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Pricing – StyleMirror AR',
  description:
    'Simple, transparent pricing. Start free and upgrade when you need more AI try-ons, family members, and advanced features.',
  openGraph: {
    title: 'Pricing – StyleMirror AR',
    description: 'Simple, transparent pricing for AI-powered fashion try-on.',
    type: 'website',
  },
}

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for exploring StyleMirror AR.',
    cta: 'Get Started Free',
    href: '/sign-up',
    highlight: false,
    features: [
      '1 family member',
      '10 AI try-ons per month',
      'Basic color analysis',
      'Wardrobe up to 50 items',
      'Price comparison',
    ],
  },
  {
    name: 'Family',
    price: 12,
    description: 'For the whole family — style everyone effortlessly.',
    cta: 'Start Free Trial',
    href: '/sign-up?plan=family',
    highlight: true,
    features: [
      'Up to 6 family members',
      '100 AI try-ons per month',
      'Full color & skin-tone analysis',
      'Unlimited wardrobe items',
      'Video previews (runway & realistic)',
      'Smart outfit recommendations',
      'Priority support',
    ],
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For fashion enthusiasts who want it all.',
    cta: 'Start Free Trial',
    href: '/sign-up?plan=pro',
    highlight: false,
    features: [
      'Everything in Family',
      'Unlimited AI try-ons',
      'Up to 12 family members',
      'Advanced body measurement AI',
      'Stylist AI chat sessions',
      'API access',
      'Dedicated account manager',
    ],
  },
]

export default async function PricingPage() {
  const tNav = await getTranslations('nav')
  const tFooter = await getTranslations('footer')

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
          <Link href="/features" className="hover:text-white transition-colors">
            {tNav('features')}
          </Link>
          <Link href="/pricing" className="text-white font-medium">
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
        aria-labelledby="pricing-heading"
        className="pt-36 pb-16 px-6 text-center max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-8">
          <Sparkles size={14} aria-hidden="true" />
          <span>Simple, transparent pricing</span>
        </div>
        <h1 id="pricing-heading" className="text-5xl font-bold mb-4">
          Plans for every wardrobe
        </h1>
        <p className="text-white/60 text-lg">
          Start free. Upgrade only when you need more. Cancel anytime.
        </p>
      </section>

      {/* Plans */}
      <section aria-label="Pricing plans" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`glass-card rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'border-purple-500/50 ring-1 ring-purple-500/30 relative'
                  : 'border-white/10'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                <p className="text-white/50 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-white/50 ml-1">/month</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <Check size={15} className="text-green-400 flex-shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full transition-all text-sm ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                    : 'border border-white/20 text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {plan.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
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
