<script setup lang="ts">
// Single lightbox for the whole site (mounted in layouts/default.vue). Driven by useLightbox().
// Native <dialog>: top layer, focus trap and Esc for free. Opens by growing out of the clicked tile (FLIP),
// pages with arrows / ← →, closes via ×, Esc or a click on the backdrop.
// Video items play a file inline (<video>) or an embed (<iframe>); closing unmounts them, which stops playback.
// Touch: horizontal swipe pages. Focus returns to the element that opened it. Navigating away closes it.
import { gsap } from 'gsap'

const { state, isOpen, current, close, next, prev, origin } = useLightbox()
const route = useRoute()
let opener: HTMLElement | null = null

const dialog = ref<HTMLDialogElement>()
const figure = ref<HTMLElement>()
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const ratioNum = computed(() => {
  const [w, h] = (current.value?.ratio ?? '3/2').split('/').map(Number)
  return (w ?? 3) / (h ?? 2)
})
const isFile = computed(() => /\.(mp4|webm)(\?|$)/i.test(current.value?.video ?? ''))
const counter = computed(() => `${String(state.value.index + 1).padStart(2, '0')} / ${String(state.value.items.length).padStart(2, '0')}`)

watch(isOpen, async (open) => {
  const d = dialog.value
  if (!d) return
  if (open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.documentElement.style.overflow = 'hidden'
    d.showModal()
    await nextTick()
    animateIn()
  } else if (d.open) {
    document.documentElement.style.overflow = ''
    d.close()
    opener?.focus({ preventScroll: true }) // explicit, not every browser restores focus after dialog.close()
    opener = null
  }
})

// Following "Inquire" / "Read the full story" changes route: drop the viewer instead of leaving it on top.
watch(() => route.fullPath, () => { if (isOpen.value) close() })

// Swipe: a mostly-horizontal touch drag of 50px+ pages.
let touch: { x: number; y: number } | null = null
function onTouchStart(e: TouchEvent) { const t = e.touches[0]; touch = t ? { x: t.clientX, y: t.clientY } : null }
function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!touch || !t) return
  const dx = t.clientX - touch.x
  const dy = t.clientY - touch.y
  touch = null
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)()
}

function animateIn() {
  const fig = figure.value
  if (!fig || !dialog.value || reduced()) return
  gsap.fromTo(dialog.value, { '--backdrop': 0 }, { '--backdrop': 1, duration: 0.35, ease: 'power2.out' })
  const from = origin()?.getBoundingClientRect()
  if (!from) { gsap.from(fig, { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: 'power3.out' }); return }
  // FLIP: start at the tile's box, end at the figure's natural box.
  const to = fig.getBoundingClientRect()
  gsap.from(fig, {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale: from.width / to.width,
    duration: 0.55,
    ease: 'power3.out',
    clearProps: 'transform'
  })
}

function requestClose() {
  const fig = figure.value
  if (!fig || !dialog.value || reduced()) return close()
  gsap.timeline({ onComplete: () => { gsap.set(fig, { clearProps: 'all' }); close() } })
    .to(fig, { autoAlpha: 0, scale: 0.94, duration: 0.22, ease: 'power2.in' }, 0)
    .to(dialog.value, { '--backdrop': 0, duration: 0.22, ease: 'power2.in' }, 0)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

// Clicks that land on the dialog itself (not its children) are backdrop clicks.
function onBackdrop(e: MouseEvent) { if (e.target === dialog.value) requestClose() }

onBeforeUnmount(() => { document.documentElement.style.overflow = '' })
</script>

<template>
  <dialog ref="dialog" class="lb" aria-modal="true" :aria-label="current?.ratio === '16/9' ? 'Film viewer' : 'Photo viewer'"
    @cancel.prevent="requestClose" @click="onBackdrop" @keydown="onKey" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
    <template v-if="current">
      <button type="button" class="lb__close" aria-label="Close" @click="requestClose"><span aria-hidden="true" /></button>

      <figure ref="figure" class="lb__figure" :style="{ '--r': ratioNum }">
        <div class="lb__media">
          <video v-if="current.video && isFile" :key="current.video" :src="current.video" :poster="current.src" class="lb__img" controls autoplay playsinline />
          <iframe v-else-if="current.video" :key="current.video" :src="current.video" :title="current.alt" class="lb__img" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen />
          <NuxtImg v-else-if="current.src" :key="current.src" :src="current.src" :alt="current.alt" class="lb__img" sizes="xs:100vw lg:90vw" />
          <ImgPlaceholder v-else :key="state.index" :ratio="current.ratio" :label="current.alt" dark />
          <p v-if="current.note" class="lb__note overline">{{ current.note }}</p>
        </div>
        <figcaption class="lb__caption">
          <span class="overline">{{ counter }}</span>
          <span v-if="current.caption">{{ current.caption }}</span>
          <span class="lb__links">
            <NuxtLink v-if="current.story" :to="current.story" class="lb__link overline">Read the full story →</NuxtLink>
            <NuxtLink v-if="state.inquire" to="/contact" class="lb__link lb__link--cta overline">Inquire about your date</NuxtLink>
          </span>
        </figcaption>
      </figure>

      <template v-if="state.items.length > 1">
        <button type="button" class="lb__nav lb__nav--prev" aria-label="Previous photo" @click="prev"><span aria-hidden="true" /></button>
        <button type="button" class="lb__nav lb__nav--next" aria-label="Next photo" @click="next"><span aria-hidden="true" /></button>
      </template>
    </template>
  </dialog>
</template>

<style scoped lang="scss">
.lb {
  --backdrop: 1;
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: none;
  height: 100svh;
  max-height: none;
  margin: 0;
  padding: var(--space-3xl) var(--space-4xl);
  border: 0;
  // The dialog is full-screen, so it paints its own backdrop (custom props don't reach ::backdrop everywhere).
  background: color-mix(in srgb, var(--color-surface-inverse) calc(var(--backdrop) * 94%), transparent);
  color: var(--color-text-on-dark);
  overflow: hidden;

  &[open] { display: grid; place-items: center; }
  &::backdrop { background: transparent; }

  &__figure {
    margin: 0;
    // Largest box of ratio --r that fits the padded viewport.
    width: min(100%, calc((100svh - var(--space-3xl) * 2 - var(--space-2xl)) * var(--r)));
    transform-origin: center;
  }
  &__img { display: block; width: 100%; aspect-ratio: var(--r); object-fit: contain; border: 0; background: var(--color-surface-inverse); }
  &__media { position: relative; }
  &__note { position: absolute; inset: 0; display: grid; place-items: center; color: var(--color-text-on-dark-muted); pointer-events: none; }
  &__caption { display: flex; flex-wrap: wrap; gap: var(--space-xs) var(--space-md); align-items: baseline; margin-top: var(--space-sm); color: var(--color-text-on-dark-muted); }
  &__links { display: flex; flex-wrap: wrap; gap: var(--space-lg); margin-left: auto; align-items: center; }
  &__link {
    color: var(--color-text-on-dark);
    border-bottom: 1px solid transparent;
    transition: color var(--duration-base), border-color var(--duration-base);
    &:hover { color: var(--color-accent-brand); border-color: var(--color-accent-brand); }
    &--cta { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-accent-brand); color: var(--color-accent-brand);
      &:hover { background: var(--color-accent-brand); color: var(--color-text-primary); } }
  }

  // Square icon buttons; the glyphs are drawn with borders so they inherit currentColor.
  &__close, &__nav {
    position: absolute;
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: 1px solid var(--color-text-on-dark-muted);
    background: transparent;
    color: var(--color-text-on-dark);
    cursor: pointer;
    transition: border-color var(--duration-base), color var(--duration-base);
    &:hover { border-color: var(--color-accent-brand); color: var(--color-accent-brand); }
  }

  &__close {
    top: var(--space-lg);
    right: var(--space-lg);
    span { position: relative; width: 20px; height: 20px;
      &::before, &::after { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: currentcolor; }
      &::before { transform: rotate(45deg); }
      &::after { transform: rotate(-45deg); } }
  }

  &__nav {
    top: 50%;
    translate: 0 -50%;
    &--prev { left: var(--space-lg); }
    &--next { right: var(--space-lg); }
    span { width: 12px; height: 12px; border: 0 solid currentcolor; border-top-width: 2px; border-left-width: 2px; }
    &--prev span { transform: translateX(2px) rotate(-45deg); }
    &--next span { transform: translateX(-2px) rotate(135deg); }
  }
}

@media (width <= 720px) {
  .lb { padding: var(--space-4xl) var(--page-margin); }
  .lb__nav { top: auto; bottom: var(--space-lg); translate: none; }
}
</style>
