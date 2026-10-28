import { useState } from 'react'
import { ITEMS_BY_ID, RARITY_LABEL, isBook, isPaint, type ItemDef } from '../game/items'
import { ATTEMPT_OPTIONS, emptyQuestion, emptyQuiz, validateQuiz, type Question, type Quiz } from '../game/quiz'
import { randomPrizeId, useGame } from '../game/store'
import { COLLECTIBLES, Switch } from './Collection'
import { IconArrowLeft, IconDice, IconEdit, IconGem, IconLogout, IconPlus, IconTrash } from './icons'
import { ItemIcon } from './ItemIcon'
import { ThemeToggle } from './ThemeToggle'

/** The admin's own window: making and managing quizzes. No room here. */
export function AdminApp() {
  const logout = useGame((s) => s.logoutAdmin)
  const [editing, setEditing] = useState<Quiz | null>(null)

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="eyebrow">Bawaba</span>
          <h1>Beheer</h1>
        </div>
        <span className="admin-spacer" />
        <ThemeToggle />
        <button className="admin-logout" onClick={logout}>
          <IconLogout /> Uitloggen
        </button>
      </header>

      <main className="admin-main">
        {editing ? (
          <QuizEditor initial={editing} onDone={() => setEditing(null)} />
        ) : (
          <QuizList onEdit={setEditing} />
        )}
      </main>
    </div>
  )
}

function QuizList({ onEdit }: { onEdit: (quiz: Quiz) => void }) {
  const quizzes = useGame((s) => s.quizzes)
  const setQuizActive = useGame((s) => s.setQuizActive)
  const deleteQuiz = useGame((s) => s.deleteQuiz)

  return (
    <div className="admin">
      <div className="admin-page-head">
        <div>
          <h2>Quizzen</h2>
          <p>Agenten die een quiz halen, krijgen de prijs die je hier kiest.</p>
        </div>
        <button className="primary" onClick={() => onEdit(emptyQuiz())}>
          <IconPlus /> Nieuwe quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <p className="empty-state">Nog geen quizzen. Maak de eerste.</p>
      ) : (
        <ul className="admin-list quiz-admin-list">
          {quizzes.map((quiz) => {
            const prize = quiz.prize.kind === 'item' ? ITEMS_BY_ID[quiz.prize.itemId] : undefined
            return (
              <li key={quiz.id} className={quiz.active ? 'on' : ''}>
                <span className="reward-window">{prize ? <ItemIcon item={prize} /> : <IconGem />}</span>
                <span className="quiz-admin-text">
                  <strong>{quiz.title || 'Naamloze quiz'}</strong>
                  <span>
                    {quiz.passCount} van {quiz.questions.length} goed nodig ·{' '}
                    {quiz.maxAttempts === null ? 'onbeperkt pogingen' : `${quiz.maxAttempts} ${quiz.maxAttempts === 1 ? 'poging' : 'pogingen'}`} ·
                    prijs: {prize ? prize.name : 'verrassing'}
                  </span>
                </span>
                <span className="admin-state">{quiz.active ? 'Zichtbaar' : 'Verborgen'}</span>
                <Switch checked={quiz.active} onChange={(v) => setQuizActive(quiz.id, v)} label={`${quiz.title} zichtbaar`} />
                <span className="row-actions">
                  <button className="icon-button" onClick={() => onEdit(quiz)} aria-label="Bewerken" title="Bewerken">
                    <IconEdit />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => confirm(`Quiz "${quiz.title}" verwijderen?`) && deleteQuiz(quiz.id)}
                    aria-label="Verwijderen"
                    title="Verwijderen"
                  >
                    <IconTrash />
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
      <p className="admin-note">Let op: quizzen worden voorlopig alleen in deze browser bewaard.</p>
    </div>
  )
}

function QuizEditor({ initial, onDone }: { initial: Quiz; onDone: () => void }) {
  const saveQuiz = useGame((s) => s.saveQuiz)
  const [quiz, setQuiz] = useState<Quiz>(initial)
  const [errors, setErrors] = useState<string[]>([])

  const update = (patch: Partial<Quiz>) => setQuiz((q) => ({ ...q, ...patch }))
  const updateQuestion = (i: number, patch: Partial<Question>) =>
    update({ questions: quiz.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) })

  const save = () => {
    const problems = validateQuiz(quiz)
    setErrors(problems)
    if (problems.length) return
    // drop empty answer slots, keeping the right answers pointing at the same text
    const questions = quiz.questions.map((q) => {
      const kept = q.options.map((o, i) => [o.trim(), i] as const).filter(([o]) => o)
      const correct = kept.flatMap(([, i], k) => (q.correct.includes(i) ? [k] : []))
      return { ...q, text: q.text.trim(), options: kept.map(([o]) => o), correct }
    })
    saveQuiz({ ...quiz, title: quiz.title.trim(), description: quiz.description.trim(), questions })
    onDone()
  }

  return (
    <div className="admin quiz-editor">
      <button className="back" onClick={onDone}>
        <IconArrowLeft /> Terug naar quizzen
      </button>
      <div className="admin-page-head">
        <h2>{initial.title ? 'Quiz bewerken' : 'Nieuwe quiz'}</h2>
      </div>

      <section className="editor-card">
        <label className="field">
          Titel
          <input value={quiz.title} onChange={(e) => update({ title: e.target.value })} placeholder="Bijv. Klantgesprekken" />
        </label>
        <label className="field">
          Korte omschrijving
          <input value={quiz.description} onChange={(e) => update({ description: e.target.value })} placeholder="Optioneel" />
        </label>
        <div className="field-row">
          <label className="field">
            Goede antwoorden nodig voor de prijs
            <select value={Math.min(quiz.passCount, quiz.questions.length)} onChange={(e) => update({ passCount: Number(e.target.value) })}>
              {quiz.questions.map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} van {quiz.questions.length} goed
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Aantal pogingen per agent
            <select
              value={quiz.maxAttempts ?? 'unlimited'}
              onChange={(e) => update({ maxAttempts: e.target.value === 'unlimited' ? null : Number(e.target.value) })}
            >
              {ATTEMPT_OPTIONS.map((n) => (
                <option key={n ?? 'unlimited'} value={n ?? 'unlimited'}>
                  {n === null ? 'Onbeperkt' : n === 1 ? '1 poging (niet opnieuw)' : `${n} pogingen`}
                </option>
              ))}
            </select>
          </label>
          <label className="field switch-field">
            Zichtbaar voor agenten
            <Switch checked={quiz.active} onChange={(active) => update({ active })} />
          </label>
        </div>
      </section>

      <h3 className="editor-heading">Vragen</h3>
      {quiz.questions.map((question, i) => (
        <section key={question.id} className="editor-card question-card">
          <div className="question-head">
            <span className="goal-number">{String(i + 1).padStart(2, '0')}</span>
            <input
              className="question-input"
              value={question.text}
              onChange={(e) => updateQuestion(i, { text: e.target.value })}
              placeholder="Typ de vraag"
            />
            <button
              className="icon-button danger"
              onClick={() =>
                update({
                  questions: quiz.questions.filter((_, j) => j !== i),
                  passCount: Math.min(quiz.passCount, quiz.questions.length - 1),
                })
              }
              disabled={quiz.questions.length === 1}
              aria-label="Vraag verwijderen"
              title="Vraag verwijderen"
            >
              <IconTrash />
            </button>
          </div>
          <QuestionOptions question={question} onChange={(patch) => updateQuestion(i, patch)} />
        </section>
      ))}
      <button className="add-question" onClick={() => update({ questions: [...quiz.questions, emptyQuestion()] })}>
        <IconPlus /> Vraag toevoegen
      </button>

      <h3 className="editor-heading">Prijs voor de winnaar</h3>
      <PrizePicker quiz={quiz} onChange={(prize) => update({ prize })} />

      {errors.length > 0 && (
        <ul className="editor-errors">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="editor-actions">
        <button onClick={onDone}>Annuleren</button>
        <button className="primary" onClick={save}>
          Quiz opslaan
        </button>
      </div>
    </div>
  )
}

/** Answers of one question, with the right ones marked. Multiple-answer questions use checkboxes. */
function QuestionOptions({ question, onChange }: { question: Question; onChange: (patch: Partial<Question>) => void }) {
  const toggleCorrect = (k: number) => {
    if (!question.multiple) return onChange({ correct: [k] })
    const correct = question.correct.includes(k) ? question.correct.filter((c) => c !== k) : [...question.correct, k].sort((a, b) => a - b)
    onChange({ correct })
  }

  const removeOption = (k: number) =>
    onChange({
      options: question.options.filter((_, j) => j !== k),
      correct: question.correct.filter((c) => c !== k).map((c) => (c > k ? c - 1 : c)),
    })

  return (
    <>
      <label className="multi-toggle">
        <Switch
          checked={question.multiple}
          onChange={(multiple) => onChange({ multiple, correct: multiple ? question.correct : question.correct.slice(0, 1) })}
          label="Meerdere antwoorden goed"
        />
        <span>
          <strong>Meerdere antwoorden goed</strong>
          <span className="field-help">
            {question.multiple
              ? 'Agenten kunnen meerdere antwoorden aanvinken. De vraag telt alleen als goed als precies alle goede antwoorden zijn aangevinkt.'
              : 'Agenten kiezen één antwoord.'}
          </span>
        </span>
      </label>
      <p className="field-help">Vul de antwoorden in en {question.multiple ? 'vink alle goede antwoorden aan' : 'kies welk antwoord goed is'}.</p>
      <ul className="option-list">
        {question.options.map((option, k) => {
          const right = question.correct.includes(k)
          return (
            <li key={k} className={right ? 'correct' : ''}>
              <label className="correct-toggle" title={right ? 'Goed antwoord' : 'Markeer als goed antwoord'}>
                <input
                  type={question.multiple ? 'checkbox' : 'radio'}
                  name={`correct-${question.id}`}
                  checked={right}
                  onChange={() => toggleCorrect(k)}
                />
                <span>{right ? 'Goed' : 'Fout'}</span>
              </label>
              <input
                value={option}
                onChange={(e) => onChange({ options: question.options.map((o, j) => (j === k ? e.target.value : o)) })}
                placeholder={`Antwoord ${k + 1}`}
              />
              <button className="icon-button" disabled={question.options.length <= 2} onClick={() => removeOption(k)} aria-label="Antwoord verwijderen">
                <IconTrash />
              </button>
            </li>
          )
        })}
      </ul>
      {question.options.length < 6 && (
        <button className="add-option" onClick={() => onChange({ options: [...question.options, ''] })}>
          <IconPlus /> Antwoord toevoegen
        </button>
      )}
    </>
  )
}

const PRIZE_GROUPS: { key: string; label: string; filter: (i: ItemDef) => boolean }[] = [
  { key: 'books', label: 'Boeken', filter: isBook },
  { key: 'paint', label: 'Verf', filter: isPaint },
  { key: 'furniture', label: 'Meubels & decoratie', filter: (i) => !isBook(i) && !isPaint(i) },
]

function PrizePicker({ quiz, onChange }: { quiz: Quiz; onChange: (prize: Quiz['prize']) => void }) {
  const selected = quiz.prize.kind === 'item' ? ITEMS_BY_ID[quiz.prize.itemId] : undefined
  const [group, setGroup] = useState(() => PRIZE_GROUPS.find((g) => selected && g.filter(selected))?.key ?? 'books')
  const items = COLLECTIBLES.filter(PRIZE_GROUPS.find((g) => g.key === group)!.filter)

  const pickRandom = () => {
    const id = randomPrizeId()
    onChange({ kind: 'item', itemId: id })
    setGroup(PRIZE_GROUPS.find((g) => g.filter(ITEMS_BY_ID[id]))!.key)
  }

  return (
    <section className="editor-card prize-picker">
      <div className="prize-current">
        <span className="card-window">{selected ? <ItemIcon item={selected} /> : <IconGem />}</span>
        <div>
          <span className="eyebrow">Gekozen prijs</span>
          <strong>{selected ? selected.name : 'Verrassingsprijs'}</strong>
          <span className="field-help">
            {selected
              ? RARITY_LABEL[selected.rarity]
              : 'De winnaar krijgt een willekeurig stuk uit de collectie, bij voorkeur iets dat ze nog niet heeft.'}
          </span>
        </div>
        <div className="prize-buttons">
          <button onClick={pickRandom}>
            <IconDice /> Willekeurige prijs
          </button>
          <button className={quiz.prize.kind === 'surprise' ? 'active-choice' : ''} onClick={() => onChange({ kind: 'surprise' })}>
            <IconGem /> Verrassing bij winnen
          </button>
        </div>
      </div>

      <nav className="chips">
        {PRIZE_GROUPS.map((g) => (
          <button key={g.key} className={`chip ${group === g.key ? 'active' : ''}`} onClick={() => setGroup(g.key)}>
            {g.label}
            <span className="chip-count">{COLLECTIBLES.filter(g.filter).length}</span>
          </button>
        ))}
      </nav>
      <ul className="prize-grid">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={`prize-tile ${item.rarity} ${selected?.id === item.id ? 'selected' : ''}`}
              onClick={() => onChange({ kind: 'item', itemId: item.id })}
              title={item.name}
            >
              <span className="card-window">
                <ItemIcon item={item} />
              </span>
              <span className="name">{item.name}</span>
              <span className={`rarity ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
