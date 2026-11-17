// Services page copy (one entry per chapter, in page order). Replace with CMS queries returning the same shape.
// !! DRAFT COPY !! Written for client sign-off. The film deliverables (highlight film, ceremony edit, teaser) are
// assumptions until the studio confirms what it offers. No prices anywhere: the studio quotes per day.
import type { ImgRatio } from '~/composables/useLightbox'

export type ServiceLink = { label: string; to: string }
export type ServiceShot = { ratio: ImgRatio; alt: string; src?: string }

export type Service = {
  id: 'wedding' | 'film' | 'pre-wedding' | 'family'
  name: string
  kind: string // short descriptor in the index ("Photography")
  flagship?: boolean
  tagline?: string
  body: string
  points: string[]
  primary: ServiceLink
  secondary?: ServiceLink
  shots: ServiceShot[]
}

export const services: Service[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    kind: 'Photography',
    flagship: true,
    body: 'Indian weddings run for days, and the photographs that matter most are rarely the posed ones. We cover every function and stay close to the small moments in between: a grandmother’s hand, a look across the mandap.',
    points: [
      'Every function, from haldi and mehendi to the vidaai',
      'Candid coverage and family portraits by one team',
      'An edited gallery on a timeline agreed up front'
    ],
    primary: { label: 'See wedding photography', to: '/portfolio/photos' },
    secondary: { label: 'Inquire about your date', to: '/contact' },
    shots: [
      { ratio: '3/2', alt: 'Wedding photograph' },
      { ratio: '4/5', alt: 'Wedding detail photograph' },
      { ratio: '1/1', alt: 'Wedding portrait' }
    ]
  },
  {
    id: 'film',
    name: 'Film',
    kind: 'Cinematography',
    body: 'Wedding films cut like short cinema. The vows, the speeches and the dance floor, paced and scored so you will want to watch it again in twenty years.',
    points: ['Highlight film: the whole wedding in a few minutes', 'Ceremony edit: the rituals in full, for the family', 'Teaser: a short cut to share first'],
    primary: { label: 'Watch our films', to: '/portfolio/films' },
    shots: [{ ratio: '16/9', alt: 'The Taj Studio showreel' }]
  },
  {
    id: 'pre-wedding',
    name: 'Pre-wedding',
    kind: 'Couple shoots',
    tagline: 'Before the big day, just the two of you.',
    body: 'A day or two away from the rituals and the guest lists. We find the place and the hour of light, plan the looks around them, then step back so the photographs feel like yours.',
    points: ['Your city or a destination', 'Location and light planned together', 'Looks styled around the place'],
    primary: { label: 'Explore pre-weddings', to: '/pre-wedding' },
    secondary: { label: 'Plan your shoot', to: '/contact' },
    shots: [
      { ratio: '4/5', alt: 'Pre-wedding photograph' },
      { ratio: '3/2', alt: 'Pre-wedding photograph' }
    ]
  },
  {
    id: 'family',
    name: 'Family',
    kind: 'Portraits',
    body: 'Anniversaries, new arrivals, three generations in one frame. Unhurried portraits at home or somewhere that means something to you.',
    points: [],
    primary: { label: 'Book a family session', to: '/contact' },
    secondary: { label: 'See family work', to: '/portfolio/photos' },
    shots: [
      { ratio: '1/1', alt: 'Family portrait' },
      { ratio: '4/5', alt: 'Family portrait' }
    ]
  }
]
