import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Camera,
  Users,
  Star,
  Zap,
  Shield,
  TrendingUp,
  BrainCircuit,
  Mail,
  Phone,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
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
          <a href="#supply" className="hover:text-white transition-colors">
            What We Supply
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#waitlist" className="hover:text-white transition-colors">
            Waitlist
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

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
            <span>Premium AI Styling Experience</span>
          </div>

          <h1 id="hero-heading" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            AI That Understands
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
              Your Style DNA
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            StyleMirror AR helps you discover the right outfit instantly with smart recommendations, virtual
            try-on, skin-tone matching, and body-fit insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/30 text-lg"
            >
              Join Early Access
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 font-medium px-8 py-4 rounded-full transition-all text-lg"
            >
              <Camera size={20} aria-hidden="true" />
              Explore Product
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
              <span>50k+ fashion users</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      <section id="supply" aria-labelledby="supply-heading" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <span className="ai-badge mb-4 inline-flex">What We Supply</span>
            <h2 id="supply-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to look confident
            </h2>
            <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">
              We supply complete AI styling support for every step: discovery, fit confidence, and confident
              buying.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold mb-3">AI Outfit Intelligence</h3>
              <p className="text-white/65 leading-relaxed">
                Context-aware outfit suggestions based on weather, occasion, season, and your personal style.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold mb-3">Virtual Try-On & Fit Preview</h3>
              <p className="text-white/65 leading-relaxed">
                Realistic previews with body-model guided fit confidence before you buy.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold mb-3">Smart Shopping Decisions</h3>
              <p className="text-white/65 leading-relaxed">
                Price comparisons, flattering color guidance, and premium recommendations tailored to you.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="features"
        aria-labelledby="features-heading"
        className="py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold mb-4">
            Advanced capabilities
            <span className="block gradient-text">powered by AI</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Designed to deliver a premium fashion-tech experience from first click to checkout.
          </p>
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
                  {badge === 'aiVisualization' ? 'AI Visualization' : 'AI Estimated'}
                </span>
              )}
              <h3 className="font-semibold text-lg mb-2">
                {key === 'arTryon' && 'AR Virtual Try-On'}
                {key === 'familyProfiles' && 'Family Profiles'}
                {key === 'colorAnalysis' && 'Color Analysis'}
                {key === 'smartRecs' && 'Smart Recommendations'}
                {key === 'bodyModeling' && 'Body Modeling'}
                {key === 'priceComparison' && 'Price Comparison'}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {key === 'arTryon' &&
                  'See garments on your body with realistic augmented previews before spending.'}
                {key === 'familyProfiles' &&
                  'Manage personalized measurements and style settings for every family member.'}
                {key === 'colorAnalysis' &&
                  'Get flattering palettes from AI-powered skin-tone and undertone analysis.'}
                {key === 'smartRecs' &&
                  'Receive daily, event-ready outfit suggestions tailored to your profile.'}
                {key === 'bodyModeling' &&
                  'Generate accurate body data for better fitting recommendations and try-on quality.'}
                {key === 'priceComparison' &&
                  'Compare product prices across stores and buy with complete confidence.'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="waitlist" aria-labelledby="waitlist-heading" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12">
          <BrainCircuit size={40} className="text-purple-400 mx-auto mb-6" aria-hidden="true" />
          <h2 id="waitlist-heading" className="text-4xl font-bold mb-4">
            Join the premium waitlist
          </h2>
          <p className="text-white/60 mb-8">
            Get early access to AI stylist upgrades, exclusive launches, and premium onboarding.
          </p>
          <form className="grid gap-4 text-left">
            <label className="sr-only" htmlFor="waitlist-name">
              Full Name
            </label>
            <input
              id="waitlist-name"
              name="name"
              type="text"
              required
              placeholder="Full Name"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
            <label className="sr-only" htmlFor="waitlist-email">
              Email
            </label>
            <input
              id="waitlist-email"
              name="email"
              type="email"
              required
              placeholder="Work or personal email"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-10 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all text-lg"
            >
              Join Waitlist
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-heading" className="pb-24 px-6">
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold mb-3">
              Contact us
            </h2>
            <p className="text-white/60">Have partnership, demo, or enterprise requests? Send us a message.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
              <Mail className="text-purple-300" size={18} aria-hidden="true" />
              <span className="text-white/80 text-sm">hello@stylemirror.ai</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
              <Phone className="text-purple-300" size={18} aria-hidden="true" />
              <span className="text-white/80 text-sm">+1 (555) 010-2026</span>
            </div>
          </div>
          <form className="grid gap-4">
            <label className="sr-only" htmlFor="contact-name">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              placeholder="Your Name"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
            <label className="sr-only" htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              placeholder="Your Email"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
            <label className="sr-only" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              placeholder="Tell us how we can help"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/5 font-semibold px-8 py-3 rounded-full transition-all"
            >
              Send Message
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 px-6 text-center text-white/40 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={12} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold text-white/60">StyleMirror AR</span>
        </div>
        <nav aria-label="Footer links" className="flex items-center justify-center gap-6 mb-4">
          <Link href="/features" className="hover:text-white/70 transition-colors">
            Features
          </Link>
          <Link href="/privacy" className="hover:text-white/70 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">
            Terms of Service
          </Link>
        </nav>
        <p>© 2026 StyleMirror AR. All rights reserved.</p>
      </footer>
    </div>
  )
}
