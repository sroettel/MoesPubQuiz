import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GameType, PictureQuestion, SoundQuestion } from '../domain/questions'
import { createAiQuestionSet, OPENROUTER_MODEL, OPENROUTER_PAID_MODEL } from './openRouterQuestions'

function mockResponse(content: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 401,
    headers: { get: () => null },
    json: async () => ok
      ? { model: OPENROUTER_MODEL, choices: [{ message: { content: JSON.stringify(content) } }] }
      : { error: { message: 'Ungültiger API-Key' } },
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('OpenRouter question generation', () => {
  it('uses the free model router directly', () => {
    expect(OPENROUTER_MODEL).toBe('openrouter/free')
  })

  it('sends the free router as the selected model', async () => {
    mockResponse({ questions: [{ prompt: 'Welche Stadt ist die Hauptstadt von Frankreich?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' }] })

    await createAiQuestionSet({ type: 'themed', count: 1, apiKey: 'secret', topic: '', assets: [] })

    const request = vi.mocked(fetch).mock.calls[0][1]
    const body = JSON.parse(String(request?.body)) as {
      model: string
      models?: string[]
      max_tokens: number
      reasoning: { effort: string; exclude: boolean }
      response_format: { type: string }
    }
    expect(body.model).toBe(OPENROUTER_MODEL)
    expect(body.models).toBeUndefined()
    expect(body.max_tokens).toBe(8000)
    expect(body.reasoning).toEqual({ effort: 'high', exclude: true })
    expect(body.response_format).toEqual({ type: 'json_object' })
  })

  it('uses only GPT-5.4 Mini for paid generation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        model: OPENROUTER_PAID_MODEL,
        choices: [{ message: { content: JSON.stringify({ questions: [{ prompt: 'Welche Stadt ist die Hauptstadt von Frankreich?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' }] }) } }],
      }),
    }))

    const [question] = await createAiQuestionSet({ type: 'themed', count: 1, apiKey: 'paid-secret', topic: '', assets: [], modelTier: 'paid' })

    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as { model: string; models?: string[] }
    expect(body.model).toBe(OPENROUTER_PAID_MODEL)
    expect(body.models).toBeUndefined()
    expect(question.source).toBe(`KI-generiert mit OpenRouter / ${OPENROUTER_PAID_MODEL}`)
  })

  it('creates and validates a German Who Am I question with eight hints', async () => {
    mockResponse({
      questions: [{
        prompt: 'Welche Person wird gesucht?',
        answer: 'Marie Curie',
        category: 'Wissenschaft',
        difficulty: 2,
        hints: Array.from({ length: 8 }, (_, index) => `Aussagekräftiger Hinweis Nummer ${index + 1}`),
      }],
    })

    const questions = await createAiQuestionSet({ type: 'who-am-i', count: 1, apiKey: 'secret', topic: 'Wissenschaft', assets: [] })

    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({ type: 'who-am-i', answer: 'Marie Curie', source: `KI-generiert mit OpenRouter / ${OPENROUTER_MODEL}` })
    expect(questions[0].type === 'who-am-i' && questions[0].hints).toHaveLength(8)
  })

  it('keeps the trusted picture prompt when the generated prompt does not match the asset', async () => {
    const asset: PictureQuestion = {
      id: 'picture-de',
      type: 'picture',
      prompt: 'Standardfrage',
      answer: 'Deutschland',
      category: 'Flaggen',
      difficulty: 1,
      imageUrl: 'https://flagcdn.com/w1280/de.png',
      imageAlt: 'Flagge von Deutschland',
      source: 'Flagcdn',
    }
    mockResponse({ questions: [{ assetId: asset.id, prompt: 'Wie hieß der am längsten amtierende Bundeskanzler?', category: 'Politik', difficulty: 2 }] })

    const [question] = await createAiQuestionSet({ type: 'picture', count: 1, apiKey: 'secret', topic: 'Politiker', assets: [asset] })

    expect(question).toMatchObject({ type: 'picture', answer: 'Deutschland', imageUrl: asset.imageUrl, prompt: 'Standardfrage', category: 'Flaggen', difficulty: 1 })
  })

  it('validates themed, lie detector, and emoji question shapes', async () => {
    const cases: Array<{ type: GameType; question: object; expectedAnswer: string }> = [
      {
        type: 'themed',
        question: { prompt: 'Welcher Film machte den Satz Yippie-Ya-Yeah bekannt?', answer: 'Stirb langsam', category: 'Film', difficulty: 2, theme: '80er-Actionfilme' },
        expectedAnswer: 'Stirb langsam',
      },
      {
        type: 'lie-detector',
        question: { prompt: 'Welche Aussage ist gelogen?', answer: 'Aussage 2', category: 'Film', difficulty: 3, statements: ['Der Film erschien 1988.', 'Die Handlung spielt in Paris.', 'Bruce Willis spielt die Hauptrolle.'], lieIndex: 1, explanation: 'Die Handlung spielt in Los Angeles.' },
        expectedAnswer: 'Aussage 2',
      },
      {
        type: 'emoji',
        question: { prompt: 'Welcher Film ist dargestellt?', answer: 'Stirb langsam', category: 'Film', difficulty: 2, emojis: ['🏢', '🎄', '👮', '💥'] },
        expectedAnswer: 'Stirb langsam',
      },
    ]

    for (const testCase of cases) {
      mockResponse({ questions: [testCase.question] })
      const [question] = await createAiQuestionSet({ type: testCase.type, count: 1, apiKey: 'secret', topic: '80er-Actionfilme', assets: [] })
      expect(question.type).toBe(testCase.type)
      expect(question.answer).toBe(testCase.expectedAnswer)
    }
  })

  it('keeps the licensed audio and answer selected from the sound pool', async () => {
    const asset: SoundQuestion = {
      id: 'sound-bell',
      type: 'sound',
      prompt: 'Welches Geräusch hörst du?',
      answer: 'Fahrradklingel',
      category: 'Verkehr',
      difficulty: 1,
      media: { kind: 'audio', url: '/media/sounds/bell.wav' },
      source: 'CC0',
    }
    mockResponse({ questions: [{ assetId: asset.id, prompt: 'Welches Verkehrsmittel kündigt sich hier an?', category: 'Verkehr', difficulty: 2 }] })

    const [question] = await createAiQuestionSet({ type: 'sound', count: 1, apiKey: 'secret', topic: '', assets: [asset] })

    expect(question).toMatchObject({ type: 'sound', answer: 'Fahrradklingel', media: asset.media })
  })

  it('surfaces OpenRouter API errors', async () => {
    mockResponse({}, false)
    await expect(createAiQuestionSet({ type: 'emoji', count: 1, apiKey: 'bad', topic: '', assets: [] })).rejects.toThrow('Der OpenRouter API-Key ist ungültig oder wurde widerrufen.')
  })

  it('explains how to resolve insufficient credits for paid generation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      headers: { get: () => null },
      json: async () => ({ error: { code: 402, message: 'Insufficient credits', metadata: { error_type: 'payment_required' } } }),
    }))

    await expect(createAiQuestionSet({ type: 'emoji', count: 1, apiKey: 'limited', topic: '', assets: [], modelTier: 'paid' }))
      .rejects.toThrow('Bitte unter openrouter.ai/credits Guthaben aufladen oder das Kreditlimit des API-Keys erhöhen.')
  })

  it('turns provider rate limits into an actionable message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => '30' },
      json: async () => ({ error: { code: 429, message: 'Provider returned error' } }),
    }))

    await expect(createAiQuestionSet({ type: 'emoji', count: 1, apiKey: 'secret', topic: '', assets: [] }))
      .rejects.toThrow('Die kostenlosen KI-Anbieter sind momentan ausgelastet. Bitte in 30 Sekunden erneut versuchen.')
  })

  it('handles provider errors embedded in an HTTP 200 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ choices: [{ error: { code: 503, message: 'Provider returned error' } }] }),
    }))

    await expect(createAiQuestionSet({ type: 'emoji', count: 1, apiKey: 'secret', topic: '', assets: [] }))
      .rejects.toThrow('Der kostenlose KI-Anbieter ist momentan überlastet. Bitte gleich erneut versuchen.')
  })

  it('attributes questions to the free router that served the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        model: OPENROUTER_MODEL,
        choices: [{ message: { content: JSON.stringify({ questions: [{ prompt: 'Welche Stadt ist die Hauptstadt von Frankreich?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' }] }) } }],
      }),
    }))

    const [question] = await createAiQuestionSet({ type: 'themed', count: 1, apiKey: 'secret', topic: '', assets: [] })
    expect(question.source).toBe(`KI-generiert mit OpenRouter / ${OPENROUTER_MODEL}`)
  })

  it('retries the free router when the first request returns no content', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({ choices: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          model: OPENROUTER_MODEL,
          choices: [{ message: { content: JSON.stringify({ questions: [{ prompt: 'Welche Stadt ist die Hauptstadt von Frankreich?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' }] }) } }],
        }),
      }))

    const [question] = await createAiQuestionSet({ type: 'themed', count: 1, apiKey: 'secret', topic: '', assets: [] })

    expect(fetch).toHaveBeenCalledTimes(2)
    const retryBody = JSON.parse(String(vi.mocked(fetch).mock.calls[1][1]?.body)) as { model: string }
    expect(retryBody.model).toBe(OPENROUTER_MODEL)
    expect(question.source).toBe(`KI-generiert mit OpenRouter / ${OPENROUTER_MODEL}`)
  })

  it('explains when every provider exhausts its output budget', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ choices: [{ message: { content: '' }, finish_reason: 'length' }] }),
    }))

    await expect(createAiQuestionSet({ type: 'themed', count: 1, apiKey: 'secret', topic: '', assets: [] }))
      .rejects.toThrow('Die kostenlosen KI-Modelle haben ihr Antwortlimit erreicht. Bitte weniger Fragen wählen und erneut versuchen.')
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('retries with the free router when the first response is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({ model: OPENROUTER_MODEL, choices: [{ message: { content: 'Leider keine JSON-Antwort.' } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          model: OPENROUTER_MODEL,
          choices: [{ message: { content: JSON.stringify({ questions: [{ prompt: 'Welche Stadt ist die Hauptstadt von Frankreich?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' }] }) } }],
        }),
      }))

    const [question] = await createAiQuestionSet({ type: 'themed', count: 1, apiKey: 'secret', topic: '', assets: [] })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(question.answer).toBe('Paris')
  })

  it('retries with the free router when the first response contains duplicate answers', async () => {
    const duplicateQuestions = [
      { prompt: 'Welche Stadt ist die Hauptstadt von Frankreich?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' },
      { prompt: 'In welcher Stadt steht der Eiffelturm?', answer: 'Paris', category: 'Geografie', difficulty: 1, theme: 'Europa' },
    ]
    const uniqueQuestions = [
      duplicateQuestions[0],
      { prompt: 'Welche Stadt ist die Hauptstadt von Italien?', answer: 'Rom', category: 'Geografie', difficulty: 1, theme: 'Europa' },
    ]
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({ model: OPENROUTER_MODEL, choices: [{ message: { content: JSON.stringify({ questions: duplicateQuestions }) } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({ model: OPENROUTER_MODEL, choices: [{ message: { content: JSON.stringify({ questions: uniqueQuestions }) } }] }),
      }))

    const questions = await createAiQuestionSet({ type: 'themed', count: 2, apiKey: 'secret', topic: '', assets: [] })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(questions.map((question) => question.answer)).toEqual(['Paris', 'Rom'])
  })
})