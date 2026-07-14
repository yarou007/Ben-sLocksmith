import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'docs');
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
  return relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/i, '')}`;
}

function clean(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html, expression) {
  return clean(html.match(expression)?.[1] || '');
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || '';
}

function meta(html, name, property = false) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const key = property ? 'property' : 'name';
  const tag = tags.find((candidate) => attr(candidate, key).toLowerCase() === name.toLowerCase());
  return tag ? attr(tag, 'content') : '';
}

function canonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => attr(candidate, 'rel').toLowerCase().split(/\s+/).includes('canonical'));
  return tag ? attr(tag, 'href') : '';
}

function internalTarget(href, route) {
  if (!href || href.startsWith('#') || /^(?:tel:|mailto:|javascript:|data:)/i.test(href)) return null;
  try {
    const url = new URL(href, `${origin}${route}`);
    if (!['dcemergencylockanddoor.com', 'www.dcemergencylockanddoor.com'].includes(url.hostname)) return null;
    let target = url.pathname.replace(/\.html$/i, '').replace(/\/$/, '') || '/';
    if (target === '/index') target = '/';
    return target;
  } catch {
    return null;
  }
}

const pages = walk(root)
  .filter((file) => file.endsWith('.html'))
  .sort()
  .map((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const route = routeFor(file);
    const links = (html.match(/<a\b[^>]*>/gi) || []).map((tag) => ({ href: attr(tag, 'href'), target: internalTarget(attr(tag, 'href'), route) }));
    return {
      route,
      file: path.relative(root, file).split(path.sep).join('/'),
      title: extract(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
      description: meta(html, 'description'),
      h1: extract(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i),
      robots: meta(html, 'robots'),
      canonical: canonical(html),
      links,
      forms: (html.match(/<form\b[^>]*>/gi) || []).length,
      images: (html.match(/<img\b[^>]*>/gi) || []).length,
      html
    };
  });

const routes = new Set(pages.map((page) => page.route));
const inbound = Object.fromEntries(pages.map((page) => [page.route, 0]));
for (const page of pages) {
  for (const link of page.links) {
    if (link.target && routes.has(link.target)) inbound[link.target] += 1;
  }
}

const redirectTargets = {
  '/access-control-systems': '/access-control-systems-washington-dc',
  '/annual-fire-door-inspection-washington-dc': '/fire-door-inspection-washington-dc',
  '/bethesda-md-commercial-locksmith': '/commercial-locksmith-bethesda-md',
  '/business-security-solutions': '/access-control-systems-washington-dc',
  '/city-maryland': '/maryland',
  '/city-new-york': '/new-york',
  '/city-northern-virginia': '/northern-virginia',
  '/city-washington-dc': '/washington-dc',
  '/commercial-locksmith-services': '/commercial-locksmith-washington-dc',
  '/door-repair-washington-dc': '/commercial-door-repair-washington-dc',
  '/emergency-commercial-locksmith': '/commercial-locksmith-washington-dc',
  '/emergency-commercial-locksmith-alexandria-va': '/commercial-locksmith-alexandria-va',
  '/emergency-commercial-locksmith-arlington-va': '/commercial-locksmith-arlington-va',
  '/emergency-commercial-locksmith-bethesda-md': '/commercial-locksmith-bethesda-md',
  '/emergency-commercial-locksmith-silver-spring-md': '/commercial-locksmith-silver-spring-md',
  '/emergency-commercial-locksmith-washington-dc': '/commercial-locksmith-washington-dc',
  '/fire-door-compliance-washington-dc': '/fire-door-inspection-washington-dc',
  '/fire-door-deficiency-repair': '/fire-door-repair-washington-dc',
  '/locksmith-alexandria-va': '/commercial-locksmith-alexandria-va',
  '/locksmith-arlington-va': '/commercial-locksmith-arlington-va',
  '/locksmith-virginia': '/northern-virginia',
  '/locksmith-washington-dc': '/commercial-locksmith-washington-dc',
  '/nfpa-80-fire-door-inspection': '/fire-door-inspection-washington-dc',
  '/service-access-control': '/access-control-systems-washington-dc',
  '/service-business-lock-change': '/commercial-rekey-washington-dc',
  '/service-commercial-door-closer-installation': '/door-closer-repair-washington-dc',
  '/service-commercial-rekey': '/commercial-rekey-washington-dc',
  '/service-door-closer-adjustment': '/door-closer-repair-washington-dc',
  '/service-door-closers': '/door-closer-repair-washington-dc',
  '/service-door-hardware': '/commercial-door-lock-repair-washington-dc',
  '/service-door-installation': '/commercial-door-installation-washington-dc',
  '/service-exit-device-installation': '/panic-bar-installation-washington-dc',
  '/service-exit-devices': '/exit-device-repair-washington-dc',
  '/service-fire-door-compliance': '/fire-door-inspection-washington-dc',
  '/service-fire-doors': '/fire-door-inspection-washington-dc',
  '/service-locksmith': '/commercial-locksmith-washington-dc',
  '/service-panic-bar-installation': '/panic-bar-installation-washington-dc',
  '/service-panic-bars': '/panic-bar-repair-washington-dc',
  '/service-tenant-lock-change': '/commercial-rekey-washington-dc',
  '/silver-spring-md-commercial-locksmith': '/commercial-locksmith-silver-spring-md'
};

const coreKeywords = {
  '/': 'commercial door repair and locksmith Washington DC',
  '/access-control-systems-washington-dc': 'commercial access control systems Washington DC',
  '/commercial-door-installation-washington-dc': 'commercial door installation Washington DC',
  '/commercial-door-lock-repair-washington-dc': 'commercial door lock repair Washington DC',
  '/commercial-door-repair-washington-dc': 'emergency commercial door repair Washington DC',
  '/commercial-locksmith-washington-dc': 'commercial locksmith Washington DC',
  '/commercial-rekey-washington-dc': 'commercial rekey Washington DC',
  '/door-closer-repair-washington-dc': 'commercial door closer repair Washington DC',
  '/exit-device-repair-washington-dc': 'exit device repair Washington DC',
  '/fire-door-inspection-washington-dc': 'fire door inspection Washington DC',
  '/fire-door-repair-washington-dc': 'fire door repair Washington DC',
  '/panic-bar-repair-washington-dc': 'panic bar repair Washington DC',
  '/service-office-lockout': 'office lockout service Washington DC',
  '/service-property-manager-locksmith': 'property manager locksmith Washington DC',
  '/service-restricted-key-systems': 'restricted key systems Washington DC',
  '/storefront-door-repair-washington-dc': 'storefront door repair Washington DC'
};

const rewriteRoutes = new Set([
  '/',
  '/about',
  '/access-control-systems-washington-dc',
  '/blog',
  '/commercial-door-installation-washington-dc',
  '/commercial-door-lock-repair-washington-dc',
  '/commercial-door-repair-washington-dc',
  '/commercial-locksmith-washington-dc',
  '/commercial-rekey-washington-dc',
  '/door-closer-repair-washington-dc',
  '/exit-device-repair-washington-dc',
  '/fire-door-inspection-washington-dc',
  '/fire-door-repair-washington-dc',
  '/gallery',
  '/panic-bar-repair-washington-dc',
  '/privacy-policy',
  '/service-office-lockout',
  '/service-property-manager-locksmith',
  '/service-restricted-key-systems',
  '/storefront-door-repair-washington-dc',
  '/terms-of-service'
]);

function intendedKeyword(page) {
  if (coreKeywords[page.route]) return coreKeywords[page.route];
  if (page.route.startsWith('/blog')) return page.h1.toLowerCase();
  if (['/maryland', '/northern-virginia', '/new-york', '/washington-dc', '/dmv-commercial-locksmith'].includes(page.route)) {
    return page.h1.toLowerCase();
  }
  return page.h1.toLowerCase().replace(/[&+]/g, 'and');
}

function intentFor(route) {
  if (route === '/privacy-policy' || route === '/terms-of-service') return 'Legal / policy';
  if (route === '/sitemap') return 'Navigation';
  if (route === '/about') return 'Trust / company';
  if (route === '/gallery') return 'Proof / consideration';
  if (route === '/blog') return 'Informational hub';
  if (route.startsWith('/blog')) return 'Informational';
  if (route.includes('inspection') || route.includes('installation') || route.includes('access-control')) return 'Scheduled commercial service';
  if (route.includes('maryland') || route.includes('virginia') || route.includes('alexandria') || route.includes('arlington') || route.includes('bethesda') || route.includes('silver-spring') || route === '/washington-dc' || route === '/new-york') return 'Local transactional';
  return 'Commercial transactional';
}

function actionFor(page) {
  if (redirectTargets[page.route]) return 'redirect';
  if (page.route === '/sitemap') return 'noindex';
  if (rewriteRoutes.has(page.route)) return 'rewrite';
  if (/licensed|same-day/i.test(page.title) || /licensed|insured|45-minute|4\.9-star|customer reviews/i.test(page.html)) return 'rewrite';
  return 'keep';
}

function ctaFor(route, action) {
  if (action === 'redirect') return `Use target page CTA`;
  if (route.startsWith('/blog')) return 'Related commercial service';
  if (route === '/privacy-policy' || route === '/terms-of-service' || route === '/sitemap') return 'Commercial service navigation';
  if (route === '/gallery' || route === '/about') return 'Call or request service';
  if (route.includes('inspection') || route.includes('installation') || route.includes('access-control') || route.includes('master-key') || route.includes('restricted-key')) return 'Request scheduled service';
  return 'Call commercial dispatch';
}

function notesFor(page, action) {
  if (action === 'redirect') return `Merge any useful unique copy and links first; then single-hop 301 and remove from sitemap.`;
  if (page.route === '/sitemap') return 'Keep for users, exclude from XML sitemap, and add noindex,follow.';
  if (page.route === '/new-york' || page.route.includes('nyc')) return 'Retain as a separate market page; remove it from DC trust bars, primary DC navigation, and paid-search layouts.';
  if (page.route.startsWith('/blog')) return 'Keep one informational purpose, remove unsupported promotional boilerplate, and link to one primary transactional page.';
  if (page.route === '/gallery') return 'Publish only verified job photos/captions; do not infer exact locations, clients, or outcomes.';
  return 'Remove unsupported claims; use centralized business data, self-canonical, an appropriate form/phone CTA, and positive commercial-service context.';
}

function escapeCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

const tableRows = pages.map((page) => {
  const action = actionFor(page);
  const target = redirectTargets[page.route] || (action === 'noindex' ? page.route : page.route);
  return `| ${[
    page.route,
    page.title,
    page.h1,
    intendedKeyword(page),
    intentFor(page.route),
    action === 'redirect' ? `Merge into ${target}` : action === 'noindex' ? 'Retain for users; exclude from index' : action === 'rewrite' ? 'Differentiate and improve' : 'Retain and maintain',
    action,
    target,
    ctaFor(page.route, action),
    notesFor(page, action)
  ].map(escapeCell).join(' | ')} |`;
});

const indexableCount = pages.filter((page) => !page.robots.toLowerCase().includes('noindex')).length;
const formPageCount = pages.filter((page) => page.forms > 0).length;
const totalImages = pages.reduce((sum, page) => sum + page.images, 0);
const duplicateTitles = new Map();
for (const page of pages) duplicateTitles.set(page.title, [...(duplicateTitles.get(page.title) || []), page.route]);
const duplicateTitleGroups = [...duplicateTitles.values()].filter((group) => group.length > 1).length;

const audit = `# SEO and CRO audit

Audit date: 2026-07-14  
Scope: the complete repository as found before consolidation work  
Production origin: ${origin}

## Executive findings

- The site is a static HTML/CSS/JavaScript deployment on Vercel. There is no application framework, package manifest, build pipeline, test runner, linter, or type checker in the audited state. Vercel provides clean URLs with \`trailingSlash: false\`, so the existing convention is HTTPS, apex hostname, lowercase extensionless paths, and no trailing slash except \`/\`.
- The repository contains ${pages.length} HTML documents; ${indexableCount} are currently indexable. Four legacy \`/city-*\` documents are \`noindex,follow\` and canonicalized/redirected to clean location pages.
- Titles, descriptions, canonicals, robots tags, Open Graph basics, Twitter card tags, H1s, and parseable JSON-LD exist on almost every page. However, four title/description pairs are duplicated on legacy city files, and much of the copy/schema repeats a small number of generated templates.
- Search intent is heavily fragmented. The largest conflicts are the homepage/DC hub/five commercial-locksmith URLs; three panic-bar URLs; three exit-device URLs; four closer URLs; four access-control/security URLs; and six fire-door inspection/compliance URLs.
- The single configured phone is \`+1-703-244-0559\`, and every audited \`tel:\` link uses that number. It is therefore the verified codebase phone source for implementation, pending owner confirmation.
- ${formPageCount} documents contain forms posting directly to FormSubmit at \`dclockanddoor@gmail.com\`. The shared JavaScript currently removes many request-form sections at runtime, rewrites quote links into phone links, and does not bind the defined form-enhancement/submission functions. This breaks the intended scheduled-service funnel and makes success/error measurement unreliable.
- GTM, GA4, and Meta Pixel values are placeholders. The site does load Ahrefs analytics from the homepage. The shared script can push events to \`dataLayer\`, but event names/parameters do not match the requested measurement plan and click listeners can produce ambiguous duplicate-style signals.
- Existing HTML and JSON-LD contain unverified claims such as licensing, insurance, response time, ratings/testimonials, stocked brands, same-day availability, certifications, guaranteed compliance, reports, and 24/7 hours. These must be disabled until confirmed rather than migrated into the new component system.
- Current LocalBusiness schema contains a fabricated-looking street address (\`Mobile Commercial Service\`) and, in places, a postal code, price range, hours, and capabilities not backed by a verified configuration. Organization/service-area schema should omit those fields until verified.
- ${totalImages} image instances reuse 19 JPEG assets plus one PNG favicon. Alt attributes are present, but source HTML generally omits explicit width/height and responsive \`srcset\`; hero images lack an explicit LCP preload/fetch priority in source. Runtime attribute injection is too late to fully prevent CLS.
- The shared UI depends on render-blocking Google Fonts and Font Awesome CSS, while the script attempts to rewrite Font Awesome loading after DOM ready. Inline styles/scripts and repeated page-specific CSS increase maintenance cost. No web app manifest or custom 404 document exists.
- Accessibility concerns include hamburger controls without complete accessible state, inconsistent focus-visible styles, runtime-injected landmark/CTA content, possible color-contrast failures in muted text, form status messages without a robust live region, and a sticky bar whose collision behavior with other overlays is not coordinated.
- Internal linking is dense but unfocused: high-value legacy service URLs receive many template links, redirected city files are orphaned as expected, and \`/storefront-door-repair-washington-dc\` is a genuine orphan. Many anchors point to pages proposed for consolidation.

## Repository and delivery architecture

| Concern | Audited implementation | Risk / recommendation |
|---|---|---|
| Framework / rendering | Hand-authored and generated static HTML | Keep static delivery; add a small deterministic build/QA script rather than rewriting frameworks. |
| Routing | One \`.html\` file per route; Vercel \`cleanUrls\` | Preserve extensionless, lowercase, no-trailing-slash convention. |
| Deployment | \`vercel.json\` with security/cache headers and redirects | Add final single-hop consolidation redirects and a real 404; test host + \`.html\` combinations for chains. |
| Sitemap / robots | Static \`sitemap.xml\`, permissive \`robots.txt\` | Regenerate only final 200/indexable canonical URLs; update truthful last-modified values. |
| Structured data | Repeated LocalBusiness, Service, FAQ, Breadcrumb JSON-LD | Centralize verified data; remove fake address/ratings/hours/claims; keep FAQ schema only with matching visible FAQs. |
| Analytics | Placeholder GTM/GA4/Meta config plus Ahrefs on homepage | Use one dataLayer helper and documented events; do not treat clicks as booked work. |
| Forms | Direct FormSubmit actions in source; runtime form removal | Restore short emergency and scheduled forms, add attribution/honeypot, and require form-recipient verification. |
| Mobile CTA | Shared script injects a fixed phone pill on every page | Limit to high-intent pages, reserve bottom spacing, respect safe areas, and emit \`sticky_phone_click\`. |
| Images | 19 JPEG photos reused across ${totalImages} placements | Add intrinsic dimensions, source-level eager LCP image, lazy below-fold images, captions, and verification metadata. |

## Overlapping intent clusters

| Cluster | Competing current routes | Primary outcome |
|---|---|---|
| DC commercial locksmith | \`/\`, \`/commercial-locksmith-washington-dc\`, \`/locksmith-washington-dc\`, \`/emergency-commercial-locksmith-washington-dc\`, \`/emergency-commercial-locksmith\`, \`/commercial-locksmith-services\`, \`/service-locksmith\`, \`/washington-dc\` | Homepage owns broad commercial door + locksmith proposition; commercial locksmith page owns lock/rekey/lockout intent; DC page is a location hub. Consolidate the remaining duplicates. |
| Emergency commercial door repair | \`/commercial-door-repair-washington-dc\`, \`/door-repair-washington-dc\`, storefront and emergency-locksmith pages | Retain and rebuild \`/commercial-door-repair-washington-dc\` to preserve the existing URL/inlinks while targeting emergency commercial door repair; do not create a competing new slug. |
| Panic / exit hardware | \`/panic-bar-repair-washington-dc\`, \`/service-panic-bars\`, \`/service-panic-bar-installation\`, \`/exit-device-repair-washington-dc\`, \`/service-exit-devices\`, \`/service-exit-device-installation\` | Separate repair, installation, and exit-device repair by buyer problem; consolidate generic service URLs. |
| Door closers | \`/door-closer-repair-washington-dc\`, \`/service-door-closers\`, adjustment and installation pages | One closer page covers diagnosis, adjustment, repair, and replacement decisions. |
| Fire doors | Inspection, annual inspection, NFPA 80 service, compliance, deficiency, repair, and articles | One scheduled inspection page, one repair/correction page, and clearly informational articles. |
| Access control | Two access-control pages, service-access-control, business-security-solutions | Retain the descriptive existing DC URL and merge generic variants. |

## URL-by-URL decision table

The table is the prerequisite decision map. Redirects are not safe until useful unique content and internal links are migrated to the listed target.

| URL | Current title | Current H1 | Intended primary keyword | Intended search intent | Recommended action | Keep, rewrite, merge, redirect, canonicalize, noindex, or delete | Canonical target | Main CTA | Notes |
|---|---|---|---|---|---|---|---|---|---|
${tableRows.join('\n')}
`;

const keywordMap = `# Keyword-to-URL map

Decision date: 2026-07-14  
URL standard: \`https://dcemergencylockanddoor.com\` + lowercase extensionless path, no trailing slash except root.

## Primary transactional ownership

| Keyword / intent family | Primary canonical URL | Page role | Primary conversion |
|---|---|---|---|
| commercial door repair and locksmith Washington DC | \`/\` | Brand/service overview; routes urgent problems to specialists | Hero phone call |
| commercial locksmith DC; business locksmith DC | \`/commercial-locksmith-washington-dc\` | Lockouts, mortise/cylinders, rekeys, key control, master-key planning | Phone + emergency form |
| emergency door repair; emergency commercial door repair DC; commercial door repair DC | \`/commercial-door-repair-washington-dc\` | Urgent door, frame, latch, hinge, closer, exit hardware and break-in failures | Emergency phone + short form |
| panic bar repair; push bar repair; crash bar repair DC | \`/panic-bar-repair-washington-dc\` | Diagnose and repair an existing device | Phone + emergency form |
| panic bar installation; exit device installation DC | \`/panic-bar-installation-washington-dc\` | New, replacement and retrofit installation assessment | Scheduled quote form |
| door closer service; door closer repair DC | \`/door-closer-repair-washington-dc\` | Leaking, slamming, slow, open, and non-latching closer diagnosis | Phone + emergency form |
| exit device repair Washington DC | \`/exit-device-repair-washington-dc\` | Rim, mortise and vertical-rod exit-device diagnosis/repair | Phone + emergency form |
| commercial door lock repair DC | \`/commercial-door-lock-repair-washington-dc\` | Lock body, cylinder, latch, strike and mortise failures | Phone + emergency form |
| commercial rekey Washington DC | \`/commercial-rekey-washington-dc\` | Employee turnover, tenant change, key-control reset | Phone + scheduled form |
| fire door inspection Washington DC; NFPA 80 inspection service | \`/fire-door-inspection-washington-dc\` | Scheduled inspection workflow and quote preparation | Scheduled service form |
| fire door repair / deficiency correction DC | \`/fire-door-repair-washington-dc\` | Repair/correction after failure or inspection | Phone + scheduled form |
| commercial door installation Washington DC | \`/commercial-door-installation-washington-dc\` | Measurement, door/frame/hardware coordination and project workflow | Scheduled estimate form |
| commercial access control Washington DC | \`/access-control-systems-washington-dc\` | Door-side access-control assessment and coordination | Scheduled estimate form |
| office lockout Washington DC | \`/service-office-lockout\` | Qualified office/business lockout only | Phone call |
| storefront door repair Washington DC | \`/storefront-door-repair-washington-dc\` | Aluminum/storefront door and hardware problems; no glass-service claims without verification | Phone + short form |
| master key systems Washington DC | \`/master-key-systems\` | Key hierarchy and planned system work | Scheduled form |
| restricted key systems Washington DC | \`/service-restricted-key-systems\` | Key-control consultation | Scheduled form |
| property manager locksmith Washington DC | \`/service-property-manager-locksmith\` | Work-order and portfolio needs, gated by verified capabilities | Scheduled form |

## Location ownership

| Geography | Primary hub | Supporting transactional pages |
|---|---|---|
| Washington DC | \`/washington-dc\` | The DC service pages above; hub does not compete for a single service keyword. |
| Northern Virginia | \`/northern-virginia\` | Alexandria and Arlington service pages retained only where copy is genuinely localized and differentiated. |
| Maryland | \`/maryland\` | Bethesda and Silver Spring service pages retained only where copy is genuinely localized and differentiated. |
| New York | \`/new-york\` | Kept separate from DC navigation/trust/paid-search experiences; not part of the DC priority architecture. |
| Broad DMV | \`/dmv-commercial-locksmith\` | Regional overview only; links down to DC, NoVA, and Maryland hubs. |

## Consolidation map

| Source URL(s) | Final target | Rationale |
|---|---|---|
${Object.entries(redirectTargets).map(([source, target]) => `| \`${source}\` | \`${target}\` | Merge useful unique material, update internal links, then use one permanent hop. |`).join('\n')}

## Content safeguards

- Informational articles keep a question/education intent and link to one transactional owner; they must not reuse the service-page title/H1 pattern.
- Local pages need useful service-area context, not swapped city tokens. Pages that cannot be differentiated after human review should be merged into the applicable location hub.
- UTM, gclid, gbraid, wbraid, and paid-layout parameters never create a new canonical URL. Canonicals remain the parameter-free service URL.
- The proposed \`/emergency-commercial-door-repair-washington-dc\` slug is intentionally not created: the existing \`/commercial-door-repair-washington-dc\` has established internal links and can own the stronger emergency-door-repair intent without an equity-moving redirect.
- The proposed access-control-commercial-doors slug is intentionally not created: \`/access-control-systems-washington-dc\` is already descriptive and indexable.
`;

const primaryTargets = [
  '/',
  '/commercial-locksmith-washington-dc',
  '/commercial-door-repair-washington-dc',
  '/panic-bar-repair-washington-dc',
  '/panic-bar-installation-washington-dc',
  '/door-closer-repair-washington-dc',
  '/exit-device-repair-washington-dc',
  '/commercial-door-lock-repair-washington-dc',
  '/commercial-rekey-washington-dc',
  '/fire-door-inspection-washington-dc',
  '/fire-door-repair-washington-dc',
  '/commercial-door-installation-washington-dc',
  '/access-control-systems-washington-dc'
];

const internalLinkMap = `# Internal-link map

Audit date: 2026-07-14

## Findings

- Current templates create very high link counts to generic legacy service URLs, which diffuses relevance and leaves users choosing among near-duplicates.
- \`/storefront-door-repair-washington-dc\` has no inbound HTML link and is the only genuine indexable orphan found in the repository snapshot.
- The four \`/city-*\` routes are intentionally orphaned legacy redirect/noindex documents.
- Internal links use a mix of root-relative and document-relative forms. The final implementation should use root-relative, extensionless canonical paths.
- The homepage must link directly to each primary service owner; articles should use descriptive, problem-specific anchors and no redirected targets.

## Homepage destination set

| Destination | Recommended anchor / problem cue | CTA event service value |
|---|---|---|
| \`/commercial-door-repair-washington-dc\` | emergency commercial door repair; door will not close/latch; break-in damage | \`commercial_door_repair\` |
| \`/commercial-locksmith-washington-dc\` | commercial locksmith; business lockout; key-control help | \`commercial_locksmith\` |
| \`/panic-bar-repair-washington-dc\` | panic bar is stuck; panic bar repair | \`panic_bar_repair\` |
| \`/panic-bar-installation-washington-dc\` | new panic bar or exit-device installation | \`panic_bar_installation\` |
| \`/door-closer-repair-washington-dc\` | leaking or slamming door closer | \`door_closer_repair\` |
| \`/exit-device-repair-washington-dc\` | exit device failed | \`exit_device_repair\` |
| \`/commercial-door-lock-repair-washington-dc\` | commercial lock is jammed | \`commercial_door_lock_repair\` |
| \`/commercial-rekey-washington-dc\` | rekey a business after key/employee change | \`commercial_rekey\` |
| \`/fire-door-inspection-washington-dc\` | fire door inspection and report request | \`fire_door_inspection\` |
| \`/fire-door-repair-washington-dc\` | fire door deficiency correction | \`fire_door_repair\` |
| \`/commercial-door-installation-washington-dc\` | new commercial door and frame | \`commercial_door_installation\` |
| \`/access-control-systems-washington-dc\` | access control for commercial doors | \`access_control\` |
| \`/service-office-lockout\` | office/business lockout | \`office_lockout\` |
| \`/storefront-door-repair-washington-dc\` | storefront door cannot close or secure | \`storefront_door_repair\` |

## Cross-link rules by page family

| Source family | Required contextual destinations | Rule |
|---|---|---|
| Emergency door repair | Panic bar repair, closer repair, exit-device repair, commercial lock repair, commercial locksmith, fire-door repair | Link from the matching symptom, not a generic service list. |
| Panic bar repair | Panic bar installation, exit-device repair, closer repair, fire-door inspection | Explain repair vs replacement/inspection context. |
| Door closer repair | Emergency door repair, fire-door inspection, commercial door installation | Link latching/fire-rated/replacement scenarios. |
| Commercial locksmith | Commercial rekey, lock repair, master keys, restricted keys, office lockout | Keep door/egress repair outside the locksmith-intent core. |
| Fire-door inspection | Fire-door repair, closer repair, exit-device repair, panic-bar repair | Scheduled CTA remains primary; correction links are secondary. |
| Installation / access control | Door installation, access control, panic installation, locksmith | Use quote/project language rather than emergency-only copy. |
| Informational articles | Exactly one primary transactional page plus one relevant geography/hub when useful | Avoid boilerplate links to every service/city. |
| DC location hub | All primary DC transactional pages | Short descriptive service summaries; no duplicate service-page copy. |
| NoVA / Maryland hubs | Their genuinely localized pages plus main DC specialty pages where service is available | Maintain geographic hierarchy and avoid doorway-page grids. |

## Planned primary-page inbound baseline

| Target | Current internal link instances | Post-consolidation requirement |
|---|---:|---|
${primaryTargets.map((target) => `| \`${target}\` | ${inbound[target] || 0} | Direct homepage link, relevant hub link, related-service links, and no links to its redirect aliases. |`).join('\n')}

## Breadcrumb pattern

- Service: Home → Commercial services → Current service.
- Location service: Home → Service areas → Location → Current service.
- Article: Home → Commercial door resources → Current article.
- BreadcrumbList JSON-LD must match visible breadcrumb text and absolute canonical URLs.

## Validation criteria

- No indexable page is orphaned.
- No internal anchor points to a redirect source or an \`.html\` URL.
- Every final canonical route is linked from at least one crawlable hub.
- Anchors describe the destination problem/service; repeated “learn more” anchors are removed.
- DC pages and paid-search layouts do not promote New York in primary navigation, trust bars, or related-location modules.
`;

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, 'seo-cro-audit.md'), audit);
fs.writeFileSync(path.join(docsDir, 'keyword-url-map.md'), keywordMap);
fs.writeFileSync(path.join(docsDir, 'internal-link-map.md'), internalLinkMap);

console.log(`Wrote planning documents for ${pages.length} HTML routes.`);
