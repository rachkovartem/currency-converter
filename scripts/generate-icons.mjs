/**
 * generate-icons.mjs
 *
 * Generates all icon/image assets for the currency-converter app from the
 * source SVG logo. Run with:
 *   node scripts/generate-icons.mjs
 *
 * Requirements:
 *   - rsvg-convert at /opt/homebrew/bin/rsvg-convert
 *   - sharp available in project node_modules
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const require = createRequire(import.meta.url)
const sharp = require(path.join(PROJECT_ROOT, 'node_modules/sharp'))

const RSVG = '/opt/homebrew/bin/rsvg-convert'
const SOURCE_SVG = '/Users/artemrachkov/Downloads/Gemini_Generated_Image_z5lb5zz5lb5zz5lb (1).svg'
const TEMP_SQUARE_SVG = '/tmp/logo-square.svg'
const BG_WHITE = { r: 255, g: 255, b: 255, alpha: 1 }
const BG_NAVY  = { r: 27,  g: 70,  b: 136, alpha: 1 }

// Background rectangle path segment to strip from path 4's d attribute
const BG_RECT_SEGMENT =
  'M 0.00 378.00 L 0.00 0.00 L 693.50 0.00 L 1387.00 0.00 L 1387.00 378.00 L 1387.00 756.00 L 693.50 756.00 L 0.00 756.00 L 0.00 378.00 Z'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Ensure a directory exists (creates it recursively if needed).
 * @param {string} dir
 */
function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * Use rsvg-convert to render an SVG file to a PNG file.
 * @param {string} inputSvg  - path to input SVG
 * @param {string} outputPng - path to output PNG
 * @param {number} width
 * @param {number} height
 */
function rsvgToPng(inputSvg, outputPng, width, height) {
  execSync(`"${RSVG}" -w ${width} -h ${height} -o "${outputPng}" "${inputSvg}"`, { stdio: 'inherit' })
}

/**
 * Use rsvg-convert to render an SVG file to a PNG Buffer (stdout).
 * @param {string} inputSvg - path to input SVG
 * @param {number} width
 * @param {number} height
 * @returns {Buffer}
 */
function rsvgToPngBuffer(inputSvg, width, height) {
  return execSync(`"${RSVG}" -w ${width} -h ${height} "${inputSvg}"`)
}

/**
 * Composite a transparent logo PNG onto a solid background and write to destPath.
 * @param {string} squareSvgPath                              - path to the square-crop SVG
 * @param {number} logoW                                      - logo render width
 * @param {number} logoH                                      - logo render height
 * @param {number} canvasW                                    - output canvas width
 * @param {number} canvasH                                    - output canvas height
 * @param {string} destPath                                   - output PNG file path
 * @param {{ r: number, g: number, b: number, alpha: number }} bg - background colour
 */
async function compositeOnBg(squareSvgPath, logoW, logoH, canvasW, canvasH, destPath, bg) {
  const logoPng = rsvgToPngBuffer(squareSvgPath, logoW, logoH)
  await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: bg },
  })
    .composite([{ input: logoPng, gravity: 'center' }])
    .png()
    .toFile(destPath)
}

/**
 * Pack an array of PNG Buffers into a valid ICO binary.
 * Supports multiple sizes; each image is stored as a full PNG data stream.
 *
 * ICO format reference:
 *   https://en.wikipedia.org/wiki/ICO_(file_format)
 *
 * @param {{ width: number, height: number, data: Buffer }[]} images
 * @returns {Buffer}
 */
function buildIco(images) {
  const count = images.length

  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)     // reserved
  header.writeUInt16LE(1, 2)     // type: 1 = ICO
  header.writeUInt16LE(count, 4) // number of images

  // Each directory entry is 16 bytes
  const dirEntrySize = 16
  const dataOffset = 6 + count * dirEntrySize

  const directory = Buffer.alloc(count * dirEntrySize)
  let currentOffset = dataOffset

  for (let i = 0; i < count; i++) {
    const { width, height, data } = images[i]
    const size = data.length
    const base = i * dirEntrySize

    // Width/height: 0 means 256
    directory.writeUInt8(width >= 256 ? 0 : width, base)
    directory.writeUInt8(height >= 256 ? 0 : height, base + 1)
    directory.writeUInt8(0, base + 2)    // color count (0 = no palette / true-color)
    directory.writeUInt8(0, base + 3)    // reserved
    directory.writeUInt16LE(1, base + 4) // color planes
    directory.writeUInt16LE(32, base + 6) // bits per pixel
    directory.writeUInt32LE(size, base + 8)          // size of image data
    directory.writeUInt32LE(currentOffset, base + 12) // offset of image data

    currentOffset += size
  }

  return Buffer.concat([header, directory, ...images.map((img) => img.data)])
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading source SVG...')
  const sourceSvg = readFileSync(SOURCE_SVG, 'utf8')

  // ── Step 1: Clean SVG (remove background rect from path 4) ──────────────────
  console.log('Stripping background rect from path 4...')
  if (!sourceSvg.includes(BG_RECT_SEGMENT)) {
    throw new Error(
      'Background rect segment not found in source SVG. ' +
        'Check that the source file has not changed.'
    )
  }
  const cleanedSvg = sourceSvg.replace(BG_RECT_SEGMENT, '').replace(/^\s+/, '')
  // The replace above removes the rect string; the remaining d value now starts
  // directly with "M 727.00 537.41 C…" (possibly with leading whitespace in the
  // attribute value which is harmless, but trim it to be tidy).
  // The broader SVG string may have leftover whitespace inside the d="…" attribute
  // right after the opening quote — normalise it.
  const finalCleanedSvg = cleanedSvg.replace(/ d="\s+M /, ' d="M ')

  const publicDir = path.join(PROJECT_ROOT, 'public')
  const iconsDir = path.join(publicDir, 'icons')
  const appDir = path.join(PROJECT_ROOT, 'src', 'app')

  ensureDir(iconsDir)

  const logoSvgPath = path.join(publicDir, 'logo.svg')
  writeFileSync(logoSvgPath, finalCleanedSvg, 'utf8')
  console.log('  Written: public/logo.svg')

  // ── Step 2: Square-crop SVG ──────────────────────────────────────────────────
  console.log('Creating square-crop SVG for favicons...')
  // Fix Bug 1: change viewBox AND root width/height so rsvg-convert uses the
  // correct 400×400 coordinate space rather than stretching to 1387×756.
  const squareSvg = finalCleanedSvg
    .replace('viewBox="0 0 1387 756"', 'viewBox="500 178 400 400"')
    .replace('width="1387"', 'width="400"')
    .replace('height="756"', 'height="400"')
  writeFileSync(TEMP_SQUARE_SVG, squareSvg, 'utf8')
  console.log('  Written: /tmp/logo-square.svg')

  // ── Step 3: Transparent PNGs (square-crop) ───────────────────────────────────
  console.log('Generating transparent favicon PNGs...')

  const transparentSizes = [
    { size: 16, dest: path.join(publicDir, 'favicon-16.png') },
    { size: 32, dest: path.join(publicDir, 'favicon-32.png') },
    { size: 48, dest: path.join(publicDir, 'favicon-48.png') },
    { size: 32, dest: path.join(appDir, 'icon.png') },
  ]

  for (const { size, dest } of transparentSizes) {
    rsvgToPng(TEMP_SQUARE_SVG, dest, size, size)
    console.log(`  Written: ${path.relative(PROJECT_ROOT, dest)} (${size}x${size})`)
  }

  // ── Step 4: Dark-background square icons ────────────────────────────────────
  // Fix Bug 2: use two-step pipeline — rsvg-convert produces a transparent PNG
  // Buffer, then sharp composites it onto the dark background. This preserves
  // colors that the base64-in-<image> approach lost.
  console.log('Generating dark-background square icons...')

  const squareIconTargets = [
    { size: 180, dest: path.join(publicDir, 'apple-touch-icon.png'), bg: BG_NAVY  },
    { size: 192, dest: path.join(iconsDir, 'icon-192.png'),          bg: BG_NAVY  },
    { size: 512, dest: path.join(iconsDir, 'icon-512.png'),          bg: BG_NAVY  },
    { size: 180, dest: path.join(appDir, 'apple-icon.png'),          bg: BG_NAVY  },
  ]

  for (const { size, dest, bg } of squareIconTargets) {
    const logoSize = Math.round(size * 0.85)
    await compositeOnBg(TEMP_SQUARE_SVG, logoSize, logoSize, size, size, dest, bg)
    console.log(`  Written: ${path.relative(PROJECT_ROOT, dest)} (${size}x${size})`)
  }

  // ── Step 5: Social image PNGs (1200×630) ─────────────────────────────────────
  console.log('Generating social share images (og-image, twitter-image)...')

  const SOCIAL_W = 1200
  const SOCIAL_H = 630
  const LOGO_SOCIAL = 504 // logo centered on dark canvas

  const socialTargets = [
    path.join(publicDir, 'og-image.png'),
    path.join(publicDir, 'twitter-image.png'),
  ]

  for (const dest of socialTargets) {
    await compositeOnBg(TEMP_SQUARE_SVG, LOGO_SOCIAL, LOGO_SOCIAL, SOCIAL_W, SOCIAL_H, dest, BG_NAVY)
    console.log(`  Written: ${path.relative(PROJECT_ROOT, dest)} (${SOCIAL_W}x${SOCIAL_H})`)
  }

  // ── Step 6: Build ICO file ───────────────────────────────────────────────────
  console.log('Generating ICO files...')

  // Read the already-generated transparent PNGs
  const icoSizes = [
    { size: 16, file: path.join(publicDir, 'favicon-16.png') },
    { size: 32, file: path.join(publicDir, 'favicon-32.png') },
    { size: 48, file: path.join(publicDir, 'favicon-48.png') },
  ]

  const icoImages = icoSizes.map(({ size, file }) => ({
    width: size,
    height: size,
    data: readFileSync(file),
  }))

  const icoBuffer = buildIco(icoImages)

  const icoTargets = [
    path.join(publicDir, 'favicon.ico'),
    path.join(appDir, 'favicon.ico'),
  ]

  for (const dest of icoTargets) {
    writeFileSync(dest, icoBuffer)
    console.log(`  Written: ${path.relative(PROJECT_ROOT, dest)} (${icoBuffer.length} bytes, multi-size 16+32+48)`)
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  console.log('\nAll icon assets generated successfully.')
}

main().catch((err) => {
  console.error('Error generating icons:', err)
  process.exit(1)
})
