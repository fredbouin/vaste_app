import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const MARKERS = ['<<<<<<<', '=======', '>>>>>>>'];
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.css', '.json']);

const hasInterestingExt = (file) => {
  const idx = file.lastIndexOf('.');
  return idx >= 0 && EXTS.has(file.slice(idx));
};

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (hasInterestingExt(name)) out.push(full);
  }
  return out;
};

const problems = [];
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (MARKERS.some((m) => line.includes(m))) {
      problems.push(`${file}:${idx + 1}: ${line.trim()}`);
    }
  });
}

if (problems.length) {
  console.error('❌ Merge conflict markers detected. Resolve before building:');
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}

console.log('✅ No merge conflict markers found in client/src');
