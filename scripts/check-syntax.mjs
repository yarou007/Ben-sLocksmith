import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function filesIn(directory, extensions) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension)))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

const scripts = [
  ...filesIn('assets', ['.js']),
  ...filesIn('data', ['.mjs']),
  ...filesIn('scripts', ['.mjs'])
];

scripts.forEach((file) => {
  execFileSync(process.execPath, ['--check', file], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });
});

const jsonFiles = [
  'data/business.json',
  'data/proof-content.json',
  'data/redirects.json',
  'site.webmanifest',
  'vercel.json'
];
jsonFiles.forEach((file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));

console.log(`Syntax checks passed for ${scripts.length} JavaScript modules and ${jsonFiles.length} JSON files.`);
