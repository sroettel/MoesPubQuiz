import type { QuizQuestion } from '../domain/questions'

export interface PlayHistoryEntry {
  questionId: string
  lastPlayedAt: number
  playCount: number
}

export function selectQuestions(
  pool: QuizQuestion[],
  history: PlayHistoryEntry[],
  count: number,
  random: () => number = Math.random,
): QuizQuestion[] {
  const historyById = new Map(history.map((entry) => [entry.questionId, entry]))
  const randomOrder = new Map(pool.map((question) => [question.id, random()]))

  return [...pool]
    .sort((left, right) => {
      const leftHistory = historyById.get(left.id)
      const rightHistory = historyById.get(right.id)

      if (!leftHistory && rightHistory) return -1
      if (leftHistory && !rightHistory) return 1
      if (leftHistory && rightHistory) {
        if (leftHistory.playCount !== rightHistory.playCount) {
          return leftHistory.playCount - rightHistory.playCount
        }
        if (leftHistory.lastPlayedAt !== rightHistory.lastPlayedAt) {
          return leftHistory.lastPlayedAt - rightHistory.lastPlayedAt
        }
      }

      return (randomOrder.get(left.id) ?? 0) - (randomOrder.get(right.id) ?? 0)
    })
    .slice(0, Math.max(0, count))
}