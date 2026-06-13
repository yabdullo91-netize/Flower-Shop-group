# 🌸 Цветочный — интернет-магазин букетов (Душанбе)

Продакшн-фронтенд цветочного магазина с доставкой по Душанбе.
React 19 + Vite + TypeScript, тёмная тема, **3 языка интерфейса** и программа лояльности.

| | |
|---|---|
| 🌐 Языки | Русский · English · Тоҷикӣ |
| 🎨 Темы | Светлая · Тёмная · Системная |
| 📱 Адаптив | Mobile-first, нижняя навигация на телефонах |
| 💳 Оплата | DC (Душанбе Сити) · Алиф · наличными курьеру |
| 🕐 Режим работы | Ежедневно 06:00–00:00, доставка до 3 часов |

---

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run lint       # eslint
```

> Тестовый код авторизации: **123456** (формат телефона `+992…`).
> Промокод: **WELCOME20**.

---

## Стек

- **React 19 + Vite 8 + TypeScript** — основа
- **TanStack Query** — загрузка каталога (мок-API c пагинацией)
- **Zustand + persist** — корзина, избранное, заказы, баллы, тема, отзывы
- **react-i18next** — мультиязычность (см. ниже)
- **React Hook Form + Zod** — формы и валидация чекаута
- **Tailwind CSS v4** — токены через `@theme {}` в CSS
- **Framer Motion** — анимации
- **React Router v7** — маршрутизация

## Структура (Feature-Sliced Design)

```
src/
├── app/          # Layout, Header, Footer, BottomNav, router
├── pages/        # Catalog (главная), Product, Cart, Checkout, Account, NotFound
├── features/     # cart, favorites, auth, orders, loyalty, reviews, theme, push…
├── entities/     # product (types, mock, api, queries, ProductCard)
└── shared/
    ├── ui/       # Button, Input, Badge, Sheet, Toast, LangSwitcher, ThemeToggle…
    ├── hooks/    # usePageTitle, useScrollHeader, useIntersection
    └── lib/
        ├── i18n/ # ← словари переводов (ru / en / tg)
        ├── format.ts, holiday.ts, constants.ts, cn.ts
```

---

## 🌐 Мультиязычность (i18n)

Сайт полностью переводится на **русский, английский и таджикский**.
Переключатель — в шапке (флаг + код языка); выбор сохраняется в
`localStorage` (`flower-lang`) и восстанавливается при следующем визите.
Атрибут `<html lang>` обновляется автоматически.

### Как устроено

```
src/shared/lib/i18n/
├── index.ts   # init i18next, LANGS, setLang(), getLocale()
├── ru.ts      # эталонный словарь + export type Translation
├── en.ts      # en: Translation  ← типы гарантируют полноту перевода
└── tg.ts      # tg: Translation
```

- `ru.ts` — источник истины: тип `Translation` выводится из него,
  поэтому **пропущенный ключ в en/tg — ошибка компиляции**.
- Словари разбиты по доменам: `common`, `nav`, `header`, `home`,
  `catalog`, `occasions`, `product`, `cart`, `checkout`, `account`,
  `auth`, `loyalty`, `push`, `holiday`, `share`, `theme`, `footer`, `notfound`.

### Использование в компонентах

```tsx
import { useTranslation } from 'react-i18next'

function Example() {
  const { t } = useTranslation()
  return (
    <>
      <h1>{t('cart.title')}</h1>
      {/* интерполяция */}
      <p>{t('cart.removed', { name: 'Пионы' })}</p>
    </>
  )
}
```

Вне React-компонентов (утилиты, zustand-сторы) используйте экземпляр напрямую:

```ts
import { i18n } from '@/shared/lib/i18n'
i18n.t('push.enabled')
```

### Как добавить новый ключ

1. Добавьте ключ в `ru.ts` (эталон).
2. TypeScript подсветит `en.ts` и `tg.ts` — добавьте переводы туда.
3. Используйте `t('секция.ключ')` в компоненте.

### Как добавить новый язык

1. Создайте `src/shared/lib/i18n/xx.ts` c `export const xx: Translation = { … }`.
2. Зарегистрируйте его в `index.ts`: массив `LANGS` + `resources`.
3. Готово — переключатель в шапке подхватит язык автоматически.

### Особые случаи

- **Статусы заказов** хранятся в persist-сторе по-русски (`'Принят'`, `'Доставлен'`…) —
  для отображения они маппятся на ключи перевода через `STATUS_KEYS`
  в `pages/Account/index.tsx`. Это сохраняет совместимость со старыми данными.
- **Валюта**: `formatPrice()` берёт слово «сомони» из словаря (`common.somoni`),
  короткая форма — `common.som`.
- **Праздничные наценки** (`shared/lib/holiday.ts`): названия праздников
  переводятся через ключи `holiday.*`.
- **Контент каталога** (названия и составы букетов в `entities/product/mock.ts`) —
  это данные, а не интерфейс; при подключении реального API локализуются на бэкенде.

---

## Ключевые фичи

- **Каталог**: фильтры (повод, цена, свежесть, тип, упаковка, «доставим сегодня»),
  сортировка, бесконечная прокрутка, чипы активных фильтров
- **Товар**: галерея со свайпом, выбор размера/количества стеблей/упаковки,
  «Купить в 1 клик», отзывы с фото, «С этим покупают»
- **Корзина**: страница + боковой drawer, промокоды, прогресс до бесплатной доставки
- **Чекаут**: получатель/подарок, открытка с шаблонами текста, доп-товары
  (торт с надписью), дата/время доставки, способы оплаты, списание баллов
- **Аккаунт**: заказы со статусами и отменой, избранное, бонусная программа
  (Бронза → Серебро → Золото), отзывы, профиль, push-уведомления
- **Праздничный режим**: 14.02, 8.03, Навруз, Новый год — живые цветы +30%

## Контакты магазина

- 📞 +992 004 048 769
- ✈️ Telegram: [@yakubov_111](https://t.me/yakubov_111)
- 📷 Instagram: [@yakubov.abdullo_](https://instagram.com/yakubov.abdullo_)
- 📍 Душанбе, ул. Рудаки 33
