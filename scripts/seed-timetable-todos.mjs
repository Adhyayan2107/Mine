// One-off importer: reads timetable.md's 30 day blocks and inserts one
// to-do per day, dated sequentially from START_DATE. Rerunnable — skips
// any day whose title is already in the table.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = process.argv[3] ?? '.env.local';
dotenv.config({ path: path.join(__dirname, '..', ENV_FILE), override: true });

const START_DATE = process.argv[2] ?? '2026-08-20'; // Day 1

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

const md = readFileSync(path.join(__dirname, '..', 'timetable.md'), 'utf8');
const headerRe = /^### Day (\d+) — (.+)$/gm;
const headers = [...md.matchAll(headerRe)];
if (headers.length !== 30) {
  throw new Error(`Expected 30 "### Day N — Title" headers in timetable.md, found ${headers.length}`);
}

const days = headers.map((match, i) => {
  const [, num, title] = match;
  const start = match.index + match[0].length;
  const end = i + 1 < headers.length ? headers[i + 1].index : md.length;
  const block = md.slice(start, end);
  const objective = block.match(/\*\*Objective:\*\*\s*(.+)/)?.[1]?.trim();
  const deliverable = block.match(/\*\*Deliverable:\*\*\s*(.+)/)?.[1]?.trim();
  const doneWhen = block.match(/\*\*Done when:\*\*\s*(.+)/)?.[1]?.trim();
  if (!objective || !deliverable || !doneWhen) {
    throw new Error(`Day ${num} is missing Objective/Deliverable/Done when`);
  }
  return {
    title: `Day ${num} — ${title.trim()}`,
    dueDate: addDays(START_DATE, Number(num) - 1),
    notes: `${objective}\n\nDeliverable: ${deliverable}\n\nDone when: ${doneWhen}`,
  };
});

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('localhost') ? undefined : { rejectUnauthorized: false },
});

try {
  let { rows } = await pool.query(`select id from categories where name = 'GTM Plan' limit 1`);
  let categoryId = rows[0]?.id;
  if (!categoryId) {
    // Same default teal the app's "new category" action uses, kept as a
    // signed 32-bit ARGB value the way Postgres integer expects it.
    ({ rows } = await pool.query(
      `insert into categories (name, color_value) values ($1, $2) returning id`,
      ['GTM Plan', 0xff4db6ac | 0],
    ));
    categoryId = rows[0].id;
  }

  let inserted = 0;
  let skipped = 0;
  for (const day of days) {
    const existing = await pool.query(`select id from todos where title = $1 limit 1`, [day.title]);
    if (existing.rows.length > 0) {
      skipped += 1;
      continue;
    }
    await pool.query(
      `insert into todos (title, notes, due_date, priority, category_id, is_completed)
       values ($1, $2, $3, 'high', $4, false)`,
      [day.title, day.notes, day.dueDate, categoryId],
    );
    inserted += 1;
  }
  console.log(`Inserted ${inserted} to-dos, skipped ${skipped} already present.`);
} finally {
  await pool.end();
}
