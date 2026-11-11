// Case study summaries (homepage switcher; later the /case-studies index and "More stories").
// Replace with CMS queries returning the same shape.
// !! PLACEHOLDER !! Only "Mohil & Harvi" is real. Stories two and three are layout stand-ins.

export type CaseStudy = {
  slug: string
  type: string
  names: string
  place?: string
  caption: string
  quote: string
  images?: string[] // 3 images: [tall lead, top-right, bottom-right]; omit while placeholder
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'mohil-harvi',
    type: 'Pre-wedding',
    names: 'Mohil & Harvi',
    place: 'Udaipur',
    caption: 'Two days in Udaipur, captured start to finish.',
    quote: 'Manish Patel & Team is such a talent. All the hard work they do reflects on the results they have been giving. We look forward to work with you over and over again.'
  },
  { slug: 'story-two', type: 'Wedding', names: 'Couple names', caption: 'One-line context for this wedding.', quote: 'Real quote from the couple goes here.' },
  { slug: 'story-three', type: 'Wedding', names: 'Couple names', caption: 'One-line context for this wedding.', quote: 'Real quote from the couple goes here.' }
]
