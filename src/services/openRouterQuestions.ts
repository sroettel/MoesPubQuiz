import { z } from 'zod'
import type { GameType, PictureQuestion, QuizQuestion, SoundQuestion } from '../domain/questions'

export const OPENROUTER_MODEL = 'openrouter/free'
export const OPENROUTER_PAID_MODEL = 'openai/gpt-5.4-mini'

export type AiModelTier = 'free' | 'paid'

const difficultySchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
const acceptedAnswersSchema = z.array(z.string().min(1)).max(5).optional()
const commonSchema = {
  prompt: z.string().min(8),
  category: z.string().min(2),
  difficulty: difficultySchema,
}

const generatedSchemas = {
  picture: z.object({
    assetId: z.string().min(1),
    ...commonSchema,
  }),
  'who-am-i': z.object({
    ...commonSchema,
    answer: z.string().min(1),
    acceptedAnswers: acceptedAnswersSchema,
    hints: z.array(z.string().min(5)).length(8),
  }),
  themed: z.object({
    ...commonSchema,
    answer: z.string().min(1),
    acceptedAnswers: acceptedAnswersSchema,
    theme: z.string().min(2),
  }),
  'lie-detector': z.object({
    ...commonSchema,
    answer: z.string().min(1),
    statements: z.tuple([z.string().min(5), z.string().min(5), z.string().min(5)]),
    lieIndex: z.number().int().min(0).max(2),
    explanation: z.string().min(8),
  }),
  sound: z.object({
    assetId: z.string().min(1),
    ...commonSchema,
  }),
  emoji: z.object({
    ...commonSchema,
    answer: z.string().min(1),
    acceptedAnswers: acceptedAnswersSchema,
    emojis: z.array(z.string().min(1)).min(4).max(8),
  }),
} as const

interface OpenRouterResponse {
  model?: string
  choices?: Array<{
    message?: { content?: string }
    error?: OpenRouterError
    finish_reason?: string
  }>
  error?: OpenRouterError
}

interface OpenRouterError {
  code?: number
  message?: string
  metadata?: { error_type?: string }
  availability?: { code?: string; retryable?: boolean; retry_after?: number }
}

function responseShape(type: GameType) {
  const shapes: Record<GameType, string> = {
    picture: '{"questions":[{"assetId":"picture-...","prompt":"...","category":"...","difficulty":2}]}',
    'who-am-i': '{"questions":[{"prompt":"...","answer":"...","acceptedAnswers":["..."],"category":"...","difficulty":2,"hints":["... genau 8 Hinweise ..."]}]}',
    themed: '{"questions":[{"prompt":"...","answer":"...","acceptedAnswers":["..."],"category":"...","difficulty":2,"theme":"..."}]}',
    'lie-detector': '{"questions":[{"prompt":"...","answer":"Aussage 2","category":"...","difficulty":2,"statements":["...","...","..."],"lieIndex":1,"explanation":"..."}]}',
    sound: '{"questions":[{"assetId":"sound-...","prompt":"Welches Geräusch hörst du?","category":"...","difficulty":2}]}',
    emoji: '{"questions":[{"prompt":"Welcher Film oder welche Serie ist dargestellt?","answer":"...","acceptedAnswers":["..."],"category":"Film","difficulty":2,"emojis":["🎬","..."]}]}',
  }
  return shapes[type]
}

function mediaCatalog(type: GameType, assets: QuizQuestion[]) {
  if (type !== 'picture' && type !== 'sound') return ''
  const uniqueAnswers = new Set<string>()
  const catalog = assets.flatMap((question) => {
    const answerKey = question.answer.toLocaleLowerCase('de')
    if (question.type !== type || uniqueAnswers.has(answerKey)) return []
    uniqueAnswers.add(answerKey)
    return [{
      id: question.id,
      prompt: question.prompt,
      answer: question.answer,
      category: question.category,
      description: question.type === 'picture' ? question.imageAlt : undefined,
    }]
  })
  return `\nWähle für jede Frage eine unterschiedliche assetId ausschließlich aus diesem Katalog:\n${JSON.stringify(catalog)}`
}

function buildPrompt(type: GameType, count: number, topic: string, assets: QuizQuestion[]) {
  const topicInstruction = topic.trim()
    ? `Das gewünschte Thema lautet: ${topic.trim()}.`
    : 'Mische bekannte, pubquiz-taugliche Themen ausgewogen.'
  const typeRules: Record<GameType, string> = {
    picture: 'Wähle ein passendes Bild-Asset aus dem Katalog. Übernimm dessen prompt sinngemäß und erfinde keine Frage über Personen, Ereignisse oder Eigenschaften, die auf dem Bild nicht erkennbar sind. Passt kein Asset zum Thema, ignoriere das Thema.',
    'who-am-i': 'Liefere genau 8 zunehmend konkrete Hinweise. Kein Hinweis darf den Namen direkt nennen. Die Fakten müssen überprüfbar sein.',
    themed: 'Jede Frage braucht ein klares Thema und eine kurze, eindeutige Antwort.',
    'lie-detector': 'Genau zwei Aussagen sind wahr und genau eine ist falsch. lieIndex ist nullbasiert und answer nennt die falsche Aussage.',
    sound: 'Wähle ein passendes Audio-Asset aus dem Katalog. Übernimm dessen prompt sinngemäß und erfinde keine Frage, die mit dem Geräusch nicht beantwortbar ist. Passt kein Asset zum Thema, ignoriere das Thema.',
    emoji: 'Nutze 4 bis 8 einzelne Emojis. Der Titel darf weder im Prompt noch als Text-Emoji erscheinen.',
  }

  return [
    `Erstelle ${count} unterschiedliche deutsche PubQuiz-Fragen für den Spieltyp "${type}".`,
    topicInstruction,
    typeRules[type],
    'Antworte ausschließlich mit gültigem JSON, ohne Markdown oder Begleittext.',
    `Die exakte Grundform ist: ${responseShape(type)}`,
    `Das Array questions muss exakt ${count} Einträge enthalten. Schwierigkeit ist eine ganze Zahl von 1 bis 5.`,
    'Vermeide mehrdeutige Lösungen, Wiederholungen und erfundene Fakten. Jede Lösung darf im gesamten questions-Array nur einmal vorkommen.',
    mediaCatalog(type, assets),
  ].join('\n')
}

function parseJsonContent(content: string) {
  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace <= firstBrace) throw new Error('Die KI-Antwort enthielt kein JSON.')
  try {
    return JSON.parse(content.slice(firstBrace, lastBrace + 1)) as unknown
  } catch {
    throw new Error('Die KI-Antwort war kein gültiges JSON.')
  }
}

function hydrateQuestions(type: GameType, generated: unknown[], assets: QuizQuestion[], model: string): QuizQuestion[] {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]))
  const sourceLabel = `KI-generiert mit OpenRouter / ${model}`

  return generated.map((item, index) => {
    const id = `ai-${type}-${crypto.randomUUID()}`
    if (type === 'picture') {
      const value = generatedSchemas.picture.parse(item)
      const asset = assetMap.get(value.assetId) as PictureQuestion | undefined
      if (!asset || asset.type !== 'picture') throw new Error(`Unbekanntes Bild-Asset in KI-Antwort ${index + 1}.`)
      return { ...asset, id, type, source: `${sourceLabel}; ${asset.source ?? 'lokaler Medienpool'}` }
    }
    if (type === 'sound') {
      const value = generatedSchemas.sound.parse(item)
      const asset = assetMap.get(value.assetId) as SoundQuestion | undefined
      if (!asset || asset.type !== 'sound') throw new Error(`Unbekanntes Sound-Asset in KI-Antwort ${index + 1}.`)
      return { ...asset, ...value, id, type, answer: asset.answer, media: asset.media, source: `${sourceLabel}; ${asset.source ?? 'lokaler Medienpool'}` }
    }

    const value = generatedSchemas[type].parse(item)
    return { ...value, id, type, source: sourceLabel } as QuizQuestion
  })
}

function openRouterErrorMessage(error: OpenRouterError | undefined, status: number, retryAfterHeader: string | null, modelTier: AiModelTier) {
  const errorType = error?.metadata?.error_type
  const retryAfter = error?.availability?.retry_after ?? Number(retryAfterHeader)
  const waitHint = Number.isFinite(retryAfter) && retryAfter > 0
    ? ` Bitte in ${Math.ceil(retryAfter)} Sekunden erneut versuchen.`
    : ' Bitte gleich erneut versuchen.'
  const providers = modelTier === 'free' ? 'kostenlosen KI-Anbieter' : 'bezahlten KI-Anbieter'
  const provider = modelTier === 'free' ? 'kostenlose KI-Anbieter' : 'bezahlte KI-Anbieter'

  if (status === 429 || errorType === 'rate_limit_exceeded') return `Die ${providers} sind momentan ausgelastet.${waitHint}`
  if (status === 502 || errorType === 'provider_unavailable') return `Der ${provider} ist vorübergehend nicht erreichbar.${waitHint}`
  if (status === 503 || errorType === 'provider_overloaded') return `Der ${provider} ist momentan überlastet.${waitHint}`
  if (status === 401) return 'Der OpenRouter API-Key ist ungültig oder wurde widerrufen.'
  if (status === 402 || errorType === 'payment_required') {
    return modelTier === 'paid'
      ? 'Für das bezahlte Modell hat dieses OpenRouter-Konto oder der API-Key nicht genug Guthaben. Bitte unter openrouter.ai/credits Guthaben aufladen oder das Kreditlimit des API-Keys erhöhen.'
      : 'Dieses OpenRouter-Konto oder der API-Key hat nicht genug Guthaben für die Anfrage.'
  }
  return error?.message || `OpenRouter antwortete mit HTTP ${status}.`
}

export async function createAiQuestionSet(options: {
  type: GameType
  count: number
  apiKey: string
  topic: string
  assets: QuizQuestion[]
  modelTier?: AiModelTier
}): Promise<QuizQuestion[]> {
  const { type, count, apiKey, topic, assets, modelTier = 'free' } = options
  const requestCompletion = async (modelSelection: { model?: string; models?: string[] }) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'X-Title': 'Moe`s PubQuiz',
      },
      body: JSON.stringify({
        ...modelSelection,
        temperature: 0.7,
        max_tokens: Math.max(8000, count * 1600),
        reasoning: { effort: 'high', exclude: true },
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Du bist ein sorgfältiger deutscher PubQuiz-Redakteur. Befolge das angeforderte JSON-Format exakt.' },
          { role: 'user', content: buildPrompt(type, count, topic, assets) },
        ],
      }),
    })

    const data = await response.json() as OpenRouterResponse
    if (!response.ok) throw new Error(openRouterErrorMessage(data.error, response.status, response.headers.get('Retry-After'), modelTier))
    const completionError = data.error ?? data.choices?.find((choice) => choice.error)?.error
    if (completionError) throw new Error(openRouterErrorMessage(completionError, completionError.code ?? response.status, response.headers.get('Retry-After'), modelTier))
    const choice = data.choices?.find((candidate) => candidate.message?.content) ?? data.choices?.[0]
    return { data, content: choice?.message?.content, finishReason: choice?.finish_reason }
  }

  const modelSelections = modelTier === 'paid'
    ? [{ model: OPENROUTER_PAID_MODEL }]
    : [
        { model: OPENROUTER_MODEL },
        { model: OPENROUTER_MODEL },
        { model: OPENROUTER_MODEL },
      ]
  let generationError: unknown

  for (const modelSelection of modelSelections) {
    const completion = await requestCompletion(modelSelection)
    try {
      if (!completion.content && completion.finishReason === 'length') {
        throw new Error(`Die ${modelTier === 'free' ? 'kostenlosen KI-Modelle' : 'bezahlte KI'} haben ihr Antwortlimit erreicht. Bitte weniger Fragen wählen und erneut versuchen.`)
      }
      if (!completion.content) throw new Error(`Die ${modelTier === 'free' ? 'kostenlosen KI-Modelle' : 'bezahlte KI'} konnten keine verwertbare Antwort erzeugen. Bitte erneut versuchen.`)
      const parsed = z.object({ questions: z.array(z.unknown()).length(count) }).parse(parseJsonContent(completion.content))
      const questions = hydrateQuestions(type, parsed.questions, assets, completion.data.model ?? modelSelection.model ?? OPENROUTER_MODEL)
      if (new Set(questions.map((question) => question.answer.toLocaleLowerCase('de'))).size !== questions.length) {
        throw new Error('Die KI hat doppelte Antworten erzeugt. Bitte erneut versuchen.')
      }
      return questions
    } catch (error) {
      generationError = error
    }
  }

  throw generationError
}