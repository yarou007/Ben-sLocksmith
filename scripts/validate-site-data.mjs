import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import plannedPages from '../data/service-pages-planned.mjs';
import locksmithPages from '../data/service-pages-locksmith.mjs';
import hardwarePages from '../data/service-pages-hardware.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const business = JSON.parse(fs.readFileSync(path.join(root, 'data/business.json'), 'utf8'));
const redirects = JSON.parse(fs.readFileSync(path.join(root, 'data/redirects.json'), 'utf8'));
const deployment = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const pages = [...locksmithPages, ...hardwarePages, ...plannedPages];
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  values.forEach((item) => (seen.has(item) ? repeated.add(item) : seen.add(item)));
  return [...repeated];
}

assert(business.origin === 'https://dcemergencylockanddoor.com', 'Business origin must use the canonical HTTPS non-www host.');
assert(/^\+1\d{10}$/.test(business.phone?.e164 || ''), 'Business phone must be a US E.164 number.');
assert(/^https:\/\//.test(business.form?.endpoint || ''), 'Form endpoint must use HTTPS.');
assert(business.address?.verified !== true || Boolean(business.address.value), 'A verified address must include a value.');

Object.entries(business.trust || {}).forEach(([key, entry]) => {
  assert(!(entry?.value && !entry?.verified), `Trust field ${key} has a value but is not verified.`);
});
assert((business.proof?.caseStudies || []).length === 0, 'Case studies require human verification before publication.');
assert((business.proof?.testimonials || []).length === 0, 'Testimonials require human verification before publication.');

[
  ['slug', pages.map((page) => page.slug)],
  ['service', pages.map((page) => page.service)],
  ['title', pages.map((page) => page.title)],
  ['description', pages.map((page) => page.description)],
  ['H1', pages.map((page) => page.h1)]
].forEach(([label, values]) => {
  const repeated = duplicates(values);
  assert(repeated.length === 0, `Duplicate service-page ${label}: ${repeated.join(', ')}`);
});

const finalRoutes = new Set([
  '/',
  ...pages.map((page) => `/${page.slug}`),
  '/washington-dc',
  '/northern-virginia',
  '/maryland',
  '/about',
  '/gallery',
  '/privacy-policy',
  '/terms-of-service',
  '/blog',
  '/sitemap'
]);

pages.forEach((page) => {
  const prefix = `/${page.slug}`;
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug), `${prefix}: slug is not lowercase kebab-case.`);
  assert(page.title.length >= 35 && page.title.length <= 68, `${prefix}: title length ${page.title.length} is outside 35–68 characters.`);
  assert(page.description.length >= 130 && page.description.length <= 170, `${prefix}: description length ${page.description.length} is outside 130–170 characters.`);
  assert(['emergency', 'scheduled', 'hybrid'].includes(page.intent), `${prefix}: invalid intent ${page.intent}.`);
  assert(['emergency', 'scheduled'].includes(page.form), `${prefix}: invalid form type ${page.form}.`);
  assert(page.symptoms?.length >= 6, `${prefix}: needs at least six differentiated problem symptoms.`);
  assert(page.sections?.length >= 3, `${prefix}: needs at least three differentiated sections.`);
  assert(page.process?.length >= 3, `${prefix}: needs at least three process steps.`);
  assert(page.faqs?.length >= 3, `${prefix}: needs at least three visible FAQs.`);
  assert(page.related?.length >= 3, `${prefix}: needs at least three related canonical links.`);
  assert(Number.isInteger(page.heroImage?.width) && Number.isInteger(page.heroImage?.height), `${prefix}: hero image needs intrinsic dimensions.`);
  assert(fs.existsSync(path.join(root, String(page.heroImage?.src || '').replace(/^\//, ''))), `${prefix}: hero image file is missing.`);

  page.related?.forEach((link) => {
    assert(link.href.startsWith('/'), `${prefix}: related link ${link.href} is not root-relative.`);
    assert(!redirects[link.href], `${prefix}: related link ${link.href} points to a redirect source.`);
    const linkedFile = link.href === '/' ? path.join(root, 'index.html') : path.join(root, `${link.href.slice(1)}.html`);
    assert(finalRoutes.has(link.href) || fs.existsSync(linkedFile), `${prefix}: related link ${link.href} does not have a canonical backing page.`);
  });

  const output = path.join(root, `${page.slug}.html`);
  assert(fs.existsSync(output), `${prefix}: generated HTML file is missing.`);
  if (fs.existsSync(output)) {
    const html = fs.readFileSync(output, 'utf8');
    assert(html.includes(`<link rel="canonical" href="${business.origin}/${page.slug}">`), `${prefix}: generated canonical does not match the slug.`);
    assert(html.includes(`<h1>${page.h1.replaceAll('&', '&amp;').replaceAll("'", '&#39;')}</h1>`) || html.includes(`<h1>${page.h1}</h1>`), `${prefix}: generated H1 does not match the data object.`);
  }
});

Object.entries(redirects).forEach(([source, target]) => {
  assert(source.startsWith('/') && target.startsWith('/'), `Redirect ${source} -> ${target} must use root-relative paths.`);
  assert(source === source.toLowerCase() && target === target.toLowerCase(), `Redirect ${source} -> ${target} must be lowercase.`);
  assert(!source.endsWith('/') && (target === '/' || !target.endsWith('/')), `Redirect ${source} -> ${target} must follow the no-trailing-slash convention.`);
  assert(!source.endsWith('.html') && !target.endsWith('.html'), `Redirect map must store extensionless routes: ${source} -> ${target}.`);
  assert(source !== target, `Redirect source and target are identical: ${source}.`);
  assert(!redirects[target], `Redirect chain detected: ${source} -> ${target} -> ${redirects[target]}.`);
  assert(target === '/' || fs.existsSync(path.join(root, `${target.slice(1)}.html`)), `Redirect target ${target} does not have a backing HTML file.`);
});

assert(Array.isArray(deployment.redirects) && deployment.redirects.length > 0, 'vercel.json must contain redirect rules.');
assert(deployment.outputDirectory === 'public', 'vercel.json must publish the generated public directory.');
const assetCacheRule = (deployment.headers || []).find((rule) => rule.source === '/assets/(.*)');
const assetCacheControl = assetCacheRule?.headers?.find((header) => header.key.toLowerCase() === 'cache-control')?.value;
assert(
  assetCacheControl === 'public, max-age=0, must-revalidate',
  'Vercel assets must revalidate so a missing stylesheet response cannot be cached as immutable.'
);
(deployment.redirects || []).forEach((rule, index) => {
  assert(rule.statusCode === 301, `Vercel redirect rule ${index + 1} must use an explicit 301 status code.`);
  assert(!Object.hasOwn(rule, 'permanent'), `Vercel redirect rule ${index + 1} must not combine statusCode with permanent.`);
});

if (errors.length) {
  console.error(`Site data validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} service page configurations and ${Object.keys(redirects).length} canonical redirects.`);
}
