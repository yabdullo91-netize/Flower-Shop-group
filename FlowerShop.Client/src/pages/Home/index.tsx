import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ProductCard, ProductCardSkeleton } from '@/entities/product/ProductCard'
import { useProducts } from '@/entities/product/queries'
import { useIntersection } from '@/shared/hooks/useIntersection'
import { usePageTitle } from '@/shared/hooks/usePageTitle'
import { RecentlyViewed } from '@/features/recently-viewed/RecentlyViewed'
import { toast } from '@/shared/ui/toast.store'

const OCCASIONS = [
  { id: 'birthday', tKey: 'occasions.birthday', emoji: '🎂' },
  { id: 'wedding',  tKey: 'occasions.wedding',  emoji: '💍' },
  { id: 'mom',      tKey: 'occasions.mom',      emoji: '💐' },
  { id: 'sorry',    tKey: 'home.occasion_sorry', emoji: '🌹' },
  { id: 'funeral',  tKey: 'occasions.funeral',  emoji: '🕊️' },
  { id: 'other',    tKey: 'home.occasion_just', emoji: '✨' },
]

const TRUST = [
  { icon: '🚚', titleKey: 'home.trust_1_title', textKey: 'home.trust_1_text' },
  { icon: '📷', titleKey: 'home.trust_2_title', textKey: 'home.trust_2_text' },
  { icon: '🌿', titleKey: 'home.trust_3_title', textKey: 'home.trust_3_text' },
]

function TrustItem({ icon, title, text, index }: { icon: string; title: string; text: string; index: number }) {
  const { ref, inView } = useIntersection()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center gap-3 p-6 bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
    >
      <span className="text-4xl">{icon}</span>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="text-sm text-muted">{text}</p>
    </motion.div>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  usePageTitle()
  const navigate = useNavigate()
  const { data, isLoading } = useProducts({ sort: 'popular' })
  const products = data?.pages.flatMap(p => p.items).slice(0, 8) || []
  const scrollRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { toast.error(t('home.newsletter_invalid')); return }
    setSubscribed(true)
    toast.success(t('home.newsletter_success'))
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70svh] min-h-[460px] overflow-hidden bg-green-deep">
        <motion.img
          src="https://picsum.photos/seed/hero1/1280/800"
          alt={t('home.hero_alt')}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          animate={{ scale: [1, 1.05] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 gap-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/80 text-sm font-medium tracking-widest uppercase"
          >{t('home.hero_tag')}</motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight max-w-2xl"
          >{t('home.hero_title_1')}<br />{t('home.hero_title_2')}</motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/70 text-base max-w-md"
          >{t('home.hero_subtitle')}</motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-white text-green-deep font-semibold px-8 py-4 rounded-[12px] hover:bg-cream transition-colors active:scale-[0.98]"
            >
              {t('home.hero_cta')}
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 space-y-14">
        {/* Occasions */}
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-4">{t('home.occasions_title')}</h2>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {OCCASIONS.map(oc => (
              <button
                key={oc.id}
                onClick={() => navigate(`/catalog?occasion=${oc.id}`)}
                className="flex-shrink-0 snap-start flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-border hover:border-green-deep hover:bg-green-deep/5 transition-all duration-150 text-sm font-medium whitespace-nowrap"
              >
                <span>{oc.emoji}</span>
                <span>{t(oc.tKey)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Hits */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-semibold">{t('home.hits_title')}</h2>
            <Link to="/catalog" className="text-sm text-green-deep font-medium hover:underline">{t('home.all_bouquets')} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </section>

        {/* Trust */}
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-6 text-center">{t('home.trust_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRUST.map((tr, i) => (
              <TrustItem key={tr.icon} icon={tr.icon} title={t(tr.titleKey)} text={t(tr.textKey)} index={i} />
            ))}
          </div>
        </section>

        {/* Promo banner */}
        <section className="relative overflow-hidden bg-green-deep rounded-[24px] p-8 md:p-12 text-white text-center">
          <div className="absolute -right-8 -top-8 text-[120px] opacity-10 rotate-12">🌹</div>
          <h2 className="font-serif text-3xl font-bold mb-2">{t('home.promo_title')}</h2>
          <p className="text-white/70 mb-6">{t('home.promo_text', { code: 'WELCOME20' })}</p>
          <Link
            to="/catalog"
            className="inline-flex bg-white text-green-deep font-semibold px-6 py-3 rounded-[12px] hover:bg-cream transition-colors"
          >{t('home.hero_cta')}</Link>
        </section>

        {/* Recently viewed */}
        <RecentlyViewed />

        {/* Newsletter */}
        <section className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-3xl mb-3">💌</p>
            <h2 className="font-serif text-2xl font-semibold mb-2">{t('home.newsletter_title')}</h2>
            <p className="text-sm text-muted mb-6">
              {t('home.newsletter_text')}
            </p>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-4xl">🌸</span>
                <p className="text-green-deep font-semibold">{t('home.newsletter_done')}</p>
                <p className="text-sm text-muted">{t('home.newsletter_done_hint')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 h-11 px-4 rounded-[12px] border border-border text-sm outline-none focus:border-green-deep focus:ring-2 focus:ring-green-deep/15 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-green-deep text-white text-sm font-semibold rounded-[12px] hover:bg-green-light transition-colors active:scale-[0.98] whitespace-nowrap"
                >
                  {t('home.newsletter_button')}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
