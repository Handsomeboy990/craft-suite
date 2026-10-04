// Point 1 and point 9 of the gate, read from the source rather than the page:
// no client fact and no visual literal inside a component.
//
//   node hardcoded.mjs ../portfolio-sports-coach
//
// An example that installs the shared package from a `file:` path has that
// package read as well, against the example's own content file.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = process.argv[2] ?? '../portfolio-sports-coach';
const content = JSON.parse(readFileSync(join(root, 'data/content.json'), 'utf8'));

// The names, numbers and places this instance invented. None of them belongs in
// a component: the template serves every instance, not this one.
const facts = new Set();
const collect = (node) => {
  if (typeof node === 'string' && node.trim().length > 3) facts.add(node.trim());
  else if (Array.isArray(node)) node.forEach(collect);
  else if (node && typeof node === 'object') Object.values(node).forEach(collect);
};
collect(content);

const CODE = /\.(tsx|ts|css|mjs)$/;
// Each file with the root it is read relative to, and the label it is
// reported under.
const files = [];
const walk = (dir, base, label) => {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', 'data', 'public'].includes(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, base, label);
    else if (CODE.test(entry)) files.push({ path, base, label });
  }
};
walk(root, root, '');

// The code an example installs from the shared package is the template too,
// and it serves every instance: it is read with the example's own facts. Its
// location comes from the example's own `file:` dependency, so a copy taken
// out of the repository with `_shared` placed elsewhere is still found.
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const sharedSpec = manifest.dependencies?.['site-template-shared'];
if (typeof sharedSpec === 'string' && sharedSpec.startsWith('file:')) {
  const shared = resolve(root, sharedSpec.slice('file:'.length));
  if (!existsSync(shared)) {
    console.error(`site-template-shared points at ${shared}, which does not exist.`);
    process.exit(2);
  }
  walk(shared, shared, '_shared/');
}

const problems = [];

for (const file of files) {
  const source = readFileSync(file.path, 'utf8');
  // The rules below read the path inside its own tree; the report names the
  // tree, so a hit in the shared package says so.
  const inside = relative(file.base, file.path);
  const where = file.label + inside;
  // The operator scripts print instructions to whoever installs the site; an
  // address in that text is guidance, not a value the site carries.
  const isOperatorScript = inside.startsWith('scripts/');
  // The back office is a tool, not the delivered site. Its only literal is the
  // fallback of a colour input for a value the loader already refuses.
  const isAdminSurface =
    inside.startsWith('components/admin') || inside.startsWith('app/admin') || inside.startsWith('admin/');

  // A fact from the content file appearing in code.
  for (const fact of facts) {
    // What counts as a client fact. A contract keyword (`textarea`, `energetic`,
    // `legalNotice`) is template vocabulary. So is a short label: the back
    // office field for opening hours is called "Horaires d'ouverture" whatever
    // the client's own heading says, and the two coinciding is not the template
    // carrying a client's words. A fact is prose, or something with a number in
    // it: a name, an address, a price, a sentence.
    const words = fact.split(/\s+/).length;
    if (fact.length < 12) continue;
    if (words <= 3 && !/\d/.test(fact)) continue;
    if (source.includes(fact)) problems.push([where, `carries a value from the content file: "${fact.slice(0, 48)}"`]);
  }

  // Contact details in any shape.
  const email = isOperatorScript ? [] : (source.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) ?? []);
  for (const hit of email) problems.push([where, `an email address: ${hit}`]);
  const phone = source.match(/\+\d[\d\s().-]{7,}/g) ?? [];
  for (const hit of phone) problems.push([where, `a telephone number: ${hit.trim()}`]);

  // Visual literals, outside the token bridge and the placeholder generator.
  if (!inside.startsWith('lib/tokens') && !isOperatorScript && !isAdminSurface) {
    const colour = source.match(/#[0-9a-f]{3,8}\b/gi) ?? [];
    for (const hit of colour) problems.push([where, `a colour literal: ${hit}`]);
    const family = source.match(/font-family:\s+(?!var\()/g) ?? [];
    for (const _ of family) problems.push([where, 'a font family literal']);
  }
}

if (problems.length === 0) {
  console.log(`${files.length} files read, nothing hardcoded.`);
} else {
  console.log(`${files.length} files read, ${problems.length} problems:\n`);
  for (const [file, why] of problems) console.log(`  ${file}: ${why}`);
  process.exitCode = 1;
}
