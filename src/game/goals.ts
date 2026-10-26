export type Metric = 'quizzes' | 'busyDays' | 'placed'

export interface Goal {
  id: string
  title: string
  description: string
  metric: Metric
  target: number
  reward: string
}

export const GOALS: Goal[] = [
  { id: 'quiz-1', title: 'Eerste quiz', description: 'Voltooi je eerste quiz', metric: 'quizzes', target: 1, reward: 'tea-glasses' },
  { id: 'quiz-3', title: 'Goed bezig', description: 'Voltooi 3 quizzen', metric: 'quizzes', target: 3, reward: 'cushion-teal' },
  { id: 'placed-5', title: 'Thuisgevoel', description: 'Plaats 5 decoraties in je kamer', metric: 'placed', target: 5, reward: 'cushion-trellis' },
  { id: 'busy-1', title: 'Er zijn wanneer het telt', description: 'Haal je dagprijs op een drukke dag', metric: 'busyDays', target: 1, reward: 'lantern-brass' },
  { id: 'busy-3', title: 'Steunpilaar', description: 'Haal je dagprijs op 3 drukke dagen', metric: 'busyDays', target: 3, reward: 'screen-mashrabiya' },
  { id: 'quiz-12', title: 'Volle boekenkast', description: 'Voltooi 12 quizzen en vul je boekenkast', metric: 'quizzes', target: 12, reward: 'rug-kilim' },
  { id: 'quiz-25', title: 'Leergierig', description: 'Voltooi 25 quizzen', metric: 'quizzes', target: 25, reward: 'mirror-arch' },
]
