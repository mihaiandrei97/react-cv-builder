import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import subsetFont from 'subset-font'

const baseDir = path.resolve('src/assets/fonts/classic')
const inputs = [
  'NotoSerif-Regular.ttf',
  'NotoSerif-Italic.ttf',
  'NotoSerif-SemiBold.ttf',
  'NotoSerif-Bold.ttf',
]

function charsFromRanges(ranges) {
  const chars = []
  for (const [start, end] of ranges) {
    for (let cp = start; cp <= end; cp += 1) chars.push(String.fromCodePoint(cp))
  }
  return chars.join('')
}

const charset = charsFromRanges([
  [0x20, 0x7e],      // Basic Latin (printable ASCII)
  [0x00a0, 0x00ff],  // Latin-1 Supplement
  [0x0100, 0x017f],  // Latin Extended-A
  [0x0180, 0x024f],  // Latin Extended-B
  [0x02c6, 0x02dd],  // Common modifier symbols used in Romanian text contexts
  [0x0300, 0x036f],  // Combining diacritical marks
  [0x2010, 0x2027],  // Dashes, quotes, bullet
  [0x2030, 0x203a],  // Per mille + guillemets variants
  [0x20ac, 0x20ac],  // Euro
  [0x2122, 0x2122],  // Trademark
  [0x2190, 0x2193],  // Arrows
  [0x25aa, 0x25aa],  // Small square
])

mkdirSync(baseDir, { recursive: true })

for (const file of inputs) {
  const inputPath = path.join(baseDir, file)
  const outPath = path.join(baseDir, file.replace('.ttf', '-subset.woff'))
  const source = readFileSync(inputPath)
  const subset = await subsetFont(source, charset, {
    targetFormat: 'woff',
  })
  writeFileSync(outPath, subset)
  console.log(`Wrote ${path.basename(outPath)} (${subset.length} bytes)`)
}
