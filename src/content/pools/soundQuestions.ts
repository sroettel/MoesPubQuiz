import type { SoundQuestion } from '../../domain/questions'
import { soundLicenseUrl } from '../soundLicenses'
import soundManifest from '../data/sounds.generated.json'

interface SoundManifestEntry {
  id: string
  answer: string
  category: string
  file: string
  title: string
  sourceUrl: string
  license: string
  artist: string
  credit: string
  duration: number
  bytes: number
  sha256: string
  pageId: number
}

export const SOUND_QUESTIONS: SoundQuestion[] = (soundManifest as SoundManifestEntry[]).map((sound, index) => ({
  id: sound.id,
  type: 'sound',
  prompt: 'Welches Geräusch hörst du?',
  answer: sound.answer,
  category: sound.category,
  difficulty: (1 + (index % 3)) as 1 | 2 | 3,
  media: {
    kind: 'audio',
    url: `${import.meta.env.BASE_URL}${sound.file.replace(/^\//, '')}`,
    endAt: sound.duration || undefined,
  },
  source: `${sound.title} — ${sound.artist} — ${sound.license} — ${sound.sourceUrl}`,
  attribution: {
    creditId: sound.id,
    title: sound.title,
    creator: sound.artist,
    credit: sound.credit || undefined,
    sourceUrl: sound.sourceUrl,
    license: sound.license,
    licenseUrl: soundLicenseUrl(sound.license, sound.sourceUrl),
    modifications: 'Originaldatei ohne weitere Bearbeitung verwendet.',
  },
}))