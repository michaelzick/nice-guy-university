import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const courseArg = process.argv[2];
if (!courseArg) {
  console.error('Usage: node scripts/export-lessons.mjs <course-slug>');
  console.error('Example: node scripts/export-lessons.mjs cognitive-distortion-playbook');
  process.exit(1);
}

function toDashCase(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Read .env.local from project root (or main repo root)
function loadEnv() {
  const candidates = [
    resolve(rootDir, '.env.local'),
    resolve(rootDir, '../../.env.local'), // main repo root from worktree
  ];
  for (const p of candidates) {
    try {
      const content = readFileSync(p, 'utf8');
      const vars = {};
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        vars[key] = val;
      }
      console.log(`Loaded env from: ${p}`);
      return vars;
    } catch {
      // try next
    }
  }
  return {};
}

const env = loadEnv();

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'http://127.0.0.1:54331';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log(`Connecting to Supabase at ${SUPABASE_URL}`);

  // 1. Fetch the course by slug
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseArg)
    .single();

  if (courseErr) throw new Error(`Failed to fetch course "${courseArg}": ${courseErr.message}`);
  console.log(`Course: ${course.title} (${course.id})`);

  // 2. Fetch chapters ordered by sort_order
  const { data: chapters, error: chapErr } = await supabase
    .from('chapters')
    .select('id, title, sort_order')
    .eq('course_id', course.id)
    .order('sort_order');

  if (chapErr) throw new Error(`Failed to fetch chapters: ${chapErr.message}`);
  console.log(`Chapters: ${chapters.length}`);

  // 3. Fetch all lessons for this course
  const chapterIds = chapters.map(c => c.id);
  const { data: lessons, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, title, content, journal_prompts, sort_order, chapter_id')
    .in('chapter_id', chapterIds)
    .order('sort_order');

  if (lessonErr) throw new Error(`Failed to fetch lessons: ${lessonErr.message}`);
  console.log(`Lessons: ${lessons.length}`);

  // 4. Create output directory using dash-case course title
  const courseDirName = toDashCase(course.title);
  const outDir = resolve(rootDir, 'lesson-exports', courseDirName);
  mkdirSync(outDir, { recursive: true });

  // 5. Build chapter lookup
  const chapterMap = {};
  chapters.forEach((ch, idx) => {
    chapterMap[ch.id] = { ...ch, num: idx + 1 };
  });

  // 6. Sort lessons by chapter sort_order then lesson sort_order
  const sortedLessons = [...lessons].sort((a, b) => {
    const ca = chapterMap[a.chapter_id];
    const cb = chapterMap[b.chapter_id];
    if (ca.sort_order !== cb.sort_order) return ca.sort_order - cb.sort_order;
    return a.sort_order - b.sort_order;
  });

  // 7. Track lesson numbers per chapter
  const lessonCountByChapter = {};
  let filesWritten = 0;

  for (const lesson of sortedLessons) {
    const chapter = chapterMap[lesson.chapter_id];
    if (!lessonCountByChapter[chapter.id]) lessonCountByChapter[chapter.id] = 0;
    lessonCountByChapter[chapter.id]++;

    const chapterNum = String(chapter.num).padStart(2, '0');
    const lessonNum = String(lessonCountByChapter[chapter.id]).padStart(2, '0');
    const lessonSlug = toDashCase(lesson.title);
    const filename = `${chapterNum}-${lessonNum}-${lessonSlug}.md`;
    const filepath = resolve(outDir, filename);

    // Build journal prompts section
    let journalSection = '';
    if (lesson.journal_prompts && lesson.journal_prompts.length > 0) {
      const bullets = lesson.journal_prompts.map(p => `- ${p}`).join('\n');
      journalSection = `\n---\n\n## Journal Prompts\n\n${bullets}\n`;
    }

    const content = lesson.content ?? '_No content yet._';

    const markdown = `# ${lesson.title}

**Chapter:** ${chapter.title}

${content}${journalSection}`;

    writeFileSync(filepath, markdown, 'utf8');
    console.log(`  Written: ${filename}`);
    filesWritten++;
  }

  console.log(`\nDone. ${filesWritten} files written to lesson-exports/${courseDirName}/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
