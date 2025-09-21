
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const router = useRouter()

  async function handleLogin(e){
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        {error && <p style={{color:'red'}}>{error}</p>}
        <form onSubmit={handleLogin} style={{marginTop:12, display:'grid', gap:8}}>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" type="email" required />
          <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" required />
          <button className="btn" style={{background:'#111827',color:'#fff'}} disabled={loading}>{loading? 'Logging...':'Login'}</button>
        </form>
      </div>
    </div>
  )
}
