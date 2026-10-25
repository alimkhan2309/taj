<script setup lang="ts">
// PLACEHOLDER signature. Swap the <path>s for the real Figma vector (node 733:170, 698x272) exported as SVG.
// Keep viewBox 0 0 698 272, stroke="currentColor", fill="none": HomeIntro draws every <path> with DrawSVG.
// If the real export is filled outlines, keep the fill off here; drawing the outline still reads as handwriting.
</script>

<template>
  <svg class="signature" viewBox="0 0 698 272" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="The Taj Studio signature">
    <!-- T -->
    <path d="M60 70 C140 40 260 30 330 45" />
    <path d="M190 50 C175 120 150 190 110 235 C95 252 70 250 75 232" />
    <!-- aj -->
    <path d="M215 175 C200 150 240 140 245 165 C248 185 225 200 215 185 M245 160 C250 180 255 192 268 188" />
    <path d="M290 150 C300 210 290 260 255 262 C230 263 240 235 290 215" />
    <path d="M300 128 L302 130" />
    <!-- Studio -->
    <path d="M400 120 C370 100 340 125 370 145 C400 165 395 200 355 205 C335 207 330 195 345 188" />
    <path d="M430 110 C425 150 420 190 432 200 C440 205 452 195 458 185 M410 150 C425 148 445 146 460 145" />
    <path d="M470 160 C465 190 480 205 495 185 C500 175 503 165 503 160 C500 190 505 205 520 195" />
    <path d="M560 170 C545 155 525 170 532 190 C538 205 560 198 565 170 C568 140 572 110 575 95 C570 140 568 180 585 200" />
    <path d="M600 165 C598 180 600 195 610 198 M603 140 L605 142" />
    <path d="M640 168 C622 168 618 198 636 198 C652 198 655 168 640 168 C660 170 675 165 690 150" />
    <!-- underline flourish -->
    <path d="M80 255 C250 235 450 225 640 235" />
  </svg>
</template>

<style scoped>
.signature { display: block; width: 100%; height: auto; overflow: visible; }
</style>
