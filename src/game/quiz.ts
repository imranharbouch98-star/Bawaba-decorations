export interface Question {
  id: string
  text: string
  options: string[]
  /** Indexes into `options` of the right answers (exactly one unless `multiple`). */
  correct: number[]
  /** Agents may tick several answers; right only when they tick exactly the right ones. */
  multiple: boolean
}

/** A fixed prize chosen by the admin, or a surprise drawn from the collection when the agent wins. */
export type QuizPrize = { kind: 'item'; itemId: string } | { kind: 'surprise' }

export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  prize: QuizPrize
  /** Correct answers needed to win the prize. */
  passCount: number
  /** Attempts an agent gets; null = unlimited. */
  maxAttempts: number | null
  active: boolean
}

export interface QuizResult {
  attempts: number
  /** Most correct answers in any attempt. */
  bestCorrect: number
  passed: boolean
  /** The item won, once passed. */
  prizeId?: string
}

/** Choices for the admin's attempt limit; null = unlimited. */
export const ATTEMPT_OPTIONS: (number | null)[] = [1, 2, 3, 4, 5, 10, null]

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const emptyQuestion = (): Question => ({ id: newId(), text: '', options: ['', ''], correct: [0], multiple: false })

export const emptyQuiz = (): Quiz => ({
  id: newId(),
  title: '',
  description: '',
  questions: [emptyQuestion()],
  prize: { kind: 'surprise' },
  passCount: 1,
  maxAttempts: 3,
  active: true,
})

/** Right when exactly the correct answers were chosen: all of them, and nothing else. */
export function isAnswerRight(question: Question, chosen: number[] = []) {
  return chosen.length === question.correct.length && question.correct.every((c) => chosen.includes(c))
}

/** Number of questions answered right; `answers[i]` holds the chosen option indexes for question i. */
export const countCorrect = (quiz: Quiz, answers: number[][]) => quiz.questions.filter((q, i) => isAnswerRight(q, answers[i])).length

export const attemptsLeft = (quiz: Quiz, result?: QuizResult) =>
  quiz.maxAttempts === null ? Infinity : Math.max(0, quiz.maxAttempts - (result?.attempts ?? 0))

/** Problems that block saving, in Dutch for the admin. */
export function validateQuiz(quiz: Quiz): string[] {
  const errors: string[] = []
  if (!quiz.title.trim()) errors.push('Geef de quiz een titel.')
  if (!quiz.questions.length) errors.push('Voeg minstens één vraag toe.')
  if (quiz.passCount < 1 || quiz.passCount > quiz.questions.length) {
    errors.push('Het aantal goede antwoorden dat nodig is, moet tussen 1 en het aantal vragen liggen.')
  }
  quiz.questions.forEach((q, i) => {
    if (!q.text.trim()) errors.push(`Vraag ${i + 1} heeft nog geen tekst.`)
    const filled = q.options.filter((o) => o.trim()).length
    if (filled < 2) errors.push(`Vraag ${i + 1} heeft minstens twee antwoorden nodig.`)
    if (!q.correct.length || q.correct.some((c) => !q.options[c]?.trim())) {
      errors.push(`Kies bij vraag ${i + 1} ${q.multiple ? 'minstens één goed antwoord' : 'een goed antwoord'} dat is ingevuld.`)
    }
  })
  return errors
}

/** Example quizzes so a fresh install has something to play. Admins can edit or delete them. */
export const SEED_QUIZZES: Quiz[] = [
  {
    id: 'seed-welkom',
    title: 'Welkom bij het team',
    description: 'Een korte kennismakingsquiz.',
    passCount: 2,
    maxAttempts: 3,
    active: true,
    prize: { kind: 'item', itemId: 'book-sahara' },
    questions: [
      {
        id: 'q1',
        text: 'Een klant is boos aan de telefoon. Wat doe je eerst?',
        options: ['Rustig luisteren en laten uitpraten', 'Meteen een oplossing geven', 'Doorverbinden met een collega'],
        correct: [0],
        multiple: false,
      },
      {
        id: 'q2',
        text: 'Wanneer vat je een gesprek samen?',
        options: ['Nooit, dat kost tijd', 'Aan het einde, zodat de klant weet wat er gebeurt', 'Alleen als de klant erom vraagt'],
        correct: [1],
        multiple: false,
      },
      {
        id: 'q3',
        text: 'Wat laat een klant merken dat je echt luistert?',
        options: ['Snel praten', 'Herhalen wat de klant zei in je eigen woorden', 'Veel vaktermen gebruiken'],
        correct: [1],
        multiple: false,
      },
    ],
  },
  {
    id: 'seed-thee',
    title: 'Theekennis',
    description: 'Hoe goed ken jij Marokkaanse muntthee?',
    passCount: 3,
    maxAttempts: 2,
    active: true,
    prize: { kind: 'item', itemId: 'lantern-brass' },
    questions: [
      {
        id: 'q1',
        text: 'Welk kruid hoort zeker in Marokkaanse thee?',
        options: ['Basilicum', 'Verse munt', 'Rozemarijn'],
        correct: [1],
        multiple: false,
      },
      {
        id: 'q2',
        text: 'Welke thee is de basis?',
        options: ['Groene thee', 'Rooibos', 'Kamille'],
        correct: [0],
        multiple: false,
      },
      {
        id: 'q4',
        text: 'Wat hoort er in klassieke muntthee? Kies alle goede antwoorden.',
        options: ['Groene thee', 'Verse munt', 'Suiker', 'Melk'],
        correct: [0, 1, 2],
        multiple: true,
      },
      {
        id: 'q3',
        text: 'Waarom schenk je de thee van hoog?',
        options: ['Voor het schuimlaagje', 'Om sneller klaar te zijn', 'Dat maakt geen verschil'],
        correct: [0],
        multiple: false,
      },
    ],
  },
]
