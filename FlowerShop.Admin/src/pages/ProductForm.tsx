import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Input, Textarea, Select, Checkbox, Spinner, Card, toast } from '@/components/ui'
import type { Product } from '@/types'

const OCCASIONS = ['birthday', 'romantic', 'wedding', 'sympathy', 'congratulations', 'universal', 'corporate']
const OCC_LABEL: Record<string, string> = {
  birthday: 'День рождения', romantic: 'Романтика', wedding: 'Свадьба',
  sympathy: 'Соболезнования', congratulations: 'Поздравление', universal: 'Любой повод', corporate: 'Корпоратив',
}

const COLORS    = ['red', 'pink', 'white', 'yellow', 'orange', 'purple', 'blue', 'green', 'mixed']
const CLR_LABEL: Record<string, string> = {
  red: 'Красный', pink: 'Розовый', white: 'Белый', yellow: 'Жёлтый',
  orange: 'Оранжевый', purple: 'Фиолетовый', blue: 'Синий', green: 'Зелёный', mixed: 'Микс',
}

const PACKAGING = ['kraft', 'hat_box', 'film', 'basket', 'none']
const PKG_LABEL: Record<string, string> = {
  kraft: 'Крафт', hat_box: 'Шляпная коробка', film: 'Плёнка', basket: 'Корзина', none: 'Без упаковки',
}

interface SizeRow   { label: string; price: string; oldPrice: string }
interface StemRow   { count: string; price: string }
interface PkgRow    { type: string;  priceDelta: string }

const emptySize = (): SizeRow => ({ label: '', price: '', oldPrice: '' })
const emptyStem = (): StemRow => ({ count: '', price: '' })
const emptyPkg  = (): PkgRow  => ({ type: 'kraft', priceDelta: '0' })

function toNum(s: string) { const n = parseFloat(s); return isNaN(n) ? 0 : n }

export function ProductForm() {
  const { id }   = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const fileRef  = useRef<HTMLInputElement>(null)
  const isEdit   = !!id

  const [name, setName]           = useState('')
  const [slug, setSlug]           = useState('')
  const [desc, setDesc]           = useState('')
  const [comp, setComp]           = useState('')
  const [kind, setKind]           = useState('bouquet')
  const [freshness, setFreshness] = useState('live')
  const [basePrice, setBasePrice] = useState('')
  const [isNew, setIsNew]         = useState(false)
  const [isHit, setIsHit]         = useState(false)
  const [inStock, setInStock]     = useState(true)
  const [deliver, setDeliver]     = useState(false)
  const [occasions, setOccasions] = useState<string[]>([])
  const [colors, setColors]       = useState<string[]>([])
  const [sizes, setSizes]         = useState<SizeRow[]>([emptySize()])
  const [stems, setStems]         = useState<StemRow[]>([])
  const [pkgs, setPkgs]           = useState<PkgRow[]>([])
  const [uploadingImg, setUploadingImg] = useState(false)
  const [images, setImages]       = useState<{ id: string; url: string; isPrimary: boolean }[]>([])
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  const productQ = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data).catch(() =>
      api.get(`/products`, { params: { pageSize: 200 } }).then(r => r.data.items?.find((p: Product) => p.id === id))
    ),
    enabled: isEdit,
  })

  useEffect(() => {
    const p = productQ.data
    if (!p) return
    setName(p.name)
    setSlug(p.slug)
    setDesc(p.description ?? '')
    setComp(p.composition ?? '')
    setKind(p.kind)
    setFreshness(p.freshness)
    setBasePrice(p.basePrice?.toString() ?? '')
    setIsNew(p.isNew)
    setIsHit(p.isHit)
    setInStock(p.inStock)
    setDeliver(p.deliverToday)
    setOccasions(p.occasions ?? [])
    setColors(p.colors ?? [])
    setSizes(p.sizes?.length ? p.sizes.map(s => ({ label: s.label, price: String(s.price), oldPrice: s.oldPrice?.toString() ?? '' })) : [emptySize()])
    setStems(p.stemOptions?.map(s => ({ count: String(s.count), price: String(s.price) })) ?? [])
    setPkgs(p.packagingOptions?.map(p => ({ type: p.type, priceDelta: String(p.priceDelta) })) ?? [])
    setImages(p.images ?? [])
  }, [productQ.data])

  const autoSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-zа-яё0-9\s]/g, '').replace(/\s+/g, '-').replace(/[а-яё]/g, c => {
      const m: Record<string, string> = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }
      return m[c] ?? c
    })

  const toggle = (arr: string[], val: string, setter: (a: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Обязательное поле'
    if (!slug.trim()) e.slug = 'Обязательное поле'
    if (sizes.some(s => !s.label || toNum(s.price) <= 0)) e.sizes = 'Заполните все размеры корректно'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        slug, name, description: desc || null, composition: comp || null,
        kind, freshness,
        basePrice: basePrice ? toNum(basePrice) : null,
        isNew, isHit, inStock, deliverToday: deliver,
        occasions, flowerTypes: [], colors,
        sizes:    sizes.filter(s => s.label && toNum(s.price) > 0).map(s => ({
          label: s.label, price: toNum(s.price),
          oldPrice: s.oldPrice ? toNum(s.oldPrice) : null, imageUrl: null,
        })),
        packagingOptions: pkgs.map(p => ({ type: p.type, priceDelta: toNum(p.priceDelta) })),
        stemOptions:      stems.filter(s => toNum(s.count) > 0).map(s => ({ count: toNum(s.count), price: toNum(s.price) })),
      }

      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        toast.success('Товар обновлён')
      } else {
        await api.post('/products', payload)
        toast.success('Товар создан')
      }
      qc.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (file: File, primary: boolean) => {
    if (!id) { toast.info('Сначала сохраните товар, потом добавьте фото'); return }
    setUploadingImg(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post(`/products/${id}/images?isPrimary=${primary}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Фото добавлено')
      productQ.refetch()
      setImages(prev => [...prev, { id: data.id ?? Date.now().toString(), url: data.url, isPrimary: primary }])
    } catch {
      toast.error('Ошибка загрузки фото')
    } finally {
      setUploadingImg(false)
    }
  }

  const deleteImage = async (imgId: string) => {
    if (!id) return
    try {
      await api.delete(`/products/${id}/images/${imgId}`)
      setImages(prev => prev.filter(i => i.id !== imgId))
      toast.success('Фото удалено')
    } catch {
      toast.error('Ошибка удаления фото')
    }
  }

  if (isEdit && productQ.isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/products')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>
          {isEdit && <p className="text-sm text-slate-500 mt-0.5">ID: {id}</p>}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Основная информация</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Название *"
                value={name}
                onChange={e => { setName(e.target.value); if (!isEdit) setSlug(autoSlug(e.target.value)) }}
                error={errors.name}
                placeholder="Розовый букет 25 роз"
              />
            </div>
            <Input
              label="Slug (URL) *"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              error={errors.slug}
              placeholder="rozovyj-buket-25-roz"
            />
            <Input
              label="Базовая цена (сом)"
              type="number"
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              placeholder="990"
            />
          </div>
          <Textarea
            label="Описание"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
            placeholder="Красивый букет из свежих роз..."
          />
          <Textarea
            label="Состав"
            value={comp}
            onChange={e => setComp(e.target.value)}
            rows={2}
            placeholder="25 роз, зелень, декоративная упаковка"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Тип" value={kind} onChange={e => setKind(e.target.value)}>
              <option value="bouquet">Букет</option>
              <option value="single">Штучно</option>
              <option value="plant">Растение</option>
              <option value="other">Другое</option>
            </Select>
            <Select label="Свежесть" value={freshness} onChange={e => setFreshness(e.target.value)}>
              <option value="live">Живые</option>
              <option value="dried">Сушёные</option>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            <Checkbox label="Новинка"       checked={isNew}    onChange={e => setIsNew(e.target.checked)} />
            <Checkbox label="Хит продаж"    checked={isHit}    onChange={e => setIsHit(e.target.checked)} />
            <Checkbox label="В наличии"     checked={inStock}  onChange={e => setInStock(e.target.checked)} />
            <Checkbox label="Доставка сегодня" checked={deliver} onChange={e => setDeliver(e.target.checked)} />
          </div>
        </Card>

        {/* Sizes */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Размеры и цены</h2>
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setSizes(p => [...p, emptySize()])}>
              Добавить размер
            </Button>
          </div>
          {errors.sizes && <p className="text-xs text-rose-500">{errors.sizes}</p>}
          {sizes.map((s, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end">
              <Input
                label={i === 0 ? 'Метка (S/M/L)' : undefined}
                value={s.label}
                onChange={e => setSizes(p => p.map((r, j) => j === i ? { ...r, label: e.target.value } : r))}
                placeholder="S"
              />
              <Input
                label={i === 0 ? 'Цена (сом)' : undefined}
                type="number"
                value={s.price}
                onChange={e => setSizes(p => p.map((r, j) => j === i ? { ...r, price: e.target.value } : r))}
                placeholder="990"
              />
              <Input
                label={i === 0 ? 'Старая цена' : undefined}
                type="number"
                value={s.oldPrice}
                onChange={e => setSizes(p => p.map((r, j) => j === i ? { ...r, oldPrice: e.target.value } : r))}
                placeholder="1200"
              />
              <button
                onClick={() => setSizes(p => p.filter((_, j) => j !== i))}
                disabled={sizes.length === 1}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </Card>

        {/* Occasions + Colors */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 space-y-3">
            <h2 className="font-semibold text-slate-900">Поводы</h2>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(occasions, o, setOccasions)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                    occasions.includes(o)
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  {OCC_LABEL[o]}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="font-semibold text-slate-900">Цвета</h2>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(colors, c, setColors)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                    colors.includes(c)
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  {CLR_LABEL[c]}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Packaging */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Упаковка</h2>
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setPkgs(p => [...p, emptyPkg()])}>
              Добавить
            </Button>
          </div>
          {pkgs.map((p, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-end">
              <Select
                label={i === 0 ? 'Тип' : undefined}
                value={p.type}
                onChange={e => setPkgs(prev => prev.map((r, j) => j === i ? { ...r, type: e.target.value } : r))}
              >
                {PACKAGING.map(pk => <option key={pk} value={pk}>{PKG_LABEL[pk]}</option>)}
              </Select>
              <Input
                label={i === 0 ? 'Доп. цена (сом)' : undefined}
                type="number"
                value={p.priceDelta}
                onChange={e => setPkgs(prev => prev.map((r, j) => j === i ? { ...r, priceDelta: e.target.value } : r))}
                placeholder="0"
              />
              <button
                onClick={() => setPkgs(prev => prev.filter((_, j) => j !== i))}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {pkgs.length === 0 && <p className="text-sm text-slate-400">Упаковка не добавлена</p>}
        </Card>

        {/* Stem Options */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Стебли (поштучно)</h2>
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setStems(p => [...p, emptyStem()])}>
              Добавить
            </Button>
          </div>
          {stems.map((s, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-end">
              <Input
                label={i === 0 ? 'Кол-во стеблей' : undefined}
                type="number"
                value={s.count}
                onChange={e => setStems(prev => prev.map((r, j) => j === i ? { ...r, count: e.target.value } : r))}
                placeholder="11"
              />
              <Input
                label={i === 0 ? 'Цена (сом)' : undefined}
                type="number"
                value={s.price}
                onChange={e => setStems(prev => prev.map((r, j) => j === i ? { ...r, price: e.target.value } : r))}
                placeholder="990"
              />
              <button
                onClick={() => setStems(prev => prev.filter((_, j) => j !== i))}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {stems.length === 0 && <p className="text-sm text-slate-400">Поштучная продажа не настроена</p>}
        </Card>

        {/* Images */}
        {isEdit && (
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Фотографии</h2>
            <div className="flex flex-wrap gap-3">
              {images.map(img => (
                <div key={img.id} className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 bg-violet-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                      Главное
                    </span>
                  )}
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full hidden group-hover:flex items-center justify-center"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}

              {/* Upload buttons */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadImage(file, images.length === 0)
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImg}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 hover:border-violet-400 hover:bg-violet-50 transition-colors text-slate-400 hover:text-violet-600"
                >
                  {uploadingImg ? (
                    <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-[10px] text-center leading-tight">Добавить фото</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        )}

        {!isEdit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            💡 После создания товара вы сможете добавить фотографии
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/products')}>Отмена</Button>
          <Button loading={saving} onClick={save}>
            {isEdit ? 'Сохранить изменения' : 'Создать товар'}
          </Button>
        </div>
      </div>
    </div>
  )
}
