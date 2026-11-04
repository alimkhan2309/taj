<script setup lang="ts">
// "The Taj Studio" signature, traced from the La Luxes Script lettering (asset: public/images/brand/signature.svg).
// One centre-line <path> per pen stroke, in writing order, so DrawSVG can write it stroke by stroke.
// `weight` is in viewBox units (576 wide): ~2.4 reads well around 700px wide, ~5 around 170px.
withDefaults(defineProps<{ weight?: number }>(), { weight: 2.4 })

const strokes = [
  'M0 39 C35 30 75 22 105 19 C125 17 150 17 158 20 C161 22 162 24 162 26', // T bar
  'M104 10 C96 40 86 85 80 115 C75 140 71 160 68 178', // T stem
  'M99 77 C110 55 125 25 134 9 C130 30 110 75 96 124 C100 105 108 82 116 76 C120 76 120 88 124 95', // h
  'M143 75 C141 73 134 80 132 90 C130 98 132 103 140 101 C150 98 162 90 170 80', // e
  'M141 40 C175 31 215 22 250 19 C275 17 296 18 302 22 C304 23 305 25 305 27', // T bar
  'M247 11 C238 40 228 85 222 130 C218 150 214 165 211 178', // T stem
  'M240 93 C242 86 245 78 248 78 C252 80 251 95 254 101 C258 104 268 92 277 81 C275 100 262 140 250 160 C243 172 233 180 226 172 C222 163 232 148 248 132 C268 113 290 96 311 80', // a + j
  'M278 63 L279 67', // j dot
  'M430 53 C436 35 442 15 441 2 C440 -8 420 -5 408 2 C385 20 362 55 352 80 C346 95 356 99 372 99 C390 99 410 93 420 92 C426 92 424 100 418 108 C405 130 390 160 380 185 C377 192 377 197 380 197', // S
  'M461 3 C455 40 445 90 434 153', // t stem
  'M400 54 C430 47 470 41 505 39 C520 38 533 40 539 45', // t bar
  'M452 78 C451 88 450 94 453 92 C457 88 462 82 466 80 C466 88 466 98 469 103', // u
  'M490 72 C482 78 476 92 478 99 C481 102 488 92 495 80 C500 68 507 52 509 44 C507 60 497 90 493 108 C491 118 494 124 499 121 C512 110 528 94 540 82 C538 88 537 95 541 96 C545 94 548 85 549 80 C553 78 552 95 547 93 C543 90 547 80 552 80 C560 82 568 82 574 81', // d + i + o
  'M538 62 L540 64' // i dot
]
</script>

<template>
  <svg class="signature" viewBox="0 -8 576 210" fill="none" role="img" aria-label="The Taj Studio signature">
    <path v-for="(d, i) in strokes" :key="i" :d="d" stroke="currentColor" :stroke-width="weight" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.signature { display: block; width: 100%; height: auto; overflow: visible; }
</style>
