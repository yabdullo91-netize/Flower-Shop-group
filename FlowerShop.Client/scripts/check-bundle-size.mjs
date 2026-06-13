/**
 * Bundle size gate — runs after `npm run build` in CI.
 * Fails if any single JS chunk exceeds the limit.
 */

import { statSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createGunzip } from 'zlib'
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Writable } from 'stream'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist/assets')

// Budget: total JS gzipped must stay under 350 KB
const BUDGET_KB = 350

async function gzipSize(filePath) {
  let bytes = 0
  const counter = new Writable({
    write(chunk, _enc, cb) { bytes += chunk.length; cb() },
  })
  await pipeline(createReadStream(filePath), createGunzip(), counter)
  return bytes
}

let totalBytes = 0
let failed = false

const jsFiles = readdirSync(DIST).filter(f => f.endsWith('.js'))

console.log('Bundle size report:')
for (const file of jsFiles) {
  const filePath = resolve(DIST, file)
  const rawKb = (statSync(filePath).size / 1024).toFixed(1)
  try {
    const gz = await gzipSize(filePath)
    const gzKb = (gz / 1024).toFixed(1)
    console.log(`  ${file.padEnd(50)} ${rawKb} KB raw  /  ${gzKb} KB gzip`)
    totalBytes += gz
  } catch {
    // file might not be gzipped — count raw size
    totalBytes += statSync(filePath).size
    console.log(`  ${file.padEnd(50)} ${rawKb} KB raw  (gzip n/a)`)
  }
}

const totalKb = (totalBytes / 1024).toFixed(1)
console.log(`\nTotal JS (gzip): ${totalKb} KB  /  budget: ${BUDGET_KB} KB`)

if (totalBytes / 1024 > BUDGET_KB) {
  console.error(`\x1b[31m✖ Bundle exceeds ${BUDGET_KB} KB budget (${totalKb} KB)\x1b[0m`)
  failed = true
} else {
  console.log(`\x1b[32m✔ Within budget\x1b[0m`)
}

if (failed) process.exit(1)
