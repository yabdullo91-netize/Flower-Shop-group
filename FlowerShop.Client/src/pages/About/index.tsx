import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { usePageTitle } from '@/shared/hooks/usePageTitle'
import { APP_PHONE_DISPLAY, APP_TG_HANDLE } from '@/shared/config/appConfig'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function AboutPage() {
  const { t } = useTranslation()
  usePageTitle(t('about.title'))

  const values = [
    { icon: '🌿', title: t('about.value_1_title'), text: t('about.value_1_text') },
    { icon: '⏱️', title: t('about.value_2_title'), text: t('about.value_2_text') },
    { icon: '💛', title: t('about.value_3_title'), text: t('about.value_3_text') },
  ]

  const stats = [
    { num: '5 000+', label: t('about.stats_orders') },
    { num: '3 200+', label: t('about.stats_clients') },
    { num: '5',      label: t('about.stats_years') },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-16">

      {/* Hero */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <p className="text-6xl">🌸</p>
        <h1 className="font-serif text-4xl font-bold text-ink">{t('about.hero_title')}</h1>
        <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">{t('about.hero_text')}</p>
      </motion.section>

      {/* Stats */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {stats.map((s, i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <p className="font-serif text-3xl font-bold text-green-deep">{s.num}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </motion.section>

      {/* Mission */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-green-deep rounded-3xl p-8 text-white"
      >
        <h2 className="font-serif text-2xl font-semibold mb-3">{t('about.mission_title')}</h2>
        <p className="text-white/80 text-base leading-relaxed">{t('about.mission_text')}</p>
      </motion.section>

      {/* Values */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-serif text-2xl font-bold text-ink mb-6 text-center">{t('about.values_title')}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <div key={i} className="bg-surface rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-2">
              <p className="text-3xl">{v.icon}</p>
              <p className="font-semibold text-ink">{v.title}</p>
              <p className="text-sm text-muted leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-surface rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center space-y-4"
      >
        <h2 className="font-serif text-2xl font-bold text-ink">{t('about.contact_title')}</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`tel:${APP_PHONE_DISPLAY.replace(/\s/g, '')}`}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-green-deep text-white font-medium text-sm hover:bg-green-light transition-colors"
          >
            📞 {APP_PHONE_DISPLAY}
          </a>
          <a
            href={`https://t.me/${APP_TG_HANDLE.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 h-11 px-6 rounded-xl border border-border text-ink font-medium text-sm hover:border-green-deep hover:text-green-deep transition-colors"
          >
            ✈️ {APP_TG_HANDLE}
          </a>
        </div>
      </motion.section>
    </div>
  )
}
