<script setup lang="ts">
// "The Taj Studio" signature, vectorised from the client's artwork (scripts/signature, data in ~/data/signature).
// What the visitor sees is `outline`: the exact filled shape. How it writes itself: `strokes`, centrelines from a
// skeleton of the same artwork, drawn inside a mask that reveals the outline (animate with signatureTimeline()).
// Static (no JS, reduced motion), the mask's full-cover rect shows the whole signature.
// `weight` thickens the ink, in viewBox units (1000 wide; native ink is ~3.9). Keep 0 from ~350px wide up (true to the
// artwork); add just enough below that to stay over one device pixel: ~2 at 240px, ~2.5 at 200px.
import { SIGNATURE } from '~/data/signature'

const props = withDefaults(defineProps<{ weight?: number }>(), { weight: 0 })

const maskId = `sig-${useId()}`
const [, , vbW = 1000, vbH = 240] = SIGNATURE.viewBox.split(' ').map(Number)
// Mask strokes must cover the ink plus ball terminals; 2.4x the average width does, without revealing neighbours early.
const maskWidth = computed(() => SIGNATURE.thickness * 2.4 + props.weight)
const pad = 20
</script>

<template>
  <svg class="signature" :viewBox="SIGNATURE.viewBox" role="img" aria-label="The Taj Studio signature">
    <defs>
      <mask :id="maskId" maskUnits="userSpaceOnUse" :x="-pad" :y="-pad" :width="vbW + pad * 2" :height="vbH + pad * 2">
        <rect class="sig-fill" :x="-pad" :y="-pad" :width="vbW + pad * 2" :height="vbH + pad * 2" fill="#fff" />
        <path v-for="(d, i) in SIGNATURE.strokes" :key="i" class="sig-stroke" :d="d" fill="none" stroke="#fff"
          :stroke-width="maskWidth" stroke-linecap="round" stroke-linejoin="round" />
      </mask>
    </defs>
    <path :d="SIGNATURE.outline" fill="currentColor" fill-rule="evenodd" :mask="`url(#${maskId})`"
      :stroke="weight ? 'currentColor' : 'none'" :stroke-width="weight" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.signature { display: block; width: 100%; height: auto; overflow: visible; }
</style>
