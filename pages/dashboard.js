import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
      loadProfile(data.user.id)
      loadLinks(data.user.id)
    })
  }, [])

  async function loadProfile(id) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile(data)
  }

  async function loadLinks(id) {
    const { data } = await supabase.from('links').select('*').eq('user_id', id).order('position')
    setLinks(data || [])
    setLoading(false)
  }

  async function addLink(e) {
    e.preventDefault()
    if (!title || !url) return
    const { data, error } = await supabase
      .from('links')
      .insert([{ user_id: user.id, title, url, position: links.length }])
      .select()
      .single()
    if (!error) {
      setLinks([...links, data])
      setTitle('')
      setUrl('')
    }
  }

  async function deleteLink(id) {
    await supabase.from('links').delete().eq('id', id)
    setLinks(links.filter(l => l.id !== id))
  }

  async function uploadAvatar(ev) {
    const file = ev.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) return alert(uploadError.message)

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    loadProfile(user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Dashboard</h2>
            <p style={{ color: '#6b7280' }}>{profile?.username || user.email}</p>
            <a
              href={(process.env.NEXT_PUBLIC_SITE_URL || '') + '/u/' + (profile?.username || user.id)}
              target="_blank"
              rel="noreferrer"
            >
              View public page
            </a>
          </div>
          <div>
            <button className="btn" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>

        <hr style={{ margin: '12px 0' }} />

        <div style={{ marginTop: 8 }}>
          <h3>Profile</h3>
          <p>Bio</p>
          <textarea
            className="input"
            value={profile?.bio || ''}
            onChange={e =>
              supabase
                .from('profiles')
                .update({ bio: e.target.value })
                .eq('id', profile.id)
                .then(() => loadProfile(user.id))
            }
          />
          <div style={{ marginTop: 8 }}>
            <label className="btn">
              Upload avatar
              <input type="file" onChange={uploadAvatar} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <h3>Your links</h3>
          <form onSubmit={addLink} style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <input
              className="input"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              className="input"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <button className="btn" style={{ background: '#111827', color: '#fff' }}>
              Add link
            </button>
          </form>

          <div style={{ marginTop: 10 }}>
            {links.map(l => (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 8
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{l.title}</div>
                  <a href={l.url} target="_blank" style={{ color: '#2563eb' }}>
                    {l.url}
                  </a>
                </div>
                <div>
                  <button className="btn" onClick={() => deleteLink(l.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
      }
