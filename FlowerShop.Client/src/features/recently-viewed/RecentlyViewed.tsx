import { useTranslation } from 'react-i18next'
import { useRecentlyViewedStore } from './store'
import { ProductCard } from '@/entities/product/ProductCard'

interface Props {
  excludeId?: string
}

export function RecentlyViewed({ excludeId }: Props) {
  const { t } = useTranslation()
  const items = useRecentlyViewedStore(s => s.items)
  const visible = items.filter(p => p.id !== excludeId)

  if (visible.length === 0) return null

  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold mb-4">{t('home.recently_viewed')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visible.slice(0, 4).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}
