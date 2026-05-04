import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DOMAIN = 'https://dcemergencylockanddoor.com';
const PHONE = '+1-703-244-0559';
const SOCIAL_LINKS = {
  x: 'https://x.com/dcemergencylock',
  linkedin: 'https://www.linkedin.com/company/dc-emergency-lock-and-door',
  youtube: 'https://www.youtube.com/@dcemergencylockanddoor',
  facebook: 'https://www.facebook.com/profile.php?id=61574339060945'
};

const keyMeta = {
  'index.html': {
    title: 'Commercial Locksmith DC | 24/7 Door & Exit Experts',
    description:
      'Commercial Locksmith DC for panic bars, fire doors, rekeys, and emergency door repair. Call now or get a free estimate from licensed technicians.'
  },
  'commercial-locksmith-services.html': {
    title: 'Commercial Locksmith Services DC | 24/7 Emergency Help',
    description:
      'Commercial Locksmith DC services for lockouts, lock changes, master key systems, and security upgrades. Call now for a free estimate and rapid dispatch.'
  },
  'service-locksmith.html': {
    title: 'Commercial Locksmith DC | Business Lock & Door Service',
    description:
      'Commercial Locksmith DC for office lockouts, rekeys, master keys, and door hardware repair. Get a free estimate and same-day licensed service.'
  },
  'service-panic-bars.html': {
    title: 'Panic Bar Repair DC | Commercial Locksmith 24/7',
    description:
      'Commercial Locksmith DC panic bar repair for failed exit devices, code issues, and emergency door exits. Get a free estimate and same-day service.'
  },
  'service-door-closers.html': {
    title: 'Door Closer Repair DC | Commercial Locksmith 24/7',
    description:
      'Commercial Locksmith DC door closer repair for slamming, leaking, or non-latching doors. Call for a free estimate and fast code-compliant fixes.'
  },
  'service-exit-devices.html': {
    title: 'Exit Device Repair DC | Commercial Locksmith 24/7',
    description:
      'Commercial Locksmith DC exit device repair for rim, mortise, and concealed rod hardware. Get a free estimate and emergency same-day support.'
  },
  'service-door-installation.html': {
    title: 'Commercial Door Installation DC | Locksmith Experts',
    description:
      'Commercial Locksmith DC installation for steel doors, frames, and fire-rated openings. Request a free estimate and schedule licensed installation.'
  },
  'service-door-hardware.html': {
    title: 'Door Hardware Repair DC | Commercial Locksmith 24/7',
    description:
      'Commercial Locksmith DC door hardware repair for locks, hinges, strikes, thresholds, and latches. Call now or get a free estimate today.'
  },
  'service-access-control.html': {
    title: 'Access Control Installation DC | Commercial Locksmith',
    description:
      'Commercial Locksmith DC access control installation for keypads, card readers, and electric strikes. Get a free estimate and secure your property fast.'
  },
  'service-fire-doors.html': {
    title: 'Fire Door Inspection DC | Commercial Locksmith 24/7',
    description:
      'Commercial Locksmith DC fire door inspection and deficiency repair for NFPA 80 compliance. Request a free estimate and same-day emergency help.'
  },
  'city-washington-dc.html': {
    title: 'Commercial Locksmith Washington DC | 24/7 Door Repair',
    description:
      'Commercial Locksmith Washington DC for panic bars, lockouts, closers, and fire door compliance. Call now or get a free estimate from local experts.'
  },
  'city-northern-virginia.html': {
    title: 'Commercial Locksmith Northern Virginia | 24/7 Service',
    description:
      'Commercial Locksmith Northern Virginia for business lockouts, rekeys, panic bars, and door repairs. Get a free estimate and rapid local response.'
  },
  'city-maryland.html': {
    title: 'Commercial Locksmith Maryland | 24/7 Door & Lock Service',
    description:
      'Commercial Locksmith Maryland for business lockouts, panic bars, fire doors, and commercial hardware repairs. Call now for a free estimate.'
  },
  'city-new-york.html': {
    title: 'Commercial Locksmith NYC | 24/7 Business Door Repair',
    description:
      'Commercial Locksmith NYC for office lockouts, panic bars, fire door repairs, and exit hardware service. Request a free estimate and emergency dispatch.'
  },
  'locksmith-washington-dc.html': {
    title: 'Emergency Commercial Locksmith DC | Same-Day Service',
    description:
      'Emergency Commercial Locksmith DC for business lockouts, broken locks, and door hardware failures. Call now for a free estimate and rapid dispatch.'
  },
  'locksmith-virginia.html': {
    title: 'Emergency Commercial Locksmith VA | 24/7 Door Service',
    description:
      'Emergency Commercial Locksmith Virginia for lockouts, rekeys, panic bars, and commercial door repairs. Get a free estimate and fast local support.'
  },
  'locksmith-arlington-va.html': {
    title: 'Emergency Commercial Locksmith Arlington VA | 24/7 Help',
    description:
      'Emergency Commercial Locksmith Arlington VA for lockouts, panic bars, and business door repairs. Call now or request a free estimate today.'
  },
  'locksmith-alexandria-va.html': {
    title: 'Emergency Commercial Locksmith Alexandria VA | 24/7',
    description:
      'Emergency Commercial Locksmith Alexandria VA for office lockouts, closer failures, and panic bar repairs. Get a free estimate and same-day service.'
  },
  'dmv-commercial-locksmith.html': {
    title: 'Commercial Locksmith DMV | DC, VA & MD 24/7 Service',
    description:
      'Commercial Locksmith DMV coverage across Washington DC, Northern Virginia, and Maryland. Call now for a free estimate and emergency business service.'
  },
  'emergency-commercial-locksmith.html': {
    title: 'Emergency Commercial Locksmith DC | 24/7 Fast Response',
    description:
      'Emergency Commercial Locksmith DC for urgent lockouts, damaged hardware, and secured entry repairs. Request a free estimate and immediate dispatch.'
  }
};

const serviceSchemaMap = {
  'service-locksmith.html': { name: 'Commercial Locksmith Service', serviceType: 'Commercial Locksmith' },
  'service-panic-bars.html': { name: 'Panic Bar Repair Service', serviceType: 'Panic Bar Repair' },
  'service-door-closers.html': { name: 'Door Closer Repair Service', serviceType: 'Door Closer Repair' },
  'service-exit-devices.html': { name: 'Exit Device Repair Service', serviceType: 'Exit Device Repair' },
  'service-door-installation.html': { name: 'Commercial Door Installation Service', serviceType: 'Commercial Door Installation' },
  'service-door-hardware.html': { name: 'Door Hardware Repair Service', serviceType: 'Commercial Door Hardware Repair' },
  'service-access-control.html': { name: 'Access Control Installation Service', serviceType: 'Access Control Systems' },
  'service-fire-doors.html': { name: 'Fire Door Inspection Service', serviceType: 'Fire Door Inspection and Compliance' },
  'commercial-locksmith-services.html': { name: 'Commercial Locksmith Services', serviceType: 'Commercial Locksmith' },
  'emergency-commercial-locksmith.html': { name: 'Emergency Commercial Locksmith Service', serviceType: 'Emergency Commercial Locksmith' },
  'master-key-systems.html': { name: 'Master Key Systems Service', serviceType: 'Master Key Systems' },
  'access-control-systems.html': { name: 'Access Control Systems Service', serviceType: 'Access Control Systems' },
  'business-security-solutions.html': { name: 'Business Security Solutions Service', serviceType: 'Business Security Solutions' },
  'fire-door-inspection-washington-dc.html': { name: 'Fire Door Inspection Washington DC', serviceType: 'Fire Door Inspection' },
  'fire-door-inspection-maryland.html': { name: 'Fire Door Inspection Maryland', serviceType: 'Fire Door Inspection' },
  'fire-door-inspection-northern-virginia.html': { name: 'Fire Door Inspection Northern Virginia', serviceType: 'Fire Door Inspection' },
  'annual-fire-door-inspection-washington-dc.html': { name: 'Annual Fire Door Inspection', serviceType: 'Annual Fire Door Inspection' },
  'fire-door-deficiency-repair.html': { name: 'Fire Door Deficiency Repair', serviceType: 'Fire Door Deficiency Repair' },
  'fire-door-repair-washington-dc.html': { name: 'Fire Door Repair Washington DC', serviceType: 'Fire Door Repair' },
  'door-repair-washington-dc.html': { name: 'Commercial Door Repair Washington DC', serviceType: 'Commercial Door Repair' },
  'door-repair-nyc.html': { name: 'Commercial Door Repair NYC', serviceType: 'Commercial Door Repair' },
  'locksmith-washington-dc.html': { name: 'Commercial Locksmith Washington DC', serviceType: 'Commercial Locksmith' },
  'locksmith-virginia.html': { name: 'Commercial Locksmith Virginia', serviceType: 'Commercial Locksmith' },
  'locksmith-arlington-va.html': { name: 'Commercial Locksmith Arlington VA', serviceType: 'Commercial Locksmith' },
  'locksmith-alexandria-va.html': { name: 'Commercial Locksmith Alexandria VA', serviceType: 'Commercial Locksmith' },
  'bethesda-md-commercial-locksmith.html': { name: 'Commercial Locksmith Bethesda MD', serviceType: 'Commercial Locksmith' },
  'silver-spring-md-commercial-locksmith.html': { name: 'Commercial Locksmith Silver Spring MD', serviceType: 'Commercial Locksmith' },
  'city-washington-dc.html': { name: 'Commercial Door & Locksmith Services in Washington DC', serviceType: 'Commercial Locksmith and Door Repair' },
  'city-northern-virginia.html': { name: 'Commercial Door & Locksmith Services in Northern Virginia', serviceType: 'Commercial Locksmith and Door Repair' },
  'city-maryland.html': { name: 'Commercial Door & Locksmith Services in Maryland', serviceType: 'Commercial Locksmith and Door Repair' },
  'city-new-york.html': { name: 'Commercial Door & Locksmith Services in NYC', serviceType: 'Commercial Locksmith and Door Repair' },
  'dmv-commercial-locksmith.html': { name: 'Commercial Locksmith DMV', serviceType: 'Commercial Locksmith' }
};

const htmlFiles = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...fs.readdirSync(path.join(ROOT, 'blog')).filter((f) => f.endsWith('.html')).map((f) => `blog/${f}`)
].sort();

const styleCache = new Map();

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function hash(input) {
  return crypto.createHash('md5').update(input).digest('hex').slice(0, 10);
}

function canonicalPath(file) {
  if (file === 'index.html') return '/';
  return `/${file.replace(/\.html$/, '').replace(/\\/g, '/')}`;
}

function assetsPrefix(file) {
  return file.startsWith('blog/') ? '../assets' : 'assets';
}

function buildLocalBusinessJson(file, description) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Locksmith', 'LocalBusiness'],
    name: 'DC Emergency Lock & Door',
    description:
      description ||
      'Commercial Locksmith DC serving Washington DC, Northern Virginia, Maryland, and New York with 24/7 emergency door and lock service.',
    telephone: PHONE,
    url: `${DOMAIN}${canonicalPath(file)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mobile Commercial Service',
      addressLocality: 'Washington',
      addressRegion: 'DC',
      postalCode: '20001',
      addressCountry: 'US'
    },
    areaServed: [
      { '@type': 'City', name: 'Washington' },
      { '@type': 'City', name: 'Alexandria' },
      { '@type': 'City', name: 'Arlington' },
      { '@type': 'City', name: 'Bethesda' },
      { '@type': 'City', name: 'Silver Spring' },
      { '@type': 'State', name: 'Maryland' },
      { '@type': 'State', name: 'Virginia' },
      { '@type': 'City', name: 'New York' }
    ],
    sameAs: [SOCIAL_LINKS.x, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.youtube, SOCIAL_LINKS.facebook]
  };
}

function buildServiceJson(file, description) {
  const service = serviceSchemaMap[file];
  if (!service) return null;
  const url = `${DOMAIN}${canonicalPath(file)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    serviceType: service.serviceType,
    description: description || `${service.name} in Washington DC, Northern Virginia, Maryland, and New York.`,
    areaServed: ['Washington DC', 'Northern Virginia', 'Maryland', 'New York City'],
    provider: {
      '@type': 'LocalBusiness',
      name: 'DC Emergency Lock & Door',
      telephone: PHONE,
      url: DOMAIN
    },
    url
  };
}

function upsertMeta(html, tagRegex, replacement) {
  if (tagRegex.test(html)) {
    return html.replace(tagRegex, replacement);
  }
  return html;
}

function setOrInsertMetaTag(html, name, content) {
  const regex = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'][^"']*["']\\s*\/?>`, 'i');
  const tag = `<meta name="${name}" content="${content}">`;

  if (regex.test(html)) {
    return html.replace(regex, tag);
  }

  return html.replace(/<title>[\s\S]*?<\/title>/i, (m) => `${m}\n${tag}`);
}

function setOrInsertPropertyMeta(html, prop, content) {
  const regex = new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["'][^"']*["']\\s*\/?>`, 'i');
  const tag = `<meta property="${prop}" content="${content}">`;

  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace(/<title>[\s\S]*?<\/title>/i, (m) => `${m}\n${tag}`);
}

function setOrInsertTwitterMeta(html, name, content) {
  const regex = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'][^"']*["']\\s*\/?>`, 'i');
  const tag = `<meta name="${name}" content="${content}">`;

  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace(/<title>[\s\S]*?<\/title>/i, (m) => `${m}\n${tag}`);
}

function ensureGtmHead(html) {
  if (html.includes('Google Tag Manager')) return html;

  const gtm = `\n<!-- Google Tag Manager -->\n<script>\n  window.dataLayer = window.dataLayer || [];\n  window.GTM_CONFIG = window.GTM_CONFIG || {\n    gtmId: 'GTM-XXXXXXX',\n    ga4Id: 'G-XXXXXXXXXX',\n    fbPixelId: '000000000000000'\n  };\n  (function(w,d,s,l,i){\n    if(!i || i==='GTM-XXXXXXX'){ return; }\n    w[l]=w[l]||[];\n    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});\n    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';\n    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;\n    f.parentNode.insertBefore(j,f);\n  })(window,document,'script','dataLayer',window.GTM_CONFIG.gtmId);\n</script>\n<!-- End Google Tag Manager -->\n`;

  return html.replace(/<head>/i, `<head>${gtm}`);
}

function ensureGtmNoscript(html) {
  if (html.includes('googletagmanager.com/ns.html')) return html;

  const noscript = `\n<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->\n`;

  return html.replace(/<body([^>]*)>/i, `<body$1>${noscript}`);
}

function externalizeStyle(file, html) {
  const styleRegex = /<style>([\s\S]*?)<\/style>/i;
  const match = html.match(styleRegex);
  if (!match) return html;

  const cssRaw = match[1].trim();
  const minified = minifyCss(cssRaw);
  const cssHash = hash(minified);
  const cssFilename = `style-${cssHash}.css`;
  const cssPath = path.join(ROOT, 'assets', 'page-styles', cssFilename);

  if (!styleCache.has(cssHash)) {
    fs.writeFileSync(cssPath, `${minified}\n`);
    styleCache.set(cssHash, cssFilename);
  }

  const href = `${assetsPrefix(file)}/page-styles/${cssFilename}`;
  return html.replace(styleRegex, `<link rel="stylesheet" href="${href}">`);
}

function removeLegacyPixel(html) {
  return html
    .replace(/\s*<!-- Facebook Pixel \(placeholder\) -->[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<!-- Facebook Pixel -->[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<!-- Facebook Pixel \(noscript\) -->\s*<noscript>[\s\S]*?<\/noscript>\s*/gi, '\n');
}

function ensureMetaAndSchema(file, html) {
  const pageMeta = keyMeta[file];

  if (pageMeta) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${pageMeta.title}</title>`);
    html = setOrInsertMetaTag(html, 'description', pageMeta.description);
    html = setOrInsertPropertyMeta(html, 'og:title', pageMeta.title);
    html = setOrInsertPropertyMeta(html, 'og:description', pageMeta.description);
    html = setOrInsertTwitterMeta(html, 'twitter:title', pageMeta.title);
    html = setOrInsertTwitterMeta(html, 'twitter:description', pageMeta.description);
  }

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1] : '';

  const localBusinessJson = JSON.stringify(buildLocalBusinessJson(file, description), null, 2);
  const localBusinessBlock = `<script id="dceld-localbusiness-schema" type="application/ld+json">\n${localBusinessJson}\n</script>`;

  html = html.replace(/\s*<script id="dceld-localbusiness-schema" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '\n');
  html = html.replace(/<\/head>/i, `\n${localBusinessBlock}\n</head>`);

  html = html.replace(/\s*<script id="dceld-service-schema" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '\n');
  const serviceJson = buildServiceJson(file, description);
  if (serviceJson) {
    const serviceBlock = `<script id="dceld-service-schema" type="application/ld+json">\n${JSON.stringify(serviceJson, null, 2)}\n</script>`;
    html = html.replace(/<\/head>/i, `\n${serviceBlock}\n</head>`);
  }

  return html;
}

function ensureSeoAssetsLinked(file, html) {
  const cssHref = `${assetsPrefix(file)}/seo-growth.css`;

  if (!html.includes('seo-growth.css')) {
    html = html.replace(/<\/head>/i, `\n<link rel="stylesheet" href="${cssHref}">\n</head>`);
  }

  return html;
}

function normalizeNavAccessibility(html) {
  html = html.replace(/<nav class="nav">/g, '<nav class="nav" aria-label="Primary">');
  html = html.replace(/<nav class="bc-nav"/g, '<nav class="bc-nav" aria-label="Breadcrumb"');
  return html;
}

for (const file of htmlFiles) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');

  html = removeLegacyPixel(html);
  html = externalizeStyle(file, html);
  html = ensureGtmHead(html);
  html = ensureMetaAndSchema(file, html);
  html = ensureSeoAssetsLinked(file, html);
  html = normalizeNavAccessibility(html);
  html = ensureGtmNoscript(html);

  fs.writeFileSync(full, html);
}

console.log(`Updated ${htmlFiles.length} HTML files.`);
console.log(`Generated ${styleCache.size} external page-style CSS files.`);
