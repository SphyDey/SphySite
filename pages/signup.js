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
      // 1️⃣ Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existingUser) {
        throw new Error("Username is already taken, use another.")
      }

      // 2️⃣ Sign up the account
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      // 3️⃣ Insert profile row only after successful auth
      if (data?.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, username })

        if (insertError) throw insertError
      }

      router.push('/dashboard')
    } catch (err) {
      let msg = err.message

      if (msg.includes("Password")) {
        msg = "Password must contain:\n· a–z\n· A–Z\n· 0–9\n· ."
      }
      if (msg.includes("Email rate limit") || msg.includes("already registered")) {
        msg = "This email is already in use. Please use another."
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
