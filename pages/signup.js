import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Try to sign up with email + password
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        // Gmail already in use
        if (signUpError.message.toLowerCase().includes("already registered")) {
          throw new Error("gmail_used")
        }
        throw signUpError
      }

      let usernameTaken = false

      // Step 2: Try inserting username into profiles
      if (data?.user) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, username })

        if (upsertError) {
          if (
            upsertError.message.includes("duplicate key value") ||
            upsertError.message.includes("already exists") ||
            upsertError.message.includes("violates")
          ) {
            usernameTaken = true
          } else {
            throw upsertError
          }
        }
      }

      // Step 3: Handle conflicts
      if (usernameTaken && error?.message === "gmail_used") {
        throw new Error("both_used")
      } else if (usernameTaken) {
        throw new Error("username_used")
      }

      // ✅ Success → go dashboard
      router.push('/dashboard')

    } catch (err) {
      let msg = err.message

      // Password rules
      if (msg.includes("Password")) {
        msg = "Password must contain:\n· a–z\n· A–Z\n· 0–9\n· ."
      }

      if (msg === "gmail_used") {
        msg = "Gmail already used. Please use a different Gmail."
      }
      if (msg === "username_used") {
        msg = "Username already used. Please choose another Username."
      }
      if (msg === "both_used") {
        msg = "Gmail and Username already used. Please use a different Gmail and Username."
      }

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up</h2>
        {error && <p style={{ color: 'red', whiteSpace: 'pre-line' }}>{error}</p>}
        <form onSubmit={handleSignup} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <input
            className="input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="username"
            required
          />
          <input
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email"
            type="email"
            required
          />
          <input
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            required
          />
          <button
            className="btn"
            style={{ background: '#111827', color: '#fff' }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
    }
