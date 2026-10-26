<script setup lang="ts">
// Photography gallery.
// Filters: real buttons (aria-pressed), client-side, mirrored to ?type= with router.replace (shareable, no reload).
// Masonry: CSS grid, no JS layout. Rows are a tiny unit derived from the column width via container query
// units, so each tile spans exactly its aspect ratio; `grid-auto-flow: dense` backfills holes. Appending
// ("Load more") never moves existing tiles — placement of tile k depends only on tiles before it.
import { photos, photoTypes, type PhotoItem, type PhotoType } from '~/data/portfolio'
import type { LightboxItem } from '~/composables/useLightbox'

useSeoMeta({
  title: 'Wedding Photography — The Taj Studio',
  description: 'Wedding, pre-wedding and family photography by The Taj Studio, Surat — candid, editorial and timeless.',
  ogTitle: 'Wedding Photography — The Taj Studio',
  ogDescription: 'Wedding, pre-wedding and family photography by The Taj Studio.',
  ogImage: '/og/photos.jpg' // PLACEHOLDER: add a 1200x630 image at public/og/photos.jpg
})

const PAGE = 24
const route = useRoute()
const router = useRouter()

const isType = (v: unknown): v is PhotoType => photoTypes.some((t) => t.value === v)
const active = computed<PhotoType | 'all'>(() => (isType(route.query.type) ? route.query.type : 'all'))
const filters = computed(() => [{ value: 'all' as const, label: 'All' }, ...photoTypes])

const shown = ref(PAGE)
watch(active, () => { shown.value = PAGE })

function setFilter(value: PhotoType | 'all') {
  router.replace({ query: { ...route.query, type: value === 'all' ? undefined : value } })
}

const filtered = computed<PhotoItem[]>(() => (active.value === 'all' ? photos : photos.filter((p) => p.type === active.value)))
const visible = computed(() => filtered.value.slice(0, shown.value))

// Rows per tile at 24 units per column width + 1 unit of gap.
const span: Record<PhotoItem['ratio'], number> = { '1/1': 25, '3/2': 17, '4/5': 31 }
const typeLabel = (t: PhotoType) => photoTypes.find((x) => x.value === t)?.label ?? t

const { open } = useLightbox()
const lightboxItems = computed<LightboxItem[]>(() => visible.value.map((p) => ({
  src: p.src,
  alt: `${p.couple}, ${typeLabel(p.type).toLowerCase()} photograph`,
  ratio: p.ratio,
  caption: `${p.couple} · ${typeLabel(p.type)}`,
  story: p.caseStudySlug ? `/case-studies/${p.caseStudySlug}` : undefined
})))
</script>

<template>
  <div>
    <section class="section photos-head">
      <div class="container">
        <SectionHeader overline="Portfolio" title="Photography" subtext="Weddings, pre-weddings and families, selected by the studio." />
      </div>
    </section>

    <div class="filters">
      <div class="container filters__inner" role="group" aria-label="Filter photographs">
        <button v-for="f in filters" :key="f.value" type="button" class="filters__btn overline" :aria-pressed="active === f.value" @click="setFilter(f.value)">
          {{ f.label }}
        </button>
        <span class="filters__count" aria-live="polite">{{ filtered.length }} photographs</span>
      </div>
    </div>

    <section class="section photos" aria-label="Photographs">
      <div class="container">
        <div class="masonry">
          <ul class="masonry__grid">
            <li v-for="(p, i) in visible" :key="p.id" class="masonry__item" :style="{ gridRowEnd: `span ${span[p.ratio]}` }">
              <BracketFrame class="masonry__frame">
                <button type="button" class="masonry__tile" :aria-label="`View larger: ${p.couple}, ${typeLabel(p.type)}`" @click="open(lightboxItems, i, $event.currentTarget, { inquire: true })">
                  <NuxtImg v-if="p.src" :src="p.src" :alt="`${p.couple}, ${typeLabel(p.type)}`" class="masonry__img" :style="{ aspectRatio: p.ratio }" loading="lazy" sizes="xs:50vw md:33vw lg:440px" />
                  <ImgPlaceholder v-else :ratio="p.ratio" :label="`${p.couple}, ${typeLabel(p.type)}`" />
                  <span class="masonry__caption" aria-hidden="true">
                    <span class="masonry__couple">{{ p.couple }}</span>
                    <span class="overline">{{ typeLabel(p.type) }}</span>
                  </span>
                </button>
              </BracketFrame>
            </li>
          </ul>
        </div>

        <div v-if="shown < filtered.length" class="photos__more">
          <BaseButton variant="secondary" @click="shown += PAGE">Load more</BaseButton>
        </div>
      </div>
    </section>

    <CtaBand title="Like what you see? Tell us about your date" label="Inquire" />
  </div>
</template>

<style scoped lang="scss">
.photos-head { padding-top: calc(var(--nav-height) + var(--space-4xl)); padding-bottom: var(--space-xl); :deep(.section-header) { margin-bottom: 0; } }

// Sticky filter row directly under the fixed nav.
.filters {
  position: sticky;
  top: var(--nav-height);
  z-index: 10;
  background: color-mix(in srgb, var(--color-bg-base) 92%, transparent);
  backdrop-filter: blur(8px);
  border-block: 1px solid var(--color-border-subtle);

  &__inner { display: flex; align-items: center; gap: var(--space-xs); padding-block: var(--space-sm); overflow-x: auto; scrollbar-width: none; }
  &__btn {
    flex: none;
    padding: var(--space-xs) var(--space-md);
    border: 1px solid transparent;
    background: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color var(--duration-base), border-color var(--duration-base);
    &:hover { color: var(--color-text-primary); }
    &[aria-pressed='true'] { color: var(--color-text-primary); border-color: var(--color-text-primary); }
  }
  &__count { margin-left: auto; flex: none; font-size: var(--text-body-sm); color: var(--color-text-muted); }
}

.photos { padding-top: var(--space-2xl); }
.photos__more { display: flex; justify-content: center; margin-top: var(--space-3xl); }

// Masonry: unit = column width / 24; the gap is one unit in both directions.
.masonry {
  container-type: inline-size;
  --cols: 3;
  --unit: calc(100cqi / (var(--cols) * 24 + var(--cols) - 1));

  &__grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), calc(var(--unit) * 24));
    grid-auto-rows: var(--unit);
    grid-auto-flow: dense;
    column-gap: var(--unit);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__item { min-width: 0; }

  &__tile {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    overflow: hidden;
    :deep(.ph), .masonry__img { transition: transform 900ms var(--ease-out); }
    &:hover :deep(.ph), &:hover .masonry__img { transform: scale(1.03); }
  }
  &__img { display: block; width: 100%; height: auto; object-fit: cover; }

  // Couple names on hover / keyboard focus.
  &__caption {
    position: absolute;
    inset: auto 0 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: var(--space-xl) var(--space-md) var(--space-md);
    background: linear-gradient(to top, rgb(0 0 0 / 55%), transparent);
    color: var(--color-text-on-dark);
    text-align: left;
    opacity: 0;
    transform: translateY(var(--space-xs));
    transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);
  }
  &__tile:hover &__caption, &__tile:focus-visible &__caption { opacity: 1; transform: none; }
  &__couple { font-family: var(--font-serif); font-size: var(--text-h4); }
}

@media (width <= 720px) {
  .masonry { --cols: 2; }
  .masonry__caption { opacity: 1; transform: none; padding: var(--space-lg) var(--space-xs) var(--space-xs); } // no hover on touch
  .masonry__couple { font-size: var(--text-body-sm); }
  .masonry__caption .overline { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .masonry__tile :deep(.ph), .masonry__img { transition: none; }
  .masonry__tile:hover :deep(.ph) { transform: none; }
}
</style>
