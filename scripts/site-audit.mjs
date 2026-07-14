import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const origin = 'https://dcemergencylockanddoor.com';

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function routeFor(file) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/\.html$/i, '')}`;
}

function cleanText(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function first(html, regex) {
  return cleanText(html.match(regex)?.[1] || '');
}

function attr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tag.match(new RegExp(`\\b${escaped}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || '';
}

function meta(html, name, property = false) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const key = property ? 'property' : 'name';
  return tags.find((tag) => attr(tag, key).toLowerCase() === name.toLowerCase())
    ? attr(tags.find((tag) => attr(tag, key).toLowerCase() === name.toLowerCase()), 'content')
    : '';
}

function linkRel(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find((item) => attr(item, 'rel').toLowerCase().split(/\s+/).includes(rel));
  return tag ? attr(tag, 'href') : '';
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
}

function pairedText(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi'))].map((match) => cleanText(match[1]));
}

function resolveInternal(href, route) {
  if (!href || /^(?:tel:|mailto:|javascript:|data:)/i.test(href) || href.startsWith('#')) return null;
  try {
    const absolute = new URL(href, `${origin}${route}`);
    if (absolute.origin !== origin && absolute.hostname !== 'www.dcemergencylockanddoor.com') return null;
    let pathname = decodeURI(absolute.pathname);
    if (pathname.endsWith('.html')) pathname = pathname.slice(0, -5);
    if (pathname === '/index') pathname = '/';
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return pathname;
  } catch {
    return '__INVALID__';
  }
}

const htmlFiles = walk(root).filter((file) => file.endsWith('.html')).sort();
const knownRoutes = new Set(htmlFiles.map(routeFor));

const pages = htmlFiles.map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeFor(file);
  const imageTags = tags(html, 'img');
  const anchorTags = tags(html, 'a');
  const formTags = tags(html, 'form');
  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1].trim());
  const jsonLdErrors = jsonLdBlocks.flatMap((block, index) => {
    try {
      JSON.parse(block);
      return [];
    } catch (error) {
      return [`block ${index + 1}: ${error.message}`];
    }
  });
  const links = anchorTags.map((tag) => ({
    href: attr(tag, 'href'),
    text: cleanText(tag),
    target: resolveInternal(attr(tag, 'href'), route)
  }));

  return {
    file: path.relative(root, file).split(path.sep).join('/'),
    route,
    bytes: fs.statSync(file).size,
    title: first(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
    description: meta(html, 'description'),
    robots: meta(html, 'robots'),
    canonical: linkRel(html, 'canonical'),
    ogTitle: meta(html, 'og:title', true),
    ogDescription: meta(html, 'og:description', true),
    ogUrl: meta(html, 'og:url', true),
    ogImage: meta(html, 'og:image', true),
    twitterCard: meta(html, 'twitter:card'),
    twitterTitle: meta(html, 'twitter:title'),
    twitterDescription: meta(html, 'twitter:description'),
    twitterImage: meta(html, 'twitter:image'),
    headings: Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((name) => [name, pairedText(html, name)])),
    lang: attr(html.match(/<html\b[^>]*>/i)?.[0] || '', 'lang'),
    viewport: meta(html, 'viewport'),
    links,
    telLinks: [...new Set(anchorTags.map((tag) => attr(tag, 'href')).filter((href) => href.startsWith('tel:')))],
    forms: formTags.map((tag) => ({ action: attr(tag, 'action'), method: attr(tag, 'method') })),
    images: imageTags.map((tag) => ({
      src: attr(tag, 'src'),
      alt: attr(tag, 'alt'),
      width: attr(tag, 'width'),
      height: attr(tag, 'height'),
      loading: attr(tag, 'loading'),
      fetchpriority: attr(tag, 'fetchpriority')
    })),
    jsonLdCount: jsonLdBlocks.length,
    jsonLdErrors,
    hasGtmPlaceholder: html.includes('GTM-XXXXXXX'),
    hasLeadScript: /lead-pages(?:\.min)?\.js/.test(html),
    hasStickyCall: /sticky-(?:mobile-)?call/.test(html),
    hasResidentialText: /\bresidential\b/i.test(cleanText(html)),
    hasAutomotiveText: /\bautomotive\b/i.test(cleanText(html))
  };
});

const inbound = Object.fromEntries(pages.map((page) => [page.route, []]));
const brokenLinks = [];
pages.forEach((page) => {
  page.links.forEach((link) => {
    if (!link.target || link.target === '__INVALID__') return;
    if (knownRoutes.has(link.target)) inbound[link.target].push({ from: page.route, text: link.text });
    else if (!link.target.startsWith('/assets/')) brokenLinks.push({ from: page.route, href: link.href, target: link.target, text: link.text });
  });
});

function duplicates(field) {
  const groups = new Map();
  pages.forEach((page) => {
    const value = page[field];
    if (!value) return;
    groups.set(value, [...(groups.get(value) || []), page.route]);
  });
  return [...groups.entries()].filter(([, routes]) => routes.length > 1).map(([value, routes]) => ({ value, routes }));
}

const summary = {
  generatedAt: new Date().toISOString(),
  htmlPageCount: pages.length,
  pagesMissing: {
    title: pages.filter((page) => !page.title).map((page) => page.route),
    description: pages.filter((page) => !page.description).map((page) => page.route),
    canonical: pages.filter((page) => !page.canonical).map((page) => page.route),
    robots: pages.filter((page) => !page.robots).map((page) => page.route),
    ogTitle: pages.filter((page) => !page.ogTitle).map((page) => page.route),
    ogDescription: pages.filter((page) => !page.ogDescription).map((page) => page.route),
    ogUrl: pages.filter((page) => !page.ogUrl).map((page) => page.route),
    ogImage: pages.filter((page) => !page.ogImage).map((page) => page.route),
    twitterCard: pages.filter((page) => !page.twitterCard).map((page) => page.route),
    h1: pages.filter((page) => page.headings.h1.length === 0).map((page) => page.route)
  },
  multipleH1: pages.filter((page) => page.headings.h1.length > 1).map((page) => ({ route: page.route, h1: page.headings.h1 })),
  duplicateTitles: duplicates('title'),
  duplicateDescriptions: duplicates('description'),
  canonicalMismatches: pages.filter((page) => page.canonical && new URL(page.canonical, origin).pathname.replace(/\/$/, '') !== (page.route === '/' ? '' : page.route)).map((page) => ({ route: page.route, canonical: page.canonical })),
  invalidJsonLd: pages.filter((page) => page.jsonLdErrors.length).map((page) => ({ route: page.route, errors: page.jsonLdErrors })),
  phoneNumbers: [...new Set(pages.flatMap((page) => page.telLinks))],
  formActions: [...new Set(pages.flatMap((page) => page.forms.map((form) => form.action)).filter(Boolean))],
  pagesWithForms: pages.filter((page) => page.forms.length).map((page) => ({ route: page.route, forms: page.forms })),
  pagesWithoutLeadScript: pages.filter((page) => !page.hasLeadScript).map((page) => page.route),
  images: {
    total: pages.reduce((sum, page) => sum + page.images.length, 0),
    missingAlt: pages.flatMap((page) => page.images.filter((image) => !image.alt).map((image) => ({ route: page.route, src: image.src }))),
    missingDimensions: pages.flatMap((page) => page.images.filter((image) => !image.width || !image.height).map((image) => ({ route: page.route, src: image.src }))),
    lazyLoaded: pages.flatMap((page) => page.images.filter((image) => image.loading === 'lazy').map((image) => ({ route: page.route, src: image.src }))).length
  },
  brokenLinks,
  orphanRoutes: pages.filter((page) => page.route !== '/' && inbound[page.route].length === 0).map((page) => page.route),
  inbound,
  pages
};

if (process.argv.includes('--pages-tsv')) {
  process.stdout.write('Route\tTitle\tH1\tRobots\tCanonical\tInbound\n');
  pages.forEach((page) => {
    const values = [
      page.route,
      page.title,
      page.headings.h1[0] || '',
      page.robots,
      page.canonical,
      String(inbound[page.route]?.length || 0)
    ].map((value) => String(value).replace(/\t|\r?\n/g, ' '));
    process.stdout.write(`${values.join('\t')}\n`);
  });
} else if (process.argv.includes('--summary')) {
  const compact = { ...summary };
  delete compact.pages;
  delete compact.inbound;
  process.stdout.write(`${JSON.stringify(compact, null, 2)}\n`);
} else {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}
