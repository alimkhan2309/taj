// Portfolio data layer. Pages import only from here, so this file can later be replaced by Sanity queries
// returning the same shapes.
//
// !! PLACEHOLDER DATA !! Couples, locations, runtimes and video IDs below are invented so layouts can be judged.
// Only "Mohil & Harvi" (pre-wedding, Udaipur, case study `mohil-harvi`) is real.

export type PhotoType = 'wedding' | 'pre-wedding' | 'family'
export type PhotoRatio = '4/5' | '3/2' | '1/1'

export type PhotoItem = {
  id: string
  type: PhotoType
  couple: string
  ratio: PhotoRatio
  caseStudySlug?: string
  src?: string // /public path or CMS URL; omit while placeholder
}

export type FilmItem = {
  id: string
  couple: string
  location: string
  runtime: string
  provider: 'vimeo' | 'youtube'
  videoId: string // PLACEHOLDER-* until real IDs arrive; players show a slate instead of an embed
}

export const photoTypes: { value: PhotoType; label: string }[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'pre-wedding', label: 'Pre-wedding' },
  { value: 'family', label: 'Family' }
]

const couples = ['Mohil & Harvi', 'Aarav & Diya', 'Kabir & Meera', 'Rohan & Isha', 'Vivaan & Anaya', 'Arjun & Kavya', 'Dev & Riya', 'The Shah Family', 'The Mehta Family', 'Neil & Tara']
const types: PhotoType[] = ['wedding', 'wedding', 'pre-wedding', 'wedding', 'family', 'pre-wedding']
const ratios: PhotoRatio[] = ['4/5', '3/2', '1/1', '4/5', '4/5', '3/2', '1/1']

// 30 placeholder photos, varied deterministically (no Math.random, so SSR and client agree).
export const photos: PhotoItem[] = Array.from({ length: 30 }, (_, i) => {
  const couple = couples[i % couples.length]!
  const type: PhotoType = couple.includes('Family') ? 'family' : couple === 'Mohil & Harvi' ? 'pre-wedding' : types[i % types.length]!
  return {
    id: `photo-${String(i + 1).padStart(2, '0')}`,
    type,
    couple,
    ratio: ratios[i % ratios.length]!,
    caseStudySlug: couple === 'Mohil & Harvi' ? 'mohil-harvi' : undefined
  }
})

export const films: FilmItem[] = [
  { id: 'film-01', couple: 'Mohil & Harvi', location: 'Udaipur', runtime: '04:12', provider: 'vimeo', videoId: 'PLACEHOLDER-1' },
  { id: 'film-02', couple: 'Aarav & Diya', location: 'Jaipur', runtime: '05:40', provider: 'vimeo', videoId: 'PLACEHOLDER-2' },
  { id: 'film-03', couple: 'Kabir & Meera', location: 'Goa', runtime: '03:58', provider: 'youtube', videoId: 'PLACEHOLDER-3' },
  { id: 'film-04', couple: 'Rohan & Isha', location: 'Surat', runtime: '06:05', provider: 'vimeo', videoId: 'PLACEHOLDER-4' },
  { id: 'film-05', couple: 'Vivaan & Anaya', location: 'Lake Como', runtime: '04:47', provider: 'youtube', videoId: 'PLACEHOLDER-5' },
  { id: 'film-06', couple: 'Arjun & Kavya', location: 'Jodhpur', runtime: '05:12', provider: 'vimeo', videoId: 'PLACEHOLDER-6' },
  { id: 'film-07', couple: 'Dev & Riya', location: 'Mumbai', runtime: '03:36', provider: 'vimeo', videoId: 'PLACEHOLDER-7' }
]

export const isPlaceholderVideo = (f: FilmItem) => f.videoId.startsWith('PLACEHOLDER')

// Embed URL, built only at click time. Privacy-friendly hosts; autoplay is fine because a click started it.
export function filmEmbedUrl(f: FilmItem): string | undefined {
  if (isPlaceholderVideo(f)) return undefined
  return f.provider === 'vimeo'
    ? `https://player.vimeo.com/video/${f.videoId}?autoplay=1&dnt=1&title=0&byline=0`
    : `https://www.youtube-nocookie.com/embed/${f.videoId}?autoplay=1&rel=0&modestbranding=1`
}
