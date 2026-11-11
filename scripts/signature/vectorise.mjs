// Vectorises the client's signature artwork into app/data/signature.ts (+ public/images/brand/signature.svg).
//  1. Crop to the ink, binarise.
//  2. Outline: potrace on the crop -> exact filled path (what the visitor sees).
//  3. Centrelines: Zhang-Suen skeleton -> graph -> edges stitched through crossings by straightest continuation
//     -> pen strokes, ordered left to right. Used only as a draw-on mask, so they need to be close, not exact.
// Deps are only needed to regenerate, so they live next to this script, not in the app's package.json:
//   npm i --prefix scripts/signature --no-package-lock potrace@2.1.8 puppeteer-core@23.11.1
// Then, from the repo root:
//   node scripts/signature/vectorise.mjs scripts/signature/source.png app/data/signature.ts scripts/signature/preview.png
// preview.png shows the outline with the numbered mask strokes over it; preview-compare.png, outline vs source.
// Uses the system Edge for canvas work (EDGE env var overrides the path).
import puppeteer from 'puppeteer-core'
import potrace from 'potrace'
import { readFileSync, writeFileSync } from 'node:fs'

const [input, outJson, previewPng] = process.argv.slice(2)
const VB_W = 1000 // output viewBox width
const WORK_W = 1400 // skeleton working width (stroke ~4-5px here)
const TRACE_W = 2400 // potrace working width

const browser = await puppeteer.launch({ executablePath: process.env.EDGE ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
const page = await browser.newPage()
await page.setContent('<body></body>')
const src = `data:image/png;base64,${readFileSync(input).toString('base64')}`

const crop = await page.evaluate(async (src, WORK_W, TRACE_W) => {
  const img = new Image(); img.src = src; await img.decode()
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, c.width, c.height).data
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0
  for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
    const i = (y * c.width + xx) * 4
    if (d[i] < 128) { if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y }
  }
  const pad = 6
  minX -= pad; minY -= pad; maxX += pad; maxY += pad
  const cw = maxX - minX, ch = maxY - minY
  const scaled = (W) => {
    const H = Math.round(ch * W / cw)
    const s = document.createElement('canvas'); s.width = W; s.height = H
    const sx = s.getContext('2d'); sx.fillStyle = '#fff'; sx.fillRect(0, 0, W, H)
    sx.imageSmoothingQuality = 'high'
    sx.drawImage(c, minX, minY, cw, ch, 0, 0, W, H)
    return s
  }
  const work = scaled(WORK_W)
  const wd = work.getContext('2d').getImageData(0, 0, work.width, work.height).data
  const bin = new Array(work.width * work.height)
  for (let i = 0; i < bin.length; i++) bin[i] = wd[i * 4] < 140 ? 1 : 0
  const trace = scaled(TRACE_W)
  return { cw, ch, workH: work.height, bin, tracePng: trace.toDataURL('image/png'), traceH: trace.height }
}, src, WORK_W, TRACE_W)

const W = WORK_W, H = crop.workH
const VB_H = Math.round((H / W) * VB_W * 10) / 10
const k = VB_W / W // work px -> viewBox

// ---------- Outline (potrace) ----------
const traceBuf = Buffer.from(crop.tracePng.split(',')[1], 'base64')
const svg = await new Promise((res, rej) => potrace.trace(traceBuf, { threshold: 140, turdSize: 4, optTolerance: 0.4, alphaMax: 1 }, (e, s) => (e ? rej(e) : res(s))))
const rawD = svg.match(/ d="([^"]+)"/)[1]
const kt = VB_W / TRACE_W
const outline = rawD.replace(/-?\d+(\.\d+)?/g, (n) => String(Math.round(parseFloat(n) * kt * 10) / 10))

// ---------- Skeleton (Zhang-Suen) ----------
const g = Uint8Array.from(crop.bin)
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : g[y * W + x])
// stroke thickness estimate: ink area / skeleton length (after thinning)
const inkArea = g.reduce((a, b) => a + b, 0)
let changed = true
while (changed) {
  changed = false
  for (const step of [0, 1]) {
    const del = []
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!g[y * W + x]) continue
      const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)]
      const B = p.reduce((a, b) => a + b, 0)
      if (B < 2 || B > 6) continue
      let A = 0; for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) A++
      if (A !== 1) continue
      if (step === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue
      del.push(y * W + x)
    }
    for (const i of del) g[i] = 0
    if (del.length) changed = true
  }
}
const skelLen = g.reduce((a, b) => a + b, 0)
const thickness = (inkArea / skelLen) * k // viewBox units

// ---------- Graph ----------
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
const nbrs = (i) => { const x = i % W, y = (i / W) | 0; const r = []; for (const [dx, dy] of N8) if (at(x + dx, y + dy)) r.push((y + dy) * W + x + dx); return r }
const deg = (i) => nbrs(i).length
// Nodes: endpoints (deg 1) and junction pixels (deg >= 3). Junction pixels adjacent to each other form one cluster.
const isNodePx = (i) => g[i] && deg(i) !== 2
const cluster = new Map() // pixel -> node id
const nodes = []
for (let i = 0; i < W * H; i++) {
  if (!isNodePx(i) || cluster.has(i)) continue
  const id = nodes.length, q = [i], px = []
  cluster.set(i, id)
  while (q.length) { const c = q.pop(); px.push(c); for (const n of nbrs(c)) if (isNodePx(n) && !cluster.has(n) && deg(c) > 2 && deg(n) > 2) { cluster.set(n, id); q.push(n) } }
  const cx = px.reduce((a, p) => a + (p % W), 0) / px.length, cy = px.reduce((a, p) => a + ((p / W) | 0), 0) / px.length
  nodes.push({ id, px, x: cx, y: cy, edges: [] })
}
// Edges: walk from each node pixel along deg-2 pixels until another node pixel.
const edges = []
const usedStep = new Set()
for (const n of nodes) for (const p of n.px) for (const s of nbrs(p)) {
  if (cluster.get(s) === n.id && deg(s) > 2) continue
  const key = `${p}>${s}`
  if (usedStep.has(key)) continue
  const path = [p]; let prev = p, cur = s
  while (true) {
    path.push(cur)
    if (cluster.has(cur)) break
    const nx = nbrs(cur).filter((q) => q !== prev && !(path.length > 2 && q === path[path.length - 3]))
    if (!nx.length) break
    // prefer 4-connected continuation to avoid diagonal shortcuts
    nx.sort((a, b) => (Math.abs(a - cur) === 1 || Math.abs(a - cur) === W ? -1 : 1))
    prev = cur; cur = nx[0]
    if (path.length > 20000) break
  }
  usedStep.add(key); usedStep.add(`${cur}>${path[path.length - 2]}`)
  const to = cluster.get(cur)
  if (to === undefined) continue
  const e = { id: edges.length, a: n.id, b: to, pts: path.map((q) => [q % W, (q / W) | 0]) }
  // dedupe the same edge found from the other side
  if (edges.some((o) => o.a === e.b && o.b === e.a && o.pts.length === e.pts.length && o.pts[1][0] === e.pts[e.pts.length - 2][0] && o.pts[1][1] === e.pts[e.pts.length - 2][1])) continue
  edges.push(e); nodes[e.a].edges.push(e.id); if (e.b !== e.a) nodes[e.b].edges.push(e.id); else nodes[e.a].edges.push(e.id)
}

// Prune spurs: short edges ending in an endpoint attached to a junction.
const SPUR = 7
const dead = new Set()
for (const e of edges) {
  const A = nodes[e.a], B = nodes[e.b]
  if (e.pts.length < SPUR && ((A.edges.length === 1 && B.edges.length > 2) || (B.edges.length === 1 && A.edges.length > 2))) dead.add(e.id)
}
for (const n of nodes) n.edges = n.edges.filter((id) => !dead.has(id))

// Merge junctions joined by a very short edge (an X crossing thinned into two Y's) into one node.
const MERGE = 9
const parent = nodes.map((n) => n.id)
const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])))
for (const e of edges) if (!dead.has(e.id) && e.a !== e.b && e.pts.length <= MERGE && nodes[e.a].edges.length > 2 && nodes[e.b].edges.length > 2) { parent[find(e.a)] = find(e.b); dead.add(e.id) }
const live = edges.filter((e) => !dead.has(e.id)).map((e) => ({ ...e, a: find(e.a), b: find(e.b) }))
const inc = new Map() // node -> [{edge, end:'a'|'b'}]
for (const e of live) for (const end of ['a', 'b']) { const n = e[end]; if (!inc.has(n)) inc.set(n, []); inc.get(n).push({ e, end }) }

// Direction of an edge leaving a node, sampled ~10px in.
const dirAt = ({ e, end }) => {
  const pts = end === 'a' ? e.pts : [...e.pts].reverse()
  const o = pts[0], t = pts[Math.min(pts.length - 1, 10)]
  const dx = t[0] - o[0], dy = t[1] - o[1], l = Math.hypot(dx, dy) || 1
  return [dx / l, dy / l]
}
// Pair incident edges at each node by straightest continuation.
const partner = new Map() // `${edgeId}:${end}` -> {e,end}
for (const [, list] of inc) {
  if (list.length < 2) continue
  const pairs = []
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = dirAt(list[i]), b = dirAt(list[j])
    pairs.push({ i, j, dot: a[0] * b[0] + a[1] * b[1] })
  }
  pairs.sort((p, q) => p.dot - q.dot)
  const taken = new Set()
  for (const p of pairs) {
    if (taken.has(p.i) || taken.has(p.j) || p.dot > -0.2) continue
    taken.add(p.i); taken.add(p.j)
    const A = list[p.i], B = list[p.j]
    partner.set(`${A.e.id}:${A.end}`, B); partner.set(`${B.e.id}:${B.end}`, A)
  }
}

// Walk strokes.
const usedE = new Set()
const strokes = []
const walk = (start) => {
  let cur = start, pts = []
  while (cur && !usedE.has(cur.e.id)) {
    usedE.add(cur.e.id)
    const seg = cur.end === 'a' ? cur.e.pts : [...cur.e.pts].reverse()
    pts = pts.concat(pts.length ? seg.slice(1) : seg)
    const exitEnd = cur.end === 'a' ? 'b' : 'a'
    cur = partner.get(`${cur.e.id}:${exitEnd}`)
  }
  return pts
}
// Start from unpaired edge ends first (true stroke ends), then whatever is left (closed loops).
for (const [, list] of inc) for (const s of list) if (!partner.has(`${s.e.id}:${s.end}`) && !usedE.has(s.e.id)) strokes.push(walk(s))
for (const e of live) if (!usedE.has(e.id)) strokes.push(walk({ e, end: 'a' }))

// Dots: a dot thins to a node with no edges at all. Emit it as a zero-length stroke (round cap draws it).
for (const n of nodes) if (!inc.has(find(n.id)) && n.px.length) strokes.push([[Math.round(n.x), Math.round(n.y)], [Math.round(n.x) + 0.2, Math.round(n.y)]])
// Direction + order: mostly-vertical strokes start at the top, others at the left; then sort by start x.
const oriented = strokes.filter((s) => s.length > 1).map((s) => {
  const [x0, y0] = s[0], [x1, y1] = s[s.length - 1]
  const xs = s.map((p) => p[0]), ys = s.map((p) => p[1])
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys)
  const flip = h > w * 1.5 ? y1 < y0 : x1 < x0
  return flip ? [...s].reverse() : s
})
// Dots (i, j) and tiny marks keep their place too.
oriented.sort((a, b) => a[0][0] - b[0][0])

// Simplify (RDP) and emit as smooth-ish polylines in viewBox units.
const rdp = (pts, eps) => {
  if (pts.length < 3) return pts
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
  const L = Math.hypot(bx - ax, by - ay) || 1
  let md = 0, mi = 0
  for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L; if (d > md) { md = d; mi = i } }
  return md > eps ? [...rdp(pts.slice(0, mi + 1), eps).slice(0, -1), ...rdp(pts.slice(mi), eps)] : [pts[0], pts[pts.length - 1]]
}
const r1 = (n) => Math.round(n * k * 10) / 10
const strokeDs = oriented.map((s) => {
  const p = rdp(s, 0.8)
  return 'M' + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')
})

const data = { viewBox: `0 0 ${VB_W} ${VB_H}`, thickness: Math.round(thickness * 100) / 100, outline, strokes: strokeDs }
writeFileSync(outJson, `// GENERATED by scripts/signature/vectorise.mjs from scripts/signature/source.png (the client's artwork). Do not hand-edit.
// outline: exact filled shape (potrace, fill-rule evenodd). strokes: skeleton centrelines in writing order, used only
// as a draw-on mask. thickness: average ink width, viewBox units.
export const SIGNATURE = {
  viewBox: ${JSON.stringify(data.viewBox)},
  thickness: ${data.thickness},
  outline:
    ${JSON.stringify(outline)},
  strokes: [
${strokeDs.map((d) => `    ${JSON.stringify(d)}`).join(',
')}
  ]
} as const
`)
writeFileSync('public/images/brand/signature.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${data.viewBox}" width="${VB_W}" height="${VB_H}"><!-- The Taj Studio signature, vectorised from the client artwork (scripts/signature) --><path fill="#1e1a16" fill-rule="evenodd" d="${outline}"/></svg>
`)
console.log('viewBox', VB_W, VB_H, 'thickness', thickness.toFixed(2), 'strokes', strokeDs.length, 'outline chars', outline.length, 'nodes', nodes.length, 'edges', live.length)

// Preview: outline in grey, mask strokes coloured by order with index labels.
const colors = (i, n) => `hsl(${Math.round((i / n) * 300)} 90% 45%)`
await page.setViewport({ width: 1600, height: Math.round(1600 * VB_H / VB_W) + 20 })
await page.setContent(`<body style="margin:0;background:#fff"><svg viewBox="0 0 ${VB_W} ${VB_H}" width="1600">
<path d="${outline}" fill="#bbb" fill-rule="evenodd"/>
${strokeDs.map((d, i) => `<path d="${d}" fill="none" stroke="${colors(i, strokeDs.length)}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
${strokeDs.map((d, i) => { const m = d.match(/M([\d.]+) ([\d.]+)/); return `<text x="${m[1]}" y="${m[2]}" font-size="12" fill="#000" font-family="sans-serif">${i}</text>` }).join('')}
</svg></body>`)
await page.screenshot({ path: previewPng, fullPage: true })
// Fidelity check: the vector outline alone (black) above the source crop, same width.
await page.setContent(`<body style="margin:0;background:#fff"><svg viewBox="0 0 ${VB_W} ${VB_H}" width="1600"><path d="${outline}" fill="#000" fill-rule="evenodd"/></svg><br><img src="${crop.tracePng}" width="1600"></body>`)
await page.screenshot({ path: previewPng.replace('.png', '-compare.png'), fullPage: true })
await browser.close()
