#!/usr/bin/env node

/**
 * Dependency-free static-site QA gate.
 *
 * Run:
 *   node scripts/qa-site.mjs
 *   node scripts/qa-site.mjs --verbose
 *   node scripts/qa-site.mjs --json
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const args = new Set(process.argv.slice(2));
const verbose = args.has('--verbose');
const jsonOutput = args.has('--json');
const detailLimit = verbose ? Number.POSITIVE_INFINITY : 8;

if (args.has('--help') || args.has('-h')) {
  console.log('Usage: node scripts/qa-site.mjs [--verbose] [--json]');
  console.log('Validates static HTML, routes, redirects, sitemap, forms, phone links, assets, and conversion essentials.');
  process.exit(0);
}

const requiredTrackingFields = [
  'landing_page',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid'
];

const ignoredDirectories = new Set([
  '.git',
  '.agents',
  '.codex',
  'node_modules',
  '.vercel'
]);

const issueGroups = new Map();
const issueKeys = new Set();
let checkCount = 0;

function addIssue(group, route, message) {
  const key = group + '\u0000' + route + '\u0000' + message;
  if (issueKeys.has(key)) return;
  issueKeys.add(key);
  if (!issueGroups.has(group)) issueGroups.set(group, []);
  issueGroups.get(group).push({ route, message });
}

function checked(amount = 1) {
  checkCount += amount;
}

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    console.error('QA configuration error: could not read ' + relativePath + ': ' + error.message);
    process.exit(2);
  }
}

function walk(directory, predicate, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, predicate, results);
    } else if (predicate(absolutePath)) {
      results.push(absolutePath);
    }
  }
  return results;
}

function routeForHtml(filePath) {
  const relative = path.relative(ROOT, filePath).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) {
    return '/' + relative.slice(0, -'/index.html'.length);
  }
  return '/' + relative.slice(0, -'.html'.length);
}

function normalizeRoute(value) {
  if (!value || value === '/') return '/';
  let output = value.split('?')[0].split('#')[0];
  try {
    output = decodeURIComponent(output);
  } catch {
    // Keep the encoded value so a useful error can be reported elsewhere.
  }
  output = output.replace(/\/+/g, '/');
  if (!output.startsWith('/')) output = '/' + output;
  if (output.length > 1) output = output.replace(/\/+$/, '');
  return output;
}

function parseAttributes(source) {
  const attributes = {};
  const expression = /([^\s"'=<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
  let match;
  while ((match = expression.exec(source))) {
    const name = match[1].toLowerCase();
    attributes[name] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function tagMatches(html, tagName) {
  const expression = new RegExp('<' + tagName + '\\b([^>]*)>', 'gi');
  const matches = [];
  let match;
  while ((match = expression.exec(html))) {
    matches.push({
      raw: match[0],
      attrs: parseAttributes(match[1]),
      index: match.index
    });
  }
  return matches;
}

function pairedTagMatches(html, tagName) {
  const expression = new RegExp('<' + tagName + '\\b([^>]*)>([\\s\\S]*?)<\\/' + tagName + '\\s*>', 'gi');
  const matches = [];
  let match;
  while ((match = expression.exec(html))) {
    matches.push({
      raw: match[0],
      attrs: parseAttributes(match[1]),
      inner: match[2],
      index: match.index
    });
  }
  return matches;
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)));
}

function cleanText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function visibleText(html) {
  return cleanText(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, ' ')
      .replace(/<template\b[\s\S]*?<\/template\s*>/gi, ' ')
  );
}

function firstPairedText(html, tagName) {
  const match = pairedTagMatches(html, tagName)[0];
  return match ? cleanText(match.inner) : '';
}

function metaContent(html, name) {
  const lowerName = name.toLowerCase();
  const match = tagMatches(html, 'meta').find((item) => {
    return (item.attrs.name || '').toLowerCase() === lowerName;
  });
  return match ? (match.attrs.content || '').trim() : '';
}

function metaPropertyContent(html, propertyName) {
  const lowerName = propertyName.toLowerCase();
  const match = tagMatches(html, 'meta').find((item) => {
    return (item.attrs.property || '').toLowerCase() === lowerName;
  });
  return match ? (match.attrs.content || '').trim() : '';
}

function linkHrefByRel(html, relName) {
  const lowerRel = relName.toLowerCase();
  const match = tagMatches(html, 'link').find((item) => {
    return (item.attrs.rel || '').toLowerCase().split(/\s+/).includes(lowerRel);
  });
  return match ? (match.attrs.href || '').trim() : '';
}

function safeUrl(value, base) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) digits = '1' + digits;
  return digits;
}

function samePhone(left, right) {
  return normalizePhone(left) === normalizePhone(right);
}

function hasNoindex(robots) {
  return robots
    .toLowerCase()
    .split(',')
    .flatMap((part) => part.trim().split(/\s+/))
    .includes('noindex');
}

function canonicalPath(canonical, origin) {
  const parsed = safeUrl(canonical, origin);
  if (!parsed || parsed.origin !== origin) return null;
  return normalizeRoute(parsed.pathname);
}

function idValues(html) {
  const values = new Set();
  const expression = /\b(?:id|name)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>]+))/gi;
  let match;
  while ((match = expression.exec(html))) {
    values.add(match[1] ?? match[2] ?? match[3]);
  }
  return values;
}

function isSkippableReference(value) {
  return !value
    || value.startsWith('#')
    || /^(?:mailto|tel|sms|javascript|data|blob):/i.test(value);
}

function internalUrl(value, base, allowedHosts) {
  const parsed = safeUrl(value, base);
  if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) return null;
  if (!allowedHosts.has(parsed.hostname.toLowerCase())) return null;
  return parsed;
}

function fileForPublicPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const relative = decoded.replace(/^\/+/, '');
  const absolute = path.resolve(ROOT, relative || 'index.html');
  if (absolute !== ROOT && !absolute.startsWith(ROOT + path.sep)) return null;
  if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return absolute;
  return null;
}

function redirectRuleMatches(rule, url) {
  const hostConditions = (rule.has || []).filter((condition) => condition.type === 'host');
  if (hostConditions.length && !hostConditions.every((condition) => {
    return condition.value.toLowerCase() === url.hostname.toLowerCase();
  })) {
    return false;
  }

  const source = rule.source || '';
  if (source === '/(.*).html') return /\.html$/i.test(url.pathname);
  if (!source.includes(':') && !source.includes('(') && !source.includes('*')) {
    return normalizeRoute(source) === normalizeRoute(url.pathname);
  }

  let pattern = '';
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (source.slice(index).startsWith('(.*)')) {
      pattern += '(.*)';
      index += 3;
    } else if (char === ':' && source.slice(index).match(/^:([A-Za-z0-9_]+)([?*+]?)/)) {
      const tokenMatch = source.slice(index).match(/^:([A-Za-z0-9_]+)([?*+]?)/);
      const token = tokenMatch[0];
      const modifier = tokenMatch[2];
      pattern += modifier === '*' ? '.*' : modifier === '+' ? '.+' : modifier === '?' ? '[^/]*' : '[^/]+';
      index += token.length - 1;
    } else if (char === '*') {
      pattern += '.*';
    } else {
      pattern += /[\\^$.*+?()[\]{}|]/.test(char) ? '\\' + char : char;
    }
  }
  try {
    return new RegExp('^' + pattern + '$').test(url.pathname);
  } catch {
    return false;
  }
}

function matchingRedirect(url, redirects) {
  return redirects.find((rule) => redirectRuleMatches(rule, url)) || null;
}

function isHighIntentRoute(route, page) {
  if (route === '/') return true;
  if (/^\/blog(?:\/|-)/i.test(route)) return false;
  if (/^\/(?:about|gallery|privacy|terms|thank-you|404)(?:\/|$|-)/i.test(route)) return false;
  if (/(?:new-york|manhattan|brooklyn|bronx|queens|staten-island)/i.test(route)) return false;
  if (page.forms.length) return true;
  return /(?:locksmith|door|panic|exit-device|crash-bar|push-bar|closer|rekey|access-control|master-key|lockout|security|services?)/i.test(route);
}

function isDcPrimaryRoute(route) {
  if (route === '/') return true;
  if (/^\/blog(?:\/|-)/i.test(route)) return false;
  return /washington-dc|(?:^|\/)dc(?:-|$)|^\/(?:commercial-locksmith-services|services|commercial-door-services)$/i.test(route);
}

function hasCommercialFocus(text) {
  return /\bcommercial\b/i.test(text) && /\b(?:door|lock|locksmith|hardware|service|property|properties|business|businesses)\b/i.test(text);
}

function hasLeadRejectionCopy(text) {
  return /\b(?:residential|automotive)\b|\b(?:car|vehicle)\s+(?:key|keys|lock|locks|lockout|lockouts)\b/i.test(text);
}

function hasStickyPhoneCta(html, phone) {
  return tagMatches(html, 'a').some((anchor) => {
    const className = anchor.attrs.class || '';
    const component = anchor.attrs['data-component'] || '';
    return /sticky/i.test(className + ' ' + component)
      && (anchor.attrs.href || '').toLowerCase().startsWith('tel:')
      && samePhone(anchor.attrs.href, phone);
  });
}

function heroImages(html) {
  const images = [];
  const regionExpression = /<(?:header|section|div)\b[^>]*(?:class|id)\s*=\s*(?:"[^"]*\bhero\b[^"]*"|'[^']*\bhero\b[^']*')[^>]*>([\s\S]*?)<\/(?:header|section|div)\s*>/gi;
  let region;
  while ((region = regionExpression.exec(html))) {
    images.push(...tagMatches(region[1], 'img'));
  }
  images.push(...tagMatches(html, 'img').filter((image) => {
    return /\bhero\b/i.test((image.attrs.class || '') + ' ' + (image.attrs.id || ''));
  }));
  return images;
}

function telephoneValues(value, results = []) {
  if (Array.isArray(value)) {
    for (const item of value) telephoneValues(item, results);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key.toLowerCase() === 'telephone' && typeof child === 'string') results.push(child);
      telephoneValues(child, results);
    }
  }
  return results;
}

const business = readJson('data/business.json');
const deployment = readJson('vercel.json');
const origin = String(business.origin || '').replace(/\/+$/, '');
const originUrl = safeUrl(origin);
const configuredPhone = business.phone && business.phone.e164;
const configuredFormEndpoint = business.form && business.form.endpoint;
const redirects = Array.isArray(deployment.redirects) ? deployment.redirects : [];

const fatalConfigurationErrors = [];
if (!originUrl || !/^https:$/i.test(originUrl.protocol)) {
  fatalConfigurationErrors.push('origin must be an absolute HTTPS URL');
}
if (!configuredPhone || !/^\+[1-9]\d{7,14}$/.test(configuredPhone)) {
  fatalConfigurationErrors.push('phone.e164 must be a valid E.164 number');
}
if (fatalConfigurationErrors.length) {
  console.error('QA configuration error in data/business.json:');
  for (const error of fatalConfigurationErrors) console.error('  - ' + error);
  process.exit(2);
}
if (business.phone && business.phone.display && !samePhone(business.phone.display, configuredPhone)) {
  addIssue('configuration', 'data/business.json', 'phone.display does not normalize to phone.e164');
}
checked(3);

const allowedHosts = new Set([
  originUrl ? originUrl.hostname.toLowerCase() : '',
  originUrl ? 'www.' + originUrl.hostname.toLowerCase() : ''
]);

const htmlFiles = walk(ROOT, (filePath) => filePath.toLowerCase().endsWith('.html')).sort();
const cssFiles = walk(ROOT, (filePath) => filePath.toLowerCase().endsWith('.css')).sort();
const routeMap = new Map();
const pages = [];

for (const filePath of htmlFiles) {
  const route = normalizeRoute(routeForHtml(filePath));
  const html = fs.readFileSync(filePath, 'utf8');
  const base = origin + (route === '/' ? '/' : route);
  const anchors = pairedTagMatches(html, 'a');
  const forms = pairedTagMatches(html, 'form');
  const images = tagMatches(html, 'img');
  const h1s = pairedTagMatches(html, 'h1').map((heading) => cleanText(heading.inner));
  const title = firstPairedText(html, 'title');
  const description = metaContent(html, 'description');
  const canonical = linkHrefByRel(html, 'canonical');
  const robots = metaContent(html, 'robots');
  const htmlTag = tagMatches(html, 'html')[0];
  const redirect = matchingRedirect(new URL(base), redirects);
  const page = {
    filePath,
    route,
    html,
    base,
    anchors,
    forms,
    images,
    h1s,
    title,
    description,
    canonical,
    robots,
    ids: idValues(html),
    text: visibleText(html),
    redirect,
    noindex: hasNoindex(robots)
  };

  if (routeMap.has(route)) {
    addIssue('routes', route, 'multiple HTML files resolve to this route');
  } else {
    routeMap.set(route, page);
  }
  pages.push(page);

  // Vercel resolves configured redirect sources before their legacy backing
  // HTML can be served. Keep those routes in the map so redirect targets can
  // be validated, but do not report unreachable legacy markup as a live-page
  // metadata, form, image or accessibility defect.
  if (redirect) {
    checked();
    continue;
  }

  if (!title) addIssue('metadata', route, 'missing or empty title');
  if (!description) addIssue('metadata', route, 'missing or empty meta description');
  if (!canonical) addIssue('metadata', route, 'missing canonical link');
  if (!robots) addIssue('metadata', route, 'missing or empty meta robots directive');
  if (h1s.length === 0) addIssue('headings', route, 'missing H1');
  if (h1s.length > 1) addIssue('headings', route, 'has ' + h1s.length + ' H1 elements');
  if (h1s.some((value) => !value)) addIssue('headings', route, 'contains an empty H1');
  ['h2', 'h3'].forEach((level) => {
    if (pairedTagMatches(html, level).some((heading) => !cleanText(heading.inner))) {
      addIssue('headings', route, 'contains an empty ' + level.toUpperCase());
    }
  });
  if (title && (title.length < 25 || title.length > 70)) {
    addIssue('metadata', route, 'title length ' + title.length + ' is outside the practical 25–70 character range');
  }
  if (description && (description.length < 100 || description.length > 180)) {
    addIssue('metadata', route, 'meta description length ' + description.length + ' is outside the practical 100–180 character range');
  }
  const socialMetadata = [
    ['Open Graph title', metaPropertyContent(html, 'og:title')],
    ['Open Graph description', metaPropertyContent(html, 'og:description')],
    ['Open Graph URL', metaPropertyContent(html, 'og:url')],
    ['Open Graph image', metaPropertyContent(html, 'og:image')],
    ['Twitter card', metaContent(html, 'twitter:card')],
    ['Twitter title', metaContent(html, 'twitter:title')],
    ['Twitter description', metaContent(html, 'twitter:description')],
    ['Twitter image', metaContent(html, 'twitter:image')]
  ];
  socialMetadata.forEach(([label, content]) => {
    if (!content) addIssue('metadata', route, 'missing ' + label);
  });
  if (!htmlTag || !(htmlTag.attrs.lang || '').trim()) {
    addIssue('accessibility', route, 'missing html lang attribute');
  }
  const viewport = metaContent(html, 'viewport');
  if (!viewport) addIssue('accessibility', route, 'missing viewport meta tag');
  checked(21);

  if (canonical) {
    const parsedCanonical = safeUrl(canonical, origin);
    if (!/^https:\/\//i.test(canonical) || !parsedCanonical || parsedCanonical.origin !== origin || parsedCanonical.search || parsedCanonical.hash) {
      addIssue('canonical', route, 'canonical must be an absolute URL on ' + origin + ' without query or fragment');
    } else if (!redirect && normalizeRoute(parsedCanonical.pathname) !== route) {
      addIssue('canonical', route, 'final route canonical points to ' + normalizeRoute(parsedCanonical.pathname));
    }
    checked();
  }

  const jsonLdScripts = pairedTagMatches(html, 'script').filter((script) => {
    return (script.attrs.type || '').toLowerCase().trim() === 'application/ld+json';
  });
  for (let index = 0; index < jsonLdScripts.length; index += 1) {
    const script = jsonLdScripts[index];
    try {
      const parsed = JSON.parse(script.inner.trim());
      for (const telephone of telephoneValues(parsed)) {
        if (!samePhone(telephone, configuredPhone)) {
          addIssue('phone', route, 'JSON-LD telephone does not match configured phone: ' + telephone);
        }
        checked();
      }
    } catch (error) {
      addIssue('structured-data', route, 'invalid JSON-LD block ' + (index + 1) + ': ' + error.message);
    }
    checked();
  }

  for (const anchor of anchors) {
    const href = (anchor.attrs.href || '').trim();
    if (!href.toLowerCase().startsWith('tel:')) continue;
    if (href !== 'tel:' + configuredPhone) {
      addIssue('phone', route, 'tel link must be exactly tel:' + configuredPhone + ', found ' + href);
    }
    const anchorText = cleanText(anchor.inner);
    const visibleNumber = anchorText.match(/(?:\+?1[\s.()-]*)?\d{3}[\s.()-]*\d{3}[\s.-]*\d{4}/);
    if (visibleNumber && !samePhone(visibleNumber[0], configuredPhone)) {
      addIssue('phone', route, 'visible number in tel link does not match configured phone: ' + visibleNumber[0]);
    }
    checked();
  }

  for (const image of images) {
    const source = image.attrs.src || image.attrs.srcset || '(missing src)';
    if (!Object.hasOwn(image.attrs, 'alt')) {
      addIssue('images', route, 'image missing alt attribute: ' + source);
    }
    const width = Number(image.attrs.width);
    const height = Number(image.attrs.height);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
      addIssue('images', route, 'image missing positive numeric width and height: ' + source);
    }
    checked(2);
  }
  for (const image of heroImages(html)) {
    if ((image.attrs.loading || '').toLowerCase() === 'lazy') {
      addIssue('performance', route, 'hero/LCP image must not use loading="lazy": ' + (image.attrs.src || '(unknown image)'));
    }
    checked();
  }

  for (let formIndex = 0; formIndex < forms.length; formIndex += 1) {
    const form = forms[formIndex];
    const formName = form.attrs.id ? '#' + form.attrs.id : 'form ' + (formIndex + 1);
    const controls = [
      ...tagMatches(form.inner, 'input'),
      ...tagMatches(form.inner, 'select'),
      ...tagMatches(form.inner, 'textarea')
    ];
    const labels = pairedTagMatches(form.inner, 'label');
    const formIds = idValues(form.inner);

    if ((form.attrs.action || '') !== configuredFormEndpoint) {
      addIssue('forms', route, formName + ' action does not match the configured form endpoint');
    }
    if ((form.attrs.method || '').toLowerCase() !== 'post') {
      addIssue('forms', route, formName + ' must use method="post"');
    }
    if (!Object.hasOwn(form.attrs, 'data-lead-form')) {
      addIssue('forms', route, formName + ' is missing the shared data-lead-form integration');
    }
    if (!controls.some((control) => (control.attrs.name || '').toLowerCase() === '_honey')) {
      addIssue('forms', route, formName + ' is missing the low-friction honeypot field');
    }
    if (!controls.some((control) => (control.attrs.name || '').toLowerCase() === 'lead_id' && (control.attrs.type || '').toLowerCase() === 'hidden')) {
      addIssue('forms', route, formName + ' is missing the hidden lead_id field');
    }
    checked(5);

    for (const control of controls) {
      const type = (control.attrs.type || '').toLowerCase();
      if (['hidden', 'submit', 'reset', 'button', 'image'].includes(type)) continue;
      const id = control.attrs.id || '';
      const explicit = id && labels.some((label) => label.attrs.for === id);
      const wrapped = labels.some((label) => label.raw.includes(control.raw));
      const ariaLabel = (control.attrs['aria-label'] || '').trim();
      const ariaTargets = (control.attrs['aria-labelledby'] || '')
        .split(/\s+/)
        .filter(Boolean);
      const ariaLabelledby = ariaTargets.length > 0
        && ariaTargets.every((target) => page.ids.has(target) || formIds.has(target));
      if (!explicit && !wrapped && !ariaLabel && !ariaLabelledby) {
        addIssue('forms', route, formName + ' has an unlabeled ' + (control.attrs.name || control.attrs.id || 'control'));
      }
      checked();
    }

    for (const fieldName of requiredTrackingFields) {
      const matching = controls.filter((control) => {
        return (control.attrs.name || '').toLowerCase() === fieldName;
      });
      if (matching.length !== 1 || (matching[0].attrs.type || '').toLowerCase() !== 'hidden') {
        addIssue(
          'forms',
          route,
          formName + ' must contain exactly one hidden input named "' + fieldName + '"'
        );
      }
      checked();
    }
  }

  if (!redirect && hasLeadRejectionCopy(page.text)) {
    addIssue('audience-copy', route, 'final public page contains residential/automotive lead-rejection language');
    checked();
  }

  if (!redirect && !page.noindex && isHighIntentRoute(route, page)) {
    if (!hasCommercialFocus(page.text)) {
      addIssue('qualification', route, 'high-intent page lacks clear positive commercial-service language');
    }
    if (!hasStickyPhoneCta(html, configuredPhone)) {
      addIssue('mobile-cta', route, 'high-intent page is missing a source-rendered sticky tel CTA');
    }
    checked(2);
  }

  if (!redirect && isDcPrimaryRoute(route)) {
    const promotionalAnchors = anchors.filter((anchor) => {
      const target = (anchor.attrs.href || '').toLowerCase();
      const text = cleanText(anchor.inner);
      return /new-york|manhattan|brooklyn|bronx|queens|staten-island/.test(target)
        || /\b(?:new york(?: city)?|nyc)\b/i.test(text);
    });
    const prominentText = [
      ...pairedTagMatches(html, 'header'),
      ...pairedTagMatches(html, 'nav'),
      ...pairedTagMatches(html, 'footer')
    ].map((region) => cleanText(region.inner)).join(' ');
    if (promotionalAnchors.length || /\b(?:new york(?: city)?|nyc)\b/i.test(prominentText)) {
      addIssue('local-relevance', route, 'DC primary page prominently links to or promotes New York');
    }
    checked();
  }
}

const uniqueMetadata = [
  ['title', (page) => page.title],
  ['meta description', (page) => page.description]
];
uniqueMetadata.forEach(([label, getter]) => {
  const owners = new Map();
  pages.forEach((page) => {
    if (page.redirect || page.noindex || canonicalPath(page.canonical, origin) !== page.route) return;
    const normalized = getter(page).replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized) return;
    if (owners.has(normalized)) {
      addIssue('metadata', page.route, 'duplicate ' + label + ' also used by ' + owners.get(normalized));
    } else {
      owners.set(normalized, page.route);
    }
    checked();
  });
});

let internalLinkCount = 0;
let assetReferenceCount = 0;
const inboundLinks = new Map();

for (const page of pages) {
  if (page.redirect) continue;
  for (const anchor of page.anchors) {
    const href = (anchor.attrs.href || '').trim();
    if (!href) {
      addIssue('internal-links', page.route, 'anchor is missing href');
      continue;
    }

    if (href.startsWith('#')) {
      const rawFragment = href.slice(1);
      if (!rawFragment) {
        addIssue('internal-links', page.route, 'empty fragment link (#)');
      } else {
        let fragment = rawFragment;
        try {
          fragment = decodeURIComponent(rawFragment);
        } catch {
          addIssue('internal-links', page.route, 'invalid encoded fragment: ' + href);
        }
        if (!page.ids.has(fragment)) {
          addIssue('internal-links', page.route, 'fragment target does not exist: ' + href);
        }
      }
      internalLinkCount += 1;
      checked();
      continue;
    }
    if (isSkippableReference(href)) continue;

    const parsed = internalUrl(href, page.base, allowedHosts);
    if (!parsed) continue;
    internalLinkCount += 1;
    checked();

    if (parsed.origin !== origin) {
      addIssue('internal-links', page.route, 'internal link uses non-preferred origin: ' + href);
    }

    const redirect = matchingRedirect(parsed, redirects);
    if (redirect) {
      addIssue(
        'redirect-links',
        page.route,
        'link points to redirect source ' + parsed.pathname + ' (' + redirect.source + ')'
      );
      continue;
    }

    const targetRoute = normalizeRoute(parsed.pathname);
    const targetPage = routeMap.get(targetRoute);
    const targetFile = fileForPublicPath(parsed.pathname);
    if (!targetPage && !targetFile) {
      addIssue('internal-links', page.route, 'broken internal link: ' + href);
      continue;
    }

    if (targetPage && targetRoute !== page.route) {
      inboundLinks.set(targetRoute, (inboundLinks.get(targetRoute) || 0) + 1);
    }

    if (parsed.hash && targetPage) {
      let fragment = parsed.hash.slice(1);
      try {
        fragment = decodeURIComponent(fragment);
      } catch {
        addIssue('internal-links', page.route, 'invalid encoded fragment: ' + href);
      }
      if (fragment && !targetPage.ids.has(fragment)) {
        addIssue('internal-links', page.route, 'fragment target does not exist: ' + href);
      }
    }
  }
}

for (const page of pages) {
  if (page.route === '/' || page.redirect || page.noindex) continue;
  const selfCanonical = canonicalPath(page.canonical, origin) === page.route;
  if (selfCanonical && !inboundLinks.get(page.route)) {
    addIssue('internal-links', page.route, 'indexable final page is orphaned');
  }
  checked();
}

function validateAssetReference(value, base, owner) {
  const reference = String(value || '').trim();
  if (!reference || /^(?:data|blob):/i.test(reference)) return;
  const parsed = safeUrl(reference, base);
  if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) return;
  if (!allowedHosts.has(parsed.hostname.toLowerCase())) return;
  assetReferenceCount += 1;
  checked();
  if (!fileForPublicPath(parsed.pathname)) {
    addIssue('assets', owner, 'missing local asset: ' + reference);
  }
}

function validateSrcset(value, base, owner) {
  for (const candidate of String(value || '').split(',')) {
    const reference = candidate.trim().split(/\s+/)[0];
    if (reference) validateAssetReference(reference, base, owner);
  }
}

for (const page of pages) {
  if (page.redirect) continue;
  for (const image of page.images) {
    validateAssetReference(image.attrs.src, page.base, page.route);
    validateSrcset(image.attrs.srcset, page.base, page.route);
  }
  for (const source of tagMatches(page.html, 'source')) {
    validateAssetReference(source.attrs.src, page.base, page.route);
    validateSrcset(source.attrs.srcset, page.base, page.route);
  }
  for (const script of tagMatches(page.html, 'script')) {
    validateAssetReference(script.attrs.src, page.base, page.route);
  }
  for (const iframe of tagMatches(page.html, 'iframe')) {
    validateAssetReference(iframe.attrs.src, page.base, page.route);
  }
  for (const video of tagMatches(page.html, 'video')) {
    validateAssetReference(video.attrs.src, page.base, page.route);
    validateAssetReference(video.attrs.poster, page.base, page.route);
  }
  for (const audio of tagMatches(page.html, 'audio')) {
    validateAssetReference(audio.attrs.src, page.base, page.route);
  }
  for (const object of tagMatches(page.html, 'object')) {
    validateAssetReference(object.attrs.data, page.base, page.route);
  }
  for (const link of tagMatches(page.html, 'link')) {
    const rels = (link.attrs.rel || '').toLowerCase().split(/\s+/);
    const isAsset = rels.some((rel) => {
      return ['stylesheet', 'icon', 'manifest', 'preload', 'modulepreload', 'apple-touch-icon', 'mask-icon'].includes(rel);
    });
    if (isAsset) validateAssetReference(link.attrs.href, page.base, page.route);
  }
  for (const meta of tagMatches(page.html, 'meta')) {
    const key = (meta.attrs.property || meta.attrs.name || '').toLowerCase();
    if (/(?:^|:)image(?::url)?$/.test(key)) {
      validateAssetReference(meta.attrs.content, page.base, page.route);
    }
  }
}

for (const cssFile of cssFiles) {
  const relative = path.relative(ROOT, cssFile).split(path.sep).join('/');
  const css = fs.readFileSync(cssFile, 'utf8');
  const base = origin + '/' + relative;
  const expression = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/gi;
  let match;
  while ((match = expression.exec(css))) {
    validateAssetReference(match[1] ?? match[2] ?? match[3], base, relative);
  }
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemapLocations = [];
if (!fs.existsSync(sitemapPath)) {
  addIssue('sitemap', '/sitemap.xml', 'sitemap.xml is missing');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const expression = /<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi;
  let match;
  while ((match = expression.exec(sitemap))) {
    sitemapLocations.push(decodeEntities(match[1]).trim());
  }
  if (!sitemapLocations.length) {
    addIssue('sitemap', '/sitemap.xml', 'sitemap contains no loc elements');
  }
}

const sitemapRoutes = new Set();
const seenSitemapLocations = new Set();
for (const location of sitemapLocations) {
  checked();
  if (seenSitemapLocations.has(location)) {
    addIssue('sitemap', '/sitemap.xml', 'duplicate URL: ' + location);
  }
  seenSitemapLocations.add(location);

  const parsed = safeUrl(location);
  if (!parsed || parsed.origin !== origin || parsed.search || parsed.hash) {
    addIssue('sitemap', '/sitemap.xml', 'URL must use the canonical origin without query or fragment: ' + location);
    continue;
  }

  const route = normalizeRoute(parsed.pathname);
  sitemapRoutes.add(route);
  const redirect = matchingRedirect(parsed, redirects);
  if (redirect) {
    addIssue('sitemap', route, 'sitemap URL is redirected by configured source ' + redirect.source);
  }

  const page = routeMap.get(route);
  if (!page) {
    addIssue('sitemap', route, 'sitemap URL has no source HTML page');
    continue;
  }
  if (page.noindex) {
    addIssue('sitemap', route, 'noindex page is present in sitemap');
  }
  const pageCanonicalPath = canonicalPath(page.canonical, origin);
  if (!pageCanonicalPath || pageCanonicalPath !== route) {
    addIssue('sitemap', route, 'sitemap URL is not the page self-canonical');
  }
}

for (const page of pages) {
  const selfCanonical = canonicalPath(page.canonical, origin) === page.route;
  const indexableFinal = !page.redirect && !page.noindex && selfCanonical;
  if (indexableFinal && !sitemapRoutes.has(page.route)) {
    addIssue('sitemap', page.route, 'indexable final URL is absent from sitemap');
  }
  checked();
}

const totalIssues = [...issueGroups.values()].reduce((sum, issues) => sum + issues.length, 0);
const stats = {
  checks: checkCount,
  pages: pages.length,
  sitemapUrls: sitemapLocations.length,
  internalLinks: internalLinkCount,
  assetReferences: assetReferenceCount,
  images: pages.reduce((sum, page) => sum + page.images.length, 0),
  forms: pages.reduce((sum, page) => sum + page.forms.length, 0),
  issueGroups: issueGroups.size,
  issues: totalIssues
};

if (jsonOutput) {
  const issues = {};
  for (const [group, values] of [...issueGroups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    issues[group] = values;
  }
  console.log(JSON.stringify({
    ok: totalIssues === 0,
    stats,
    requiredTrackingFields,
    issues
  }, null, 2));
} else {
  const status = totalIssues === 0 ? 'QA PASSED' : 'QA FAILED';
  console.log(status + ' — ' + totalIssues + ' issue' + (totalIssues === 1 ? '' : 's') + ' across ' + issueGroups.size + ' categor' + (issueGroups.size === 1 ? 'y' : 'ies'));
  console.log(
    'Scanned ' + stats.pages + ' pages, '
    + stats.sitemapUrls + ' sitemap URLs, '
    + stats.internalLinks + ' internal links, '
    + stats.assetReferences + ' local asset references, '
    + stats.images + ' images, and '
    + stats.forms + ' forms (' + stats.checks + ' checks).'
  );

  for (const [group, values] of [...issueGroups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    console.log('\n[' + group + '] ' + values.length);
    for (const issue of values.slice(0, detailLimit)) {
      console.log('  - ' + issue.route + ': ' + issue.message);
    }
    if (values.length > detailLimit) {
      console.log('  ... ' + (values.length - detailLimit) + ' more; rerun with --verbose for every issue.');
    }
  }

  if (totalIssues === 0) {
    console.log('\nAll configured static-site QA gates passed.');
  } else {
    console.log('\nFix the listed source issues and rerun. Use --json for CI output or --verbose for full details.');
  }
}

process.exitCode = totalIssues === 0 ? 0 : 1;
