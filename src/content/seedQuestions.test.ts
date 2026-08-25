import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { SEED_QUESTIONS } from './seedQuestions'
import flagManifest from './data/flags.generated.json'
import soundManifest from './data/sounds.generated.json'
import type { GameType } from '../domain/questions'

const EXPECTED_COUNTS: Record<GameType, number> = {
  picture: 100,
  'who-am-i': 100,
  themed: 100,
  'lie-detector': 100,
  sound: 100,
  emoji: 100,
}

describe('seed question pool', () => {
  it('contains the expected number of unique questions per game', () => {
    const counts = SEED_QUESTIONS.reduce<Partial<Record<GameType, number>>>((result, question) => {
      result[question.type] = (result[question.type] ?? 0) + 1
      return result
    }, {})

    expect(SEED_QUESTIONS).toHaveLength(600)
    expect(counts).toEqual(EXPECTED_COUNTS)
    expect(new Set(SEED_QUESTIONS.map((question) => question.id)).size).toBe(SEED_QUESTIONS.length)
  })

  it('provides valid common fields and type-specific payloads', () => {
    for (const question of SEED_QUESTIONS) {
      expect(question.id.length).toBeGreaterThan(3)
      expect(question.prompt.length).toBeGreaterThan(5)
      expect(question.answer.length).toBeGreaterThan(0)
      expect(question.difficulty).toBeGreaterThanOrEqual(1)
      expect(question.difficulty).toBeLessThanOrEqual(5)

      if (question.type === 'picture') {
        expect(question.imageUrl).toMatch(/^\/media\/images\/flags\/[a-z]{2}\.svg$/)
        expect(question.imageAlt).toContain(question.answer)
      }
      if (question.type === 'who-am-i') expect(question.hints).toHaveLength(8)
      if (question.type === 'themed') expect(question.theme.length).toBeGreaterThan(2)
      if (question.type === 'lie-detector') {
        expect(question.statements).toHaveLength(3)
        expect(question.lieIndex).toBeGreaterThanOrEqual(0)
        expect(question.lieIndex).toBeLessThanOrEqual(2)
        expect(question.explanation.length).toBeGreaterThan(5)
      }
      if (question.type === 'sound') expect(question.media.url).toMatch(/^\/media\/sounds\/.+\.(ogg|oga|wav|mp3|webm|opus)$/)
      if (question.type === 'emoji') expect(question.emojis.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('provides 100 unique, documented local flag files', () => {
    expect(flagManifest).toHaveLength(100)
    expect(new Set(flagManifest.map((flag) => flag.cca2)).size).toBe(100)
    expect(new Set(flagManifest.map((flag) => flag.file)).size).toBe(100)

    for (const flag of flagManifest) {
      const filePath = path.resolve('public', flag.file.replace(/^\//, ''))
      expect(statSync(filePath).size).toBe(flag.bytes)
      expect(createHash('sha256').update(readFileSync(filePath)).digest('hex')).toBe(flag.sha256)
      expect(flag.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(flag.sourceUrl).toMatch(/^https:\/\/flagcdn\.com\/[a-z]{2}\.svg$/)
      expect(flag.provenanceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
      expect(flag.rightsNote.length).toBeGreaterThan(20)
    }
  })

  it('publishes the derived country database with its ODbL offer', () => {
    const database = JSON.parse(readFileSync(path.resolve('public/data/countries.generated.json'), 'utf8'))

    expect(database.license).toContain('ODbL')
    expect(database.licenseUrl).toBe('https://opendatacommons.org/licenses/odbl/1-0/')
    expect(database.source).toBe('https://github.com/mledoze/countries')
    expect(database.transformations.length).toBeGreaterThan(40)
    expect(database.countries.length).toBeGreaterThanOrEqual(100)
  })

  it('provides 100 unique, licensed local sound files', () => {
    expect(soundManifest).toHaveLength(100)
    expect(new Set(soundManifest.map((sound) => sound.id)).size).toBe(100)
    expect(new Set(soundManifest.map((sound) => sound.file)).size).toBe(100)
    expect(new Set(soundManifest.map((sound) => sound.sha256)).size).toBe(100)

    for (const sound of soundManifest) {
      const filePath = path.resolve('public', sound.file.replace(/^\//, ''))
      expect(statSync(filePath).size).toBe(sound.bytes)
      expect(createHash('sha256').update(readFileSync(filePath)).digest('hex')).toBe(sound.sha256)
      expect(sound.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(sound.license).toMatch(/^(CC0|Public domain|CC BY(?:-SA)?(?: \d\.\d)?)$/i)
      expect(sound.sourceUrl).toMatch(/^https?:\/\//)
      expect(sound.title.trim().length).toBeGreaterThan(0)
      expect(sound.artist.trim().length).toBeGreaterThan(0)
      if (/^CC BY/i.test(sound.license)) expect(sound.credit.trim().length).toBeGreaterThan(0)
    }

    const soundQuestions = SEED_QUESTIONS.filter((question) => question.type === 'sound')
    for (const question of soundQuestions) {
      expect(question.attribution?.creditId).toBe(question.id)
      expect(question.attribution?.sourceUrl).toMatch(/^https?:\/\//)
      expect(question.attribution?.licenseUrl).toMatch(/^https?:\/\//)
      expect(question.attribution?.modifications).toContain('ohne weitere Bearbeitung')
    }
  })
})