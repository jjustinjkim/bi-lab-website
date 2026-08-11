import { randomUUID } from 'node:crypto'

// A small in-memory stand-in for the Supabase/PostgREST client, covering
// only the query-builder surface lib/actions.ts, lib/queries.ts, and
// lib/auth.ts actually use: .select/.insert/.update/.delete, .eq/.neq/.ilike
// /.gte/.lte/.lt, .or (eq/in clauses only), .order/.limit, .single, the
// embedded-relation select used by getSessionMember (member_sessions ->
// lab_members), and the {count:'exact', head:true} select option. Adapted
// from the sibling NASBS portals' fakeSupabase.ts for this project's
// simpler schema (every table has a standard `id` PK and `created_at`, no
// upsert).

type Row = Record<string, unknown>
type Op = 'select' | 'insert' | 'update' | 'delete'

interface Filter {
  col: string
  op: 'eq' | 'neq' | 'ilike' | 'gte' | 'lte' | 'lt'
  val?: unknown
}

// Converts a Postgres LIKE/ILIKE pattern (backslash-escaped % and _, as
// produced by escapeLikePattern) into an equivalent case-insensitive regex.
function likeToRegex(pattern: string): RegExp {
  let out = ''
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (c === '\\') {
      const next = pattern[i + 1]
      if (next === '%' || next === '_' || next === '\\') {
        out += next.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        i++
        continue
      }
      out += '\\\\'
      continue
    }
    if (c === '%') { out += '.*'; continue }
    if (c === '_') { out += '.'; continue }
    out += c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${out}$`, 'i')
}

function matchesFilters(row: Row, filters: Filter[]): boolean {
  return filters.every(f => {
    if (f.op === 'eq') return row[f.col] === f.val
    if (f.op === 'neq') return row[f.col] !== f.val
    if (f.op === 'ilike') return likeToRegex(String(f.val)).test(String(row[f.col] ?? ''))
    // ISO 8601 / plain-date strings compare correctly with plain string
    // comparison, same as real Postgres comparing timestamptz/date columns.
    if (f.op === 'gte') return String(row[f.col] ?? '') >= String(f.val)
    if (f.op === 'lte') return String(row[f.col] ?? '') <= String(f.val)
    if (f.op === 'lt') return String(row[f.col] ?? '') < String(f.val)
    return true
  })
}

// .or('owner_id.eq.<id>,id.in.(<id1>,<id2>)') -- a comma-separated list of
// col.op.val clauses, ORed together, then ANDed with whatever plain filters
// are also on the query (matching real PostgREST .or() semantics). Only
// eq/in are implemented since those are the only operators this app's
// project-visibility filter actually generates.
interface OrClause { col: string; op: 'eq' | 'in'; val: string | string[] }

function splitTopLevel(s: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  if (cur) parts.push(cur)
  return parts
}

function parseOrFilter(filterString: string): OrClause[] {
  return splitTopLevel(filterString).map((clause) => {
    const m = clause.match(/^(\w+)\.(eq|in)\.(.+)$/)
    if (!m) throw new Error(`fakeSupabase: unsupported or() clause: ${clause}`)
    const [, col, op, rawVal] = m
    if (op === 'in') {
      return { col, op: 'in', val: rawVal.replace(/^\(/, '').replace(/\)$/, '').split(',').filter(Boolean) }
    }
    return { col, op: 'eq', val: rawVal }
  })
}

function matchesOrClauses(row: Row, clauses: OrClause[]): boolean {
  return clauses.some(c => {
    if (c.op === 'eq') return String(row[c.col]) === c.val
    return (c.val as string[]).includes(String(row[c.col]))
  })
}

interface SelectSpec {
  plainCols: string[] | null
  embeds: Array<{ table: string; cols: string[] }>
}

// Parses a PostgREST-style select string like
// 'member_id, expires_at, lab_members(id, email, name, title, is_admin, created_at)'
// into plain top-level columns plus embedded-relation specs.
function parseSelect(colsStr: string): SelectSpec {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of colsStr) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  if (cur.trim()) parts.push(cur)

  const plainCols: string[] = []
  const embeds: Array<{ table: string; cols: string[] }> = []
  for (const raw of parts) {
    const p = raw.trim()
    const m = p.match(/^(\w+)\((.+)\)$/)
    if (m) embeds.push({ table: m[1], cols: m[2].split(',').map(c => c.trim()) })
    else plainCols.push(p)
  }
  return { plainCols: plainCols.length ? plainCols : null, embeds }
}

// Singularizes a table name to guess its foreign-key column name on the
// embedding table (lab_members -> member_id, matching this schema's actual
// column name, not the naive "lab_member_id").
const FK_COLUMN: Record<string, string> = {
  lab_members: 'member_id',
}
function fkColumnFor(table: string): string {
  return FK_COLUMN[table] ?? `${table.replace(/s$/, '')}_id`
}

class FakeQueryBuilder implements PromiseLike<{ data: unknown; error: null; count?: number }> {
  private op: Op = 'select'
  private payload: Row | Row[] | null = null
  private filters: Filter[] = []
  private orderCol: string | null = null
  private orderAscending = true
  private limitN: number | null = null
  private singleFlag = false
  private wantCount = false
  private selectSpec: SelectSpec | null = null
  private orClauses: OrClause[] | null = null

  constructor(private db: FakeDb, private tableName: string) {}

  select(cols?: string, opts?: { count?: 'exact'; head?: boolean }) {
    if (opts?.count === 'exact') this.wantCount = true
    if (cols && cols.trim() !== '*') this.selectSpec = parseSelect(cols)
    return this
  }
  insert(payload: Row | Row[]) { this.op = 'insert'; this.payload = payload; return this }
  update(payload: Row) { this.op = 'update'; this.payload = payload; return this }
  delete() { this.op = 'delete'; return this }
  eq(col: string, val: unknown) { this.filters.push({ col, op: 'eq', val }); return this }
  neq(col: string, val: unknown) { this.filters.push({ col, op: 'neq', val }); return this }
  ilike(col: string, val: string) { this.filters.push({ col, op: 'ilike', val }); return this }
  gte(col: string, val: unknown) { this.filters.push({ col, op: 'gte', val }); return this }
  lte(col: string, val: unknown) { this.filters.push({ col, op: 'lte', val }); return this }
  lt(col: string, val: unknown) { this.filters.push({ col, op: 'lt', val }); return this }
  or(filterString: string) { this.orClauses = parseOrFilter(filterString); return this }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col
    this.orderAscending = opts?.ascending ?? true
    return this
  }
  limit(n: number) { this.limitN = n; return this }
  // Real Supabase's .single() errors on zero rows, .maybeSingle() returns
  // null without erroring -- this fake's .single() already implements the
  // latter's behavior (see execute() below), so maybeSingle is just an
  // explicit alias rather than a second implementation to keep in sync.
  single() { this.singleFlag = true; return this }
  maybeSingle() { this.singleFlag = true; return this }

  private embed(row: Row): Row {
    if (!this.selectSpec) return row
    const { plainCols, embeds } = this.selectSpec
    const out: Row = !plainCols || plainCols.includes('*')
      ? { ...row }
      : Object.fromEntries(plainCols.map(c => [c, row[c]]))
    for (const e of embeds) {
      const fkCol = fkColumnFor(e.table)
      const related = this.db.table(e.table).find(r => r.id === row[fkCol])
      out[e.table] = related
        ? (e.cols.includes('*') ? { ...related } : Object.fromEntries(e.cols.map(c => [c, related[c]])))
        : null
    }
    return out
  }

  private matches(row: Row): boolean {
    return matchesFilters(row, this.filters) && (!this.orClauses || matchesOrClauses(row, this.orClauses))
  }

  private execute(): { data: unknown; error: null; count?: number } {
    const table = this.db.table(this.tableName)

    if (this.op === 'insert') {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
      const rows = payloads.map(p => {
        const row = this.db.materialize(this.tableName, p)
        table.push(row)
        return this.embed({ ...row })
      })
      return { data: this.singleFlag ? rows[0] : rows, error: null }
    }

    if (this.op === 'update') {
      const matched = table.filter(r => this.matches(r))
      const updated = matched.map(r => {
        const merged = { ...r, ...(this.payload as Row) }
        table[table.indexOf(r)] = merged
        return this.embed({ ...merged })
      })
      return { data: this.singleFlag ? updated[0] ?? null : updated, error: null }
    }

    if (this.op === 'delete') {
      const matched = table.filter(r => this.matches(r))
      this.db.tables[this.tableName] = table.filter(r => !this.matches(r))
      return { data: matched.map(r => ({ ...r })), error: null }
    }

    // select -- always return fresh copies, never live references into the
    // table, so a caller holding onto a previous result can't observe a
    // later write mutate it out from under them (matching real PostgREST).
    let rows = table.filter(r => this.matches(r)).map(r => ({ ...r }))
    const count = rows.length
    if (this.orderCol) {
      const col = this.orderCol
      const ascending = this.orderAscending
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string | number | null
        const bv = b[col] as string | number | null
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (av < bv) return ascending ? -1 : 1
        if (av > bv) return ascending ? 1 : -1
        return 0
      })
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN)
    rows = rows.map(r => this.embed(r))

    if (this.wantCount) return { data: null, error: null, count }
    if (this.singleFlag) return { data: rows[0] ?? null, error: null }
    return { data: rows, error: null }
  }

  then<TResult1 = { data: unknown; error: null; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }
}

export class FakeDb {
  tables: Record<string, Row[]> = {}
  private clock = 0

  table(name: string): Row[] {
    if (!this.tables[name]) this.tables[name] = []
    return this.tables[name]
  }

  // A monotonically increasing fake timestamp, so ordering/window
  // assertions never depend on real wall-clock resolution.
  now(): string {
    this.clock += 1
    return new Date(1770000000000 + this.clock * 1000).toISOString()
  }

  materialize(tableName: string, row: Row): Row {
    const auto: Row = tableName === 'member_sessions'
      ? { token: randomUUID(), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString() }
      : {}
    const base: Row = { id: randomUUID(), created_at: this.now() }
    if (tableName === 'projects') base.updated_at = this.now()
    return { ...base, ...auto, ...row }
  }

  seed(name: string, rows: Row[]) {
    this.tables[name] = rows.map(r => ({ ...r }))
  }

  reset() {
    this.tables = {}
    this.clock = 0
  }

  from(name: string) {
    return new FakeQueryBuilder(this, name)
  }
}
