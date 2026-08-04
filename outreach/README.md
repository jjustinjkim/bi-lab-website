# /outreach

Tracks real outreach to the institutions behind each core dataset, requesting clinical metadata
(radiation-treatment status, and other gaps like recurrence/outcome data) that exists at the
source but didn't make it into the public deposit. This is the record of what actually
happened -- who was emailed, when, and what came back -- not a measure of what's already public
(that's `data/*.json`'s own `tags` and field-completeness, unrelated to this file).

**`status.json`** is the single source of truth, one entry per core dataset (`data/*.json`'s
`id`), keyed the same way. The website's `/institutions` page reads this file directly to compute
each institution's outreach funnel and sort institutions by responsiveness -- so this file is
edited the same way `/data/*.json` is: by hand, only ever recording what genuinely happened, never
a guess or a placeholder for "probably will respond."

## Schema

```jsonc
{
  "<dataset-id>": {
    "status": "enum: not_contacted | contacted | responded_declined | responded_no_new_data | responded_partial_data | responded_full_data",
    "contact_log": [
      {
        "date": "YYYY-MM-DD",
        "contacted_person": "string, name of who was emailed, or 'Not reported' if unknown",
        "method": "string, e.g. 'email'",
        "fields_requested": ["string, e.g. 'radiation_treatment_status', 'recurrence_status'"],
        "outcome": "string, free text -- what happened, quote the reply if useful",
        "fields_received": ["string, subset of fields_requested actually obtained, empty if none yet"]
      }
    ]
  }
}
```

## Status definitions

- **not_contacted**: no outreach attempted yet. Every entry starts here -- this file is seeded at
  `not_contacted` for all 138 core datasets as of 2026-08-04, since outreach had not yet begun.
- **contacted**: an email was sent, no reply yet.
- **responded_declined**: they replied but declined to share additional clinical metadata.
- **responded_no_new_data**: they replied, but had nothing beyond what's already in the public deposit.
- **responded_partial_data**: they replied with some, but not all, of the requested clinical fields.
- **responded_full_data**: they replied with everything requested.

## How this rolls up on `/institutions`

The website groups datasets by (canonicalized) institution and shows, per institution: how many of
its datasets have been contacted, how many got any reply, and how many yielded new clinical
metadata (`responded_partial_data` or `responded_full_data`). That last count is the one meant to
answer "who should we prioritize partnering with" -- an institution that reliably replies with real
data is a stronger future-partner signal than one with more datasets but no response history.

## Updating this file

There's no live backend -- this is a static site, matching the rest of this project's
architecture. Update `status.json` directly (by hand, or ask a future session to update it from a
description of what happened) whenever:
- An email is sent (`not_contacted` -> `contacted`, log the attempt).
- A reply comes in (update `status`, append to `contact_log` with the outcome and any
  `fields_received`).

Never mark a dataset `contacted` or beyond without a real, dated attempt in `contact_log` -- this
file has the same "never fabricate" standard as everything else in this repository.
