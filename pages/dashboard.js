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
  const [bio, setBio] = useState('')

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
    setBio(data?.bio || '')
  }

  async function loadLinks(id) {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', id)
      .order('position')
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
    setLinks(links.filter((l) => l.id !== id))
  }

  async function uploadAvatar(ev) {
    const file = ev.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (error) return alert(error.message)
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    loadProfile(user.id)
  }

  async function saveBio() {
    await supabase.from('profiles').update({ bio }).eq('id', user.id)
    loadProfile(user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="container">
      <div className="card space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Dashboard</h2>
            <p className="text-gray-500">@{profile?.username || user.email}</p>
            <a
              href={(process.env.NEXT_PUBLIC_SITE_URL || '') + '/u/' + (profile?.username || '')}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600"
            >
              View public page
            </a>
          </div>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>

        <hr />

        {/* Profile */}
        <div>
          <h3 className="font-semibold">Profile</h3>
          <textarea
            className="input w-full mt-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button onClick={saveBio} className="btn mt-2 bg-gray-800 text-white">
            Save Bio
          </button>
          <div className="mt-4">
            <label className="btn">
              Upload avatar
              <input type="file" onChange={uploadAvatar} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold">Your Links</h3>
          <form onSubmit={addLink} className="grid gap-2 mt-2">
            <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="input" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="btn bg-gray-800 text-white">Add link</button>
          </form>

          <div className="mt-4 space-y-2">
            {links.map((l) => (
              <div
                key={l.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div>
                  <div className="font-semibold">{l.title}</div>
                  <a href={l.url} target="_blank" className="text-blue-600">
                    {l.url}
                  </a>
                </div>
                <button className="btn" onClick={() => deleteLink(l.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
    }
