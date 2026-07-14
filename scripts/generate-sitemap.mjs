import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://dcemergencylockanddoor.com';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'sitemap.xml');
const VERCEL_CONFIG_FILE = path.join(ROOT_DIR, 'vercel.json');

const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.vercel',
  'coverage',
  'dist',
  'node_modules'
]);

// These documents can remain available to people and crawlers, but they are
// not search landing pages and do not belong in the XML sitemap.
const EXCLUDED_ROUTES = new Set(['/404', '/sitemap']);

// Paid-search pages must be canonical, noindex parameter views rather than
// independent sitemap URLs. This also protects future physical PPC layouts.
const PAID_ROUTE_PATTERN = /\/(?:google-ads|paid-search|ppc)(?:\/|$)/;

function compareStrings(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function listHtmlFiles(directory) {
  const files = [];
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => compareStrings(left.name, right.name));

  for (const entry of entries) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(absolutePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function routeForHtmlFile(file) {
  const relativeFile = path
    .relative(ROOT_DIR, file)
    .split(path.sep)
    .join('/');

  if (relativeFile === 'index.html') return '/';

  let route = `/${relativeFile.slice(0, -'.html'.length)}`;
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length) || '/';
  return route;
}

function parseAttributes(tag) {
  const attributes = new Map();
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;

  while ((match = attributePattern.exec(tag))) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function tagsNamed(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  return [...html.matchAll(pattern)].map((match) => parseAttributes(match[0]));
}

function canonicalHrefs(html) {
  return tagsNamed(html, 'link')
    .filter((attributes) =>
      (attributes.get('rel') || '')
        .toLowerCase()
        .split(/\s+/)
        .includes('canonical')
    )
    .map((attributes) => attributes.get('href') || '');
}

function hasNoindexDirective(html) {
  const crawlerNames = new Set(['robots', 'googlebot', 'bingbot']);

  return tagsNamed(html, 'meta').some((attributes) => {
    const name = (attributes.get('name') || '').toLowerCase();
    if (!crawlerNames.has(name)) return false;

    const directives = (attributes.get('content') || '')
      .toLowerCase()
      .split(/[\s,]+/);

    return directives.includes('noindex') || directives.includes('none');
  });
}

function hasMetaRefresh(html) {
  return tagsNamed(html, 'meta').some(
    (attributes) => (attributes.get('http-equiv') || '').toLowerCase() === 'refresh'
  );
}

function escapeRegexCharacter(character) {
  return /[\\^$.*+?()[\]{}|]/.test(character) ? `\\${character}` : character;
}

// Vercel redirect sources use path-to-regexp-style named parameters and may
// also contain raw `(.*)` captures. This compiler intentionally supports the
// route forms used in vercel.json without evaluating arbitrary expressions.
function redirectSourcePattern(source) {
  let expression = '';

  for (let index = 0; index < source.length; index += 1) {
    if (source.startsWith('(.*)', index)) {
      expression += '.*';
      index += '(.*)'.length - 1;
      continue;
    }

    if (source[index] === ':') {
      let cursor = index + 1;
      while (cursor < source.length && /[A-Za-z0-9_]/.test(source[cursor])) cursor += 1;

      if (cursor === index + 1) {
        expression += ':';
        continue;
      }

      const modifier = source[cursor];
      if (modifier === '*') {
        expression += '.*';
        cursor += 1;
      } else if (modifier === '+') {
        expression += '.+';
        cursor += 1;
      } else if (modifier === '?') {
        expression += '[^/]*';
        cursor += 1;
      } else {
        expression += '[^/]+';
      }

      index = cursor - 1;
      continue;
    }

    expression += escapeRegexCharacter(source[index]);
  }

  return new RegExp(`^${expression}$`);
}

function unconditionalRedirectPatterns() {
  const config = JSON.parse(fs.readFileSync(VERCEL_CONFIG_FILE, 'utf8'));

  return (config.redirects || [])
    .filter(
      (redirect) =>
        typeof redirect.source === 'string' &&
        !redirect.has?.length &&
        !redirect.missing?.length
    )
    .map((redirect) => redirectSourcePattern(redirect.source));
}

function isRedirectSource(route, redirectPatterns) {
  return redirectPatterns.some((pattern) => pattern.test(route));
}

function isSelfCanonical(canonicalHref, route) {
  let canonical;

  try {
    canonical = new URL(canonicalHref);
  } catch {
    return false;
  }

  if (canonical.origin !== SITE_ORIGIN) return false;
  if (canonical.search || canonical.hash) return false;
  if (canonical.pathname !== route) return false;
  if (canonical.pathname !== canonical.pathname.toLowerCase()) return false;
  if (canonical.pathname.endsWith('.html')) return false;
  if (canonical.pathname !== '/' && canonical.pathname.endsWith('/')) return false;

  return canonical.href === `${SITE_ORIGIN}${route}`;
}

function runGit(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function fileLastModified(file) {
  const relativeFile = path.relative(ROOT_DIR, file).split(path.sep).join('/');
  const worktreeStatus = runGit([
    'status',
    '--porcelain',
    '--untracked-files=all',
    '--',
    relativeFile
  ]);

  if (!worktreeStatus) {
    const committedAt = runGit(['log', '-1', '--format=%cI', '--', relativeFile]);
    if (committedAt) {
      const commitDate = new Date(committedAt);
      if (!Number.isNaN(commitDate.valueOf())) return commitDate.toISOString();
    }
  }

  return fs.statSync(file).mtime.toISOString();
}

function xmlEscape(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function sitemapXml(entries) {
  const urls = entries
    .map(
      ({ url, lastmod }) =>
        `  <url>\n    <loc>${xmlEscape(url)}</loc>\n    <lastmod>${xmlEscape(lastmod)}</lastmod>\n  </url>`
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    ''
  ].join('\n');
}

const redirectPatterns = unconditionalRedirectPatterns();
const seenRoutes = new Map();
const sitemapEntries = [];

for (const file of listHtmlFiles(ROOT_DIR)) {
  const route = routeForHtmlFile(file);

  // A lowercase output URL is only a 200 route when the backing file route is
  // already lowercase; silently lowercasing an uppercase filename would lie.
  if (route !== route.toLowerCase()) continue;
  if (EXCLUDED_ROUTES.has(route) || path.posix.basename(route) === '404') continue;
  if (route.startsWith('/city-')) continue;
  if (PAID_ROUTE_PATTERN.test(route)) continue;
  if (isRedirectSource(route, redirectPatterns)) continue;

  const html = fs.readFileSync(file, 'utf8');
  if (hasNoindexDirective(html) || hasMetaRefresh(html)) continue;

  const canonicals = canonicalHrefs(html);
  if (canonicals.length !== 1 || !isSelfCanonical(canonicals[0], route)) continue;

  if (seenRoutes.has(route)) {
    throw new Error(
      `Multiple HTML files map to ${route}: ${seenRoutes.get(route)} and ${path.relative(ROOT_DIR, file)}`
    );
  }
  seenRoutes.set(route, path.relative(ROOT_DIR, file));

  sitemapEntries.push({
    url: `${SITE_ORIGIN}${route}`,
    lastmod: fileLastModified(file)
  });
}

sitemapEntries.sort((left, right) => compareStrings(left.url, right.url));

const nextSitemap = sitemapXml(sitemapEntries);
const currentSitemap = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : '';

if (currentSitemap !== nextSitemap) fs.writeFileSync(OUTPUT_FILE, nextSitemap);

console.log(`Generated sitemap.xml with ${sitemapEntries.length} canonical URLs.`);
