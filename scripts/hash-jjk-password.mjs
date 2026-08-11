#!/usr/bin/env node
// Prints a bcrypt hash for a new JJK portal password, to paste into
// JJK_PASSWORD_HASH in .env.local and the Vercel project's env vars
// (production/preview/development). Doesn't write anywhere itself --
// rotating on Vercel also needs `vercel env rm/add`, same as the
// EDITOR_PASSWORD_HASH pattern in the sns-pd-academy sibling project.
//
// Usage: node scripts/hash-jjk-password.mjs "new-password"
import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password || password.length < 8) {
  console.error('Usage: node scripts/hash-jjk-password.mjs "at-least-8-chars"')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 10)
console.log(hash)
