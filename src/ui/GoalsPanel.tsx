import { GOALS } from '../game/goals'
import { ITEMS_BY_ID, RARITY_LABEL } from '../game/items'
import { goalProgress, useGame } from '../game/store'
import { DailyPrize } from './DailyPrize'
import { ItemIcon } from './ItemIcon'

export function GoalsPanel() {
  const state = useGame()
  const claimable = GOALS.filter((g) => !state.claimedGoals.includes(g.id) && goalProgress(state, g.metric) >= g.target).length

  return (
    <aside className="goals">
      <header>
        <h2>Doelen</h2>
        {claimable > 0 && <span className="badge">{claimable} klaar</span>}
      </header>

      <DailyPrize />

      <ul>
        {GOALS.map((goal) => {
          const progress = Math.min(goalProgress(state, goal.metric), goal.target)
          const claimed = state.claimedGoals.includes(goal.id)
          const done = progress >= goal.target
          const reward = ITEMS_BY_ID[goal.reward]
          return (
            <li key={goal.id} className={`goal ${claimed ? 'claimed' : done ? 'done' : ''}`}>
              <div className="goal-text">
                <strong>{goal.title}</strong>
                <span>{goal.description}</span>
              </div>
              <div className="goal-progress">
                <div className="bar">
                  <div style={{ width: `${(progress / goal.target) * 100}%` }} />
                </div>
                <span>
                  {progress}/{goal.target}
                </span>
              </div>
              <div className="goal-reward">
                <ItemIcon item={reward} />
                <span>
                  {reward.name}
                  <small className={reward.rarity}>{RARITY_LABEL[reward.rarity]}</small>
                </span>
                {claimed ? (
                  <span className="check">✓</span>
                ) : (
                  <button disabled={!done} onClick={() => state.claimGoal(goal.id)}>
                    Ophalen
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <DevPanel />
    </aside>
  )
}

/** Temporary controls to simulate progress until the performance/quiz backend exists. */
function DevPanel() {
  const completeQuiz = useGame((s) => s.completeQuiz)
  const addPoints = useGame((s) => s.addPoints)
  const grantRandomItem = useGame((s) => s.grantRandomItem)
  const reset = useGame((s) => s.reset)

  return (
    <div className="dev">
      <span>Testen</span>
      <button onClick={() => addPoints(25)}>+25 punten</button>
      <button onClick={completeQuiz}>Quiz voltooid</button>
      <button onClick={grantRandomItem}>Willekeurige beloning</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
