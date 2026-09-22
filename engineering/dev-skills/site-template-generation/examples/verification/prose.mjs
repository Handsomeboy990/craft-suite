// Proofreads the prose of an instance. Nothing else in this directory does: the
// gate checks that a field is wired, the sweep that no fact is hardcoded, the
// browser suites that the page behaves. A word dropped while the content was
// written passes all of them and ships.
//
//   node prose.mjs ../portfolio-sports-coach
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '../portfolio-sports-coach';
const content = JSON.parse(readFileSync(join(root, 'data/content.json'), 'utf8'));

function* strings(node, path = '') {
  if (typeof node === 'string') yield [path, node];
  else if (Array.isArray(node)) {
    for (const [index, value] of node.entries()) yield* strings(value, `${path}[${index}]`);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      yield* strings(value, path ? `${path}.${key}` : key);
    }
  }
}

// French puts a space before : ; ! ? and none before , or . The rules below
// know the difference, because flagging correct typography teaches a reader to
// ignore the tool. A rule that cannot tell a label from a truncated sentence
// was written and removed for the same reason.
const RULES = [
  { name: 'double space', test: /\S {2,}\S/, why: 'two spaces, usually a word that went missing' },
  { name: 'space before a comma or a full stop', test: /\s[,.](\s|$)/, why: 'a word went missing before it' },
  { name: 'a word written twice', test: /\b(\p{L}{3,})\s+\1\b/iu, why: 'the same word twice in a row' },
  { name: 'an unclosed bracket', test: /\([^)]*$|^[^(]*\)/, why: 'a bracket without its pair' },
];

const problems = [];
for (const [path, value] of strings(content)) {
  if (value.length < 12) continue;
  for (const rule of RULES) {
    if (rule.only && !rule.only.test(path)) continue;
    if (rule.test.test(value)) problems.push({ path, rule: rule.name, why: rule.why, value });
  }
}

if (problems.length === 0) {
  console.log('prose reads clean.');
} else {
  console.log(`${problems.length} thing(s) to look at:\n`);
  for (const p of problems) {
    console.log(`  ${p.path}: ${p.rule}`);
    console.log(`    ${p.why}`);
    console.log(`    ${p.value.slice(0, 96)}${p.value.length > 96 ? '...' : ''}\n`);
  }
  process.exitCode = 1;
}
