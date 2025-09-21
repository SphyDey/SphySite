
# Linktree-ready (Full) — Ready to deploy to Vercel

This is a fully working Linktree-style multi-user app using Next.js (pages router) + Supabase.

## Quick deploy (mobile-friendly)
1. Create a GitHub repo and upload this project's files (upload ZIP contents).
2. In Vercel import the repo as a New Project.
3. In Vercel Project Settings → Environment Variables add:
   - NEXT_PUBLIC_SUPABASE_URL = https://ivomuzlgbbnbprkfjtaz.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = <your anon key>
   - NEXT_PUBLIC_SITE_URL = https://your-vercel-domain.vercel.app
4. In Supabase SQL editor run `supabase.sql` (included).
5. In Supabase Storage create a bucket named `avatars`.
6. Deploy on Vercel and open your site.

## Features
- Signup (email + password) and Login
- Dashboard to edit profile (username, bio, avatar) and manage links (add/delete/reorder)
- Public profile pages at /u/[username]
- Avatars stored in avatars/{user_id}/avatar.ext and public URL saved in profiles table
- RLS policies + auto-profile creation (see supabase.sql)
