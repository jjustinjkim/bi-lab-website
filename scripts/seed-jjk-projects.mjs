#!/usr/bin/env node
// Seeds Justin's real research pipeline into the JJK research progress
// portal, so it's useful immediately instead of empty. Safe to re-run: it
// checks for an existing project/idea with the same name/title first and
// skips it rather than creating a duplicate.
//
// Requires the jjk_* tables to already exist (run the "JJK research
// progress portal" section of supabase/schema.sql in the Supabase SQL
// editor first).
//
// Usage: node scripts/seed-jjk-projects.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

const PROJECTS = [
  {
    name: 'Progestin (Meningioma Hormone Exposure)',
    pillar: 'manuscript',
    stage: 'under_review',
    collaborators: 'Varun Kshettry, David Raleigh',
    notes: 'Sent to Kshettry and Raleigh on 2026-08-11. Considering adding Stephen Magill for a second round of review.',
  },
  {
    name: 'Osi (Molecular Osi NSCLC)',
    pillar: 'manuscript',
    stage: 'revision',
    collaborators: 'Zsombor',
    notes: 'Analysis and edits finished.',
  },
  {
    name: 'Salvage Mets',
    pillar: 'manuscript',
    stage: 'revision',
    collaborators: 'Zsombor, Dr. Bi',
    notes: 'Revision draft finished, already submitted to JNS previously.',
  },
  {
    name: 'CDKN2AB',
    pillar: 'manuscript',
    stage: 'drafting',
    target_date: '2026-08-28',
    notes: 'Push to a draft ready for co-authors by 2026-08-28.',
  },
  {
    name: 'Breakpoints',
    pillar: 'manuscript',
    stage: 'drafting',
    notes: 'Top priority -- push to submission ASAP.',
  },
  {
    name: 'Radiogenomics',
    pillar: 'collaboration',
    stage: 'planning',
    collaborators: 'Andrew',
    notes: 'Andrew has 2 dedicated research weeks, 2026-09-28 to 2026-10-09.',
  },
]

const IDEAS = [
  {
    pillar: 'manuscript',
    title: 'ctDNA meningioma',
    spark: 'Listed with a "?" on the 2026-08-11 project list -- not yet a committed project.',
  },
]

for (const p of PROJECTS) {
  const { data: existing } = await db.from('jjk_projects').select('id').eq('name', p.name).limit(1)
  if (existing && existing.length > 0) {
    console.log(`Skipped (already exists): ${p.name}`)
    continue
  }
  const { error } = await db.from('jjk_projects').insert(p)
  if (error) {
    console.error(`Failed to seed project "${p.name}":`, error.message)
    process.exit(1)
  }
  console.log(`Seeded project: ${p.name}`)
}

for (const i of IDEAS) {
  const { data: existing } = await db.from('jjk_big_ideas').select('id').eq('title', i.title).limit(1)
  if (existing && existing.length > 0) {
    console.log(`Skipped (already exists): ${i.title}`)
    continue
  }
  const { error } = await db.from('jjk_big_ideas').insert(i)
  if (error) {
    console.error(`Failed to seed idea "${i.title}":`, error.message)
    process.exit(1)
  }
  console.log(`Seeded idea: ${i.title}`)
}

console.log('Done.')
