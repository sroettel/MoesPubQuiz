import { describe, expect, it } from 'vitest'
import type { ThemedQuestion } from '../domain/questions'
import { selectQuestions, type PlayHistoryEntry } from './questionSelector'

const questions: ThemedQuestion[] = ['one', 'two', 'three'].map((id) => ({
  id,
  type: 'themed',
  prompt: `Frage ${id}`,
  answer: id,
  category: 'Test',
  theme: 'Test',
  difficulty: 1,
}))

describe('selectQuestions', () => {
  it('selects unseen questions before played questions', () => {
    const history: PlayHistoryEntry[] = [
      { questionId: 'one', playCount: 1, lastPlayedAt: 100 },
      { questionId: 'two', playCount: 1, lastPlayedAt: 200 },
    ]

    expect(selectQuestions(questions, history, 1, () => 0)[0].id).toBe('three')
  })

  it('prefers the least frequently played question', () => {
    const history: PlayHistoryEntry[] = [
      { questionId: 'one', playCount: 3, lastPlayedAt: 100 },
      { questionId: 'two', playCount: 1, lastPlayedAt: 200 },
      { questionId: 'three', playCount: 2, lastPlayedAt: 300 },
    ]

    expect(selectQuestions(questions, history, 1, () => 0)[0].id).toBe('two')
  })

  it('prefers the oldest question when play counts are equal', () => {
    const history: PlayHistoryEntry[] = [
      { questionId: 'one', playCount: 2, lastPlayedAt: 300 },
      { questionId: 'two', playCount: 2, lastPlayedAt: 100 },
      { questionId: 'three', playCount: 2, lastPlayedAt: 200 },
    ]

    expect(selectQuestions(questions, history, 3, () => 0).map((question) => question.id)).toEqual([
      'two',
      'three',
      'one',
    ])
  })
})