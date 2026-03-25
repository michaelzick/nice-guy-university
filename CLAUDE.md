# Claude Code Instructions

## Fact Check Updates Command

Triggered by: `fact check updates [course-slug]`

When this command is run, apply AI fact-check corrections to the specified course's lesson content, keeping all three content locations in sync.

---

## Where Lesson Content Lives (3 Places Must Stay in Sync)

1. **Original INSERT migration** — `supabase/migrations/NNN_add_[course-slug]_course.sql` — used for fresh installs
2. **Seed file** — `supabase/seeds/seed.sql`
3. **Exported markdown files** — `lesson-exports/[course-slug]/[filename].md`

---

## Before You Start

1. **Find the original INSERT migration** for the course by grepping for the course slug in `supabase/migrations/`.
2. **Find lesson UUIDs** by reading that migration file — never assume UUIDs. Grep for the lesson title or sort order to locate each one.
3. **Determine the next migration number** by checking the highest-numbered file in `supabase/migrations/`.

---

## Workflow (Per Batch of Changes)

1. **Create a new migration file**: `supabase/migrations/NNN_update_[course-slug]_lessons_batchN.sql`
   - Use `UPDATE lessons SET content = replace(content, 'old text', 'new text') WHERE id = 'uuid'`
   - Apostrophes in plain string literals must be escaped as `''`

2. **Edit the original INSERT migration** for the course — apply the same text changes inside the `$$...$$` dollar-quoted blocks
   - Apostrophes inside `$$...$$` are literal `'` — no escaping needed

3. **Edit `supabase/seeds/seed.sql`** — apply the same text changes
   - Apostrophes must be escaped as `''`

4. **Edit the affected exported markdown files** in `lesson-exports/[course-slug]/`
   - Apostrophes are plain `'` — no escaping needed

5. **Run the migration**: `supabase migration up` from the repo root

6. **Regenerate exported markdown**: `npm run export:lessons [course-slug]`

7. **Verify**: Grep the updated files for key new phrases to confirm changes landed

---

## Lesson Content Structure

Each lesson's `content` field contains three sections in order:

1. **`## Full Script`** — the lesson body. Uses bold-text headers (`**Section Name**`) as informal dividers within the script, e.g. `**How It Shows Up in Men**`, `**Scientific Research**`, `**The Mechanism**`.
2. **`## Quick-Reference Outline`** — bullet points summarizing the lesson. The last bullet is always `- **Scientific research:**` with a one-sentence summary of the key study or finding.
3. No journal prompts in the content field — those are in the separate `journal_prompts` column and get appended by the export script.

### Scientific Research Section Pattern

When a fact-check batch adds a `**Scientific Research**` section to a lesson, it goes:
- **Inside the Full Script body**, as a bold-text subsection at the end of the script, before the `---` separator.
- **Sources**: peer-reviewed or clinically documented research only. Good sources include Ekman, Gottman, Buss, Zahavi, Porges, Bowen, Schnarch, Berne, Deci/Ryan, Stern, Darwin. No political, military, arts, or non-relationship historical examples.
- **Writing style**: use contractions (don't, can't, it's, you're), no em dashes. Natural tone.
- **Quick-Ref bullet**: add `- **Scientific research:** [one-sentence summary]` as the final bullet in the Quick-Reference Outline.

Example structure:
```
## Full Script

[lesson body content]

**Scientific Research**

[1-2 paragraphs of research, natural prose, contractions, no em dashes]

---

## Quick-Reference Outline

- [existing bullets]
- **Scientific research:** [one-sentence summary; source citation]
```

---

## Technical Notes

- **`supabase db push` does NOT work** on this setup (not linked to a remote project). Always use `supabase migration up`.
- **Dollar-quoting (`$$...$$`) in INSERT migrations**: apostrophes are literal `'`.
- **Plain string literals** in update migrations and `seed.sql`: apostrophes must be escaped as `''`.
- **Exported markdown files**: plain apostrophes `'`, no escaping.
- **Always `Read` a file before `Edit`** — the Edit tool requires a prior read in the conversation.
- **Adding sections to content**: to insert before `---\n\n## Quick-Reference Outline`, use `replace(content, '\n\n---\n\n## Quick-Reference Outline', '\n\n[new section]\n\n---\n\n## Quick-Reference Outline')`. To truncate at a known suffix, use `left(content, position('search string' IN content) - 1) || 'appended text'`.
