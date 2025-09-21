
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
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data?.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, username })
    }
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up</h2>
        {error && <p style={{color:'red'}}>{error}</p>}
        <form onSubmit={handleSignup} style={{marginTop:12, display:'grid', gap:8}}>
          <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required />
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" type="email" required />
          <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" required />
          <button className="btn" style={{background:'#111827',color:'#fff'}} disabled={loading}>{loading? 'Creating...':'Create account'}</button>
        </form>
      </div>
    </div>
  )
}
