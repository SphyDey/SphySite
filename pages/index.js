
import Link from 'next/link'
export default function Home(){
  return (
    <div className="container">
      <div className="card">
        <h1 style={{fontSize:22, fontWeight:700}}>Linktree-ready</h1>
        <p style={{marginTop:8,color:'#6b7280'}}>Multi-user link hub powered by Supabase.</p>
        <div style={{marginTop:16}}>
          <Link href="/signup"><a className="btn" style={{background:'#111827',color:'#fff'}}>Sign up</a></Link>
          <Link href="/login"><a className="btn" style={{marginLeft:8}}>Log in</a></Link>
        </div>
        <div style={{marginTop:12}}><Link href="/dashboard"><a className="linkbtn">Open Dashboard</a></Link></div>
      </div>
    </div>
  )
}
