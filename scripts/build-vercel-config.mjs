import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://dcemergencylockanddoor.com';
const redirects = JSON.parse(fs.readFileSync(path.join(root, 'data/redirects.json'), 'utf8'));
const wwwHost = [{ type: 'host', value: 'www.dcemergencylockanddoor.com' }];

function rule(source, destination, has) {
  // The SEO migration plan calls for explicit 301 responses. Vercel's
  // `permanent: true` shorthand emits 308, so use statusCode instead.
  const entry = { source, destination, statusCode: 301 };
  if (has) entry.has = has;
  return entry;
}

const redirectRules = [];

// Exact legacy aliases come first so old .html and www combinations reach the
// final canonical in one hop instead of passing through clean-URL redirects.
for (const [source, target] of Object.entries(redirects).sort(([a], [b]) => a.localeCompare(b))) {
  const destination = `${origin}${target}`;
  redirectRules.push(rule(`${source}.html`, destination, wwwHost));
  redirectRules.push(rule(source, destination, wwwHost));
  redirectRules.push(rule(`${source}.html`, destination));
  redirectRules.push(rule(source, destination));
}

redirectRules.push(rule('/index.html', `${origin}/`, wwwHost));
redirectRules.push(rule('/index', `${origin}/`, wwwHost));
redirectRules.push(rule('/index.html', `${origin}/`));
redirectRules.push(rule('/index', `${origin}/`));
redirectRules.push(rule('/(.*).html', `${origin}/$1`, wwwHost));
redirectRules.push(rule('/:path*', `${origin}/:path*`, wwwHost));
redirectRules.push(rule('/(.*).html', `${origin}/$1`));

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  outputDirectory: 'public',
  cleanUrls: true,
  trailingSlash: false,
  headers: [
    {
      source: '/assets/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' }
      ]
    }
  ],
  redirects: redirectRules
};

const output = `${JSON.stringify(config, null, 2)}\n`;
const target = path.join(root, 'vercel.json');
if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) {
  fs.writeFileSync(target, output);
  console.log(`Wrote ${redirectRules.length} redirect rules to vercel.json.`);
} else {
  console.log('vercel.json is already current.');
}
