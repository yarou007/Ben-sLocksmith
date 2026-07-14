import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'public');
const publicDirectories = ['assets', 'blog'];
const publicRootFiles = [
  'favicon.ico',
  'llms.txt',
  'robots.txt',
  'site.webmanifest',
  'sitemap.xml'
];
const requiredOutputFiles = [
  'index.html',
  '404.html',
  'assets/site.css',
  'assets/site.js',
  'robots.txt',
  'sitemap.xml'
];

let copiedFiles = 0;

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  copiedFiles += 1;
}

function copyDirectory(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      copyFile(sourcePath, destinationPath);
    }
  }
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
  if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
    copyFile(path.join(root, entry.name), path.join(outputDirectory, entry.name));
  }
}

for (const directory of publicDirectories) {
  const source = path.join(root, directory);
  if (!fs.existsSync(source)) throw new Error(`Required public directory is missing: ${directory}`);
  copyDirectory(source, path.join(outputDirectory, directory));
}

for (const file of publicRootFiles) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) throw new Error(`Required public file is missing: ${file}`);
  copyFile(source, path.join(outputDirectory, file));
}

for (const file of requiredOutputFiles) {
  if (!fs.existsSync(path.join(outputDirectory, file))) {
    throw new Error(`Deployment output is incomplete: public/${file} is missing`);
  }
}

console.log(`Prepared public/ deployment output with ${copiedFiles} files.`);
