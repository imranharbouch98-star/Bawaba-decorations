import { useEffect, useState } from 'react'
import { ITEMS_BY_ID, RARITY_LABEL, type ItemDef } from '../game/items'
import { attemptsLeft, type Quiz, type QuizResult } from '../game/quiz'
import { useGame, type QuizOutcome } from '../game/store'
import { IconArrowLeft, IconCheck, IconGem } from './icons'
import { ItemIcon } from './ItemIcon'
import { ThemeToggle } from './ThemeToggle'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Single choice replaces the answer; multiple choice toggles it. */
const pick = (chosen: number[], i: number, multiple: boolean) =>
  !multiple ? [i] : chosen.includes(i) ? chosen.filter((c) => c !== i) : [...chosen, i]

const prizeItem = (quiz: Quiz) => (quiz.prize.kind === 'item' ? ITEMS_BY_ID[quiz.prize.itemId] : undefined)

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** "Nog 2 pogingen" / "Onbeperkt opnieuw" */
function attemptsLabel(quiz: Quiz, result?: QuizResult) {
  const left = attemptsLeft(quiz, result)
  if (left === Infinity) return 'Onbeperkt pogingen'
  if (left === 0) return 'Geen pogingen meer'
  return `Nog ${plural(left, 'poging', 'pogingen')}`
}

/** Right-hand panel for agents: the list of quizzes. Playing one opens QuizPage. */
export function QuizPanel() {
  const allQuizzes = useGame((s) => s.quizzes)
  const results = useGame((s) => s.quizResults)
  const playQuiz = useGame((s) => s.playQuiz)
  const quizzes = allQuizzes.filter((q) => q.active)
  const won = quizzes.filter((q) => results[q.id]?.passed).length

  return (
    <aside className="goals quiz-panel">
      <header className="goals-header">
        <span className="eyebrow">Win boeken, verf en meubels</span>
        <h2>Quizzen</h2>
      </header>

      <div className="section-title">
        <h3>Beschikbaar</h3>
        <span className="badge">
          {won} van {quizzes.length} gewonnen
        </span>
      </div>

      {quizzes.length === 0 ? (
        <p className="quiz-empty">Er staan nog geen quizzen klaar. Kom later terug.</p>
      ) : (
        <ol className="goal-list">
          {quizzes.map((quiz, i) => {
            const result = results[quiz.id]
            const prize = result?.prizeId ? ITEMS_BY_ID[result.prizeId] : prizeItem(quiz)
            const outOfTries = !result?.passed && attemptsLeft(quiz, result) === 0
            return (
              <li key={quiz.id} className={`goal quiz-item ${result?.passed ? 'claimed' : ''} ${outOfTries ? 'spent' : ''}`}>
                <span className="goal-number">{String(i + 1).padStart(2, '0')}</span>
                <div className="goal-body">
                  <div className="goal-text">
                    <strong>{quiz.title}</strong>
                    {quiz.description && <span>{quiz.description}</span>}
                    <span className="quiz-meta">
                      {quiz.passCount} van {plural(quiz.questions.length, 'vraag', 'vragen')} goed nodig
                      {!result?.passed && ` · ${attemptsLabel(quiz, result)}`}
                    </span>
                  </div>
                  <div className="goal-reward">
                    <PrizeBadge item={prize} />
                    {result?.passed ? (
                      <span className="check">
                        <IconCheck /> Gewonnen
                      </span>
                    ) : outOfTries ? (
                      <span className="spent-label">Afgerond</span>
                    ) : (
                      <button className="claim ready" onClick={() => playQuiz(quiz.id)}>
                        {result ? 'Opnieuw' : 'Start'}
                      </button>
                    )}
                  </div>
                  {result && !result.passed && (
                    <span className="quiz-meta">
                      Beste poging: {result.bestCorrect} van {quiz.questions.length} goed
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </aside>
  )
}

/** Prize preview: the item, or a mystery tile for surprise prizes. */
function PrizeBadge({ item }: { item?: ItemDef }) {
  return (
    <>
      <span className="reward-window">{item ? <ItemIcon item={item} /> : <IconGem />}</span>
      <span className="reward-text">
        {item ? item.name : 'Verrassingsprijs'}
        {item ? (
          <small className={`rarity ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</small>
        ) : (
          <small className="rarity special">Verrassing</small>
        )}
      </span>
    </>
  )
}

/** Full-page quiz, covering the room while the agent plays. */
export function QuizPage() {
  const quizId = useGame((s) => s.playingQuiz)
  const quiz = useGame((s) => s.quizzes.find((q) => q.id === s.playingQuiz && q.active))
  const playQuiz = useGame((s) => s.playQuiz)
  const exit = () => playQuiz(null)

  useEffect(() => {
    // the quiz was hidden or deleted while open
    if (quizId && !quiz) playQuiz(null)
  }, [quizId, quiz, playQuiz])

  if (!quiz) return null
  return (
    <div className="quiz-page" role="dialog" aria-modal aria-labelledby="quiz-page-title">
      <header className="quiz-page-header">
        <button className="back" onClick={exit}>
          <IconArrowLeft /> Terug naar mijn kamer
        </button>
        <ThemeToggle />
      </header>
      <main className="quiz-page-body">
        <QuizRunner key={quiz.id} quiz={quiz} onExit={exit} />
      </main>
    </div>
  )
}

function QuizRunner({ quiz, onExit }: { quiz: Quiz; onExit: () => void }) {
  const submitQuiz = useGame((s) => s.submitQuiz)
  const result = useGame((s) => s.quizResults[quiz.id])
  const [index, setIndex] = useState(0)
  // answers[i] = option indexes chosen for question i
  const [answers, setAnswers] = useState<number[][]>([])
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)

  const restart = () => {
    setIndex(0)
    setAnswers([])
    setOutcome(null)
  }

  if (outcome) return <QuizResultView quiz={quiz} outcome={outcome} onRetry={restart} onExit={onExit} />

  if (!result?.passed && attemptsLeft(quiz, result) === 0) {
    return (
      <div className="quiz-card">
        <h1 id="quiz-page-title">{quiz.title}</h1>
        <p className="daily-note">Je hebt al je pogingen voor deze quiz gebruikt.</p>
        <button className="primary" onClick={onExit}>
          Terug naar mijn kamer
        </button>
      </div>
    )
  }

  const question = quiz.questions[index]
  const chosen = answers[index] ?? []
  const answered = chosen.length > 0
  const last = index === quiz.questions.length - 1
  const attempt = (result?.attempts ?? 0) + 1

  const next = () => {
    if (!answered) return
    if (last) setOutcome(submitQuiz(quiz.id, answers))
    else setIndex(index + 1)
  }

  return (
    <div className="quiz-card">
      <header className="quiz-card-head">
        <span className="eyebrow">
          Vraag {index + 1} van {quiz.questions.length}
          {quiz.maxAttempts !== null && ` · poging ${attempt} van ${quiz.maxAttempts}`}
        </span>
        <h1 id="quiz-page-title">{quiz.title}</h1>
        <p className="quiz-meta">
          {quiz.passCount} van {plural(quiz.questions.length, 'vraag', 'vragen')} goed om de prijs te winnen
        </p>
      </header>
      <div className="bar quiz-steps">
        <div style={{ width: `${((index + (answered ? 1 : 0)) / quiz.questions.length) * 100}%` }} />
      </div>

      <p className="question">{question.text}</p>
      {question.multiple && <p className="multi-hint">Meerdere antwoorden mogelijk. Vink alle goede antwoorden aan.</p>}
      <ol className={`answers ${question.multiple ? 'multiple' : ''}`}>
        {question.options.map((option, i) =>
          option.trim() ? (
            <li key={i}>
              <button
                className={`answer ${chosen.includes(i) ? 'chosen' : ''}`}
                role={question.multiple ? 'checkbox' : 'radio'}
                aria-checked={chosen.includes(i)}
                onClick={() => setAnswers((a) => Object.assign([...a], { [index]: pick(chosen, i, question.multiple) }))}
              >
                <span className="answer-letter">{LETTERS[i]}</span>
                <span>{option}</span>
              </button>
            </li>
          ) : null,
        )}
      </ol>

      <div className="quiz-nav">
        <button onClick={() => setIndex(index - 1)} disabled={index === 0}>
          Vorige
        </button>
        <button className="primary" onClick={next} disabled={!answered}>
          {last ? 'Inleveren' : 'Volgende'}
        </button>
      </div>
    </div>
  )
}

function QuizResultView({ quiz, outcome, onRetry, onExit }: { quiz: Quiz; outcome: QuizOutcome; onRetry: () => void; onExit: () => void }) {
  const prize = outcome.prizeId ? ITEMS_BY_ID[outcome.prizeId] : undefined
  const canRetry = !outcome.passed && outcome.attemptsLeft > 0
  return (
    <div className="quiz-card">
      <header className="quiz-card-head">
        <span className="eyebrow">{quiz.title}</span>
        <h1 id="quiz-page-title">{outcome.passed ? 'Gefeliciteerd!' : 'Bijna...'}</h1>
      </header>

      <div className={`daily quiz-score ${outcome.passed ? 'passed' : ''}`}>
        <span className="eyebrow">Jouw score</span>
        <div className="daily-points">
          <span className="daily-number">{outcome.correct}</span>
          <span className="daily-target">van {outcome.total} goed</span>
        </div>
        <span className="daily-target">{quiz.passCount} goed nodig</span>

        {prize ? (
          <div className="won-prize">
            <span className="card-window">
              <ItemIcon item={prize} />
            </span>
            <strong>{prize.name}</strong>
            <span className={`rarity ${prize.rarity}`}>{RARITY_LABEL[prize.rarity]}</span>
            <p className="daily-note">Staat nu in je inventaris.</p>
          </div>
        ) : outcome.passed && outcome.alreadyWon ? (
          <p className="daily-note">Goed gedaan! Je had de prijs van deze quiz al gewonnen.</p>
        ) : canRetry ? (
          <p className="daily-note">
            Je hebt er {quiz.passCount} goed nodig om de prijs te winnen.{' '}
            {outcome.attemptsLeft === Infinity
              ? 'Je mag het opnieuw proberen.'
              : `Je hebt nog ${plural(outcome.attemptsLeft, 'poging', 'pogingen')}.`}
          </p>
        ) : (
          <p className="daily-note">Dit was je laatste poging. Bij een volgende quiz heb je weer een kans.</p>
        )}
      </div>

      <div className="quiz-nav">
        {canRetry && <button onClick={onRetry}>Opnieuw proberen</button>}
        <button className="primary" onClick={onExit}>
          Terug naar mijn kamer
        </button>
      </div>
    </div>
  )
}
