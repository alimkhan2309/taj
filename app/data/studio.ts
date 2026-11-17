// Studio facts shared by the homepage and the About page. One source, so a number changes everywhere at once.
// Only client-confirmed figures live here (not "2000+ weddings" / "382 awards").
// OPEN WITH CLIENT: "1997" vs "25 years" vs "22+ years" — these disagree (1997 → 2026 is 29 years). Until resolved,
// prefer the founding year over a years-count, since the year cannot go stale.

export const FOUNDED = 1997

export type Stat = { value: string; label: string }

export const stats: Stat[] = [
  { value: '22+', label: 'years' },
  { value: '18', label: 'countries' },
  { value: '1,200+', label: 'weddings' }
]

// Press / award marks. width/height are the intrinsic size of the PNG scaled to the strip's 138px design height.
// `height` below is the *optical* display height in the strip: wide or boxed marks are set smaller so all five carry
// similar visual weight (equal heights make the wide "Admired in Africa" crest look twice as loud as the rest).
export type PressMark = { name: string; src: string; width: number; height: number; display: number }

export const pressMarks: PressMark[] = [
  { name: 'MyWed', src: '/images/press/mywed.png', width: 113, height: 138, display: 86 },
  { name: 'Admired in Africa', src: '/images/press/admired-in-africa.png', width: 230, height: 118, display: 66 },
  { name: 'Fearless Photographers', src: '/images/press/fearless.png', width: 138, height: 138, display: 72 },
  { name: 'WeddingSutra Photography Awards', src: '/images/press/weddingsutra.png', width: 161, height: 138, display: 76 },
  { name: 'Wedisson Awards winner', src: '/images/press/wedisson.png', width: 194, height: 138, display: 70 }
]

// Recognition timeline, oldest first. Mirrors the cards in Our Journey (which adds its own layout fields).
export type Award = { year?: string; title: string; by?: string }

export const awards: Award[] = [
  { year: '1997', title: 'Manish Patel begins photographing weddings' },
  { year: '2018', title: 'Wedding Photographer of the Year', by: 'MyWed' },
  { year: '2018–2020', title: 'MyWed Award winner', by: 'MyWed' },
  { year: '2018–2022', title: 'Fearless Award winner', by: 'Fearless Photographers' },
  { year: '2020', title: 'One of India’s top 3 wedding photographers' },
  { year: '2020–2021', title: 'WeddingSutra Photography Awards winner', by: 'WeddingSutra' },
  { title: 'Canon EOS influencer, India', by: 'Canon' }
]

// Studio address (client-supplied, 2026-11-17). Also used to point at the Google listing.
export const ADDRESS = '401 Sakar Complex, near Rupali Nahar, Bhatar Road, Surat, Gujarat 395001'

// Google reviews. `rating` and `count` stay null until copied from the studio's Google Business Profile: never round
// up or invent them. While null, the Testimonials section shows a plain "Read our Google reviews" link instead.
export type GoogleReviews = { rating: string | null; count: string | null; url: string }

export const googleReviews: GoogleReviews = {
  rating: null,
  count: null,
  url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`The Taj Studio, ${ADDRESS}`)}`
}
