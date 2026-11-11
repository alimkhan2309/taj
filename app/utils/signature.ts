// "Writes itself" timeline for a <TajSignature>. Returned paused; play/reverse it from the caller.
// Hides the mask's full-cover rect, draws each centreline at a constant pen speed in writing order (dots pop in),
// then fades the rect back so the end state is exactly the artwork, whatever the mask strokes missed.
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

const PEN = 2000 // viewBox units per second (viewBox is 1000 wide; ~3700 units of pen travel ≈ 2s)

export function signatureTimeline(svg: Element | null | undefined): gsap.core.Timeline {
  gsap.registerPlugin(DrawSVGPlugin)
  const tl = gsap.timeline({ paused: true })
  if (!svg) return tl

  const fill = svg.querySelector('.sig-fill')
  tl.set(svg, { autoAlpha: 1 }).set(fill, { opacity: 0 })
  svg.querySelectorAll<SVGPathElement>('.sig-stroke').forEach((p) => {
    const len = p.getTotalLength()
    if (len < 6) tl.from(p, { autoAlpha: 0, duration: 0.06, ease: 'none' }, '>')
    else tl.from(p, { drawSVG: 0, duration: len / PEN, ease: 'power1.inOut' }, '>-0.02')
  })
  tl.to(fill, { opacity: 1, duration: 0.3, ease: 'none' })
  return tl
}
