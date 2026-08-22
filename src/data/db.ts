import Dexie, { type EntityTable } from 'dexie'
import { RETIRED_SEED_IDS, SEED_QUESTIONS } from '../content/seedQuestions'
import type { GameType, QuizQuestion } from '../domain/questions'
import { selectQuestions, type PlayHistoryEntry } from '../services/questionSelector'

class PubQuizDatabase extends Dexie {
  questions!: EntityTable<QuizQuestion, 'id'>
  history!: EntityTable<PlayHistoryEntry, 'questionId'>

  constructor() {
    super('pubquiz-master')
    this.version(1).stores({
      questions: 'id, type, category',
      history: 'questionId, lastPlayedAt, playCount',
    })
  }
}

export const db = new PubQuizDatabase()

export async function prepareDatabase() {
  await db.transaction('rw', db.questions, async () => {
    await db.questions.bulkDelete(RETIRED_SEED_IDS)
    await db.questions.bulkPut(SEED_QUESTIONS)
  })
}

export async function getPoolCounts(): Promise<Record<GameType, number>> {
  const gameTypes: GameType[] = ['picture', 'who-am-i', 'themed', 'lie-detector', 'sound', 'emoji']
  const entries = await Promise.all(
    gameTypes.map(async (type) => [type, await db.questions.where('type').equals(type).count()] as const),
  )
  return Object.fromEntries(entries) as Record<GameType, number>
}

export async function createQuestionSet(type: GameType, count: number) {
  const [pool, history] = await Promise.all([
    db.questions.where('type').equals(type).toArray(),
    db.history.toArray(),
  ])
  return selectQuestions(pool, history, count)
}

export async function recordQuestionPlayed(questionId: string) {
  const current = await db.history.get(questionId)
  await db.history.put({
    questionId,
    lastPlayedAt: Date.now(),
    playCount: (current?.playCount ?? 0) + 1,
  })
}