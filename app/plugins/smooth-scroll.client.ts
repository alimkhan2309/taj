// Smooth, inertial wheel scrolling (Lenis). The page keeps its native scroll position, so position: sticky,
// ScrollTrigger pins and window.scrollY all behave as usual; Lenis only eases the wheel input
// (it speeds up as you keep scrolling and glides to a stop when you let go).
// Touch keeps the device's own momentum (syncTouch off). Users with prefers-reduced-motion get native scrolling.
// Driven by the GSAP ticker so ScrollTrigger reads the same frame Lenis writes.
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis({
    lerp: 0.09, // lower = heavier glide, higher = snappier. 0.1 is the Lenis default.
    wheelMultiplier: 1,
    anchors: true, // in-page #links glide too
    stopInertiaOnNavigate: true, // clicking a link kills leftover momentum before the route changes
    allowNestedScroll: true // inner scrollers (galleries, overflow-x tracks) scroll themselves
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // New page = new heights. Re-measure once it has rendered.
  nuxtApp.hook('page:finish', () => {
    lenis.resize()
    ScrollTrigger.refresh()
  })

  return { provide: { lenis } }
})
