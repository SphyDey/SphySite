import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Signup(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [username,setUsername] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const router = useRouter()

  async function handleSignup(e){
    e.preventDefault()
    setLoading(true); setError('')

    try {
      // create account
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      if (data?.user) {
        // insert username, fail if already taken
        const { error: upsertError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, username })

        if (upsertError) throw upsertError
      }

      router.push('/dashboard')
    } catch (err) {
      let msg = err.message

      // 🔹 Clean password error
      if (msg.includes("Password should contain")) {
        msg = "Password must contain:\n· a–z\n· A–Z\n· 0–9\n· ."
      }

      // 🔹 Username already taken error
      if (msg.includes("duplicate key value") || msg.includes("already exists")) {
        msg = "This username is already taken. Please choose another."
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
        {error && <p style={{ color:'red', whiteSpace:'pre-line' }}>{error}</p>}
        <form onSubmit={handleSignup} style={{marginTop:12, display:'grid', gap:8}}>
          <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required />
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" type="email" required />
          <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" required />
          <button className="btn" style={{background:'#111827',color:'#fff'}} disabled={loading}>
            {loading? 'Creating...':'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
  }
