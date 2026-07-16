import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const BUSINESS_FILE = path.join(ROOT_DIR, 'data', 'business.json');
const REDIRECTS_FILE = path.join(ROOT_DIR, 'data', 'redirects.json');
const DRY_RUN = process.argv.includes('--dry-run');

const business = JSON.parse(fs.readFileSync(BUSINESS_FILE, 'utf8'));
const redirects = JSON.parse(fs.readFileSync(REDIRECTS_FILE, 'utf8'));
const origin = business.origin.replace(/\/$/, '');
const assetVersion = createHash('sha256')
  .update(JSON.stringify(business))
  .update(fs.readFileSync(path.join(ROOT_DIR, 'assets', 'site.js')))
  .update(fs.readFileSync(path.join(ROOT_DIR, 'assets', 'legacy-safety.css')))
  .update(fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'prepare-deploy-output.mjs')))
  .digest('hex')
  .slice(0, 12);

const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.vercel',
  'coverage',
  'dist',
  'node_modules',
  'public'
]);

const PLACEHOLDER_ANALYTICS_PATTERN =
  /GTM-XXXXXXX|G-XXXXXXXXXX|000000000000000|window\.GTM_CONFIG/i;
const RISKY_TITLE_PATTERN =
  /24\s*\/\s*7|licen[cs]ed|insured|same[ -]?day|free (?:estimate|quote)|(?:\d+)[ -]?(?:minute|min) response|fast response/i;
const FIRE_INFORMATION_PATTERN =
  /(?:nfpa|fire[-_ ]?door|panic[-_ ]?bar[-_ ]?guide|exit[-_ ]?device[-_ ]?compliance|\bcompliance\b)/i;

const CODE_DISCLAIMER =
  '<aside class="legacy-code-disclaimer" role="note" data-code-disclaimer>' +
  '<strong>Code and compliance note:</strong> General educational information only. Requirements depend on ' +
  'the adopted code edition, occupancy, occupant load, the opening\'s listing and approved design, and the ' +
  'authority having jurisdiction (AHJ). Confirm the applicable inspection scope, interval, qualifications, ' +
  'corrective requirements, and final acceptance with the AHJ or responsible design/code professional. A ' +
  'service contractor does not determine compliance or closeout unless expressly authorized.</aside>';

const socialUrls = business.socialProfiles
  .filter((profile) => profile.verified !== true)
  .map((profile) => profile.url);
const socialHosts = new Set(
  socialUrls.flatMap((value) => {
    try {
      const hostname = new URL(value).hostname.toLowerCase();
      return [hostname, hostname.replace(/^www\./, '')];
    } catch {
      return [];
    }
  })
);

function compareStrings(left, right) {
  return left.localeCompare(right);
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
  const relativeFile = path.relative(ROOT_DIR, file).split(path.sep).join('/');
  if (relativeFile === 'index.html') return '/';

  let route = `/${relativeFile.slice(0, -'.html'.length)}`;
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length) || '/';
  return cleanPathname(route);
}

function cleanPathname(value) {
  let pathname = value || '/';

  try {
    pathname = decodeURI(pathname);
  } catch {
    // Keep the original form if a legacy link contains malformed percent encoding.
  }

  pathname = pathname.replace(/\/{2,}/g, '/');
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/index\.html$/i, '/');
  pathname = pathname.replace(/\.html$/i, '');
  pathname = pathname.replace(/\/index$/i, '/');
  if (pathname !== '/') pathname = pathname.replace(/\/$/, '');
  return pathname || '/';
}

function redirectKey(pathname) {
  return cleanPathname(pathname).toLowerCase();
}

function finalRedirectTarget(pathname) {
  let current = redirectKey(pathname);
  const visited = new Set();

  while (redirects[current] && !visited.has(current)) {
    visited.add(current);
    current = redirectKey(redirects[current]);
  }

  return current;
}

function htmlEscapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function decodeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function decodeBasicEntities(value) {
  return decodeHtmlAttribute(value)
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#8217;', '\u2019')
    .replaceAll('&#x27;', "'");
}

function getAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `\\s${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i'
  );
  const match = tag.match(pattern);
  return match ? match[1] ?? match[2] ?? match[3] ?? '' : null;
}

function hasAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\s${escapedName}(?:\\s*=|\\s|/?>)`, 'i').test(tag);
}

function setAttribute(tag, name, value) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `\\s${escapedName}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
    'i'
  );
  const serialized = ` ${name}="${htmlEscapeAttribute(value)}"`;

  if (pattern.test(tag)) return tag.replace(pattern, serialized);

  const close = tag.endsWith('/>') ? '/>' : '>';
  return `${tag.slice(0, -close.length).trimEnd()}${serialized}${close}`;
}

function removeAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tag.replace(
    new RegExp(`\\s${escapedName}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'i'),
    ''
  );
}

function stripTags(value) {
  return decodeBasicEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function titleFromHtml(html) {
  return stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Commercial door resource');
}

function descriptionFromHtml(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if ((getAttribute(tag, 'name') || '').toLowerCase() === 'description') {
      return decodeBasicEntities(getAttribute(tag, 'content') || '').trim();
    }
  }
  return '';
}

function hasNewComponentSystem(html) {
  return /<link\b[^>]*href\s*=\s*["']\/assets\/site\.css(?:\?[^"']*)?["']/i.test(html);
}

function removeLegacyScriptsAndSchema(html) {
  let output = html.replace(
    /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,
    (block) => {
      const type = (getAttribute(block.match(/<script\b[^>]*>/i)?.[0] || '', 'type') || '')
        .toLowerCase()
        .trim();
      const src = getAttribute(block.match(/<script\b[^>]*>/i)?.[0] || '', 'src') || '';

      if (type === 'application/ld+json') return '';
      if (/(?:^|\/)assets\/lead-pages(?:\.min)?\.js(?:[?#]|$)/i.test(src)) return '';
      if (/analytics\.ahrefs\.com\/analytics\.js/i.test(src)) return '';
      if (PLACEHOLDER_ANALYTICS_PATTERN.test(block)) return '';
      return block;
    }
  );

  output = output.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, (block) =>
    PLACEHOLDER_ANALYTICS_PATTERN.test(block) ? '' : block
  );

  output = output
    .replace(/<!--\s*(?:End\s+)?Google Tag Manager(?:\s*\(noscript\))?\s*-->/gi, '')
    .replace(/<!--\s*(?:Meta|Facebook) Pixel[^>]*-->/gi, '');

  // The retained templates have adequate system-font fallbacks. Remove the
  // render-blocking remote font/icon styles after unverified social controls
  // are removed; shared CSS supplies focus and layout safety rules.
  output = output.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = getAttribute(tag, 'href') || '';
    if (/fonts\.(?:googleapis|gstatic)\.com/i.test(href)) return '';
    if (/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i.test(href)) return '';
    return tag;
  });

  return output;
}

function isUnverifiedSocialHref(value) {
  let parsed;
  try {
    parsed = new URL(decodeHtmlAttribute(value), `${origin}/`);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  return socialHosts.has(hostname) || socialUrls.some((url) => parsed.href === url);
}

function removeUnverifiedSocialProfiles(html) {
  let output = html;

  // Remove the common social-only wrappers first. The expression is intentionally
  // limited to explicitly social-named containers rather than generic header/footer blocks.
  output = output.replace(
    /<(div|nav|aside|ul)\b(?=[^>]*class\s*=\s*["'][^"']*(?:nav-social|footer-social|social-links|social-icons|social-row)[^"']*["'])[^>]*>[\s\S]*?<\/\1\s*>/gi,
    ''
  );

  output = output.replace(
    /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>[\s\S]*?<\/a\s*>/gi,
    (anchor, doubleQuoted, singleQuoted) =>
      isUnverifiedSocialHref(doubleQuoted ?? singleQuoted ?? '') ? '' : anchor
  );

  return output
    .replace(/<li\b[^>]*>\s*<\/li\s*>/gi, '')
    .replace(
      /<(div|nav|aside|ul)\b(?=[^>]*class\s*=\s*["'][^"']*(?:nav-social|footer-social|social-links|social-icons|social-row)[^"']*["'])[^>]*>\s*<\/\1\s*>/gi,
      ''
    );
}

function normalizeInternalHref(value, pageRoute) {
  const decoded = decodeHtmlAttribute(value).trim();
  if (!decoded) return value;
  if (decoded === '#request-service-form') {
    if (isNewYorkPage(pageRoute)) return `tel:${business.phone.e164}`;
    if (/access-control/i.test(pageRoute)) return '/access-control-systems-washington-dc#service-request';
    if (/door-closer/i.test(pageRoute)) return '/door-closer-repair-washington-dc#service-request';
    if (/fire-door/i.test(pageRoute)) return '/fire-door-inspection-washington-dc#service-request';
    if (/master-key/i.test(pageRoute)) return '/master-key-systems#service-request';
    if (/panic-bar|exit-device/i.test(pageRoute)) return '/panic-bar-repair-washington-dc#service-request';
    if (/rekey/i.test(pageRoute)) return '/commercial-rekey-washington-dc#service-request';
    if (/door-wont-latch|door-not-locking/i.test(pageRoute)) return '/commercial-door-repair-washington-dc#service-request';
    return '/commercial-locksmith-washington-dc#service-request';
  }
  if (decoded.startsWith('#')) return value;
  if (/^(?:tel|mailto|sms|javascript|data):/i.test(decoded)) return value;
  if (decoded.startsWith('//')) return value;

  let parsed;
  try {
    parsed = new URL(decoded, `${origin}${pageRoute}`);
  } catch {
    return value;
  }

  if (parsed.hostname.toLowerCase().replace(/^www\./, '') !== new URL(origin).hostname) {
    return value;
  }

  const pathname = finalRedirectTarget(parsed.pathname);
  const search = parsed.search;
  const hash = parsed.hash;
  return `${pathname}${search}${hash}`;
}

function rewriteInternalLinks(html, pageRoute) {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const href = getAttribute(tag, 'href');
    if (href === null) return tag;
    return setAttribute(tag, 'href', normalizeInternalHref(href, pageRoute));
  });
}

function isNewYorkPage(route) {
  return /(?:new-york|nyc)/i.test(route);
}

function isNewYorkHref(value, pageRoute) {
  let parsed;
  try {
    parsed = new URL(decodeHtmlAttribute(value), `${origin}${pageRoute}`);
  } catch {
    return false;
  }
  return /(?:new-york|nyc)/i.test(parsed.pathname);
}

function removeNewYorkPromotion(html, pageRoute) {
  if (isNewYorkPage(pageRoute)) return html;

  let output = html.replace(
    /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>[\s\S]*?<\/a\s*>/gi,
    (anchor, doubleQuoted, singleQuoted) =>
      isNewYorkHref(doubleQuoted ?? singleQuoted ?? '', pageRoute) ? '' : anchor
  );

  output = output.replace(/<li\b[^>]*>\s*<\/li\s*>/gi, '');

  // Remove plain-text market mentions only from repeated navigation/top-bar/footer
  // blocks. Article prose is left intact unless it contains a linked promotion above.
  output = output.replace(
    /<(nav|footer)\b[^>]*>[\s\S]*?<\/\1\s*>|<div\b[^>]*class\s*=\s*["'][^"']*topbar[^"']*["'][^>]*>[\s\S]*?<\/div\s*>/gi,
    (block) =>
      block
        .replace(/\s*(?:\u00b7|&middot;|\||,|&amp;|&)\s*New York(?: City)?/gi, '')
        .replace(/\s+and\s+New York(?: City)?/gi, '')
  );

  return output;
}

function safeMetadataValue(value) {
  return value
    .replace(/fast\s+24\s*\/\s*7\s+emergency service by licensed experts\.?/gi, 'Commercial guidance and service options for businesses and property teams.')
    .replace(/fast\s+24\s*\/\s*7\s+emergency response,?\s*same[ -]?day fixes,?\s*and licensed technicians\.?/gi, 'Commercial repair guidance and service options for business doors.')
    .replace(/fast\s+same[ -]?day service,?\s*licensed techs,?\s*and\s*24\s*\/\s*7\s+emergency response\.?/gi, 'Commercial door repair guidance and emergency service options.')
    .replace(/technician available\s*24\s*\/\s*7\.?/gi, 'Call to confirm emergency service availability.')
    .replace(/24\s*\/\s*7\s+(?:fast,?\s*)?licensed(?: experts?)?/gi, 'commercial service')
    .replace(/24\s*\/\s*7\s+emergency response/gi, 'emergency service')
    .replace(/24\s*\/\s*7\s+emergency service/gi, 'emergency commercial service')
    .replace(/24\s*\/\s*7\s+service/gi, 'commercial service')
    .replace(/licensed (?:experts?|technicians?|techs|specialists?)/gi, 'commercial specialists')
    .replace(/licensed installation/gi, 'commercial installation')
    .replace(/licensed and insured/gi, 'commercial')
    .replace(/same[ -]?day (?:service|help)/gi, 'commercial service')
    .replace(/same[ -]?day (?:fixes|repairs?)/gi, 'repair options')
    .replace(/same[ -]?day (?:correction|scheduling) options/gi, 'service options')
    .replace(/same[ -]?day scheduling/gi, 'scheduling')
    .replace(/rapid local response/gi, 'local service availability')
    .replace(/fast service/gi, 'commercial service')
    .replace(/request (?:a )?free estimate/gi, 'request an estimate')
    .replace(/get (?:a )?free estimate/gi, 'request an estimate')
    .replace(/free (?:estimate|quote)/gi, 'service estimate')
    .replace(/\bsame[ -]?day\b/gi, 'scheduled')
    .replace(/\blicensed\b/gi, 'commercial')
    .replace(/\binsured\b/gi, '')
    .replace(/\b24\s*\/\s*7\b/gi, 'emergency')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function sanitizeMetadata(html, pageRoute) {
  let output = html.replace(/<meta\b[^>]*>/gi, (tag) =>
    (getAttribute(tag, 'name') || '').toLowerCase() === 'keywords' ? '' : tag
  );
  const titleMatch = output.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  let title = titleMatch ? stripTags(titleMatch[1]) : 'Commercial door resource';

  if (RISKY_TITLE_PATTERN.test(title)) {
    const safeSegments = title
      .split('|')
      .map((segment) => segment.trim())
      .filter((segment) => segment && !RISKY_TITLE_PATTERN.test(segment));
    const base = safeSegments[0] || title.split('|')[0].trim() || 'Commercial door resource';
    const suffix = pageRoute.includes('blog') ? 'Commercial Guide' : 'Commercial Service';
    title = `${safeMetadataValue(base)} | ${suffix}`;
    output = output.replace(
      /<title\b[^>]*>[\s\S]*?<\/title>/i,
      `<title>${htmlEscapeAttribute(title)}</title>`
    );
  }
  if (title.length > 70) {
    title = title
      .replace(/\s*\|\s*Business Security\s*(?:&amp;|&|and)\s*Door Service/gi, ' | Business Guide')
      .replace(/\s*\|\s*Commercial Door Compliance/gi, ' | Commercial Guide');
    output = output.replace(
      /<title\b[^>]*>[\s\S]*?<\/title>/i,
      `<title>${htmlEscapeAttribute(title)}</title>`
    );
  }

  output = output.replace(/<meta\b[^>]*>/gi, (tag) => {
    const name = (getAttribute(tag, 'name') || '').toLowerCase();
    const property = (getAttribute(tag, 'property') || '').toLowerCase();
    const key = property || name;
    const content = getAttribute(tag, 'content');
    if (content === null) return tag;

    if (key === 'description' || key === 'og:description' || key === 'twitter:description') {
      return setAttribute(tag, 'content', safeMetadataValue(decodeBasicEntities(content)));
    }
    if (key === 'og:title' || key === 'twitter:title') {
      return setAttribute(tag, 'content', title);
    }
    return tag;
  });

  return output;
}

function applyMarketIndexingGate(html, pageRoute) {
  if (!isNewYorkPage(pageRoute)) return html;

  let found = false;
  const output = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    if ((getAttribute(tag, 'name') || '').toLowerCase() !== 'robots') return tag;
    found = true;
    return setAttribute(tag, 'content', 'noindex,follow,max-image-preview:large');
  });

  if (found) return output;
  return output.replace(
    /<head\b[^>]*>/i,
    (tag) => `${tag}\n<meta name="robots" content="noindex,follow,max-image-preview:large">`
  );
}

function ensureSocialMetadata(html, pageRoute) {
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  const contentFor = (attribute, key) => {
    const tag = metas.find((candidate) => (getAttribute(candidate, attribute) || '').toLowerCase() === key);
    return tag ? decodeBasicEntities(getAttribute(tag, 'content') || '') : '';
  };
  const title = titleFromHtml(html);
  const description = descriptionFromHtml(html) || 'Commercial door and lock information for businesses and property teams.';
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) || []).find((tag) =>
    (getAttribute(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical')
  );
  const canonical = canonicalTag ? decodeHtmlAttribute(getAttribute(canonicalTag, 'href') || '') : `${origin}${pageRoute}`;
  const image = contentFor('property', 'og:image') || `${origin}/assets/locksmith.png`;
  const additions = [];
  const addMeta = (attribute, key, value) => {
    if (contentFor(attribute, key)) return;
    additions.push(`<meta ${attribute}="${key}" content="${htmlEscapeAttribute(value)}">`);
  };

  addMeta('property', 'og:title', title);
  addMeta('property', 'og:description', description);
  addMeta('property', 'og:url', canonical);
  addMeta('property', 'og:image', image);
  addMeta('name', 'twitter:card', 'summary_large_image');
  addMeta('name', 'twitter:title', title);
  addMeta('name', 'twitter:description', description);
  addMeta('name', 'twitter:image', image);
  if (!additions.length) return html;
  return html.replace(/<\/head\s*>/i, `\n${additions.join('\n')}\n</head>`);
}

function neutralizeVisibleClaimText(text) {
  return text
    .replace(/NYC DOB licensed contractor/gi, 'New York service credentials require confirmation')
    .replace(/licensed NY contractor/gi, 'Credentials require confirmation')
    .replace(/licensed\s*(?:&amp;|&|and)\s*insured\s+(?:commercial\s+)?(?:technicians?|specialists?|experts?)/gi, 'commercial service team')
    .replace(/licensed (?:experts?|technicians?|techs|specialists?)/gi, 'commercial specialists')
    .replace(/under\s+45[- ]minute average response in active zones/gi, 'Response timing depends on availability and site conditions')
    .replace(/fast response in\s+\d+\s+minutes?/gi, 'Response timing depends on availability and site conditions')
    .replace(/response in under\s+\d+\s+minutes?/gi, 'Response timing depends on availability and site conditions')
    .replace(/45[- ]min(?:ute)? response/gi, 'Call to confirm availability')
    .replace(/we(?:'|\u2019)?re there in 45 minutes/gi, 'Call to confirm response availability')
    .replace(/technician available\s*24\s*\/\s*7/gi, 'call to confirm emergency availability')
    .replace(/available\s*24\s*\/\s*7/gi, 'available only after confirmation')
    .replace(/call\s*24\s*\/\s*7\s*:/gi, 'Call for commercial service:')
    .replace(/24\s*\/\s*7\s+commercial locksmith dispatch/gi, 'Commercial locksmith dispatch')
    .replace(/24\s*\/\s*7\s+commercial locksmith\s*(?:&amp;|&)\s*exit door/gi, 'Commercial locksmith &amp; exit door service')
    .replace(/24\s*\/\s*7\s+emergency commercial service/gi, 'Emergency commercial service')
    .replace(/24\s*\/\s*7\s+emergency service/gi, 'Emergency commercial service')
    .replace(/24\s*\/\s*7\s+emergency/gi, 'Emergency service')
    .replace(/24\s*\/\s*7\s+dispatch/gi, 'Emergency dispatch')
    .replace(/for\s+24\s*\/\s*7\s+dispatch/gi, 'for emergency dispatch')
    .replace(/when to call\s+24\s*\/\s*7\s+emergency service/gi, 'When to call for emergency service')
    .replace(/24\s*\/\s*7\s*[\u00b7|]\s*live dispatch/gi, 'Call to confirm emergency availability')
    .replace(/24\s*\/\s*7\s*[\u00b7|]\s*45[- ]min(?:ute)? response/gi, 'Call to confirm emergency availability')
    .replace(/licensed\s*(?:&amp;|&|and)\s*insured/gi, 'Commercial')
    .replace(/licensed,?\s*insured,?\s*and\s*available only after confirmation/gi, 'Credentials and availability require confirmation')
    .replace(/Licensed DC, VA, MD\s*(?:&amp;|&|and)\s*NY/gi, 'Commercial service information')
    .replace(/\bLive dispatch\b/gi, 'Call to confirm dispatch availability')
    .replace(/Emergency and after-hours service is available\.?/gi, 'Call to confirm emergency and after-hours availability.')
    .replace(/We handle emergency door repair and after-hours locksmith calls\.?/gi, 'Call to confirm emergency and after-hours availability.')
    .replace(/We regularly support portfolio teams and facility managers\.?/gi, 'Ask whether portfolio or facility-team coordination is available.')
    .replace(/We support portfolio-level rekey planning and execution\.?/gi, 'Ask whether portfolio-level rekey coordination is available.')
    .replace(/Same[ -]?day options are available for many commercial keyways\.?/gi, 'Scheduling depends on the keyway, opening count, authorization, parts and location.')
    .replace(/We repair and replace LCN, Norton, Dorma, and other commercial closers across Washington DC\.?/gi, 'Brand and model compatibility must be confirmed from the closer label or a clear photo.')
    .replace(/We support commercial fire door inspections in Washington DC, Maryland, and Northern Virginia with reports, correction plans, and repair support\.?/gi, 'Call to confirm inspection, documentation, correction and repair scope for the property.')
    .replace(/We handle annual inspections, deficiency reports, and correction planning across Washington DC, Maryland, and Northern Virginia\.?/gi, 'Call to confirm inspection, documentation and correction-planning scope for the property.')
    .replace(/recommend compliant options/gi, 'identify project-specific options for review')
    .replace(/all brands stocked/gi, 'Hardware availability varies')
    .replace(/code compliance guaranteed/gi, 'Confirm the applicable compliance scope')
    .replace(/same[ -]?day and scheduled service options/gi, 'urgent and scheduled service options')
    .replace(/same[ -]?day dispatch options/gi, 'dispatch options')
    .replace(/same[ -]?day commercial service/gi, 'commercial service')
    .replace(/same[ -]?day (?:service|help)/gi, 'commercial service')
    .replace(/same[ -]?day fixes/gi, 'repair options')
    .replace(/solved same[ -]?day/gi, 'correction scope requires assessment')
    .replace(/same[ -]?day correction options/gi, 'correction options')
    .replace(/same[ -]?day scheduling/gi, 'scheduling')
    .replace(/need a same[ -]?day quote/gi, 'Need a service quote')
    .replace(/request (?:a )?free estimate/gi, 'request an estimate')
    .replace(/get (?:a )?free estimate/gi, 'request an estimate')
    .replace(/free (?:estimate|quote)/gi, 'service estimate')
    .replace(/rapid local response/gi, 'local service availability')
    .replace(/fast response/gi, 'urgent service')
    .replace(/fast service/gi, 'commercial service')
    .replace(/we will follow up quickly/gi, 'we will follow up')
    .replace(/Call Now\s*[-—]\s*Technician Near You/gi, 'Call to Confirm Commercial Service')
    .replace(/Emergency dispatch is available only after confirmation with commercial service windows\.?/gi, 'Emergency and after-hours dispatch availability must be confirmed for the exact location.')
    .replace(/We assess and recommend the fastest safe path\.?/gi, 'Assessment should determine whether rekey, repair, or replacement is appropriate.')
    .replace(/Yes\. We can stabilize access immediately, then phase permanent upgrades\.?/gi, 'Call to confirm whether temporary stabilization and a separate permanent repair scope are available.')
    .replace(/Yes\. We coordinate with building teams for fast approvals and updates\.?/gi, 'Ask whether building-team coordination and work-order updates are available for the request.')
    .replace(/call to confirm availability\s*[·|]\s*Call to confirm availability/gi, 'Availability and dispatch timing require confirmation')
    .replace(/Commercial commercial locksmith and exit door hardware specialists serving Washington DC, Northern Virginia, Maryland,?\.? available only after confirmation\.?/gi, 'Commercial locksmith and exit-door hardware information for Washington DC businesses and nearby service areas. Exact availability must be confirmed.')
    .replace(/\bCommercial commercial\b/gi, 'Commercial')
    .replace(/\bservice service\b/gi, 'service')
    .replace(/available only after confirmation\s*[-—]\s*Response timing depends on availability and site conditions/gi, 'Availability and response timing depend on the exact location and site conditions')
    .replace(/Maryland,\s*\./gi, 'Maryland.')
    .replace(/\bsame[ -]?day\b/gi, 'scheduled')
    .replace(/\b24\s*\/\s*7\b/gi, 'call to confirm availability');
}

function neutralizeNonNewYorkMarketText(text) {
  return text
    .replace(/Emergency commercial service\s*[—-]\s*DC, Virginia, Maryland\s*(?:&amp;|&)\s*New York\.?/gi, 'Commercial service requests — Washington DC, nearby Northern Virginia and nearby Maryland.')
    .replace(/Commercial locksmith\s*(?:&amp;|&)\s*exit door (?:repairs?|service)\s*[—-]\s*Washington DC, Virginia, Maryland\s*(?:&amp;|&)\s*New York\.?/gi, 'Commercial locksmith and exit-door service information — Washington DC, nearby Northern Virginia and nearby Maryland.')
    .replace(/Our commercial technicians support Washington DC, Northern Virginia, Maryland, and New York with urgent and scheduled service options\.?/gi, 'Washington DC is the priority service area. Availability in nearby Northern Virginia and Maryland must be confirmed for the exact property.')
    .replace(/Washington DC, Northern Virginia, Maryland, and New York(?: City)?/gi, 'Washington DC, nearby Northern Virginia, and nearby Maryland')
    .replace(/Washington DC, Virginia, Maryland\s*(?:&amp;|&)\s*New York/gi, 'Washington DC, nearby Northern Virginia and nearby Maryland')
    .replace(/DC, Virginia, Maryland\s*(?:&amp;|&)\s*New York/gi, 'Washington DC, nearby Northern Virginia and nearby Maryland');
}

function neutralizeUnverifiedNewYorkText(text) {
  return text
    .replace(/Every Commercial Door(?:<br>)?Service in New York City/gi, 'Commercial Door Service Requests in New York City')
    .replace(/Every Neighborhood(?:<br>)?in New York City/gi, 'New York City Service-Area Confirmation')
    .replace(/\bEvery Commercial Door\b/gi, 'Commercial Door')
    .replace(/\bEvery Neighborhood\b/gi, 'Service-Area Availability')
    .replace(/Call to confirm response availability with the right unit on the truck\.?/gi, 'Call to confirm service availability, diagnosis scope, and hardware or parts needs.')
    .replace(/Schlage, Medeco, Best\s*[—-]\s*scheduling subject to confirmation\.?/gi, 'Hardware compatibility and scheduling require confirmation from the existing door and lock details.')
    .replace(/LCN, Norton, Dorma door closer repair and replacement for New York City commercial properties\. Fire-rated closers replaced to code\.?/gi, 'Door-closer repair or replacement scope in New York requires confirmation. Work on a rated opening must follow its listing, approved design, and applicable authority requirements.')
    .replace(/Fire code violation correction scope requires assessment\.?/gi, 'Any cited egress or fire-door condition requires project-specific assessment and responsible-authority direction.')
    .replace(/Need immediate help in New York City\? Call ([^<]+) for Emergency service dispatch and scheduled commercial door and lock service\.?/gi, 'Need service in New York City? Call $1 to confirm market availability and the requested commercial scope.')
    .replace(/Need immediate help in New York City\? Call/gi, 'Need service in New York City? Call')
    .replace(/for Emergency service dispatch and scheduled commercial door and lock service\.?/gi, 'to confirm market availability and the requested commercial scope.')
    .replace(/Credentials require confirmation\. call to confirm availability\.?/gi, 'Credentials and availability require confirmation for the exact property and scope.')
    .replace(/available only after confirmation with scheduled dispatch for commercial doors\.?/gi, 'Urgent and scheduled availability must be confirmed for the exact commercial property.')
    .replace(/available only after confirmation\s*[-—]\s*Response timing depends on availability and site conditions for commercial door emergencies\.?/gi, 'Service availability and response timing must be confirmed for the exact commercial property.')
    .replace(/New York City service-area coverage for commercial locksmith and exit door work requires confirmation\. New York service credentials require confirmation\. Midtown office building lobbies to outer borough retail\s*[—-]\s*call to confirm availability, Hardware availability varies\.?/gi, 'New York market, credential, scheduling, and hardware availability require confirmation for the exact commercial property and requested scope.')
    .replace(/New York City Coverage/gi, 'New York City Service-Area Status')
    .replace(/Commercial locksmith New York, emergency commercial locksmith New York, panic bar repair New York, door closer repair New York, fire door inspection New York, commercial rekey service New York, and access control installation New York are available through scheduled and emergency commercial routes\.?/gi, 'These commercial service categories are listed for planning only. New York market availability and the requested scope must be confirmed before scheduling.')
    .replace(/Call to confirm availability anywhere in New York City\.?/gi, 'Call to confirm availability for the exact New York City property.')
    .replace(/Commercial locksmith and exit door hardware specialists serving verified DC-area markets; New York availability requires confirmation\. available only after confirmation\.?/gi, 'Commercial locksmith and exit-door hardware information. New York market availability requires confirmation.')
    .replace(
      /New York City commercial buildings face the country's most complex regulatory environment\. NYC DOB enforces code requirements aggressively, and building management approvals, freight elevator logistics, and after-hours work windows add complexity that only commercial-specialist locksmiths handle correctly\./gi,
      'Commercial work in New York City can involve project-specific code, building-management, access, logistics, and work-hour constraints. Confirm the applicable requirements and service availability before planning work.'
    )
    .replace(/NYC DOB compliant, documented/gi, 'hardware and documentation scope require project review')
    .replace(
      /We provide urgent repair for storefront entrances, office doors, and building access points\./gi,
      'Call to confirm whether urgent repair is available for the storefront, office, or building access point.'
    )
    .replace(
      /Our service focuses on restoring security, safe egress, and smooth operation in one visit whenever possible\./gi,
      'Repair scope and timing depend on diagnosis, authorization, hardware, parts, access, and the exact location.'
    )
    .replace(
      /We support high-traffic commercial properties across all NYC boroughs\./gi,
      'New York service-area availability must be confirmed for the exact commercial property.'
    )
    .replace(
      /Serving all five NYC boroughs for commercial locksmith and exit door hardware\.?/gi,
      'New York City service-area coverage for commercial locksmith and exit door work requires confirmation.'
    )
    .replace(
      /Serving Manhattan, Brooklyn, Queens, Bronx, Staten Island/gi,
      'New York City service-area availability'
    )
    .replace(
      /Our same[ -]?day model reduces downtime and repeat calls\.?/gi,
      'Scheduling, travel, diagnosis, and parts availability affect repair timing.'
    )
    .replace(
      /Yes\. Emergency and scheduled support is available for commercial lock and door hardware needs in New York service zones\.?/gi,
      'Emergency and scheduled commercial service availability in New York requires confirmation.'
    )
    .replace(
      /Yes\. We provide office lockout response, rekeying, and tenant turnover lock service\.?/gi,
      'Call to confirm whether office lockout, rekey, and tenant-turnover work is available.'
    )
    .replace(
      /Yes\. We handle panic bar and exit device repair and installation for commercial properties\.?/gi,
      'Call to confirm panic bar and exit-device service availability for the property.'
    )
    .replace(
      /Yes\. We provide inspection support and correction services for fire door compliance workflows\.?/gi,
      'Call to confirm fire-door inspection or correction scope and availability.'
    )
    .replace(/\u2014\s*same[ -]?day\.?/gi, '\u2014 scheduling subject to confirmation.')
    .replace(/\bserving\s+Washington DC, Northern Virginia, Maryland, and New York City\b/gi, 'serving verified DC-area markets; New York availability requires confirmation');
}

function neutralizeVisibleClaims(html, pageRoute) {
  // This targets text nodes only. It deliberately avoids broad replacements in
  // attributes, URLs, styles, and JavaScript; metadata is handled separately.
  const withoutBoilerplate = html.replace(
    /<p\b[^>]*>\s*We handle emergency commercial locksmith calls, panic bar issues, door closer failures, and fire door compliance support\.\s*<\/p>/gi,
    ''
  );
  return withoutBoilerplate.replace(/>([^<]*)</g, (whole, text) => {
    let updated = neutralizeVisibleClaimText(text);
    if (isNewYorkPage(pageRoute)) {
      updated = neutralizeUnverifiedNewYorkText(updated);
    } else {
      updated = neutralizeNonNewYorkMarketText(updated);
    }
    return `>${updated}<`;
  });
}

function replaceExactClaims(html, replacements) {
  return replacements.reduce(
    (output, [unsafeCopy, safeCopy]) => output.replaceAll(unsafeCopy, safeCopy),
    html
  );
}

function neutralizeFireAndCodeClaims(html, pageRoute) {
  const replacementsByRoute = {
    '/blog-fire-door-inspection-requirements-washington-dc': [
      [
        'Need fire door inspection guidance in Washington DC? Learn NFPA 80 basics, common failures, and service options. Call now.',
        'Washington DC fire door inspection guidance: NFPA 80 context, facility pre-screen steps, and questions to confirm with the AHJ.'
      ],
      [
        'Fire doors are not optional safety hardware. In Washington DC commercial buildings, annual inspection expectations are strict and documentation quality matters. This guide covers what inspectors look for, why certain deficiencies are repeated across portfolios, and how to prepare without delaying operations.',
        'Fire doors are life-safety assemblies. NFPA 80 contains inspection, testing, maintenance, and recordkeeping provisions, but the edition, scope, interval, and required qualifications for a Washington DC property depend on the adopted code, occupancy, project documents, and AHJ direction. This guide offers facility-preparation steps, not a compliance determination.'
      ],
      [
        'NFPA 80 requires annual inspection of fire-rated door assemblies by qualified personnel. The inspection checks door and frame labels, self-closing and latching function, hardware operation, and clearances. Missing records can create the same compliance risk as physical deficiencies.',
        'NFPA 80 includes provisions addressing inspection, testing, maintenance, and records for opening protectives. Whether a particular opening is subject to an annual interval, which edition applies, and who is qualified to perform the work must be confirmed from the adopted code, approved design, listing information, and AHJ requirements. Missing records and physical deficiencies are distinct findings and should be handled according to the written inspection scope.'
      ],
      [
        'Many facilities teams assume a door that closes "most of the time" is acceptable. It is not. Fire doors must close and latch reliably under normal use conditions, not just after manual force.',
        'A facility pre-screen can note inconsistent closing or latching for qualified review. The required operation and acceptance criteria must be evaluated against the opening\'s listing, approved design, applicable code, and inspection scope.'
      ],
      ['Most Common Inspection Failures in DC', 'Examples of Conditions an Inspection May Identify'],
      [
        'Frequent issues include leaking closers, improper clearances, non-compliant modifications, missing gasketing, and blocked latching. Paired openings often fail because coordinators are absent or out of sequence. Labels are also commonly painted over or obscured.',
        'Examples of conditions that may be identified include leaking closers, irregular clearances, unevaluated field modifications, blocked latching, obscured labels, and missing gasketing where the listing or approved design requires it. Paired openings may also require review of coordinator sequencing.'
      ],
      [
        'Another common failure is incompatible replacement hardware installed by non-specialists. If hardware is not listed and approved for that opening, the assembly can fail inspection even if it appears functional.',
        'Replacement hardware that has not been evaluated against the opening\'s listing and approved design may lead to an inspection finding even when it appears functional. Have compatibility and any required qualifications confirmed for the specific assembly.'
      ],
      [
        'For large properties, schedule corrective work in phases. Handle life-safety critical openings first, then high-traffic routes, then lower-risk areas. Keep clear records including location, deficiency type, and repair status.',
        'For large properties, organize findings by opening and building zone. Follow the written findings and responsible inspector, AHJ, or design professional when setting priorities; do not defer or phase a cited condition without approval. Keep records of the location, finding, authorized work, and status.'
      ],
      [
        'Start with a pre-inspection walk. Document each opening, note visible damage, test close and latch behavior, and record urgent corrective priorities. Group repairs by building zone to minimize tenant impact and technician travel time.',
        'Start with a facility pre-screen. Identify each opening, record visible damage and observed closing or latching concerns under the property\'s approved procedures, and organize the notes for the responsible inspector or qualified reviewer.'
      ],
      [
        'Call for immediate correction if a fire door fails to latch, has broken closer arms, or cannot be secured. scheduled correction reduces risk exposure and prevents compliance backlog before audits.',
        'If an opening will not latch, has broken hardware, or cannot be secured, follow the property\'s safety procedures and obtain direction on temporary safeguards and corrective scope. Final acceptance remains with the responsible inspector or AHJ.'
      ],
      ['When to Request scheduled Corrective Service', 'When to Request Corrective-Service Scope'],
      ['call to confirm availability commercial dispatch with inspection-focused repairs.', 'Call to confirm whether inspection-related mechanical correction is available for the specific opening.'],
      ['Fire Door Inspection Service', 'Fire Door Inspection Scope Request'],
      ['Fire Door Inspection Maryland', 'Nearby Maryland Service Area']
    ],
    '/blog/how-often-fire-doors-inspected-washington-dc': [
      [
        'How often should fire doors be inspected in Washington DC? Learn annual NFPA 80 expectations and when interim checks are recommended.',
        'How often should fire doors be inspected in Washington DC? Learn which property and code factors determine the applicable interval and scope.'
      ],
      [
        'Annual inspection is the baseline. This guide explains when additional checks make sense for commercial buildings.',
        'Inspection intervals depend on the adopted code, occupancy, opening, project documents, and AHJ direction. This guide explains questions to confirm.'
      ],
      [
        'Annual NFPA 80 inspection guidance for Washington DC commercial properties.',
        'NFPA 80 inspection-interval context for Washington DC commercial properties.'
      ],
      [
        'For most commercial buildings, the baseline is annual fire door inspection under NFPA 80. Many properties also add interim checks when occupancy changes or hardware failures appear.',
        'NFPA 80 contains inspection, testing, maintenance, and recordkeeping provisions. Whether a particular Washington DC opening is subject to an annual interval—and which edition applies—depends on the adopted code, occupancy, project documents, listing information, and AHJ direction. Confirm the applicable interval, scope, and qualifications with the AHJ or responsible design/code professional.'
      ],
      ['Annual Inspection Service', 'Request Inspection Scope'],
      ['When to Inspect Beyond Annual Cycles', 'When Additional Facility Checks May Help'],
      ['Before major occupancy reviews or insurance audits', 'Before an occupancy review or other property-directed assessment'],
      [
        'Interim checks reduce surprise failures during formal annual inspections.',
        'Facility checks can surface operational concerns, but they do not replace any formal inspection required for the property.'
      ],
      ['CTA: Need Annual Fire Door Inspection Washington DC Service?', 'Need Help Confirming an Inspection Scope?']
    ],
    '/blog/nfpa-80-fire-door-inspection-checklist': [
      ['Need inspection help now?', 'Planning an inspection scope?'],
      [
        'NFPA 80 Fire Door Inspection Checklist for Commercial Buildings',
        'Fire Door Pre-Inspection Preparation List | NFPA 80 Context'
      ],
      [
        'Use this NFPA 80 fire door inspection checklist to prepare commercial buildings in Washington DC, Maryland, and Northern Virginia for annual compliance reviews.',
        'Facility pre-screen for swinging fire doors with builders hardware. It is not a formal NFPA 80 inspection or compliance determination.'
      ],
      [
        'A practical NFPA 80 checklist for property managers and building owners preparing for annual inspections.',
        'A facility preparation list for property teams, with NFPA 80 scope and AHJ limitations explained.'
      ],
      [
        'Commercial checklist for annual NFPA 80 fire door inspections.',
        'Facility pre-screen for swinging fire doors with builders hardware; not a formal inspection.'
      ],
      ['NFPA 80 Checklist', 'Fire Door Pre-Inspection Preparation'],
      ['NFPA 80 Fire Door Inspection Checklist', 'Fire Door Pre-Inspection Preparation List'],
      [
        'Start with labels, clearances, latching, and hardware compatibility. If any opening fails self-close or self-latch, treat it as a priority deficiency.',
        'This facility pre-screen is limited to visible observations on swinging fire doors with builders hardware. It is not a formal NFPA 80 inspection, deficiency classification, or compliance determination.'
      ],
      ['NFPA 80 Service Page', 'Request Fire Door Inspection Scope'],
      [
        '<h2>Checklist You Can Use</h2><ul class="lead-checklist">',
        '<h2>Facility Pre-Screen You Can Use</h2><p><strong>Scope:</strong> Use this list only to prepare information for a qualified review of swinging fire doors with builders hardware. It does not cover rolling steel doors, shutters, curtains, dampers, or other specialized assemblies. Consult the <a href="https://content.nfpa.org/-/media/project/storefront/catalog/files/code-or-topic-fact-sheets/nfpa_80_inspection_checklist_for_swinging_door.pdf?rev=6480d63a390a4dc2868f90b588627ad7">official NFPA inspection checklist for swinging doors</a> and confirm the effective requirements with the AHJ.</p><ul class="lead-checklist">'
      ],
      ['Confirm rated labels on door and frame are legible', 'Record whether door and frame labels appear present and legible'],
      ['Test full self-closing and positive latching operation', 'Record observed self-closing and latching behavior under the property\'s approved facility procedure'],
      ['Measure clearances at head, jamb, and undercut', 'Note visibly irregular clearances for formal measurement'],
      ['Verify panic bars / exit devices function correctly', 'Record visible panic-bar or exit-device operating concerns'],
      ['Inspect door closers for leaks, arm damage, and control', 'Note visible closer leaks, arm damage, or operating concerns'],
      ['Check hinges, strikes, and frame anchoring', 'Record visible hinge, strike, or frame damage for qualified review'],
      ['Review glazing and gasketing condition', 'Record glazing and gasketing condition for listing-specific review'],
      ['Flag non-listed hardware or field modifications', 'Record uncertain hardware or field modifications for qualified review'],
      [
        'Create a deficiency list by opening and prioritize life-safety risks first. Then schedule correction work before your formal annual review.',
        'Create an observation list by opening and provide it to the responsible inspector or qualified professional. Do not classify findings or authorize corrections until the applicable listing, approved design, inspection scope, and qualifications have been confirmed.'
      ],
      ['CTA: Need Help with Annual Inspections?', 'Need Help Confirming the Applicable Inspection Scope?'],
      ['NFPA 80 fire door inspection checklist resource', 'Fire door pre-inspection preparation resource'],
      [
        '<div class="lead-inline-links"><a href="/fire-door-deficiency-repair">Fire Door Deficiency Repair</a><a href="/fire-door-repair-washington-dc">Fire Door Repair Washington DC</a></div>',
        '<div class="lead-inline-links"><a href="/fire-door-repair-washington-dc">Request a Fire Door Repair Scope</a></div>'
      ],
      [
        '<div class="lead-inline-links"><a href="/fire-door-repair-washington-dc">Fire Door Deficiency Repair</a><a href="/fire-door-repair-washington-dc">Fire Door Repair Washington DC</a></div>',
        '<div class="lead-inline-links"><a href="/fire-door-repair-washington-dc">Request a Fire Door Repair Scope</a></div>'
      ]
    ],
    '/blog-panic-bar-guide': [
      [
        'That push bar on your exit door isn\'t just a piece of hardware — it\'s a life-safety device with legal requirements behind it. When it fails, you\'re in code violation territory. Here\'s everything you need to know.',
        'A push bar is life-safety hardware whose required function depends on the opening and applicable rules. A failed device may create an unsafe operating condition or an inspection finding; the AHJ or project code professional determines the requirement for the opening.'
      ],
      [
        'A panic bar — also called an exit device, crash bar, or push bar — is designed to allow emergency egress with a single push motion. Unlike a door knob, it requires no grasping or twisting — critical for rapid evacuation. NFPA 101 and IBC govern where they\'re required.',
        'A panic bar—also called an exit device, crash bar, or push bar—is designed to unlatch a door with a push motion. Whether panic hardware is required depends on the adopted code, occupancy, occupant load, opening function, approved design, and AHJ determination.'
      ],
      [
        'Required by DC Building Code on exit doors serving assembly occupancies with 50+ occupants, all exit doors in educational occupancies, and all Group H hazardous occupancy exits. Even where not strictly required, panic hardware is strongly recommended for liability protection.',
        'Panic- or fire-exit-hardware requirements depend on the currently adopted DC code, occupancy, occupant load, door location and function, listing information, and approved design. Have the AHJ or project code professional determine the requirement for the specific opening.'
      ],
      ['Panic Bar Replacement Costs in DC', 'What Affects Panic Bar Repair or Replacement Scope?'],
      [
        'Standard replacement: $285–$650. CVR systems: $450–$950. Emergency surcharge: $100–$175. Most insurance covers vandalism-related panic bar damage. See our <a href="/panic-bar-repair-washington-dc">full panic bar service page</a>.',
        'Device type, door condition, trim, rods, electrification, listing requirements, parts availability, and approved scope all affect the work. Obtain a site-specific estimate and confirm any insurance question directly with the policy carrier. See our <a href="/panic-bar-repair-washington-dc">panic bar repair service page</a>.'
      ]
    ],
    '/blog/annual-fire-door-inspection-maryland': [
      [
        'Annual Fire Door Inspection Maryland Guide for Commercial Properties',
        'Planning a Fire Door Inspection in Nearby Maryland'
      ],
      [
        'Annual fire door inspection Maryland guide: what to check, how to prepare, and how to handle deficiencies for commercial properties.',
        'Planning guidance for a fire door inspection in nearby Maryland, including questions about the applicable code, scope, interval, and AHJ.'
      ],
      [
        'Practical annual fire door inspection Maryland planning for property managers and building owners.',
        'Fire door inspection planning for nearby Maryland properties, subject to state, local, project, and AHJ requirements.'
      ],
      [
        'How to run annual fire door inspections across Maryland commercial buildings.',
        'How property teams can prepare for a project-specific fire door inspection in nearby Maryland.'
      ],
      ['Annual fire door inspection Maryland', 'Fire door inspection planning in nearby Maryland'],
      ['Annual Maryland fire door support:', 'Maryland fire door planning support:'],
      ['Annual Fire Door Inspection Maryland', 'Planning a Fire Door Inspection in Nearby Maryland'],
      [
        'Annual inspection programs work best when they are scheduled early, documented clearly, and paired with a realistic correction plan for deficiencies.',
        'Maryland\'s State Fire Prevention Code incorporates NFPA 1 and NFPA 101 subject to state amendments, local rules, building conditions, and AHJ determinations. This is planning guidance, not a statewide compliance determination.'
      ],
      ['Maryland Annual Planning Framework', 'Maryland Inspection Planning Framework'],
      [
        'This process helps building owners and managers avoid last-minute compliance pressure.',
        'This preparation can help owners organize property information before the responsible authority confirms the applicable scope.'
      ],
      ['CTA: Need Annual Fire Door Inspection Maryland Support?', 'Need Help Scoping a Fire Door Inspection in Nearby Maryland?'],
      ['CTA: Need Planning a Fire Door Inspection in Nearby Maryland Support?', 'Need Help Scoping a Fire Door Inspection in Nearby Maryland?'],
      [
        'We help Maryland portfolios with inspections, deficiency reporting, and correction planning across Bethesda, Silver Spring, and surrounding markets.',
        'Call to confirm service-area availability and whether opening review, formal inspection, reporting, or mechanical correction can be supported for the specific property. Final acceptance remains with the responsible inspector or AHJ.'
      ],
      ['Fire Door Inspection Maryland Service', 'Nearby Maryland Service Information'],
      ['Log deficiencies by risk and urgency', 'Log written findings and the responsible authority\'s stated priority'],
      ['Annual fire door inspection Maryland resource', 'Nearby Maryland fire door inspection planning resource']
    ],
    '/blog-fire-door-inspection-checklist-businesses-washington-dc': [
      [
        'Fire Door Inspection Checklist for Businesses in Washington DC',
        'Fire Door Pre-Inspection Checklist for Washington DC Businesses'
      ],
      [
        'Practical fire door inspection checklist for Washington DC businesses with compliance steps, deficiency priorities, and fast correction planning.',
        'Facility pre-screen for Washington DC property teams preparing opening information; not a formal inspection or compliance determination.'
      ],
      ['Practical Compliance Guidance for Property Teams', 'Facility Preparation Guidance for Property Teams'],
      [
        'Use this checklist to prepare inspections, document deficiencies, and prioritize corrections before compliance deadlines create operational pressure.',
        'Use this facility pre-screen to prepare opening information for the responsible inspector. It does not replace a formal inspection, classify deficiencies, or determine compliance.'
      ],
      ['What to Check First', 'Facility Pre-Screen: What to Record First'],
      [
        '<ul class="lead-list">\n        <li>Confirm rated labels are present and legible on door and frame assemblies.',
        '<p><strong>Scope:</strong> Record visible conditions without altering or testing beyond facility procedures. The applicable code edition, inspection interval, assembly listing, required qualifications, and final acceptance must be confirmed for the property.</p>\n      <ul class="lead-list">\n        <li>Record whether rated labels appear present and legible on door and frame assemblies.'
      ],
      ['Test full self-close and positive latch behavior on every inspected opening.', 'Record observed self-closing and latching behavior under the property\'s approved facility procedure.'],
      ['Inspect panic bars, exit devices, and closer performance under normal traffic.', 'Record visible panic-bar, exit-device, and closer operating concerns.'],
      ['Review clearances, gasketing, and door/frame condition for visible failures.', 'Note visibly irregular clearances, gasketing condition, and door/frame damage for qualified review.'],
      ['Capture findings by opening ID so repairs can be routed quickly.', 'Capture observations by opening ID so the responsible inspector can determine next steps.'],
      ['Fire Door Compliance', 'Fire Door Inspection Scope'],
      [
        'Annual inspection cycles are typical, with interim checks when high-traffic risks are identified.',
        'The applicable interval depends on the adopted code, occupancy, opening, project documents, and AHJ direction. Confirm it with the AHJ or responsible design/code professional.'
      ],
      [
        'Yes. Many businesses prioritize urgent life-safety items first, then phase remaining corrections.',
        'Do not defer or phase a cited condition unless the responsible owner and AHJ, inspector, or design professional approve the sequence.'
      ],
      [
        'Commercial door and locksmith specialists can handle many closer, latch, panic bar, and hardware corrections.',
        'Required qualifications, listing instructions, permits, and trade scope depend on the assembly and AHJ. Confirm them before authorizing work.'
      ],
      [
        'Yes. We also support Northern Virginia, Maryland, and New York service routes.',
        'Washington DC is the priority service area. Call to confirm the exact property and requested scope in nearby Northern Virginia or Maryland; other markets require separate confirmation.'
      ],
      [
        'Our commercial technicians support Washington DC, Northern Virginia, Maryland, and New York with urgent and scheduled service options.',
        'Washington DC is the priority service area. Availability for an exact property and scope in nearby Northern Virginia or Maryland must be confirmed.'
      ]
    ],
    '/blog-fire-door-compliance-mistakes-businesses-avoid': [
      [
        'Avoid common fire door compliance mistakes that cause failed inspections, costly rework, and preventable operational delays in commercial buildings.',
        'Examples of fire door maintenance and documentation issues that may lead to inspection findings or operational delays in commercial buildings.'
      ],
      [
        'Most compliance failures are repeatable and preventable. Addressing a few high-impact mistakes can significantly lower risk and repair cost.',
        'Examples of conditions that may be identified include closing, latching, hardware-compatibility, and documentation issues. The responsible inspector or AHJ determines each finding and required response.'
      ],
      ['Delaying closer and panic hardware correction beyond safe windows.', 'Delaying action after a closer or panic-hardware problem is identified.'],
      ['What is the most common fire door compliance failure?', 'What conditions may lead to a fire door inspection finding?'],
      [
        'Non-latching openings and failing closer/exit hardware are among the most common issues.',
        'Examples include non-latching openings and closer or exit-hardware problems; only the responsible inspector or AHJ can classify a condition for the property.'
      ],
      [
        'Address immediate life-safety risks first, then phase lower-risk items with clear timelines.',
        'Follow the written findings and responsible authority\'s direction. Do not defer or phase a cited condition without approval.'
      ],
      [
        'Yes. We support inspection planning and deficiency correction workflows.',
        'Call to confirm whether opening review, inspection coordination, documentation, or mechanical correction is available for the property. Final acceptance remains separate.'
      ],
      [
        'Yes. Exit hardware failures can produce immediate life-safety concerns and inspection findings.',
        'They may create an unsafe operating condition or be cited during an applicable inspection. The responsible inspector or AHJ determines the finding.'
      ],
      ['Fire Door Compliance Service', 'Fire Door Inspection Requests'],
      [
        'Our commercial technicians support Washington DC, Northern Virginia, Maryland, and New York with urgent and scheduled service options.',
        'Washington DC is the priority service area. Availability for an exact property and scope in nearby Northern Virginia or Maryland must be confirmed.'
      ]
    ],
    '/blog-fire-door-inspection': [
      [
        'Fire Door Inspection Washington DC Guide | NFPA 80 Compliance Tips',
        'Fire Door Inspection Washington DC Guide | NFPA 80 Context'
      ],
      [
        'Fire door inspection Washington DC guide covering NFPA 80 basics, common deficiencies, and how to prepare your commercial building for annual reviews.',
        'Washington DC fire door inspection guide with NFPA 80 context, example checklist observations, and questions to confirm before requesting service.'
      ],
      [
        'Fire doors are tested life-safety assemblies, and inspections focus on labels, clearances, closing/latching, and approved hardware. This guide covers the most common deficiencies and how to fix them.',
        'Fire doors are life-safety assemblies. Applicable inspections may review labels, clearances, closing and latching, and hardware against the opening\'s listing and approved design. This guide offers preparation context, not a compliance determination.'
      ],
      ['What Inspectors Commonly Look For', 'Examples of Items an Applicable Inspection May Review'],
      ['Clearances and gasketing meet the opening’s requirements', 'Clearances and gasketing, where required by the listing or approved design'],
      ['Common Deficiencies', 'Examples of Conditions That May Be Identified'],
      ['Missing or damaged smoke seals', 'Missing or damaged seals where required by the listing or approved design'],
      ['Non-compliant hardware changes by prior occupants or contractors', 'Hardware changes not evaluated against the listing or approved design'],
      ['How We Help You Get Compliant', 'How to Scope Inspection and Correction Support'],
      [
        'We can inspect openings, correct deficiencies when parts are available, and provide documentation. For service details, see our <a href="/fire-door-inspection-washington-dc">fire door inspection & compliance page</a>.',
        'Call to confirm whether opening review, formal inspection, documentation, or corrective work is available for the specific property. Final compliance and closeout are determined separately by the responsible inspector or AHJ. See our <a href="/fire-door-inspection-washington-dc">fire door inspection request page</a>.'
      ]
    ],
    '/blog/what-happens-if-fire-door-fails-inspection': [
      [
        'What happens if a fire door fails inspection? Learn the business and compliance risks plus the fastest way to correct deficiencies.',
        'What happens after a fire door inspection finding? Learn how written findings, corrective scope, documentation, and follow-up may be handled.'
      ],
      [
        'Failed fire door inspections can create life-safety and compliance risk. Here is what to do next.',
        'Next steps after a fire door inspection finding depend on the written report and responsible inspector or AHJ.'
      ],
      ['Immediate next steps after a failed fire door inspection.', 'Possible next steps after a fire door inspection finding.'],
      [
        'A failed inspection usually means you need documented corrections before the opening is considered compliant again. In active-use buildings, delays can increase risk and disrupt operations.',
        'Next steps depend on the written findings and responsible inspector or AHJ. The report may require correction, documentation, temporary safeguards, or follow-up review; a service contractor cannot declare closeout unless expressly authorized.'
      ],
      ['Common Consequences', 'Potential Next Steps'],
      ['Corrective actions required before close-out', 'Correction, documentation, or follow-up identified in the written findings'],
      ['Increased liability if life-safety doors stay deficient', 'Direction on temporary safeguards or operating restrictions, where applicable'],
      [
        'The faster you map and complete corrections, the faster risk decreases.',
        'Use the written findings and responsible authority\'s direction to set priorities, document authorized work, and arrange any required follow-up.'
      ],
      ['CTA: Failed Inspection? Call Now.', 'Have Written Inspection Findings? Request Service Scope.'],
      [
        'We provide deficiency correction support across Washington DC, Maryland, and Northern Virginia, including panic bars, closers, exit devices, and related hardware.',
        'Call to confirm whether mechanical correction of panic bars, closers, exit devices, or related hardware can be supported for the property. Final inspection acceptance remains with the responsible inspector or AHJ.'
      ]
    ],
    '/blog/common-fire-door-deficiencies-commercial-buildings': [
      ['Common Fire Door Deficiencies in Commercial Buildings', 'Examples of Fire Door Deficiencies in Commercial Buildings'],
      [
        'Most common fire door deficiencies in commercial buildings and how property managers can correct them before annual inspection deadlines.',
        'Examples of conditions included in fire door inspection checklists and how property teams can prepare them for assembly-specific evaluation.'
      ],
      [
        'Learn the recurring fire door deficiencies that cause failed inspections and how to fix them.',
        'Examples of fire door conditions that may lead to findings and require assembly-specific evaluation.'
      ],
      ['Top deficiency patterns seen in annual fire door inspection programs.', 'Example conditions that may appear in a fire door inspection report.'],
      [
        'The most frequent failures are latching problems, closer issues, clearance violations, and non-compliant hardware changes. These are usually fixable with targeted correction work.',
        'Examples included in fire door inspection checklists include latching problems, closer issues, irregular clearances, and unevaluated hardware changes. A condition may be repairable only after assembly-specific evaluation; the responsible inspector or AHJ classifies the finding.'
      ],
      ['Top Deficiencies', 'Example Conditions'],
      [
        'Many properties run reactive maintenance only. Without inspection-driven correction planning, the same openings fail repeatedly each year.',
        'Reactive maintenance can leave recurring operational problems unresolved. Track observations by opening and use the applicable inspection findings to plan authorized work.'
      ],
      ['Annual Fire Door Inspection Washington DC', 'Fire Door Inspection Washington DC'],
      [
        'We help property managers and building owners correct high-risk deficiencies and document completed work for compliance records.',
        'Call to confirm whether mechanical correction and work documentation are available for the cited condition. Risk classification and final acceptance remain with the responsible inspector or AHJ.'
      ]
    ],
    '/blog/door-closer-problems-fire-door-compliance': [
      [
        'Door closer problems can cause fire door compliance failures. Learn warning signs, quick checks, and when to schedule corrective service.',
        'Door closer problems may be cited during an applicable fire door inspection. Learn warning signs and questions to confirm before service.'
      ],
      [
        'How failing door closers impact fire door inspections and what commercial properties should do next.',
        'How door closer problems may affect a rated opening and what property teams can confirm next.'
      ],
      [
        'If a fire door closer leaks, slams, or fails to close and latch correctly, that opening can fail inspection. Closer performance is one of the most common compliance gaps.',
        'If a closer on a rated opening leaks, slams, or does not close and latch, the condition may be cited during an applicable inspection. The opening\'s listing, approved design, inspection scope, and AHJ direction determine the finding.'
      ],
      [
        'These signs indicate the opening may not satisfy inspection expectations.',
        'Record these signs for evaluation against the opening\'s listing, approved design, and applicable inspection scope.'
      ],
      ['Schedule correction before annual inspection', 'Schedule authorized correction before the property\'s required inspection'],
      ['CTA: Need Closer Correction for Compliance?', 'Need Closer Correction on a Rated Opening?']
    ],
    '/blog-exit-device-compliance': [
      [
        'Need exit device compliance in Washington DC? Commercial guidance and service options for businesses and property teams. Call now for commercial service and a service estimate.',
        'Washington DC exit-device code considerations for businesses, including occupancy, listing, approved-design, and AHJ questions to confirm.'
      ],
      [
        'Exit devices and panic hardware are life-safety components. If they’re missing, broken, or incorrectly installed, you can fail inspection and create serious liability. Here’s a practical overview of the basics.',
        'Exit devices and panic hardware are life-safety components. Missing, broken, or incompatible hardware may lead to an inspection finding or unsafe operation. The AHJ or project code professional determines the applicable requirement.'
      ],
      [
        'Requirements depend on occupancy type, occupant load, and local adoption of building and life-safety codes. Many commercial buildings need panic hardware on certain exit doors (especially assembly and educational uses). If you’re unsure, we can review the opening and identify project-specific options for review.',
        'Panic- or fire-exit-hardware requirements depend on the currently adopted code, occupancy, occupant load, door location and function, the opening\'s listing, and approved design. Have the AHJ or project code professional determine the requirement for the specific opening.'
      ],
      [
        'Improper modifications, missing latching, or mismatched hardware are common reasons for inspection issues.',
        'Improper modifications, missing latching, or mismatched hardware may be identified during an applicable inspection.'
      ],
      ['Common Compliance Problems', 'Examples of Conditions That May Be Identified'],
      [
        'We troubleshoot and repair exit devices, replace worn components, and install compliant hardware for your opening. For service details, see our <a href="/exit-device-repair-washington-dc">exit device repair & installation page</a>.',
        'We can troubleshoot exit devices and scope repair or replacement options for review against the opening, listing, approved design, and applicable requirements. Final acceptance is determined separately by the responsible inspector or AHJ. See our <a href="/exit-device-repair-washington-dc">exit device repair page</a>.'
      ]
    ],
    '/blog-door-closer-repair': [
      [
        'Door closer repair Washington DC guide for identifying failures, minimizing downtime, and maintaining compliant fire door operation in commercial buildings.',
        'Door closer repair Washington DC guide for identifying failures, minimizing downtime, and understanding rated-opening considerations.'
      ],
      [
        'Many fire-rated doors must self-close and latch. A failing closer can become a compliance issue. If this is a fire door opening, we’ll verify proper closing/latching behavior and help correct deficiencies.',
        'A rated opening may be required to self-close and latch under its listing, approved design, and applicable code. We can assess closing and latching behavior and scope mechanical corrections; inspection acceptance and compliance determinations remain separate.'
      ]
    ],
    '/blog-door-closer-not-closing-common-causes-fixes': [
      [
        'When doors stop latching, security and compliance risks follow quickly. Start with the most common causes before deciding on adjustment or replacement.',
        'When a door stops latching, security and operation can be affected, and a rated opening may require inspection review. Start by documenting the symptoms before deciding on adjustment or replacement.'
      ],
      ['Most Common Causes', 'Possible Causes'],
      [
        'Often yes, if the closer is healthy and the opening alignment is stable.',
        'Adjustment may help when the closer is serviceable and the opening alignment is stable; diagnosis is needed before deciding.'
      ],
      [
        'Yes. We service closers on fire door assemblies with compliance in mind.',
        'Call to confirm whether the rated-opening scope and required qualifications can be supported. Final inspection acceptance and compliance determinations remain separate.'
      ]
    ]
  };

  const output = replaceExactClaims(html, replacementsByRoute[pageRoute] || []);
  if (!FIRE_INFORMATION_PATTERN.test(pageRoute)) return output;

  return output
    .replace(/(<a\b[^>]*href\s*=\s*["']tel:[^>]*>)Request Inspection(<\/a>)/gi, '$1Call About Inspection Scope$2')
    .replace(/>Fire Door Inspection Service</gi, '>Fire Door Inspection Scope Request<');
}

function accessibleLegacyControls(html) {
  let output = html.replace(/<button\b[^>]*>/gi, (tag) => {
    const className = getAttribute(tag, 'class') || '';

    if (/\b(?:ham|hamburger|menu-toggle)\b/i.test(className)) {
      let updated = setAttribute(tag, 'type', 'button');
      updated = setAttribute(updated, 'aria-label', 'Open navigation menu');
      updated = setAttribute(updated, 'aria-expanded', 'false');
      updated = setAttribute(updated, 'aria-controls', 'mobNav');
      return updated;
    }

    if (/\bmob-close\b/i.test(className)) {
      let updated = setAttribute(tag, 'type', 'button');
      updated = setAttribute(updated, 'aria-label', 'Close navigation menu');
      updated = setAttribute(updated, 'aria-controls', 'mobNav');
      return updated;
    }

    return tag;
  });

  output = output.replace(/<(?:div|nav)\b[^>]*>/gi, (tag) => {
    const className = getAttribute(tag, 'class') || '';
    if (!/\bmob-nav\b/i.test(className)) return tag;

    let updated = setAttribute(tag, 'id', getAttribute(tag, 'id') || 'mobNav');
    updated = setAttribute(updated, 'role', 'navigation');
    updated = setAttribute(updated, 'aria-label', 'Mobile navigation');
    return updated;
  });

  return output;
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;

  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) continue;
    if (offset + 2 > buffer.length) break;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame && length >= 7) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3)
      };
    }

    offset += length;
  }

  return null;
}

function pngDimensions(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const imageDimensionCache = new Map();

function dimensionsForImage(src, htmlFile) {
  const decoded = decodeHtmlAttribute(src).split(/[?#]/, 1)[0];
  if (!decoded || /^(?:data:|https?:|\/\/)/i.test(decoded)) return null;

  const absolutePath = decoded.startsWith('/')
    ? path.join(ROOT_DIR, decoded.replace(/^\/+/, ''))
    : path.resolve(path.dirname(htmlFile), decoded);

  const relativePath = path.relative(ROOT_DIR, absolutePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return null;
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) return null;
  if (imageDimensionCache.has(absolutePath)) return imageDimensionCache.get(absolutePath);

  const buffer = fs.readFileSync(absolutePath);
  const dimensions = jpegDimensions(buffer) || pngDimensions(buffer);
  imageDimensionCache.set(absolutePath, dimensions);
  return dimensions;
}

function enrichImages(html, htmlFile) {
  let contentImageIndex = 0;

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = getAttribute(tag, 'src');
    if (!src) return tag;

    const dimensions = dimensionsForImage(src, htmlFile);
    let updated = tag;
    if (dimensions) {
      if (!hasAttribute(updated, 'width')) updated = setAttribute(updated, 'width', dimensions.width);
      if (!hasAttribute(updated, 'height')) updated = setAttribute(updated, 'height', dimensions.height);
    }

    if (!hasAttribute(updated, 'alt')) updated = setAttribute(updated, 'alt', '');
    if (!hasAttribute(updated, 'decoding')) updated = setAttribute(updated, 'decoding', 'async');

    const isFaviconOrLogo = /(?:locksmith\.png|logo)/i.test(`${src} ${getAttribute(tag, 'class') || ''}`);
    if (!isFaviconOrLogo && contentImageIndex === 0) {
      updated = removeAttribute(updated, 'loading');
      updated = setAttribute(updated, 'fetchpriority', 'high');
      contentImageIndex += 1;
    } else {
      if (!hasAttribute(updated, 'loading')) updated = setAttribute(updated, 'loading', 'lazy');
      if (!isFaviconOrLogo) contentImageIndex += 1;
    }

    return updated;
  });
}

function addQualificationNotice(html, pageRoute) {
  const marketNote = isNewYorkPage(pageRoute)
    ? '<span> New York service-area availability requires business confirmation.</span>'
    : '';
  const notice =
    '<div class="legacy-commercial-notice" role="note" data-qualification-notice>' +
    '<strong>Commercial door and locksmith service.</strong> Door, lock and hardware requests are welcome.' +
    marketNote +
    '</div>';
  let output = html.replace(
    /<div\b(?=[^>]*\blegacy-commercial-notice\b)(?=[^>]*\bdata-qualification-notice\b)[^>]*>[\s\S]*?<\/div>/gi,
    notice
  );
  const bodyMatch = output.match(/<body\b[^>]*>/i);
  if (!bodyMatch) return output;

  let preamble = '';
  if (!/href\s*=\s*["']#main-content["']/i.test(html)) {
    preamble += '\n<a class="legacy-skip-link" href="#main-content">Skip to main content</a>';
  }

  if (!/data-qualification-notice/i.test(output)) {
    preamble += `\n${notice}`;
  }

  if (!preamble) return output;
  return output.replace(bodyMatch[0], `${bodyMatch[0]}${preamble}\n`);
}

function configureLegacyBody(html, pageRoute) {
  const bodyMatch = html.match(/<body\b[^>]*>/i);
  if (!bodyMatch) return html;
  let body = setAttribute(bodyMatch[0], 'data-service', pageRoute.includes('blog') ? 'commercial_resource' : 'legacy_commercial_service');
  body = setAttribute(
    body,
    'data-location',
    isNewYorkPage(pageRoute) ? 'New York availability requires confirmation' : 'Washington DC service area'
  );
  return html.replace(bodyMatch[0], body);
}

function addTransactionalStickyCall(html, pageRoute) {
  if (pageRoute.includes('blog') || !isNewYorkPage(pageRoute)) return html;
  const hasStickyCall = (html.match(/<a\b[^>]*>/gi) || []).some((tag) =>
    /sticky/i.test(getAttribute(tag, 'class') || '') && /^tel:/i.test(getAttribute(tag, 'href') || '')
  );
  if (hasStickyCall) return html;
  const call = `<a class="sticky-call" href="tel:${htmlEscapeAttribute(business.phone.e164)}" data-business-phone-link data-dynamic-number-eligible data-cta-location="sticky" aria-label="Call to confirm commercial service availability at ${htmlEscapeAttribute(business.phone.display)}">Call to Confirm Commercial Service · <span data-business-phone>${htmlEscapeAttribute(business.phone.display)}</span></a>`;
  return /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, `${call}\n</body>`) : `${html}\n${call}`;
}

function ensureMainLandmark(html) {
  const mainMatch = html.match(/<main\b[^>]*>/i);
  if (mainMatch) {
    const withId = setAttribute(mainMatch[0], 'id', 'main-content');
    return html.replace(mainMatch[0], withId);
  }

  const bodyMatch = html.match(/<body\b[^>]*>/i);
  if (!bodyMatch) return html;

  const bodyStart = (bodyMatch.index || 0) + bodyMatch[0].length;
  const contentAfterBody = html.slice(bodyStart);
  const preferredStart = contentAfterBody.search(
    /<(?:header\b[^>]*class\s*=\s*["'][^"']*(?:lead-hero|hero)[^"']*["']|section\b)/i
  );
  const startIndex = preferredStart >= 0 ? bodyStart + preferredStart : bodyStart;
  const footerIndex = html.slice(startIndex).search(/<footer\b/i);
  const bodyEndIndex = html.slice(startIndex).search(/<\/body\s*>/i);
  const endIndex =
    footerIndex >= 0
      ? startIndex + footerIndex
      : bodyEndIndex >= 0
        ? startIndex + bodyEndIndex
        : html.length;

  return `${html.slice(0, startIndex)}<main id="main-content">\n${html.slice(startIndex, endIndex)}\n</main>\n${html.slice(endIndex)}`;
}

function addComplianceDisclaimer(html, file, pageRoute) {
  const pageSignals = `${path.basename(file)} ${pageRoute} ${titleFromHtml(html)}`;
  if (!FIRE_INFORMATION_PATTERN.test(pageSignals)) return html;
  const disclaimer = `\n${CODE_DISCLAIMER}\n`;

  if (/data-code-disclaimer/i.test(html)) {
    return html.replace(
      /<aside\b(?=[^>]*data-code-disclaimer)[^>]*>[\s\S]*?<\/aside\s*>/i,
      CODE_DISCLAIMER
    );
  }

  if (/<\/main\s*>/i.test(html)) return html.replace(/<\/main\s*>/i, `${disclaimer}</main>`);
  return html.replace(/<\/body\s*>/i, `${disclaimer}</body>`);
}

function addNewYorkClusterLink(html, pageRoute) {
  if (pageRoute !== '/door-repair-nyc' || /data-new-york-cluster-link/i.test(html)) return html;
  const related = '\n<aside class="legacy-code-disclaimer" role="note" data-new-york-cluster-link>' +
    '<strong>Related market page:</strong> <a href="/new-york">New York commercial service availability</a> ' +
    'requires confirmation for the exact property and requested work.</aside>\n';
  return /<\/main\s*>/i.test(html) ? html.replace(/<\/main\s*>/i, `${related}</main>`) : html;
}

function safeSchema(html, pageRoute) {
  const pageUrl = `${origin}${pageRoute}`;
  const organizationId = `${origin}/#organization`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: business.publicName,
        url: `${origin}/`,
        telephone: business.phone.e164,
        areaServed: business.serviceAreas
          .filter((area) => area.verifiedFromBrief === true)
          .map((area) => area.name)
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: titleFromHtml(html),
        description: descriptionFromHtml(html) || undefined,
        inLanguage: business.language,
        publisher: { '@id': organizationId }
      }
    ]
  };

  const serialized = JSON.stringify(schema, null, 2)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
  return `<script id="dceld-safe-legacy-schema" type="application/ld+json">\n${serialized}\n</script>`;
}

function addSharedAssetsAndSchema(html, pageRoute) {
  html = html
    .replace(/\/assets\/legacy-safety\.css(?:\?[^"']*)?/gi, `/assets/legacy-safety.css?v=${assetVersion}`)
    .replace(/\/assets\/business-config\.js(?:\?[^"']*)?/gi, `/assets/business-config.js?v=${assetVersion}`)
    .replace(/\/assets\/site\.js(?:\?[^"']*)?/gi, `/assets/site.js?v=${assetVersion}`);

  const additions = [];

  if (!/href\s*=\s*["']\/assets\/legacy-safety\.css(?:\?[^"']*)?["']/i.test(html)) {
    additions.push(`<link rel="stylesheet" href="/assets/legacy-safety.css?v=${assetVersion}">`);
  }
  if (!/rel\s*=\s*["'][^"']*manifest/i.test(html)) additions.push('<link rel="manifest" href="/site.webmanifest">');
  if (business.siteVerification?.google && !/name\s*=\s*["']google-site-verification["']/i.test(html)) {
    additions.push(`<meta name="google-site-verification" content="${htmlEscapeAttribute(business.siteVerification.google)}">`);
  }
  additions.push(safeSchema(html, pageRoute));
  if (!/src\s*=\s*["']\/assets\/business-config\.js(?:\?[^"']*)?["']/i.test(html)) {
    additions.push(`<script src="/assets/business-config.js?v=${assetVersion}" defer></script>`);
  }
  if (!/src\s*=\s*["']\/assets\/site\.js(?:\?[^"']*)?["']/i.test(html)) {
    additions.push(`<script src="/assets/site.js?v=${assetVersion}" defer></script>`);
  }

  const block = `\n${additions.join('\n')}\n`;
  if (!/<\/head\s*>/i.test(html)) return `${block}${html}`;
  const normalized = html.replace(/\s*<\/head\s*>/i, '\n</head>');
  return normalized.replace(/<\/head\s*>/i, `${block}</head>`);
}

function sanitizeLegacyPage(html, file, pageRoute) {
  let output = removeLegacyScriptsAndSchema(html);
  output = removeUnverifiedSocialProfiles(output);
  output = rewriteInternalLinks(output, pageRoute);
  output = removeNewYorkPromotion(output, pageRoute);
  output = sanitizeMetadata(output, pageRoute);
  output = applyMarketIndexingGate(output, pageRoute);
  output = ensureSocialMetadata(output, pageRoute);
  output = neutralizeVisibleClaims(output, pageRoute);
  output = neutralizeFireAndCodeClaims(output, pageRoute);
  output = accessibleLegacyControls(output);
  output = enrichImages(output, file);
  output = configureLegacyBody(output, pageRoute);
  output = addQualificationNotice(output, pageRoute);
  output = ensureMainLandmark(output);
  output = addComplianceDisclaimer(output, file, pageRoute);
  output = addNewYorkClusterLink(output, pageRoute);
  output = addTransactionalStickyCall(output, pageRoute);
  output = addSharedAssetsAndSchema(output, pageRoute);
  return output;
}

const redirectSources = new Set(Object.keys(redirects).map(redirectKey));
const files = listHtmlFiles(ROOT_DIR);
const results = {
  scanned: files.length,
  changed: 0,
  unchanged: 0,
  skippedGenerated: 0,
  skippedRedirectSources: 0
};

for (const file of files) {
  const pageRoute = routeForHtmlFile(file);
  const html = fs.readFileSync(file, 'utf8');

  if (redirectSources.has(redirectKey(pageRoute))) {
    results.skippedRedirectSources += 1;
    continue;
  }
  if (hasNewComponentSystem(html)) {
    results.skippedGenerated += 1;
    continue;
  }

  const output = sanitizeLegacyPage(html, file, pageRoute).replace(/[ \t]+$/gm, '');
  if (output === html) {
    results.unchanged += 1;
    continue;
  }

  results.changed += 1;
  if (!DRY_RUN) fs.writeFileSync(file, output);
}

const mode = DRY_RUN ? 'would update' : 'updated';
console.log(
  `Legacy sanitizer scanned ${results.scanned} HTML files; ${mode} ${results.changed}, ` +
    `left ${results.unchanged} unchanged, skipped ${results.skippedGenerated} generated pages and ` +
    `${results.skippedRedirectSources} redirect sources.`
);
