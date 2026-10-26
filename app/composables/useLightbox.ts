// Shared lightbox state. Any gallery calls open(items, index, originEl); <AppLightbox> (mounted once in the
// default layout) renders it. `origin` is the clicked element, so the viewer can grow out of it.
export type ImgRatio = '4/5' | '3/2' | '4/3' | '1/1' | '16/9'

export type LightboxItem = {
  src?: string // omit while the photo is still a placeholder; doubles as the poster for video items
  video?: string // .mp4/.webm file, or an embed URL (YouTube / Vimeo player link)
  alt: string
  ratio?: ImgRatio
  caption?: string
  story?: string // route of the related case study → "Read the full story →"
  note?: string // shown over the placeholder (e.g. "Film placeholder — add a video ID")
}

export type LightboxOptions = { inquire?: boolean } // persistent "Inquire about your date" link

let origin: HTMLElement | null = null // client-only, not part of serialisable state

export function useLightbox() {
  const state = useState('lightbox', () => ({ items: [] as LightboxItem[], index: -1, inquire: false }))

  const isOpen = computed(() => state.value.index >= 0)
  const current = computed(() => state.value.items[state.value.index])

  function open(items: LightboxItem[], index: number, from?: EventTarget | null, opts: LightboxOptions = {}) {
    origin = from instanceof HTMLElement ? from : null
    state.value = { items, index, inquire: !!opts.inquire }
  }

  function close() {
    state.value = { ...state.value, index: -1 }
  }

  function step(delta: number) {
    const n = state.value.items.length
    if (!n) return
    origin = null // after paging, the original tile no longer matches the image
    state.value = { ...state.value, index: (state.value.index + delta + n) % n }
  }

  return { state, isOpen, current, open, close, next: () => step(1), prev: () => step(-1), origin: () => origin }
}
