import { NextRequest, NextResponse } from 'next/server'

const cleanText = (value: string | null, fallback: string) =>
  String(value || fallback)
    .replace(/[<>&"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90)

const hash = (value: string) =>
  value.split('').reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 2166136261)

const paletteFor = (seed: string) => {
  const n = hash(seed)
  const hue = n % 360
  return {
    sky: `hsl(${hue}, 58%, 82%)`,
    mid: `hsl(${(hue + 42) % 360}, 48%, 62%)`,
    deep: `hsl(${(hue + 188) % 360}, 48%, 32%)`,
    glow: `hsl(${(hue + 90) % 360}, 76%, 78%)`,
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const country = cleanText(params.get('country'), 'Travel')
  const place = cleanText(params.get('place'), country)
  const title = cleanText(params.get('title'), `${place} travel day`)
  const theme = cleanText(params.get('theme'), 'scenic route')
  const day = cleanText(params.get('day'), '1')
  const colors = paletteFor(`${country}-${place}-${theme}-${day}-${params.get('seed') || ''}`)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-label="${place} ${country}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.sky}"/>
      <stop offset=".55" stop-color="${colors.mid}"/>
      <stop offset="1" stop-color="${colors.deep}"/>
    </linearGradient>
    <radialGradient id="sun" cx=".72" cy=".22" r=".34">
      <stop offset="0" stop-color="${colors.glow}" stop-opacity=".95"/>
      <stop offset=".7" stop-color="${colors.glow}" stop-opacity=".18"/>
      <stop offset="1" stop-color="${colors.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="1600" height="1000" fill="url(#sky)"/>
  <rect width="1600" height="1000" fill="url(#sun)"/>
  <path d="M0 690 C190 610 310 640 470 570 C650 490 770 565 940 500 C1110 435 1320 455 1600 350 L1600 1000 L0 1000 Z" fill="#12352f" opacity=".38"/>
  <path d="M0 760 C180 690 340 720 520 650 C730 570 850 650 1040 585 C1220 525 1390 545 1600 470 L1600 1000 L0 1000 Z" fill="#09251f" opacity=".46"/>
  <path d="M115 725 C310 635 500 625 705 705 C925 790 1135 735 1495 620" fill="none" stroke="#fff" stroke-opacity=".72" stroke-width="14" stroke-linecap="round"/>
  <path d="M115 725 C310 635 500 625 705 705 C925 790 1135 735 1495 620" fill="none" stroke="#0f766e" stroke-opacity=".78" stroke-width="5" stroke-linecap="round" stroke-dasharray="28 30"/>
  <circle cx="115" cy="725" r="28" fill="#fff"/><circle cx="115" cy="725" r="14" fill="#0f766e"/>
  <circle cx="1495" cy="620" r="30" fill="#fff"/><circle cx="1495" cy="620" r="15" fill="#dc2626"/>
  <g transform="translate(96 92)">
    <rect width="540" height="216" rx="28" fill="#061b16" opacity=".58"/>
    <text x="42" y="65" fill="#d1fae5" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" letter-spacing="2">DAY ${day} / ${country.toUpperCase()}</text>
    <text x="42" y="124" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800">${place}</text>
    <text x="42" y="178" fill="#ecfdf5" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="600">${theme}</text>
  </g>
  <g transform="translate(96 834)">
    <rect width="1008" height="74" rx="22" fill="#061b16" opacity=".5"/>
    <text x="32" y="49" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">${title}</text>
  </g>
  <circle cx="1320" cy="190" r="98" fill="#fff" opacity=".26" filter="url(#soft)"/>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
