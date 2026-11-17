// Testimonials (homepage). Replace with CMS queries returning the same shape.
// !! PLACEHOLDER !! Only the first is real: Mohil & Harvi's quote, shared with their case study (one source, so it
// can't drift). The other two wait for real Google reviews: paste the reviewer's exact words, their name as Google
// shows it, and the month. Never paraphrase or invent a review.
import { caseStudies } from './case-studies'

export type Testimonial = {
  quote: string
  name: string
  meta: string // e.g. "Pre-wedding · Udaipur" or "Google review · March 2026"
  avatar?: string // square photo; omit to show initials
  story?: string // route of a related case study
}

const mohilHarvi = caseStudies.find((c) => c.slug === 'mohil-harvi')

export const testimonials: Testimonial[] = [
  ...(mohilHarvi
    ? [{
        quote: mohilHarvi.quote,
        name: mohilHarvi.names,
        meta: [mohilHarvi.type, mohilHarvi.place].filter(Boolean).join(' · '),
        story: `/case-studies/${mohilHarvi.slug}`
      }]
    : []),
  { quote: 'Real Google review goes here, in the reviewer’s own words.', name: 'Reviewer name', meta: 'Google review · Month Year' },
  { quote: 'Real Google review goes here, in the reviewer’s own words.', name: 'Reviewer name', meta: 'Google review · Month Year' }
]
