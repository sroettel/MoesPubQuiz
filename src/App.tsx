import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  ArrowLeft,
  AudioLines,
  ChevronRight,
  Database,
  Eye,
  Image,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Minus,
  Play,
  Plus,
  RotateCcw,
  ScanSearch,
  SmilePlus,
  Sparkles,
  Trophy,
  UserRoundSearch,
  Wifi,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import './App.css'
import { createQuestionSet, getPoolCounts, prepareDatabase, recordQuestionPlayed } from './data/db'
import { GAME_DEFINITIONS, type GameDefinition, type GameType, type QuizQuestion } from './domain/questions'
import { createAiQuestionSet, type AiModelTier } from './services/openRouterQuestions'

type Screen = 'library' | 'setup' | 'game' | 'results'
type QuestionSource = 'pool' | 'ai'

const GAME_ICONS: Record<GameType, LucideIcon> = {
  picture: Image,
  'who-am-i': UserRoundSearch,
  themed: ListChecks,
  'lie-detector': ScanSearch,
  sound: AudioLines,
  emoji: SmilePlus,
}

const EMPTY_COUNTS: Record<GameType, number> = {
  picture: 0,
  'who-am-i': 0,
  themed: 0,
  'lie-detector': 0,
  sound: 0,
  emoji: 0,
}

function App() {
  const [screen, setScreen] = useState<Screen>('library')
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null)
  const [poolCounts, setPoolCounts] = useState(EMPTY_COUNTS)
  const [roundCount, setRoundCount] = useState(10)
  const [teams, setTeams] = useState(['Team Messing', 'Die Schlauen'])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [scores, setScores] = useState([0, 0])
  const [revealed, setRevealed] = useState(false)
  const [visibleHints, setVisibleHints] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLoading, setIsLoading] = useState(true)
  const [questionSource, setQuestionSource] = useState<QuestionSource>('pool')
  const [aiModelTier, setAiModelTier] = useState<AiModelTier>('free')
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [aiTopic, setAiTopic] = useState('')
  const [startError, setStartError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      await prepareDatabase()
      setPoolCounts(await getPoolCounts())
      setIsLoading(false)
    }
    void initialize()

    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  const currentQuestion = questions[questionIndex]
  const winnerScore = Math.max(...scores)
  const standings = useMemo(
    () => teams.map((name, index) => ({ name, score: scores[index] ?? 0 })).sort((a, b) => b.score - a.score),
    [scores, teams],
  )

  const selectGame = (game: GameDefinition) => {
    setSelectedGame(game)
    setQuestionSource('pool')
    setStartError('')
    setRoundCount(Math.min(game.defaultRounds, poolCounts[game.type] || game.defaultRounds))
    setScreen('setup')
  }

  const selectQuestionSource = (source: QuestionSource) => {
    setQuestionSource(source)
    setStartError('')
    if (!selectedGame) return
    const maximum = source === 'ai' ? 20 : poolCounts[selectedGame.type]
    setRoundCount((current) => Math.min(current, maximum))
  }

  const startGame = async () => {
    if (!selectedGame) return
    setStartError('')
    setIsGenerating(true)
    try {
      const nextQuestions = questionSource === 'ai'
        ? await createAiQuestionSet({
            type: selectedGame.type,
            count: roundCount,
            apiKey: openRouterKey,
            topic: aiTopic,
            modelTier: aiModelTier,
            assets: selectedGame.type === 'picture' || selectedGame.type === 'sound'
              ? await createQuestionSet(selectedGame.type, poolCounts[selectedGame.type])
              : [],
          })
        : await createQuestionSet(selectedGame.type, roundCount)
      if (nextQuestions.length === 0) throw new Error('Für diese Auswahl wurden keine Fragen gefunden.')
      setQuestions(nextQuestions)
      setScores(teams.map(() => 0))
      setQuestionIndex(0)
      setRevealed(false)
      setVisibleHints(0)
      setScreen('game')
      if (questionSource === 'pool') await recordQuestionPlayed(nextQuestions[0].id)
    } catch (error) {
      setStartError(error instanceof Error ? error.message : 'Die Fragen konnten nicht erstellt werden.')
    } finally {
      setIsGenerating(false)
    }
  }

  const nextQuestion = async () => {
    const nextIndex = questionIndex + 1
    if (nextIndex >= questions.length) {
      setScreen('results')
      return
    }
    setQuestionIndex(nextIndex)
    setRevealed(false)
    setVisibleHints(0)
    if (questionSource === 'pool') await recordQuestionPlayed(questions[nextIndex].id)
  }

  const updateTeamName = (index: number, name: string) => {
    setTeams((current) => current.map((team, teamIndex) => (teamIndex === index ? name : team)))
  }

  const addTeam = () => {
    if (teams.length < 6) setTeams((current) => [...current, `Team ${current.length + 1}`])
  }

  const removeTeam = (index: number) => {
    if (teams.length > 1) setTeams((current) => current.filter((_, teamIndex) => teamIndex !== index))
  }

  const updateScore = (index: number, delta: number) => {
    setScores((current) => current.map((score, teamIndex) => (teamIndex === index ? score + delta : score)))
  }

  if (isLoading) return <main className="loading-screen">Quizkarten werden gemischt ...</main>

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setScreen('library')}>
          <span className="brand-mark">MP</span>
          <span><strong>Moe`s</strong><small>PubQuiz</small></span>
        </button>
        <div className={`connection ${isOnline ? '' : 'offline'}`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>

      {screen === 'library' && (
        <section className="library page-enter">
          <div className="game-grid">
            {GAME_DEFINITIONS.map((game, index) => {
              const Icon = GAME_ICONS[game.type]
              return (
                <button
                  className="game-card"
                  style={{ '--game-accent': game.accent, '--delay': `${index * 55}ms` } as CSSProperties}
                  type="button"
                  key={game.type}
                  onClick={() => selectGame(game)}
                >
                  <span className="game-card-top"><span className="game-icon"><Icon /></span><span className="question-count">{poolCounts[game.type]} Fragen</span></span>
                  <span className="game-eyebrow">{game.eyebrow}</span>
                  <strong>{game.title}</strong>
                  <span className="game-description">{game.description}</span>
                  <span className="game-action">Auswählen <ChevronRight size={18} /></span>
                </button>
              )
            })}
          </div>
          <p className="demo-note">Der Startpool enthält 600 Aufgaben, darunter 100 frei lizenzierte Geräusche für die Soundrunde.</p>
        </section>
      )}

      {screen === 'setup' && selectedGame && (
        <section className="setup page-enter">
          <button className="back-button" type="button" onClick={() => setScreen('library')}><ArrowLeft size={18} /> Spiele</button>
          <div className="setup-layout">
            <div className="setup-intro" style={{ '--game-accent': selectedGame.accent } as CSSProperties}>
              <span className="game-icon large">{(() => { const Icon = GAME_ICONS[selectedGame.type]; return <Icon /> })()}</span>
              <p className="kicker">{selectedGame.eyebrow}</p>
              <h1>{selectedGame.title}</h1>
              <p>{selectedGame.description}</p>
              {selectedGame.onlineOnly && !isOnline && <div className="warning"><WifiOff size={18} /> Für Soundquellen wird eine Internetverbindung benötigt.</div>}
            </div>
            <div className="setup-controls" style={{ '--game-accent': selectedGame.accent } as CSSProperties}>
              <fieldset>
                <legend>Fragenquelle</legend>
                <div className="source-switch" role="radiogroup" aria-label="Fragenquelle">
                  <button className={questionSource === 'pool' ? 'active' : ''} type="button" role="radio" aria-checked={questionSource === 'pool'} onClick={() => selectQuestionSource('pool')}>
                    <Database size={18} /> Standardpool
                  </button>
                  <button className={questionSource === 'ai' ? 'active' : ''} type="button" role="radio" aria-checked={questionSource === 'ai'} onClick={() => selectQuestionSource('ai')}>
                    <Sparkles size={18} /> KI live
                  </button>
                </div>
                {questionSource === 'ai' && (
                  <div className="ai-fields">
                    <div className="ai-model-field">
                      <span>KI-Modell</span>
                      <div className="model-tier-switch" role="radiogroup" aria-label="KI-Modell">
                        <button className={aiModelTier === 'free' ? 'active' : ''} type="button" role="radio" aria-checked={aiModelTier === 'free'} onClick={() => { setAiModelTier('free'); setStartError('') }}>
                          <strong>Kostenlos</strong><small>GLM mit Free-Fallback</small>
                        </button>
                        <button className={aiModelTier === 'paid' ? 'active' : ''} type="button" role="radio" aria-checked={aiModelTier === 'paid'} onClick={() => { setAiModelTier('paid'); setStartError('') }}>
                          <strong>Bezahlt</strong><small>GPT-5.4 Mini</small>
                        </button>
                      </div>
                      {aiModelTier === 'paid' && (
                        <p className="ai-note">
                          OpenRouter berechnet openai/gpt-5.4-mini über den unten eingegebenen API-Key. Das zugehörige Konto benötigt Guthaben und der Key ein ausreichendes Kreditlimit.{' '}
                          <a href="https://openrouter.ai/credits" target="_blank" rel="noreferrer">Guthaben verwalten</a>
                        </p>
                      )}
                    </div>
                    <label>
                      <span>OpenRouter API-Key</span>
                      <input type="password" value={openRouterKey} autoComplete="off" spellCheck={false} placeholder="sk-or-v1-..." onChange={(event) => setOpenRouterKey(event.target.value)} />
                    </label>
                    <label>
                      <span>Thema oder Schwerpunkt <small>optional</small></span>
                      <input
                        value={aiTopic}
                        maxLength={120}
                        placeholder={selectedGame.type === 'picture' ? 'z. B. europäische Länder' : 'z. B. 80er-Actionfilme'}
                        onChange={(event) => setAiTopic(event.target.value)}
                      />
                    </label>
                    {selectedGame.type === 'picture' && <p className="ai-note">Der aktuelle Bildpool enthält Flaggen. Die KI wählt daraus passende Bilder aus, erzeugt aber keine neuen Bilder von Personen.</p>}
                  </div>
                )}
              </fieldset>
              <fieldset>
                <legend>Wie viele Aufgaben?</legend>
                <div className="stepper">
                  <button type="button" title="Eine Aufgabe weniger" onClick={() => setRoundCount(Math.max(1, roundCount - 1))}><Minus /></button>
                  <output><strong>{roundCount}</strong><span>Runden</span></output>
                  <button type="button" title="Eine Aufgabe mehr" onClick={() => setRoundCount(Math.min(questionSource === 'ai' ? 20 : poolCounts[selectedGame.type], roundCount + 1))}><Plus /></button>
                </div>
                <p className="field-hint">{questionSource === 'ai' ? 'Pro KI-Runde sind bis zu 20 neue Aufgaben möglich.' : `Aktuell sind ${poolCounts[selectedGame.type]} Aufgaben für dieses Spiel verfügbar.`}</p>
              </fieldset>
              <fieldset>
                <legend>Teams</legend>
                <div className="team-inputs">
                  {teams.map((team, index) => (
                    <div className="team-input" key={index}>
                      <span>{index + 1}</span>
                      <input value={team} aria-label={`Name von Team ${index + 1}`} onChange={(event) => updateTeamName(index, event.target.value)} />
                      <button type="button" title="Team entfernen" onClick={() => removeTeam(index)} disabled={teams.length === 1}><Minus size={16} /></button>
                    </div>
                  ))}
                </div>
                <button className="text-button" type="button" onClick={addTeam} disabled={teams.length >= 6}><Plus size={17} /> Team hinzufügen</button>
              </fieldset>
              {questionSource === 'ai' && !isOnline && <div className="warning"><WifiOff size={18} /> KI-Fragen benötigen eine Internetverbindung.</div>}
              {startError && <div className="setup-error" role="alert">{startError}</div>}
              <button className="primary-button" type="button" onClick={() => void startGame()} disabled={isGenerating || (questionSource === 'ai' && (!isOnline || !openRouterKey.trim())) || (selectedGame.onlineOnly && !isOnline)}>
                {isGenerating ? <LoaderCircle className="spin" size={20} /> : <Play size={20} fill="currentColor" />}
                {isGenerating ? 'Fragen werden erstellt ...' : 'Spiel starten'}
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === 'game' && currentQuestion && selectedGame && (
        <section className="host page-enter">
          <div className="host-meta">
            <button className="back-button" type="button" onClick={() => setScreen('setup')}><ArrowLeft size={18} /> Abbrechen</button>
            <span>{selectedGame.title}</span><strong>{questionIndex + 1} / {questions.length}</strong>
          </div>
          <div className="progress"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
          <div className="host-layout">
            <article className="question-stage">
              <div className="question-label"><span>{currentQuestion.category}</span><span>Schwierigkeit {currentQuestion.difficulty}/5</span></div>
              <QuestionContent question={currentQuestion} revealed={revealed} visibleHints={visibleHints} />
              {revealed && (
                <div className="answer-reveal">
                  <span>Antwort</span><strong>{currentQuestion.answer}</strong>
                  {'explanation' in currentQuestion && <p>{currentQuestion.explanation}</p>}
                  {currentQuestion.source && <small>Quelle: {currentQuestion.source}</small>}
                </div>
              )}
              <div className="stage-actions">
                {currentQuestion.type === 'who-am-i' && visibleHints < currentQuestion.hints.length && !revealed && (
                  <button className="secondary-button" type="button" onClick={() => setVisibleHints((count) => count + 1)}><Lightbulb size={19} /> Hinweis {visibleHints + 1}</button>
                )}
                {!revealed ? (
                  <button className="primary-button" type="button" onClick={() => setRevealed(true)}><Eye size={19} /> Lösung zeigen</button>
                ) : (
                  <button className="primary-button" type="button" onClick={() => void nextQuestion()}>{questionIndex + 1 === questions.length ? 'Zum Endstand' : 'Nächste Frage'} <ChevronRight size={19} /></button>
                )}
              </div>
            </article>
            <aside className="scoreboard">
              <div className="scoreboard-title"><Trophy size={19} /><strong>Punktestand</strong></div>
              {teams.map((team, index) => (
                <div className="score-row" key={index}>
                  <span>{team || `Team ${index + 1}`}</span>
                  <div><button type="button" title={`Punkt für ${team} abziehen`} onClick={() => updateScore(index, -1)}><Minus /></button><strong>{scores[index]}</strong><button type="button" title={`Punkt für ${team} geben`} onClick={() => updateScore(index, 1)}><Plus /></button></div>
                </div>
              ))}
            </aside>
          </div>
        </section>
      )}

      {screen === 'results' && (
        <section className="results page-enter">
          <Trophy className="result-trophy" size={52} />
          <p className="kicker">Das war die Runde</p>
          <h1>{standings.filter((team) => team.score === winnerScore).map((team) => team.name).join(' & ')} gewinnt!</h1>
          <div className="standings">
            {standings.map((team, index) => <div key={`${team.name}-${index}`}><span>{index + 1}</span><strong>{team.name}</strong><output>{team.score} Pkt.</output></div>)}
          </div>
          <div className="result-actions">
            <button className="secondary-button" type="button" onClick={() => setScreen('setup')}><RotateCcw size={18} /> Noch eine Runde</button>
            <button className="primary-button" type="button" onClick={() => setScreen('library')}>Andere Spielart <ChevronRight size={18} /></button>
          </div>
        </section>
      )}
    </main>
  )
}

function QuestionContent({ question, revealed, visibleHints }: { question: QuizQuestion; revealed: boolean; visibleHints: number }) {
  return (
    <div className={`question-content ${question.type}`}>
      <h2>{question.prompt}</h2>
      {question.type === 'picture' && <img className="quiz-image" src={question.imageUrl} alt={question.imageAlt} />}
      {question.type === 'who-am-i' && (
        <ol className="hint-list">
          {question.hints.slice(0, visibleHints).map((hint, index) => <li key={hint}><span>{index + 1}</span>{hint}</li>)}
          {visibleHints === 0 && <li className="empty-hint">Noch ist alles möglich. Decke den ersten Hinweis auf.</li>}
        </ol>
      )}
      {question.type === 'themed' && <div className="theme-stamp">Thema: {question.theme}</div>}
      {question.type === 'lie-detector' && (
        <ol className="statement-list">{question.statements.map((statement, index) => <li className={revealed && index === question.lieIndex ? 'is-lie' : ''} key={statement}><span>{index + 1}</span>{statement}</li>)}</ol>
      )}
      {question.type === 'sound' && question.media.kind === 'audio' && <audio className="audio-player" controls preload="metadata" src={question.media.url}>Dein Browser kann dieses Audio nicht abspielen.</audio>}
      {question.type === 'sound' && question.media.kind === 'youtube' && <iframe className="youtube-player" src={question.media.url} title="YouTube Soundquelle" allow="autoplay; encrypted-media" allowFullScreen />}
      {question.type === 'emoji' && <div className="emoji-line" aria-label={question.emojis.join(' ')}>{question.emojis.map((emoji, index) => <span key={`${emoji}-${index}`}>{emoji}</span>)}</div>}
    </div>
  )
}

export default App