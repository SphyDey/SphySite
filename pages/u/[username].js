import { supabase } from "../../lib/supabaseClient"

export async function getServerSideProps({ params }) {
  const username = params.username

  // Find profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .limit(1)
    .maybeSingle()

  if (!profile) return { notFound: true }

  // Get public links
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("position")

  return { props: { profile, links } }
}

export default function PublicProfile({ profile, links }) {
  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <div
        style={{
          background: "#111827",
          color: "#fff",
          padding: 28,
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              background: "#374151",
              display: "inline-block",
            }}
          />
        )}
        <h2 style={{ marginTop: 12, fontSize: 22 }}>
          {profile.full_name || profile.username}
        </h2>
        <p style={{ opacity: 0.85, marginTop: 6 }}>{profile.bio}</p>

        <div style={{ marginTop: 16 }}>
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                margin: "10px 0",
                padding: "14px",
                borderRadius: 12,
                background: "#fff",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {l.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
    }
