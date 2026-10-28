import { useState, type FormEvent, type ReactNode } from 'react'
import { useGame } from '../game/store'
import { ThemeToggle } from './ThemeToggle'

function LoginLayout({ eyebrow, title, intro, switchTo, children }: { eyebrow: string; title: string; intro: string; switchTo: { href: string; label: string }; children: ReactNode }) {
  return (
    <main className="login-screen">
      <ThemeToggle />
      <div className="login-window">
        <header className="login-brand">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>
        {children}
        <a className="login-switch" href={switchTo.href}>
          {switchTo.label}
        </a>
      </div>
    </main>
  )
}

/** Agents' entry page (the app's default route). */
export function AgentLoginPage() {
  const loginAgent = useGame((s) => s.loginAgent)
  const [name, setName] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    loginAgent(name)
  }

  return (
    <LoginLayout eyebrow="Bawaba" title="Inloggen" switchTo={{ href: '#/admin', label: 'Inloggen als beheerder' }} intro="Log in met je naam. Je kamer en je prijzen worden onder die naam bewaard.">
      <form className="login-form" onSubmit={submit}>
        <label className="field">
          Naam
          <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <button type="submit" className="primary" disabled={!name.trim()}>
          Naar mijn kamer
        </button>
      </form>
    </LoginLayout>
  )
}

/** Admin entry page, reached at #/admin. */
export function AdminLoginPage() {
  const loginAdmin = useGame((s) => s.loginAdmin)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const ok = await loginAdmin(username, password)
    setBusy(false)
    setError(!ok)
  }

  return (
    <LoginLayout eyebrow="Bawaba beheer" title="Beheerder" switchTo={{ href: '#/', label: 'Inloggen als agent' }} intro="Maak quizzen en kies welke prijzen agenten kunnen winnen.">
      <form className="login-form" onSubmit={submit}>
        <label className="field">
          Gebruikersnaam
          <input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>
        <label className="field">
          Wachtwoord
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <span className="error">Gebruikersnaam of wachtwoord klopt niet.</span>}
        <button type="submit" className="primary" disabled={busy || !username || !password}>
          Inloggen
        </button>
      </form>
    </LoginLayout>
  )
}
