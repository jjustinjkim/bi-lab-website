#!/usr/bin/env node
// Bootstraps the very first lab member account (an admin, so they can then
// add everyone else from the Members page in-app). Adding a member is
// normally gated behind requireAdmin(), which only an existing admin can
// call -- so the first one has to be created out-of-band, directly against
// the database, with the service-role key.
//
// Usage: node scripts/create-admin.mjs --email wbi@bwh.harvard.edu --name "Wenya Linda Bi" --password "at-least-8-chars"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1]
      i++
    }
  }
  return out
}

const { email, name, password, title } = parseArgs(process.argv.slice(2))

if (!email || !name || !password) {
  console.error('Usage: node scripts/create-admin.mjs --email you@bwh.harvard.edu --name "Your Name" --password "at-least-8-chars" [--title "Your Title"]')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

let url = process.env.NEXT_PUBLIC_SUPABASE_URL
let key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  const envPath = path.join(__dirname, '..', '.env.local')
  const env = fs.readFileSync(envPath, 'utf8')
  const vars = {}
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) vars[m[1]] = m[2]
  }
  url = url || vars.NEXT_PUBLIC_SUPABASE_URL
  key = key || vars.SUPABASE_SERVICE_ROLE_KEY
}

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (checked environment, then .env.local)')
  process.exit(1)
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const normalized = email.toLowerCase().trim()
const { data: existing } = await db.from('lab_members').select('id').ilike('email', normalized).limit(1)
if (existing && existing.length > 0) {
  console.error(`A lab member with email ${normalized} already exists.`)
  process.exit(1)
}

const passwordHash = await bcrypt.hash(password, 10)
const { error } = await db.from('lab_members').insert({ email: normalized, name, title: title ?? null, is_admin: true, password_hash: passwordHash })

if (error) {
  console.error('Failed to create lab member:', error.message)
  process.exit(1)
}

console.log(`Admin lab member account created: ${normalized}`)
