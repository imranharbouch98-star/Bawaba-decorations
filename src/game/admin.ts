/**
 * TEMPORARY client-side admin check. Anything in the browser bundle can be inspected,
 * so this only keeps casual users out. Move the login and the item settings to the
 * backend before this goes live.
 */
const ADMIN_HASH = '1d140092775f0faf802b2da7629a5b592bc8ed7d11c2bb9dc157ee5bd7f8a2ab'

async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkAdmin(username: string, password: string) {
  if (!crypto.subtle) return false
  return (await sha256(`${username.trim()}:${password}`)) === ADMIN_HASH
}
