import { GOALS } from '../game/goals'
import { ITEMS_BY_ID, RARITY_LABEL } from '../game/items'
import { goalProgress, useGame } from '../game/store'
import { DailyPrize } from './DailyPrize'
import { IconCheck } from './icons'
import { ItemIcon } from './ItemIcon'

export function GoalsPanel() {
  const state = useGame()
  const claimable = GOALS.filter((g) => !state.claimedGoals.includes(g.id) && goalProgress(state, g.metric) >= g.target).length

  return (
    <aside className="goals">
      <header className="goals-header">
        <span className="eyebrow">Jouw voortgang</span>
        <h2>Doelen</h2>
      </header>

      <DailyPrize />

      <div className="section-title">
        <h3>Mijlpalen</h3>
        {claimable > 0 && <span className="badge">{claimable} klaar om op te halen</span>}
      </div>

      <ol className="goal-list">
        {GOALS.map((goal, i) => {
          const progress = Math.min(goalProgress(state, goal.metric), goal.target)
          const claimed = state.claimedGoals.includes(goal.id)
          const done = progress >= goal.target
          const reward = ITEMS_BY_ID[goal.reward]
          return (
            <li key={goal.id} className={`goal ${claimed ? 'claimed' : done ? 'done' : ''}`}>
              <span className="goal-number">{String(i + 1).padStart(2, '0')}</span>
              <div className="goal-body">
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
                  <span className="reward-window">
                    <ItemIcon item={reward} />
                  </span>
                  <span className="reward-text">
                    {reward.name}
                    <small className={`rarity ${reward.rarity}`}>{RARITY_LABEL[reward.rarity]}</small>
                  </span>
                  {claimed ? (
                    <span className="check">
                      <IconCheck /> Opgehaald
                    </span>
                  ) : (
                    <button className="claim" disabled={!done} onClick={() => state.claimGoal(goal.id)}>
                      Ophalen
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

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
      <span className="eyebrow">Testen</span>
      <div className="dev-buttons">
        <button onClick={() => addPoints(25)}>+25 punten</button>
        <button onClick={completeQuiz}>Quiz voltooid</button>
        <button onClick={grantRandomItem}>Beloning</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  )
}
