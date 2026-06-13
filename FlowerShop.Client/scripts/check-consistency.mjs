/**
 * Consistency gate — runs in CI and via npm run check:consistency
 * Checks that config values are in sync across source files without executing TypeScript.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8')

let failed = false
const fail = (msg) => { console.error(`\x1b[31m✖ ${msg}\x1b[0m`); failed = true }
const ok   = (msg) => console.log(`\x1b[32m✔ ${msg}\x1b[0m`)

// ─── 1. Promo codes: promotionConfig.ts is the single source ─────────────────
const promoCodes = []
const promoSrc = read('src/shared/config/promotionConfig.ts')
for (const m of promoSrc.matchAll(/code:\s*'([A-Z0-9]+)'/g)) {
  promoCodes.push(m[1])
}

if (promoCodes.length === 0) {
  fail('promotionConfig.ts: no promo codes found')
} else {
  ok(`promotionConfig.ts has ${promoCodes.length} codes: ${promoCodes.join(', ')}`)
}

// Ensure cart/store.ts does NOT hardcode promo codes separately
const cartSrc = read('src/features/cart/store.ts')
const cartHardcoded = promoCodes.filter(c =>
  cartSrc.includes(`'${c}'`) && !cartSrc.includes('findPromo')
)
if (!cartSrc.includes('findPromo')) {
  fail('cart/store.ts: must use findPromo() instead of hardcoded promo codes')
} else {
  ok('cart/store.ts uses findPromo() — no duplicate promo dictionary')
}

// ─── 2. Time slots: deliveryConfig must be used in Checkout ──────────────────
const deliverySrc = read('src/shared/config/deliveryConfig.ts')
const checkoutSrc = read('src/pages/Checkout/index.tsx')

const hasTIME_SLOTS = deliverySrc.includes('TIME_SLOTS')
const checkoutUsesDeliverySlots = checkoutSrc.includes('TIME_SLOTS') && checkoutSrc.includes('deliveryConfig')

if (!hasTIME_SLOTS) {
  fail('deliveryConfig.ts: TIME_SLOTS export not found')
} else {
  ok('deliveryConfig.ts exports TIME_SLOTS')
}

if (!checkoutUsesDeliverySlots) {
  fail('Checkout/index.tsx: must import TIME_SLOTS from deliveryConfig (not hardcode slots)')
} else {
  ok('Checkout/index.tsx imports TIME_SLOTS from deliveryConfig')
}

// ─── 3. Zustand stores: all persist() stores must have version ───────────────
const stores = [
  'src/features/cart/store.ts',
  'src/features/orders/store.ts',
  'src/features/loyalty/store.ts',
  'src/features/favorites/store.ts',
  'src/features/addresses/store.ts',
]

for (const storeFile of stores) {
  const src = read(storeFile)
  if (!src.includes('persist(')) continue  // no persist, skip
  if (!src.includes('version:')) {
    fail(`${storeFile}: uses persist() but missing version field`)
  } else {
    ok(`${storeFile}: has version in persist config`)
  }
}

// ─── 4. i18n: all keys in ru.ts must exist (non-empty) in en.ts and tg.ts ──
const extractTopLevelKeys = (src) => {
  const keys = []
  for (const m of src.matchAll(/^\s{2}(\w+):/gm)) {
    keys.push(m[1])
  }
  return keys
}

const ruKeys  = extractTopLevelKeys(read('src/shared/lib/i18n/ru.ts'))
const enSrc   = read('src/shared/lib/i18n/en.ts')
const tgSrc   = read('src/shared/lib/i18n/tg.ts')

const missingEn = ruKeys.filter(k => !enSrc.includes(`${k}:`))
const missingTg = ruKeys.filter(k => !tgSrc.includes(`${k}:`))

if (missingEn.length) {
  fail(`en.ts missing top-level keys: ${missingEn.join(', ')}`)
} else {
  ok(`en.ts has all ${ruKeys.length} top-level i18n sections`)
}

if (missingTg.length) {
  fail(`tg.ts missing top-level keys: ${missingTg.join(', ')}`)
} else {
  ok(`tg.ts has all ${ruKeys.length} top-level i18n sections`)
}

// ─── 5. ErrorBoundary must wrap App ──────────────────────────────────────────
const mainSrc = read('src/main.tsx')
if (!mainSrc.includes('ErrorBoundary')) {
  fail('main.tsx: ErrorBoundary not found — app may crash to white screen on unhandled errors')
} else {
  ok('main.tsx wraps app in ErrorBoundary')
}

// ─── Result ──────────────────────────────────────────────────────────────────
if (failed) {
  console.error('\n\x1b[31mConsistency check FAILED\x1b[0m')
  process.exit(1)
} else {
  console.log('\n\x1b[32mAll consistency checks passed\x1b[0m')
}
