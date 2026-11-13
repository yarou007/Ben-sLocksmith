import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { googleAnalyticsTag } from './google-analytics-tag.mjs';
import { conversionComponents } from './conversion-components.mjs';
import { coverageCandidates, locationProfiles } from '../data/conversion-content.mjs';

import plannedPages from '../data/service-pages-planned.mjs';
import locksmithPages from '../data/service-pages-locksmith.mjs';
import hardwarePages from '../data/service-pages-hardware.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const business = JSON.parse(fs.readFileSync(path.join(root, 'data/business.json'), 'utf8'));
const proof = JSON.parse(fs.readFileSync(path.join(root, 'data/proof-content.json'), 'utf8'));
const conversion = conversionComponents(business, proof);
const criticalCss = fs.readFileSync(path.join(root, 'assets/critical.css'), 'utf8').trim();
const allServicePages = [...locksmithPages, ...hardwarePages, ...plannedPages];
const origin = business.origin;
const phone = business.phone;
const assetVersion = createHash('sha256')
  .update(JSON.stringify(business))
  .update(fs.readFileSync(path.join(root, 'assets/site.css')))
  .update(fs.readFileSync(path.join(root, 'assets/site.js')))
  .update(fs.readFileSync(path.join(root, 'assets/quote-form.js')))
  // Bust browser caches when the Vercel publish pipeline changes, even if the
  // CSS bytes did not. This prevents a previously cached missing asset from
  // surviving the deployment that restores the public asset directory.
  .update(fs.readFileSync(path.join(root, 'scripts/prepare-deploy-output.mjs')))
  .digest('hex')
  .slice(0, 12);

function escapeHtml(input = '') {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(input = '') {
  return escapeHtml(input).replace(/`/g, '&#96;');
}

function absolute(value) {
  return new URL(value, origin).href;
}

function webpSource(value) {
  return value.replace(/\.jpe?g$/i, '.webp');
}

function jsonScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function formatList(items, className = 'check-list') {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function commercialBadge() {
  return '<p class="commercial-badge" data-component="CommercialServiceBadge">24/7 commercial door &amp; lock service</p>';
}

function qualificationNotice(location = 'form') {
  return `<p class="qualification-notice" data-component="BusinessQualificationNotice" data-qualification-notice data-cta-location="${escapeAttribute(location)}">Commercial door, lock and hardware service for businesses and managed properties.</p>`;
}

function callButton(label = 'Call for Commercial Emergency Dispatch', location = 'body', secondary = false) {
  return `<a class="button ${secondary ? 'button-secondary' : 'button-primary'}" href="tel:${escapeAttribute(phone.e164)}" data-component="EmergencyCallButton" data-business-phone-link data-dynamic-number-eligible data-cta-location="${escapeAttribute(location)}">${escapeHtml(label)} <span aria-hidden="true">·</span> <span data-business-phone>${escapeHtml(phone.display)}</span></a>`;
}

function compactCallButton(location = 'hero') {
  return `<a class="button button-primary" href="tel:${escapeAttribute(phone.e164)}" data-component="EmergencyCallButton" data-business-phone-link data-dynamic-number-eligible data-cta-location="${escapeAttribute(location)}" aria-label="Call ${phone.display}">Call <span data-business-phone>${escapeHtml(phone.display)}</span></a>`;
}

function photoCta(context = '', location = 'body') {
  return conversion.photoCta(context.startsWith('#') || context.startsWith('/') ? '' : context, location);
}

function header() {
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
<div class="commercial-strip"><span>Commercial door &amp; locksmith service</span><span class="commercial-strip-area"> · Washington DC, nearby Northern Virginia and nearby Maryland</span><span class="commercial-strip-call"> · <a href="tel:${escapeAttribute(phone.e164)}" data-business-phone-link data-dynamic-number-eligible data-cta-location="header">Call <span data-business-phone>${escapeHtml(phone.display)}</span></a></span></div>
<header class="site-header">
  <nav class="site-nav wrap" aria-label="Primary navigation">
    <a class="brand" href="/" aria-label="${escapeAttribute(business.publicName)} home">DC Emergency <span>Lock &amp; Door</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu" aria-label="Open navigation menu" data-nav-toggle>☰</button>
    <div class="nav-links" id="primary-menu" data-nav-menu data-open="false">
      <a href="/commercial-door-repair-washington-dc">Emergency door repair</a>
      <a href="/commercial-locksmith-washington-dc">Commercial locksmith</a>
      <a href="/panic-bar-repair-washington-dc">Panic bars</a>
      <a href="/fire-door-inspection-washington-dc">Fire doors</a>
      ${callButton('Call Dispatch', 'header')}
    </div>
  </nav>
</header>`;
}

function verifiedTrustItems() {
  const items = ['Commercial-only specialists'];
  if (business.trust.availability24x7?.verified && business.trust.availability24x7.value) items.push('24/7 service');
  if (business.trust.freeEstimates?.verified && business.trust.freeEstimates.value) items.push('Free estimates');
  items.push('Washington DC · nearby VA & MD');
  const labels = {
    responseTime: 'Response target',
    ...(!business.trust.availability24x7?.value ? { serviceHours: 'Service hours' } : {}),
    licensed: 'Licensed',
    insured: 'Insured',
    sameDayService: 'Same-day service',
    writtenEstimates: 'Written estimates',
    coiAvailable: 'COI availability',
    w9Available: 'W-9 availability',
    commercialInvoicing: 'Commercial invoicing'
  };
  Object.entries(labels).forEach(([key, label]) => {
    if (business.trust[key]?.verified && business.trust[key]?.value) {
      const detail = business.trust[key].value;
      items.push(typeof detail === 'string' ? `${label}: ${detail}` : label);
    }
  });
  return items;
}

function trustBar() {
  return `<aside class="trust-bar" aria-label="Verified business information" data-component="CommercialTrustBar">
  <ul class="trust-items wrap">${verifiedTrustItems().map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  <!-- Response-time and credential claims omitted: not supplied by the owner. -->
</aside>`;
}

function breadcrumbs(pageName, currentPath, parent = { href: '/washington-dc', label: 'Washington DC commercial services' }) {
  const middle = parent ? `<span aria-hidden="true">/</span><a href="${escapeAttribute(parent.href)}">${escapeHtml(parent.label)}</a>` : '';
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a>${middle}<span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(pageName)}</span></nav>`;
}

function heroImage(image, eager = true) {
  return `<figure class="hero-media">
  <picture><source srcset="${escapeAttribute(webpSource(image.src))}" type="image/webp"><img src="${escapeAttribute(image.src)}" width="${image.width}" height="${image.height}" alt="${escapeAttribute(image.alt)}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}></picture>
  <figcaption>${escapeHtml(image.caption)}</figcaption>
</figure>`;
}

function head({ title, description, pathName, image, schema, robots = 'index,follow,max-image-preview:large' }) {
  const canonical = `${origin}${pathName === '/' ? '/' : pathName}`;
  const imageUrl = absolute(image.src);
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  ${googleAnalyticsTag(business.analytics)}
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  ${business.siteVerification?.google ? `<meta name="google-site-verification" content="${escapeAttribute(business.siteVerification.google)}" />` : ''}
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="robots" content="${escapeAttribute(robots)}">
  <link rel="canonical" href="${escapeAttribute(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeAttribute(business.publicName)}">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:url" content="${escapeAttribute(canonical)}">
  <meta property="og:image" content="${escapeAttribute(imageUrl)}">
  <meta property="og:image:alt" content="${escapeAttribute(image.alt)}">
  <meta property="og:image:width" content="${image.width}">
  <meta property="og:image:height" content="${image.height}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <meta name="twitter:image" content="${escapeAttribute(imageUrl)}">
  <meta name="twitter:image:alt" content="${escapeAttribute(image.alt)}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/locksmith.png" type="image/png" sizes="512x512">
  <link rel="apple-touch-icon" href="/assets/locksmith.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" as="image" href="${escapeAttribute(webpSource(image.src))}" type="image/webp" fetchpriority="high" media="(min-width: 761px)">
  <style data-critical>${criticalCss}</style>
  <link rel="stylesheet" href="/assets/site.css?v=${assetVersion}">
  <script type="application/ld+json">${jsonScript(schema)}</script>
  <script src="/assets/business-config.js?v=${assetVersion}" defer></script>
  <script src="/assets/site.js?v=${assetVersion}" defer></script>
  <script src="/assets/quote-form.js?v=${assetVersion}" defer></script>
</head>`;
}

function organizationSchema() {
  return {
    '@type': ['Organization', 'LocalBusiness', 'Locksmith'],
    '@id': `${origin}/#organization`,
    name: business.publicName,
    url: `${origin}/`,
    logo: absolute('/assets/locksmith.png'),
    telephone: phone.e164,
    ...(business.trust.availability24x7?.verified && business.trust.availability24x7.value ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' } } : {}),
    ...(business.address?.verified && business.address.value ? { address: business.address.value } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone.e164,
      contactType: 'commercial service inquiries',
      areaServed: business.serviceAreas.map((area) => area.name),
      availableLanguage: ['en']
    },
    areaServed: [...business.serviceAreas.map((area) => ({ '@type': 'AdministrativeArea', name: area.name })), ...Object.entries(business.coverage || {}).flatMap(([region, item]) => item.verified.map(name => ({ '@type': 'Place', name, ...(region === 'washington-dc' ? { containedInPlace: { '@type': 'City', name: 'Washington DC' } } : {}) })))]
  };
}

function serviceSchema(page) {
  const url = `${origin}/${page.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(),
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: business.publicName,
        publisher: { '@id': `${origin}/#organization` },
        inLanguage: 'en-US'
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': `${url}#service` }
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: page.h1,
        serviceType: page.h1,
        url,
        description: page.description,
        provider: { '@id': `${origin}/#organization` },
        audience: { '@type': 'BusinessAudience', audienceType: 'Businesses and commercial property operators' },
        areaServed: business.serviceAreas.map((area) => area.name)
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Washington DC commercial services', item: `${origin}/washington-dc` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: url }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
      }
    ]
  };
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <section><h2 class="brand">DC Emergency <span>Lock &amp; Door</span></h2><p>Commercial door, lock and life-safety hardware service for businesses and commercial properties in Washington DC and nearby service areas.</p><p><strong>24/7 service · Free estimates</strong></p>${callButton('Call Commercial Dispatch', 'footer')}</section>
      <nav class="footer-links" aria-label="Commercial services"><h3>Commercial services</h3><a href="/commercial-door-repair-washington-dc">Emergency commercial door repair</a><a href="/commercial-locksmith-washington-dc">Commercial locksmith</a><a href="/panic-bar-repair-washington-dc">Panic bar repair</a><a href="/door-closer-repair-washington-dc">Door closer repair</a><a href="/fire-door-inspection-washington-dc">Fire door inspection</a></nav>
      <nav class="footer-links" aria-label="Service areas and resources"><h3>Areas &amp; resources</h3><a href="/washington-dc">Washington DC</a><a href="/northern-virginia">Nearby Northern Virginia</a><a href="/maryland">Nearby Maryland</a><a href="/blog">Commercial door resources</a><a href="/gallery">Commercial hardware photos</a><a href="/about">About this service</a><a href="/privacy-policy">Privacy policy</a><a href="/terms-of-service">Terms of service</a><a href="/sitemap">Sitemap</a></nav>
    </div>
    <a class="paid-privacy" href="/privacy-policy">Privacy policy</a>
    <div class="footer-bottom"><span>© <span data-current-year>2026</span> ${escapeHtml(business.publicName)}.</span><span>Commercial door, lock and hardware service.</span></div>
  </div>
</footer>`;
}

function stickyActions() { return conversion.stickyActions(); }

function renderFaqs(faqs) {
  return `<div class="faq-list">${faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div>`;
}

function renderRelated(related) {
  return `<div class="inline-links">${related.map((link) => `<a href="${escapeAttribute(link.href)}">${escapeHtml(link.label)}</a>`).join('')}</div>`;
}

function servicePage(page) {
  const currentPath = `/${page.slug}`;
  const heroSide = heroImage(page.heroImage);
  const segment = {
    property_manager_locksmith: 'property-managers',
    commercial_door_repair: 'restaurants-retail',
    commercial_locksmith: 'offices-medical',
    fire_door_repair: 'fire-door-egress'
  }[page.service];

  return `${head({ title: page.title, description: page.description, pathName: currentPath, image: page.heroImage, schema: serviceSchema(page) })}
  <body class="has-sticky-actions" data-service="${escapeAttribute(page.service)}" data-location="Washington DC" data-intent="${escapeAttribute(page.intent)}">
${header()}
<main id="main-content">
  <section class="hero">
    <div class="hero-grid wrap">
      <div class="hero-copy">
        ${breadcrumbs(page.h1, currentPath)}
        ${commercialBadge()}
        <p class="eyebrow" style="color:#bcdcff">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.h1)}</h1>
        <p class="hero-subtitle">${escapeHtml(page.subtitle)}</p>
        <div class="hero-actions">${compactCallButton('hero')}${photoCta(page.h1, 'hero')}</div>
        <p class="service-area-line">Serving Washington DC, with nearby Northern Virginia and Maryland requests reviewed by service location.</p>
      </div>
      <div class="hero-side">${heroSide}</div>
    </div>
  </section>
  ${trustBar()}
  <section class="section">
    <div class="wrap">
      <div class="section-heading"><p class="eyebrow">Start with the problem</p><h2>${escapeHtml(page.intro.heading)}</h2>${page.intro.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      <div class="problem-grid">${page.symptoms.map((symptom) => `<div class="problem-card"><span class="icon-box" aria-hidden="true">!</span><span>${escapeHtml(symptom)}</span></div>`).join('')}</div>
    </div>
  </section>
  ${page.sections.map((section, index) => `<section class="section ${index % 2 === 0 ? 'section-alt' : ''}"${index > 0 ? ' data-paid-hide' : ''}><div class="wrap grid-2"><div><p class="eyebrow">${index === 0 ? 'Diagnosis and scope' : index === 1 ? 'Commercial decision support' : 'Service details'}</p><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div><article class="card"><h3>Key points</h3>${formatList(section.bullets)}</article></div></section>`).join('')}
  <section class="section section-navy">
    <div class="wrap grid-2">
      <div class="section-heading"><p class="eyebrow" style="color:#bcdcff">What happens next</p><h2>${page.intent === 'scheduled' ? 'How a scheduled request moves forward' : 'How a commercial service request moves forward'}</h2><p>Call with the service location and opening details. The request is reviewed and the available next step is confirmed directly.</p></div>
      <ol class="steps">${page.process.map((step) => `<li><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join('')}</ol>
    </div>
  </section>
  <section class="section" data-paid-hide>
    <div class="wrap grid-2">
      <div><p class="eyebrow">Commercial property types</p><h2>Built for facility and business needs</h2>${formatList(page.propertyTypes)}${qualificationNotice('property_types')}</div>
      <aside class="callout" aria-label="Related commercial service information"><h3>Related commercial services</h3><p>Use the page that best matches the failed component or planned project.</p>${renderRelated(page.related)}</aside>
    </div>
  </section>
  ${segment ? conversion.segmentSection(segment) : ''}
  ${conversion.requestSection(page)}
  ${conversion.pricingSection()}
  ${conversion.proofSection()}
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial FAQ</p><h2>Questions about this commercial service</h2></div>${renderFaqs(page.faqs)}</div>
  </section>
  <section class="section final-cta"><div class="wrap"><h2>${page.intent === 'scheduled' ? 'Ready to define the commercial scope?' : 'Is the commercial opening unsafe or unsecured?'}</h2><p>${page.intent === 'scheduled' ? 'Commercial installation, inspection and planned repair service for businesses and managed properties.' : 'Commercial door, lock and hardware repair service for businesses and managed properties.'}</p><div class="button-row">${compactCallButton('body')}${photoCta(page.h1, 'body')}</div></div></section>
</main>
${footer()}
${stickyActions('#service-request')}
</body>
</html>`;
}

const homeImage = {
  src: '/assets/img-956a4955d1ddb21c.jpg',
  width: 525,
  height: 700,
  alt: 'Commercial exit door with panic bar and door closer hardware',
  caption: 'Panic hardware and a door closer on a commercial exit door.'
};

const homeFaqs = [
  {
    question: 'What commercial door and locksmith services are available?',
    answer: 'Services include commercial door repair, business lock and rekey work, panic bars, exit devices, door closers, fire door requests, door installation and access-control door coordination.'
  },
  {
    question: 'Should I call or send a door photo?',
    answer: 'Call for a business lockout or a door you cannot secure. For a quote or planned work, send a full-door photo and hardware close-up on WhatsApp with your business address and urgency.'
  },
  {
    question: 'How do I request planned commercial service?',
    answer: 'Use the WhatsApp quote form, or call 24/7 for a free estimate. Include the business address, opening count, requested work, access window and any work-order or inspection requirements. Send the prepared message in WhatsApp to request service.'
  },
  {
    question: 'What areas are prioritized?',
    answer: 'Washington DC is the primary service area, followed by nearby Northern Virginia and nearby Maryland. Service availability is confirmed from the exact commercial location.'
  }
];

function homeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(),
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: business.publicName,
        publisher: { '@id': `${origin}/#organization` },
        inLanguage: 'en-US'
      },
      {
        '@type': 'WebPage',
        '@id': `${origin}/#webpage`,
        url: `${origin}/`,
        name: 'DC Emergency Lock & Door | Commercial Services 24/7',
        description: 'DC Emergency Lock & Door provides 24/7 commercial door, lock and exit hardware services in DC and nearby VA and MD. Call 202-643-4062 for a free estimate.',
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': `${origin}/#organization` }
      },
      {
        '@type': 'FAQPage',
        '@id': `${origin}/#faq`,
        mainEntity: homeFaqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }))
      }
    ]
  };
}

const homeProblems = [
  ['Door will not close', '/commercial-door-repair-washington-dc', 'commercial_door_repair'],
  ['Door will not latch', '/commercial-door-repair-washington-dc', 'commercial_door_repair'],
  ['Panic bar is stuck', '/panic-bar-repair-washington-dc', 'panic_bar_repair'],
  ['Exit device failed', '/exit-device-repair-washington-dc', 'exit_device_repair'],
  ['Door closer is leaking or slamming', '/door-closer-repair-washington-dc', 'door_closer_repair'],
  ['Commercial lock is jammed', '/commercial-door-lock-repair-washington-dc', 'commercial_door_lock_repair'],
  ['Business lockout', '/service-office-lockout', 'office_lockout'],
  ['Fire door failed inspection', '/fire-door-repair-washington-dc', 'fire_door_repair'],
  ['Break-in or security damage', '/commercial-door-repair-washington-dc', 'commercial_door_repair'],
  ['New commercial door or hardware needed', '/commercial-door-installation-washington-dc', 'commercial_door_installation']
];

function serviceCard(title, description, href, service) {
  return `<article class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><a class="card-link" href="${escapeAttribute(href)}" data-service-card="${escapeAttribute(service)}">${escapeHtml(title)} details →</a></article>`;
}

function photoCards() {
  const photos = [
    { src: '/assets/img-94ae8ed1d777b872.jpg', width: 525, height: 700, alt: 'Commercial door with panic hardware', caption: 'Panic hardware: a clear photo helps identify the bar, latch and mounting.' },
    { src: '/assets/img-9e19b3ab02e1d2d8.jpg', width: 525, height: 700, alt: 'Commercial door closer hardware', caption: 'Door closer: show the arm, mounting and any visible leaks.' },
    { src: '/assets/img-af734f238d1e0eb7.jpg', width: 394, height: 700, alt: 'Commercial lock cylinders and hardware', caption: 'Lock cylinders: include the visible brand or model when requesting work.' }
  ];
  return photos.map((photo) => `<figure class="photo-card"><picture><source srcset="${webpSource(photo.src)}" type="image/webp"><img src="${photo.src}" width="${photo.width}" height="${photo.height}" alt="${escapeAttribute(photo.alt)}" loading="lazy" decoding="async"></picture><figcaption>${escapeHtml(photo.caption)}</figcaption></figure>`).join('');
}

function homepage() {
  return `${head({
    title: 'DC Emergency Lock & Door | Commercial Services 24/7',
    description: 'DC Emergency Lock & Door provides 24/7 commercial door, lock and exit hardware services in DC and nearby VA and MD. Call 202-643-4062 for a free estimate.',
    pathName: '/',
    image: homeImage,
    schema: homeSchema()
  })}
<body class="has-sticky-actions home-page" data-service="commercial_door_and_locksmith" data-location="Washington DC">
${header()}
<main id="main-content">
  <section class="hero">
    <div class="hero-grid wrap">
      <div class="hero-copy">
        ${commercialBadge()}
        <h1>DC Emergency Lock &amp; Door: Commercial Services 24/7</h1>
        <p class="hero-subtitle">Commercial door, lock and exit hardware services for businesses in Washington DC and nearby Virginia and Maryland. Choose the service you need, call 24/7 or send photos for a free estimate.</p>
        <div class="hero-actions">${compactCallButton('hero')}${conversion.photoCta('', 'hero', 'Send a Door Photo for a Free Estimate')}</div>
        <p class="service-area-line">24/7 · Free estimates · DC and nearby VA &amp; MD</p><a class="hero-project-link" href="#service-request">Plan a project: get a free estimate</a>
      </div>
      ${heroImage(homeImage)}
    </div>
  </section>
  ${trustBar()}
  ${conversion.whoWeServe()}
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Choose the problem</p><h2>What is the commercial door doing?</h2><p>Start with the symptom. Each option opens the page built for that specific repair or project.</p></div><div class="problem-grid">${homeProblems.map(([label, href, service]) => `<a class="problem-card" href="${href}" data-service-card="${service}"><span class="icon-box" aria-hidden="true">!</span><span>${escapeHtml(label)}</span></a>`).join('')}</div></div>
  </section>
  ${conversion.requestSection({ service: 'homepage', symptoms: homeProblems.map(([label]) => label) })}
  <section class="section section-alt" id="services">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Emergency repair</p><h2>Restore a door that will not close, latch or secure</h2><p>Commercial door calls are routed by the failed opening, lock and hardware condition.</p></div><div class="grid-3">${serviceCard('Emergency commercial door repair', 'Door, frame, hinge, latch, closer and break-in damage affecting a business opening.', '/commercial-door-repair-washington-dc', 'commercial_door_repair')}${serviceCard('Panic bar repair', 'Stuck bars, failed latch retraction, loose touchpads, strikes and relatching problems.', '/panic-bar-repair-washington-dc', 'panic_bar_repair')}${serviceCard('Door closer repair', 'Leaking, slamming, slow-closing or non-latching commercial door closers.', '/door-closer-repair-washington-dc', 'door_closer_repair')}</div></div>
  </section>
  <section class="section">
    <div class="wrap grid-2"><div><p class="eyebrow">Commercial locksmith work</p><h2>Locks, rekeys and business access</h2><p>Commercial lock service focuses on business lockouts, mortise and cylinder problems, rekey decisions and key-control planning.</p>${renderRelated([
      { href: '/commercial-locksmith-washington-dc', label: 'Commercial locksmith in Washington DC' },
      { href: '/commercial-door-lock-repair-washington-dc', label: 'Commercial door lock repair' },
      { href: '/commercial-rekey-washington-dc', label: 'Commercial rekey' },
      { href: '/master-key-systems', label: 'Master key systems' },
      { href: '/service-office-lockout', label: 'Office lockout service' }
    ])}</div><aside class="callout" aria-label="Related commercial service information"><h3>Commercial lock and door service</h3><p>We work on commercial locks, cylinders, rekeys, master-key systems and business entry doors throughout the Washington DC service area.</p>${callButton('Call About Commercial Service', 'body')}</aside></div>
  </section>
  <section class="section section-navy">
    <div class="wrap"><div class="section-heading"><p class="eyebrow" style="color:#bcdcff">Life-safety hardware</p><h2>Panic bars, exit devices, closers and fire doors</h2><p>A sticking panic bar, leaking closer or fire door that will not latch can affect daily operations. Choose the hardware or inspection request that matches your opening.</p></div><div class="grid-3">${serviceCard('Fire door inspection request', 'Discuss opening counts, inspection requirements and the documentation your building needs.', '/fire-door-inspection-washington-dc', 'fire_door_inspection')}${serviceCard('Exit device repair', 'Commercial exit device diagnosis for rim, mortise and vertical-rod configurations.', '/exit-device-repair-washington-dc', 'exit_device_repair')}${serviceCard('Panic bar installation', 'Assessment for new, replacement and retrofit panic or exit hardware.', '/panic-bar-installation-washington-dc', 'panic_bar_installation')}</div></div>
  </section>
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Planned installation and security</p><h2>Coordinate doors, frames, hardware and controlled entry</h2><p>Planned projects begin with measurements, opening counts, building constraints and clear trade responsibilities.</p></div><div class="grid-3">${serviceCard('Commercial door installation', 'Door/frame measurement, replacement planning and hardware coordination.', '/commercial-door-installation-washington-dc', 'commercial_door_installation')}${serviceCard('Commercial access control', 'Door-side locks, strikes, exit hardware and integrator coordination.', '/access-control-systems-washington-dc', 'access_control')}${serviceCard('Fire door repair', 'Known closing, latching, hardware or inspection-deficiency correction needs.', '/fire-door-repair-washington-dc', 'fire_door_repair')}</div></div>
  </section>
  ${conversion.segmentSection()}
  ${conversion.howItWorks()}
  ${conversion.pricingSection()}
  ${conversion.proofSection()}
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial door photos</p><h2>Identify the hardware before the service conversation</h2><p>Photograph the whole door and then the problem hardware. These reference photos show useful details to include in your request.</p></div><div class="photo-grid">${photoCards()}</div></div>
  </section>
  <section class="section">
    <div class="wrap grid-2"><div><p class="eyebrow">Service area</p><h2>Washington DC is the priority</h2><p>Requests are reviewed first for Washington DC, then nearby Northern Virginia and nearby Maryland. The exact commercial address or ZIP is required to confirm availability.</p></div><div class="grid-3">${serviceCard('Washington DC', 'Primary commercial door and locksmith service area.', '/washington-dc', 'washington_dc')}${serviceCard('Northern Virginia', 'Nearby Northern Virginia commercial service requests.', '/northern-virginia', 'northern_virginia')}${serviceCard('Maryland', 'Nearby Maryland commercial service requests.', '/maryland', 'maryland')}</div></div>
  </section>
  <section class="section section-alt"><div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial FAQ</p><h2>Commercial service questions</h2></div>${renderFaqs(homeFaqs)}</div></section>
  <section class="section final-cta"><div class="wrap"><h2>Commercial door and locksmith service in Washington DC</h2><p>Call for commercial door repair, lock service, panic hardware, closers, rekeys and planned door projects.</p><div class="button-row">${compactCallButton('body')}${photoCta('', 'body')}</div></div></section>
</main>
${footer()}
${stickyActions()}
</body>
</html>`;
}

function simpleSchema(title, description, currentPath, type = 'WebPage', breadcrumbName = title) {
  const url = `${origin}${currentPath === '/' ? '/' : currentPath}`;
  const graph = [
    organizationSchema(),
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: business.publicName,
      publisher: { '@id': `${origin}/#organization` },
      inLanguage: 'en-US'
    },
    {
      '@type': type,
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': `${origin}/#website` },
      about: { '@id': `${origin}/#organization` },
      inLanguage: 'en-US'
    }
  ];
  if (currentPath !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: breadcrumbName, item: url }
      ]
    });
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

const locationPages = [
  {
    slug: 'washington-dc',
    service: 'washington_dc_commercial_service',
    location: 'Washington DC',
    title: 'Washington DC Service Areas | DC Emergency Lock & Door',
    description: 'Explore our Washington DC service areas, from Downtown and Capitol Hill to Georgetown and Navy Yard. Find commercial door and lock services for your neighborhood.',
    h1: 'Washington DC Neighborhoods We Serve',
    subtitle: 'Find your Washington DC neighborhood below, then choose the door repair, locksmith or exit hardware service your property needs. Include your exact business address when requesting availability.',
    image: homeImage,
    areas: ['Downtown and central business districts', 'Northwest, Northeast, Southwest and Southeast DC', 'Commercial offices and managed buildings', 'Retail, restaurant, education, medical and warehouse properties']
  },
  {
    slug: 'northern-virginia',
    service: 'northern_virginia_commercial_service',
    location: 'Nearby Northern Virginia',
    title: 'Commercial Door & Locksmith Services Northern Virginia',
    description: '24/7 commercial door and locksmith service in Arlington, Alexandria and nearby Northern Virginia. Free estimates for locks, panic bars, closers and doors.',
    h1: 'Commercial Door & Locksmith Service in Northern Virginia',
    subtitle: 'Door and lock service requests for nearby Northern Virginia businesses. Call with your address to discuss current availability.',
    image: {
      src: '/assets/img-ac0dc74c141fc9b7.jpg',
      width: 525,
      height: 700,
      alt: 'Commercial exterior doors and metal frames',
      caption: 'Commercial exterior door and frame hardware.'
    },
    areas: ['Alexandria commercial properties', 'Arlington commercial properties', 'Nearby Northern Virginia offices and retail', 'Managed buildings, schools, medical facilities and warehouses']
  },
  {
    slug: 'maryland',
    service: 'maryland_commercial_service',
    location: 'Nearby Maryland',
    title: 'Commercial Door & Locksmith Services Maryland',
    description: '24/7 commercial door repair and locksmith service in Bethesda, Silver Spring and nearby Maryland. Free estimates for business doors, locks and exit hardware.',
    h1: 'Commercial Door & Locksmith Service in Nearby Maryland',
    subtitle: 'Commercial door and lock service requests in nearby Maryland. Call with your address or ZIP to discuss current availability.',
    image: {
      src: '/assets/img-466c8958117610c9.jpg',
      width: 900,
      height: 506,
      alt: 'Commercial entry door and threshold area',
      caption: 'Commercial entry door and threshold.'
    },
    areas: ['Bethesda-area commercial properties', 'Silver Spring-area commercial properties', 'Nearby Maryland offices and retail', 'Managed buildings, schools, medical facilities and warehouses']
  }
];

const locationServiceLinks = [
  { title: 'Emergency commercial door repair', description: 'Doors that will not close, latch or secure; frame, hinge, closer and break-in problems.', href: '/commercial-door-repair-washington-dc', service: 'commercial_door_repair' },
  { title: 'Commercial locksmith', description: 'Business lockouts, commercial locks, rekeys, cylinders and key-control planning.', href: '/commercial-locksmith-washington-dc', service: 'commercial_locksmith' },
  { title: 'Panic bar repair', description: 'Stuck bars, failed latch retraction, strike alignment and relatching problems.', href: '/panic-bar-repair-washington-dc', service: 'panic_bar_repair' },
  { title: 'Door closer repair', description: 'Leaking, slamming, slow-closing or non-latching commercial door closers.', href: '/door-closer-repair-washington-dc', service: 'door_closer_repair' },
  { title: 'Fire door inspection request', description: 'Discuss opening counts, inspection requirements and the documentation your building needs.', href: '/fire-door-inspection-washington-dc', service: 'fire_door_inspection' },
  { title: 'Commercial door installation', description: 'Door and frame measurement, replacement planning and hardware coordination.', href: '/commercial-door-installation-washington-dc', service: 'commercial_door_installation' }
];

function locationFaqs(page) {
  return [
    { question: `Can I request commercial door service in ${page.location}?`, answer: `Yes. Call 24/7 or use the WhatsApp quote form with your business address in ${page.location}. Describe whether the door closes, latches, locks and releases, and request a free estimate.` },
    { question: 'What should a property or facility manager include?', answer: 'Include the property address, affected door, work-order reference, opening count, onsite contact, access window and approval requirements. Add the exact report item for an inspection-related repair request.' },
    { question: 'Can I request an estimate from door photos?', answer: 'Yes. Estimates are free. Send a full-opening photo, hardware close-ups, the business address and urgency. Photos help define the initial scope; measurements or an onsite assessment may be needed for the work.' }
  ];
}

function locationDetailSections(page) {
  const verified = new Set(business.coverage?.[page.slug]?.verified || []);
  const profiles = (locationProfiles[page.slug] || []).filter(item => verified.has(item.name));
  if (!profiles.length) return '';
  return `<section class="section local-coverage" id="neighborhoods"><div class="wrap"><div class="section-heading"><p class="eyebrow">Neighborhoods and business districts</p><h2>Commercial door and lock service in ${escapeHtml(page.location)}</h2><p>24/7 service and free estimates for the commercial openings described below. Include your exact address and onsite contact when requesting work.</p></div><nav class="coverage-jump-links" aria-label="Local service locations">${profiles.map(p => `<a href="#${p.id}">${escapeHtml(p.name)}</a>`).join('')}</nav><div class="coverage-grid">${profiles.map(p => `<article class="coverage-card" id="${p.id}"><p class="eyebrow">${escapeHtml(p.name)}</p><h3>${escapeHtml(p.heading)}</h3><p>${escapeHtml(p.text)}</p>${formatList(p.benefits)}<a class="card-link" href="${p.href}" data-service-card="local_${p.id}">${escapeHtml(p.link)} →</a>${conversion.photoCta(`${p.name} commercial service`, 'local_area', `Request a free estimate in ${p.name}`)}</article>`).join('')}</div></div></section>`;
}

function locationSchema(page) {
  const currentPath = `/${page.slug}`;
  const base = simpleSchema(page.title, page.description, currentPath, 'WebPage', page.h1);
  base['@graph'].push({
    '@type': 'Service',
    '@id': `${origin}${currentPath}#service`,
    name: page.h1,
    serviceType: 'Commercial door and locksmith service',
    url: `${origin}${currentPath}`,
    provider: { '@id': `${origin}/#organization` },
    audience: { '@type': 'BusinessAudience', audienceType: 'Businesses and commercial property operators' },
    areaServed: page.location
  });
  base['@graph'].push({ '@type': 'FAQPage', '@id': `${origin}${currentPath}#faq`, mainEntity: locationFaqs(page).map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) });
  const area = base['@graph'].find(item => item['@type'] === 'Service');
  area.areaServed = [page.location, ...(business.coverage?.[page.slug]?.verified || [])];
  return base;
}

function locationPage(page) {
  const currentPath = `/${page.slug}`;
  const formConfig = {
    slug: page.slug,
    service: page.service,
    h1: page.h1,
    symptoms: homeProblems.map(([label]) => label),
    propertyTypes: []
  };
  return `${head({ title: page.title, description: page.description, pathName: currentPath, image: page.image, schema: locationSchema(page) })}
<body class="has-sticky-actions" data-service="${escapeAttribute(page.service)}" data-location="${escapeAttribute(page.location)}">
${header()}
<main id="main-content">
  <section class="hero"><div class="hero-grid wrap"><div class="hero-copy">${breadcrumbs(page.h1, currentPath, null)}${commercialBadge()}<p class="eyebrow" style="color:#bcdcff">Commercial service area</p><h1>${escapeHtml(page.h1)}</h1><p class="hero-subtitle">${escapeHtml(page.subtitle)}</p><div class="hero-actions">${callButton('Call Commercial Dispatch', 'hero')}${photoCta('#area-request', 'hero')}</div></div>${heroImage(page.image)}</div></section>
  ${trustBar()}
  <section class="section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial services</p><h2>Choose the failed opening or planned project</h2><p>Each service page explains a distinct buyer problem. Call with the exact commercial location so coverage can be confirmed.</p></div><div class="grid-3">${locationServiceLinks.map((item) => serviceCard(item.title, item.description, item.href, item.service)).join('')}</div></div></section>
  <section class="section section-alt"><div class="wrap grid-2"><div><p class="eyebrow">Area context</p><h2>Commercial properties in ${escapeHtml(page.location)}</h2><p>Tell us the business address, property type and door problem. We will discuss the service options for your location.</p>${formatList(page.areas)}</div><aside class="callout" aria-label="Related commercial service information"><h3>What to include</h3>${formatList(['Business or organization name', 'Exact city, ZIP and service address', 'Affected door and hardware type', 'Whether the opening closes, latches and secures', 'Onsite contact and access window', 'Photo when it can be shared safely'])}${qualificationNotice('service_area')}</aside></div></section>
  ${locationDetailSections(page)}
  ${conversion.requestSection(formConfig, 'area-request')}
  <section class="section section-alt"><div class="wrap"><h2>Commercial service questions in ${escapeHtml(page.location)}</h2>${renderFaqs(locationFaqs(page))}</div></section>
  <section class="section final-cta"><div class="wrap"><h2>Need help with a commercial door or lock?</h2><p>Commercial door, lock and hardware service is available throughout this service area.</p><div class="button-row">${callButton('Call Commercial Dispatch', 'body')}${photoCta('#area-request', 'body')}</div></div></section>
</main>${footer()}${stickyActions('#area-request')}</body></html>`;
}

function supportPage({ slug, title, description, h1, eyebrow, bodyHtml, image = homeImage, robots = 'index,follow,max-image-preview:large', service = 'site_information', sticky = false, type = 'WebPage' }) {
  const currentPath = slug ? `/${slug}` : '/';
  return `${head({ title, description, pathName: currentPath, image, schema: simpleSchema(title, description, currentPath, type, h1), robots })}
<body class="${sticky ? 'has-sticky-actions' : ''}" data-service="${escapeAttribute(service)}" data-location="Washington DC service area">
${header()}
<main id="main-content">
  <section class="hero"><div class="hero-grid wrap"><div class="hero-copy">${slug ? breadcrumbs(h1, currentPath, null) : ''}${commercialBadge()}<p class="eyebrow" style="color:#bcdcff">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(h1)}</h1><p class="hero-subtitle">${escapeHtml(description)}</p></div>${heroImage(image)}</div></section>
  ${bodyHtml}
</main>${footer()}${sticky ? stickyActions() : ''}</body></html>`;
}

function aboutPage() {
  return supportPage({
    slug: 'about',
    title: `About ${business.publicName} | Commercial Service`,
    description: 'Learn how this website routes commercial door, lock, panic hardware, closer, fire door and installation requests in the Washington DC service area.',
    h1: `About ${business.publicName}`,
    eyebrow: 'Commercial door and lock service',
    service: 'about',
    sticky: true,
    bodyHtml: `${trustBar()}<section class="section"><div class="wrap grid-2"><div><p class="eyebrow">Commercial service</p><h2>Door, lock and hardware work for commercial properties</h2><p>The service pages cover work for property managers, facility managers, building engineers, commercial landlords, offices, retail stores, restaurants, schools, medical facilities, warehouses, general contractors and multifamily property-management companies.</p></div><article class="card"><h3>Primary work categories</h3>${formatList(['Commercial door repair', 'Business lockouts, locks and rekeys', 'Panic bars and exit devices', 'Door closers', 'Fire door inspection and repair requests', 'Commercial door installation and access-control coordination'])}</article></div></section><section class="section section-alt"><div class="wrap grid-2"><div><p class="eyebrow">Commercial-only focus</p><h2>Start with your business and the affected door</h2><p>From a single storefront to a managed commercial building, tell us which door is failing and how it affects security or daily access. Washington DC is our priority, with requests from nearby Northern Virginia and Maryland.</p><p>Have a work order, vendor documents or specific reporting requirements? Include them in the conversation so we can review your needs before scheduling.</p></div><aside class="callout" aria-label="Related commercial service information"><h3>Request service</h3><p>Use the page matching the failed hardware or planned project, or call about the door or lock condition.</p>${callButton('Call Commercial Dispatch', 'body')}</aside></div></section>`
  });
}

function galleryPage() {
  const images = business.existingPhotos.map((photo) => `<figure class="photo-card"><picture><source srcset="${escapeAttribute(webpSource(photo.src))}" type="image/webp"><img src="${escapeAttribute(photo.src)}" width="${photo.width}" height="${photo.height}" alt="${escapeAttribute(photo.subject)}" loading="lazy" decoding="async"></picture><figcaption>${escapeHtml(photo.subject)}.</figcaption></figure>`).join('');
  return supportPage({
    slug: 'gallery',
    title: 'Commercial Door & Lock Hardware Photos | Washington DC',
    description: 'Commercial door, panic bar, closer and lock reference photos. See which hardware details to include when requesting service for your business.',
    h1: 'Commercial Door & Lock Hardware Photos',
    eyebrow: 'Commercial hardware reference photos',
    service: 'commercial_hardware_gallery',
    sticky: true,
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Send useful door photos</p><h2>Show the opening and the hardware</h2><p>Start with a full-door photo, then add the lock, panic bar, closer or damaged area. These reference images show the kinds of details that help explain a commercial service request.</p></div><div class="photo-grid">${images}</div></div></section><section class="section final-cta"><div class="wrap"><h2>Have a photo of the failed commercial opening?</h2><p>Send a full-door photo and a hardware close-up on WhatsApp, with your business address and urgency.</p><div class="button-row">${callButton('Call Commercial Dispatch', 'body')}${photoCta('', 'body')}</div></div></section>`
  });
}

function privacyPage() {
  return supportPage({
    slug: 'privacy-policy',
    title: `Privacy Policy | ${business.publicName}`,
    description: 'How commercial quote requests use WhatsApp, phone links, session attribution and website analytics. Request details are sent when you send them in WhatsApp.',
    h1: 'Privacy Policy',
    eyebrow: 'Website and lead data',
    service: 'privacy_policy',
    image: {
      src: '/assets/img-6c9f60cefc5f9de6.jpg',
      width: 525,
      height: 700,
      alt: 'Commercial door closer mounted above a door',
      caption: 'Commercial door hardware shown; the image location is not published.'
    },
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><h2>How quote requests are sent</h2><p>The quote form prepares a WhatsApp message with the details you enter. You send the message and photos in WhatsApp. Details entered in the form stay on the page until you choose to continue; they are not uploaded to a website submission service. Photo sharing lets you choose an app and recipient on your device. Keep access credentials and confidential documents out of door photos.</p><!-- [ADD: PRIVACY_DETAILS — legal identity, privacy contact, effective date, retention and consent details] --></div><div class="grid-2"><article class="card"><h3>Attribution and measurement</h3><p>The site may retain landing page, referrer and UTM parameters in the browser session. Phone and WhatsApp clicks are measured through Google Analytics 4. These events do not include form messages, door photos or personal contact details and do not indicate a booked job.</p></article><article class="card"><h3>Direct website delivery</h3><p>Direct website delivery is coming soon. The working quote form prepares a WhatsApp request; use the phone or WhatsApp conversation for service.</p></article><article class="card"><h3>Third-party tools</h3><p>The existing configuration loads Ahrefs Web Analytics after the page load.  Google Analytics 4 is configured to measure website usage. Google Tag Manager, Google Ads conversion settings and call-tracking numbers are not configured.</p></article><article class="card"><h3>Questions</h3><p>Call <a href="tel:${phone.e164}" data-business-phone-link data-cta-location="body"><span data-business-phone>${phone.display}</span></a> with privacy questions. </p></article></div></div></section>`
  });
}

function termsPage() {
  return supportPage({
    slug: 'terms-of-service',
    title: `Website Terms | ${business.publicName}`,
    description: 'Terms for commercial door and locksmith requests, free estimates, phone contact and WhatsApp quote preparation. Agree service arrangements directly.',
    h1: 'Website Terms of Service',
    eyebrow: 'Commercial service requests',
    service: 'terms',
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><h2>Website contact does not confirm an appointment</h2><p>Call 24/7 or prepare a WhatsApp request for a free estimate. Send the prepared message in WhatsApp, then agree the work, site access and service arrangements directly with us. Preparing the form does not reserve an appointment.</p></div><div class="grid-2"><article class="card"><h3>Commercial authorization</h3><p>The requester should be authorized to seek work for the business or property and should provide accurate access, opening and contact information.</p></article><article class="card"><h3>Photos and files</h3><p>Send door photos through WhatsApp. Share files you are authorized to provide, and keep people, access credentials and confidential documents out of the images.</p></article><article class="card"><h3>Inspection and code information</h3><p>General website information is not legal, engineering or authority approval. Applicable requirements and final acceptance are project-specific.</p></article><article class="card"><h3>Agree the service scope</h3><p>Discuss operating hours, response estimates, vendor documentation, payment terms and project requirements before approving service. The agreed service scope controls the work.</p></article></div>${qualificationNotice('terms')}</div></section>`
  });
}

function stripMarkup(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}

function extractPageValue(html, regex) {
  return stripMarkup(html.match(regex)?.[1] || '');
}

function blogEntries() {
  function walkBlog(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? walkBlog(file) : [file];
    });
  }
  return walkBlog(root)
    .filter((file) => file.endsWith('.html'))
    .filter((file) => {
      const relative = path.relative(root, file).split(path.sep).join('/');
      return relative !== 'blog.html' && (relative.startsWith('blog-') || relative.startsWith('blog/'));
    })
    .filter((file) => !/(?:new-york|nyc)/i.test(path.relative(root, file).split(path.sep).join('/')))
    .sort()
    .map((file) => {
      const html = fs.readFileSync(file, 'utf8');
      const relative = path.relative(root, file).split(path.sep).join('/');
      return {
        href: `/${relative.replace(/\.html$/i, '')}`,
        title: extractPageValue(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || extractPageValue(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
        description: extractPageValue(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || 'Commercial door and lock resource.'
      };
    });
}

function blogHubPage() {
  const entries = blogEntries();
  return supportPage({
    slug: 'blog',
    title: 'Commercial Door & Lock Resources | Washington DC',
    description: 'Commercial door, lock, panic hardware, closer, fire door and access-control articles for Washington DC property and facility teams.',
    h1: 'Commercial Door & Lock Resources',
    eyebrow: 'Guides for business properties',
    service: 'commercial_resources',
    type: 'CollectionPage',
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><h2>Diagnose the question, then choose the service page</h2><p>Find practical guidance for commercial doors, locks and exit hardware, then choose the service page that matches your building’s problem. For inspection requirements, consult the responsible inspector or authority for your property.</p></div><div class="grid-3">${entries.map((entry) => `<article class="card"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.description)}</p><a class="card-link" href="${escapeAttribute(entry.href)}">Read the guide →</a></article>`).join('')}</div></div></section>`
  });
}

function sitemapPage() {
  const primary = [
    ...locationServiceLinks.map((item) => ({ href: item.href, label: item.title })),
    { href: '/panic-bar-installation-washington-dc', label: 'Panic bar installation' },
    { href: '/exit-device-repair-washington-dc', label: 'Exit device repair' },
    { href: '/commercial-door-lock-repair-washington-dc', label: 'Commercial door lock repair' },
    { href: '/commercial-rekey-washington-dc', label: 'Commercial rekey' },
    { href: '/fire-door-repair-washington-dc', label: 'Fire door repair' },
    { href: '/access-control-systems-washington-dc', label: 'Commercial access control' },
    { href: '/storefront-door-repair-washington-dc', label: 'Storefront door repair' },
    { href: '/master-key-systems', label: 'Master key systems' },
    { href: '/service-office-lockout', label: 'Office lockout service' },
    { href: '/service-property-manager-locksmith', label: 'Property manager service' },
    { href: '/service-restricted-key-systems', label: 'Restricted key systems' }
  ];
  const entries = blogEntries();
  return supportPage({
    slug: 'sitemap',
    title: `HTML Sitemap | ${business.publicName}`,
    description: 'Browse commercial door, locksmith, panic bar, closer, fire door, installation, access-control, service-area and resource pages.',
    h1: 'Website Sitemap',
    eyebrow: 'Browse final canonical pages',
    service: 'html_sitemap',
    robots: 'noindex,follow',
    bodyHtml: `<section class="section"><div class="wrap grid-3"><nav class="card footer-links" aria-label="Primary service pages"><h2>Commercial services</h2>${primary.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join('')}</nav><nav class="card footer-links" aria-label="Service areas and company pages"><h2>Areas and company</h2><a href="/">Home</a><a href="/washington-dc">Washington DC</a><a href="/northern-virginia">Northern Virginia</a><a href="/maryland">Maryland</a><a href="/about">About</a><a href="/gallery">Gallery</a><a href="/privacy-policy">Privacy</a><a href="/terms-of-service">Terms</a></nav><nav class="card footer-links" aria-label="Articles"><h2>Resources</h2>${entries.map((entry) => `<a href="${entry.href}">${escapeHtml(entry.title)}</a>`).join('')}</nav></div></section>`
  });
}

function notFoundPage() {
  return supportPage({
    slug: '404',
    title: `Page Not Found | ${business.publicName}`,
    description: 'The requested page could not be found. Choose a commercial door or locksmith service page or call with the business location.',
    h1: 'That Page Could Not Be Found',
    eyebrow: '404',
    service: 'not_found',
    robots: 'noindex,follow',
    sticky: true,
    bodyHtml: `<section class="section"><div class="wrap grid-2"><div><h2>Choose the closest commercial service</h2>${renderRelated([{ href: '/commercial-door-repair-washington-dc', label: 'Emergency commercial door repair' }, { href: '/commercial-locksmith-washington-dc', label: 'Commercial locksmith' }, { href: '/panic-bar-repair-washington-dc', label: 'Panic bar repair' }, { href: '/door-closer-repair-washington-dc', label: 'Door closer repair' }, { href: '/fire-door-inspection-washington-dc', label: 'Fire door inspection' }])}</div><aside class="callout" aria-label="Related commercial service information"><h3>Active commercial security problem?</h3><p>Call for commercial door, lock and hardware service.</p>${callButton('Call Commercial Dispatch', 'body')}</aside></div></section>`
  });
}

function thankYouPage() {
  return supportPage({ slug: 'thank-you', title: 'Next Steps for Your Commercial Service Request', description: 'Send the prepared WhatsApp message and keep your phone available to discuss your commercial door request. For an unsecured door or urgent lockout, call 1 202-643-4062.', h1: 'Keep your phone available', eyebrow: 'Complete your WhatsApp request', service: 'request_follow_up', robots: 'noindex,follow', sticky: true, bodyHtml: `<section class="section"><div class="wrap"><h2>What happens next</h2><p>After preparing the quote form, send its message in WhatsApp and attach your door photos. We discuss your commercial service request, scope and next step in that conversation or by phone. Opening the app alone does not send the message.</p><p>For an unsecured commercial door or urgent business lockout, call ${escapeHtml(phone.display)} 24/7. Estimates are free.</p><!-- [ADD: CALLBACK_WINDOW — approved callback promise before connecting a live form] --><div class="button-row">${compactCallButton('body')}${photoCta('', 'body')}</div></div></section>` });
}

function writeIfChanged(file, content) {
  content = content.replace(/[ \t]+$/gm, '');
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === content) return false;
  fs.writeFileSync(file, content);
  return true;
}

function browserConfig() {
  return {
    publicName: business.publicName,
    origin: business.origin,
    phone: business.phone,
    serviceAreas: business.serviceAreas,
    trust: business.trust,
    photoContact: business.photoContact,
    form: { enabled: business.form.enabled, contactMode: 'whatsapp' },
    analytics: business.analytics
  };
}

let changed = 0;
changed += writeIfChanged(path.join(root, 'assets/business-config.js'), `window.DCELD_CONFIG = ${JSON.stringify(browserConfig(), null, 2)};\n`) ? 1 : 0;
changed += writeIfChanged(path.join(root, 'index.html'), homepage()) ? 1 : 0;
allServicePages.forEach((page) => {
  const output = path.join(root, `${page.slug}.html`);
  if (writeIfChanged(output, servicePage(page))) changed += 1;
});
locationPages.forEach((page) => {
  if (writeIfChanged(path.join(root, `${page.slug}.html`), locationPage(page))) changed += 1;
});
[
  ['about.html', aboutPage()],
  ['gallery.html', galleryPage()],
  ['privacy-policy.html', privacyPage()],
  ['terms-of-service.html', termsPage()],
  ['blog.html', blogHubPage()],
  ['sitemap.html', sitemapPage()],
  ['404.html', notFoundPage()],
  ['thank-you.html', thankYouPage()]
].forEach(([file, content]) => {
  if (writeIfChanged(path.join(root, file), content)) changed += 1;
});

console.log(`Built ${allServicePages.length + locationPages.length + 9} canonical/support pages; ${changed} files changed.`);
