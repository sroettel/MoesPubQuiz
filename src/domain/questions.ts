export type GameType =
  | 'picture'
  | 'who-am-i'
  | 'themed'
  | 'lie-detector'
  | 'sound'
  | 'emoji'

export interface GameDefinition {
  type: GameType
  title: string
  description: string
  eyebrow: string
  accent: string
  defaultRounds: number
  onlineOnly?: boolean
}

interface QuestionBase {
  id: string
  prompt: string
  answer: string
  acceptedAnswers?: string[]
  category: string
  difficulty: 1 | 2 | 3 | 4 | 5
  source?: string
}

export interface PictureQuestion extends QuestionBase {
  type: 'picture'
  imageUrl: string
  imageAlt: string
}

export interface WhoAmIQuestion extends QuestionBase {
  type: 'who-am-i'
  hints: [string, string, ...string[]]
}

export interface ThemedQuestion extends QuestionBase {
  type: 'themed'
  theme: string
}

export interface LieDetectorQuestion extends QuestionBase {
  type: 'lie-detector'
  statements: [string, string, string]
  lieIndex: 0 | 1 | 2
  explanation: string
}

export interface SoundQuestion extends QuestionBase {
  type: 'sound'
  media: {
    kind: 'audio' | 'youtube'
    url: string
    startAt?: number
    endAt?: number
  }
}

export interface EmojiQuestion extends QuestionBase {
  type: 'emoji'
  emojis: [string, string, string, string, ...string[]]
}

export type QuizQuestion =
  | PictureQuestion
  | WhoAmIQuestion
  | ThemedQuestion
  | LieDetectorQuestion
  | SoundQuestion
  | EmojiQuestion

export const GAME_DEFINITIONS: readonly GameDefinition[] = [
  {
    type: 'picture',
    eyebrow: 'Hinsehen',
    title: 'Picture Quiz',
    description: 'Flaggen erkennen.',
    accent: '#d73a31',
    defaultRounds: 10,
  },
  {
    type: 'who-am-i',
    eyebrow: 'Hinweis für Hinweis',
    title: 'Who Am I?',
    description: 'Eine gesuchte Person mit möglichst wenigen Hinweisen erraten.',
    accent: '#157a72',
    defaultRounds: 10,
  },
  {
    type: 'themed',
    eyebrow: 'Ein Thema, zehn Fragen',
    title: 'Themed Rounds',
    description: 'Von 80er-Action bis Cocktails: Wissen mit Tiefgang.',
    accent: '#bc7b16',
    defaultRounds: 10,
  },
  {
    type: 'lie-detector',
    eyebrow: 'Zwei Wahrheiten, eine Lüge',
    title: 'Lie Detector',
    description: 'Drei Aussagen prüfen und die erfundene entlarven.',
    accent: '#7c3f68',
    defaultRounds: 10,
  },
  {
    type: 'sound',
    eyebrow: 'Ohren auf',
    title: 'Guess the Sound',
    description: 'Alltagsgeräusche und bekannte Klänge am Ton erkennen.',
    accent: '#28649b',
    defaultRounds: 10,
  },
  {
    type: 'emoji',
    eyebrow: 'Vier Zeichen, ein Titel',
    title: 'Emoji Quiz',
    description: 'Filme und Serien ausschließlich als Emoji-Rätsel.',
    accent: '#518134',
    defaultRounds: 10,
  },
] as const