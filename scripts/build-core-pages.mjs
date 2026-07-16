import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import plannedPages from '../data/service-pages-planned.mjs';
import locksmithPages from '../data/service-pages-locksmith.mjs';
import hardwarePages from '../data/service-pages-hardware.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const business = JSON.parse(fs.readFileSync(path.join(root, 'data/business.json'), 'utf8'));
const allServicePages = [...locksmithPages, ...hardwarePages, ...plannedPages];
const origin = business.origin;
const phone = business.phone;
const assetVersion = createHash('sha256')
  .update(JSON.stringify(business))
  .update(fs.readFileSync(path.join(root, 'assets/site.css')))
  .update(fs.readFileSync(path.join(root, 'assets/site.js')))
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
  return '<p class="commercial-badge" data-component="CommercialServiceBadge">Commercial door &amp; locksmith service</p>';
}

function qualificationNotice(location = 'form') {
  return `<p class="qualification-notice" data-component="BusinessQualificationNotice" data-qualification-notice data-cta-location="${escapeAttribute(location)}">Commercial door, lock and hardware service for businesses and managed properties.</p>`;
}

function callButton(label = 'Call for Commercial Emergency Dispatch', location = 'body', secondary = false) {
  return `<a class="button ${secondary ? 'button-secondary' : 'button-primary'}" href="tel:${escapeAttribute(phone.e164)}" data-component="EmergencyCallButton" data-business-phone-link data-dynamic-number-eligible data-cta-location="${escapeAttribute(location)}" aria-label="${escapeAttribute(label)} at ${phone.display}">${escapeHtml(label)} <span aria-hidden="true">·</span> <span data-business-phone>${escapeHtml(phone.display)}</span></a>`;
}

function compactCallButton(location = 'hero') {
  return `<a class="button button-primary" href="tel:${escapeAttribute(phone.e164)}" data-component="EmergencyCallButton" data-business-phone-link data-dynamic-number-eligible data-cta-location="${escapeAttribute(location)}" aria-label="Call ${phone.display}">Call <span data-business-phone>${escapeHtml(phone.display)}</span></a>`;
}

function photoCta(href, location = 'body') {
  return `<a class="button button-secondary" href="${escapeAttribute(href)}" data-component="SendPhotoCTA" data-photo-cta data-cta-location="${escapeAttribute(location)}">Send a Door Photo</a>`;
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
  const items = [
    business.businessAudience,
    ...business.serviceAreas.filter((area) => area.verifiedFromBrief).map((area) => area.name)
  ];
  const labels = {
    licensed: 'Licensed',
    insured: 'Insured',
    availability24x7: '24/7 availability',
    sameDayService: 'Same-day service',
    writtenEstimates: 'Written estimates',
    coiAvailable: 'COI availability',
    w9Available: 'W-9 availability',
    commercialInvoicing: 'Commercial invoicing'
  };
  Object.entries(labels).forEach(([key, label]) => {
    if (business.trust[key]?.verified && business.trust[key]?.value) items.push(label);
  });
  return items;
}

function trustBar() {
  return `<aside class="trust-bar" aria-label="Verified business information" data-component="CommercialTrustBar">
  <ul class="trust-items wrap">${verifiedTrustItems().map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
</aside>`;
}

function hiddenAttribution(formType) {
  return `
    <input type="hidden" name="landing_page" value="">
    <input type="hidden" name="referrer" value="">
    <input type="hidden" name="utm_source" value="">
    <input type="hidden" name="utm_medium" value="">
    <input type="hidden" name="utm_campaign" value="">
    <input type="hidden" name="utm_term" value="">
    <input type="hidden" name="utm_content" value="">
    <input type="hidden" name="gclid" value="">
    <input type="hidden" name="gbraid" value="">
    <input type="hidden" name="wbraid" value="">
    <input type="hidden" name="page_path" value="">
    <input type="hidden" name="page_title" value="">
    <input type="hidden" name="lead_id" value="">`;
}

function formCommon(type, currentPath, subject, formId) {
  const nextUrl = `${origin}${currentPath}?submitted=1&form=${encodeURIComponent(type)}`;
  return `${hiddenAttribution(type)}
    <input type="hidden" name="_subject" value="${escapeAttribute(subject)}">
    <input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="_template" value="table">
    <input type="hidden" name="_next" value="${escapeAttribute(nextUrl)}">
    <div class="honeypot" aria-hidden="true"><label for="${escapeAttribute(formId)}-company-website">Leave this field empty</label><input id="${escapeAttribute(formId)}-company-website" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>`;
}

function emergencyForm(page, compact = false) {
  const formId = compact ? `hero-${page.service}-form` : `${page.service}-emergency-form`;
  const problemOptions = page.symptoms.slice(0, 8);
  return `<form id="${escapeAttribute(formId)}" class="lead-form" action="${escapeAttribute(business.form.endpoint)}" method="post" enctype="multipart/form-data" data-lead-form data-form-type="emergency" data-cta-location="${compact ? 'hero' : 'body'}">
  ${formCommon('emergency', `/${page.slug}`, `Commercial emergency request: ${page.h1}`, formId)}
  <div class="form-grid">
    <div class="field"><label for="${formId}-business">Business or organization <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-business" name="business_name" autocomplete="organization" required></div>
    <div class="field"><label for="${formId}-contact">Contact name <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-contact" name="contact_name" autocomplete="name" required></div>
    <div class="field"><label for="${formId}-phone">Phone <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>
    <div class="field"><label for="${formId}-location">Service location city or ZIP <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-location" name="service_location" autocomplete="postal-code" required></div>
    <div class="field field-full"><label for="${formId}-problem">Problem type <span class="required-mark" aria-hidden="true">*</span></label><select id="${formId}-problem" name="problem_type" required><option value="">Select the closest problem</option>${problemOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join('')}<option>Other commercial door or lock problem</option></select></div>
    <div class="field ${compact ? '' : 'field-full'}"><label for="${formId}-photo">Optional door photo</label><input id="${formId}-photo" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,image/heic"><p class="field-hint">Attach one clear image of the door or hardware. Do not include people or confidential documents.</p></div>
    ${compact ? '' : `<div class="field field-full"><label for="${formId}-message">Optional short message</label><textarea id="${formId}-message" name="message" placeholder="What happened, which opening is affected, and whether it can close or secure?"></textarea></div>`}
  </div>
  ${qualificationNotice(compact ? 'hero_form' : 'form')}
  <button class="button button-primary" type="submit">Request Commercial Service</button>
  <p class="form-note">Submitting this form does not confirm dispatch or an appointment. For an active security or egress issue, call.</p>
  <p class="form-status" data-form-status role="status" aria-live="polite"></p>
</form>`;
}

function scheduledForm(page) {
  const formId = `${page.service}-scheduled-form`;
  return `<form id="${escapeAttribute(formId)}" class="lead-form" action="${escapeAttribute(business.form.endpoint)}" method="post" enctype="multipart/form-data" data-lead-form data-form-type="scheduled" data-cta-location="body">
  ${formCommon('scheduled', `/${page.slug}`, `Scheduled commercial service request: ${page.h1}`, formId)}
  <div class="form-grid">
    <div class="field"><label for="${formId}-company">Company name <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-company" name="company_name" autocomplete="organization" required></div>
    <div class="field"><label for="${formId}-contact">Contact name <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-contact" name="contact_name" autocomplete="name" required></div>
    <div class="field"><label for="${formId}-email">Work email</label><input id="${formId}-email" name="work_email" type="email" inputmode="email" autocomplete="email"></div>
    <div class="field"><label for="${formId}-phone">Phone <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>
    <div class="field"><label for="${formId}-building">Building type</label><select id="${formId}-building" name="building_type"><option value="">Select building type</option>${page.propertyTypes.map((item) => `<option>${escapeHtml(item)}</option>`).join('')}<option>Other commercial property</option></select></div>
    <div class="field"><label for="${formId}-service">Service requested <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-service" name="service_requested" value="${escapeAttribute(page.h1)}" required></div>
    <div class="field"><label for="${formId}-count">Approximate doors or openings</label><input id="${formId}-count" name="opening_count" type="number" inputmode="numeric" min="1" step="1"></div>
    <div class="field"><label for="${formId}-location">City or ZIP <span class="required-mark" aria-hidden="true">*</span></label><input id="${formId}-location" name="service_location" autocomplete="postal-code" required></div>
    <div class="field"><label for="${formId}-date">Preferred date</label><input id="${formId}-date" name="preferred_date" type="date"></div>
    <div class="field"><label for="${formId}-photos">Optional photos</label><input id="${formId}-photos" name="attachments" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple></div>
    <div class="field field-full"><label for="${formId}-message">Project details</label><textarea id="${formId}-message" name="message" placeholder="Describe the openings, known issues, deadline and any report, access or coordination requirements."></textarea></div>
  </div>
  ${qualificationNotice('form')}
  <button class="button button-primary" type="submit">Request a Commercial Service Quote</button>
  <p class="form-note">Submitting the form is a request, not a confirmed appointment. Scope, documentation and availability are confirmed separately. See the <a href="/privacy-policy">privacy policy</a>.</p>
  <p class="form-status" data-form-status role="status" aria-live="polite"></p>
</form>`;
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
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  ${business.siteVerification?.google ? `<meta name="google-site-verification" content="${escapeAttribute(business.siteVerification.google)}">` : ''}
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
  <link rel="preload" as="image" href="${escapeAttribute(webpSource(image.src))}" type="image/webp" fetchpriority="high">
  <link rel="stylesheet" href="/assets/site.css?v=${assetVersion}">
  <script type="application/ld+json">${jsonScript(schema)}</script>
  <script src="/assets/business-config.js?v=${assetVersion}" defer></script>
  <script src="/assets/site.js?v=${assetVersion}" defer></script>
</head>`;
}

function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: business.publicName,
    url: `${origin}/`,
    logo: absolute('/assets/locksmith.png'),
    telephone: phone.e164,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone.e164,
      contactType: 'commercial service inquiries',
      areaServed: ['US-DC', 'US-VA', 'US-MD'],
      availableLanguage: ['en']
    },
    areaServed: business.serviceAreas.map((area) => ({ '@type': 'AdministrativeArea', name: area.name }))
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
      <section><h2 class="brand">DC Emergency <span>Lock &amp; Door</span></h2><p>Commercial door, lock and life-safety hardware service for businesses and commercial properties in Washington DC and nearby service areas.</p>${callButton('Call Commercial Dispatch', 'footer')}</section>
      <nav class="footer-links" aria-label="Commercial services"><h3>Commercial services</h3><a href="/commercial-door-repair-washington-dc">Emergency commercial door repair</a><a href="/commercial-locksmith-washington-dc">Commercial locksmith</a><a href="/panic-bar-repair-washington-dc">Panic bar repair</a><a href="/door-closer-repair-washington-dc">Door closer repair</a><a href="/fire-door-inspection-washington-dc">Fire door inspection</a></nav>
      <nav class="footer-links" aria-label="Service areas and resources"><h3>Areas &amp; resources</h3><a href="/washington-dc">Washington DC</a><a href="/northern-virginia">Nearby Northern Virginia</a><a href="/maryland">Nearby Maryland</a><a href="/blog">Commercial door resources</a><a href="/gallery">Commercial hardware photos</a><a href="/about">About this service</a><a href="/privacy-policy">Privacy policy</a><a href="/terms-of-service">Terms of service</a><a href="/sitemap">Sitemap</a></nav>
    </div>
    <a class="paid-privacy" href="/privacy-policy">Privacy policy</a>
    <div class="footer-bottom"><span>© <span data-current-year>2026</span> ${escapeHtml(business.publicName)}.</span><span>Commercial door, lock and hardware service.</span></div>
  </div>
</footer>`;
}

function stickyCall() {
  return `<a class="sticky-mobile-call" href="tel:${escapeAttribute(phone.e164)}" data-component="StickyMobileCallBar" data-business-phone-link data-dynamic-number-eligible data-cta-location="sticky" aria-label="Call ${phone.display}">Call <span data-business-phone>${escapeHtml(phone.display)}</span></a>`;
}

function renderFaqs(faqs) {
  return `<div class="faq-list">${faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div>`;
}

function renderRelated(related) {
  return `<div class="inline-links">${related.map((link) => `<a href="${escapeAttribute(link.href)}">${escapeHtml(link.label)}</a>`).join('')}</div>`;
}

function servicePage(page) {
  const currentPath = `/${page.slug}`;
  const urgentHeroForm = page.slug === 'commercial-door-repair-washington-dc';
  const pageForm = page.form === 'scheduled' ? scheduledForm(page) : emergencyForm(page);
  const heroSecondaryHref = urgentHeroForm ? '#service-request' : '#service-request';
  const heroSide = urgentHeroForm
    ? `<aside class="hero-form" id="hero-request"><figure class="hero-form-photo"><picture><source srcset="${escapeAttribute(webpSource(page.heroImage.src))}" type="image/webp"><img src="${escapeAttribute(page.heroImage.src)}" width="${page.heroImage.width}" height="${page.heroImage.height}" alt="${escapeAttribute(page.heroImage.alt)}" decoding="async" fetchpriority="high"></picture><figcaption>${escapeHtml(page.heroImage.caption)}</figcaption></figure><h2>Request emergency commercial service</h2>${emergencyForm(page, true)}</aside>`
    : heroImage(page.heroImage);

  return `${head({ title: page.title, description: page.description, pathName: currentPath, image: page.heroImage, schema: serviceSchema(page) })}
<body class="has-sticky-call" data-service="${escapeAttribute(page.service)}" data-location="Washington DC" data-intent="${escapeAttribute(page.intent)}">
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
        <div class="hero-actions">${page.intent === 'scheduled' ? `<a class="button button-primary" href="${heroSecondaryHref}">Request Scheduled Service</a>${callButton('Call About This Commercial Service', 'hero', true)}` : `${callButton('Call for Commercial Emergency Dispatch', 'hero')}${photoCta(heroSecondaryHref, 'hero')}`}</div>
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
      <div class="section-heading"><p class="eyebrow" style="color:#bcdcff">What happens next</p><h2>${page.intent === 'scheduled' ? 'How a scheduled request moves forward' : 'How a commercial service request moves forward'}</h2><p>Call or use the service-page request form. The request is reviewed and the available next step is confirmed directly.</p></div>
      <ol class="steps">${page.process.map((step) => `<li><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join('')}</ol>
    </div>
  </section>
  <section class="section" data-paid-hide>
    <div class="wrap grid-2">
      <div><p class="eyebrow">Commercial property types</p><h2>Built for facility and business needs</h2>${formatList(page.propertyTypes)}${qualificationNotice('property_types')}</div>
      <aside class="callout"><h3>Related commercial services</h3><p>Use the page that best matches the failed component or planned project.</p>${renderRelated(page.related)}</aside>
    </div>
  </section>
  <section class="section section-alt" id="service-request">
    <div class="wrap grid-2">
      <div><p class="eyebrow">Request service</p><h2>${page.form === 'scheduled' ? 'Request a scoped commercial service quote' : 'Send a short commercial service request'}</h2><p>${page.form === 'scheduled' ? 'Include the building type, approximate number of openings and any deadline or documentation requirement.' : 'For an active security or egress issue, calling is the fastest way to explain the condition. The form is available when a photo will help.'}</p>${page.form === 'scheduled' ? callButton('Call to Discuss the Project', 'form', true) : callButton('Call for Commercial Emergency Dispatch', 'form')}</div>
      <div class="form-panel">${pageForm}</div>
    </div>
  </section>
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial FAQ</p><h2>Questions about this commercial service</h2></div>${renderFaqs(page.faqs)}</div>
  </section>
  <section class="section final-cta"><div class="wrap"><h2>${page.intent === 'scheduled' ? 'Ready to define the commercial scope?' : 'Is the commercial opening unsafe or unsecured?'}</h2><p>${page.intent === 'scheduled' ? 'Commercial installation, inspection and planned repair service for businesses and managed properties.' : 'Commercial door, lock and hardware repair service for businesses and managed properties.'}</p><div class="button-row">${page.intent === 'scheduled' ? `<a class="button button-primary" href="#service-request">Request Scheduled Service</a>${callButton('Call About the Project', 'body', true)}` : `${callButton('Call Commercial Dispatch', 'body')}${photoCta('#service-request', 'body')}`}</div></div></section>
</main>
${footer()}
${stickyCall()}
</body>
</html>`;
}

const homeImage = {
  src: '/assets/img-956a4955d1ddb21c.jpg',
  width: 525,
  height: 700,
  alt: 'Commercial exit door with panic bar and door closer hardware',
  caption: 'Commercial exit hardware shown; the image location is not published.'
};

const homeFaqs = [
  {
    question: 'What commercial door and locksmith services are available?',
    answer: 'Services include commercial door repair, business lock and rekey work, panic bars, exit devices, door closers, fire door requests, door installation and access-control door coordination.'
  },
  {
    question: 'Can I call about a door or lock problem?',
    answer: 'Yes. Call and describe the door, lock or hardware problem so the service request can be reviewed.'
  },
  {
    question: 'How do I request planned commercial service?',
    answer: 'Call to discuss inspections, installation, rekeying, access-control door work or another planned commercial project.'
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
        name: 'Commercial Door Repair & Locksmith Washington DC',
        description: 'Commercial door, panic bar, closer and lock repair for businesses in Washington DC. Call 703-244-0559 for commercial dispatch.',
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
    { src: '/assets/img-94ae8ed1d777b872.jpg', width: 525, height: 700, alt: 'Commercial door with panic hardware', caption: 'Commercial panic and exit hardware. Client and location are not identified.' },
    { src: '/assets/img-9e19b3ab02e1d2d8.jpg', width: 525, height: 700, alt: 'Commercial door closer hardware', caption: 'Commercial door closer and opening hardware. Client and location are not identified.' },
    { src: '/assets/img-af734f238d1e0eb7.jpg', width: 394, height: 700, alt: 'Commercial lock cylinders and hardware', caption: 'Commercial lock cylinders. Client and location are not identified.' }
  ];
  return photos.map((photo) => `<figure class="photo-card"><picture><source srcset="${webpSource(photo.src)}" type="image/webp"><img src="${photo.src}" width="${photo.width}" height="${photo.height}" alt="${escapeAttribute(photo.alt)}" loading="lazy" decoding="async"></picture><figcaption>${escapeHtml(photo.caption)}</figcaption></figure>`).join('');
}

function homepage() {
  return `${head({
    title: 'Commercial Door Repair & Locksmith Washington DC',
    description: 'Commercial door, panic bar, closer and lock repair in Washington DC. Call 703-244-0559 for commercial door and locksmith service.',
    pathName: '/',
    image: homeImage,
    schema: homeSchema()
  })}
<body class="has-sticky-call" data-service="commercial_door_and_locksmith" data-location="Washington DC">
${header()}
<main id="main-content">
  <section class="hero">
    <div class="hero-grid wrap">
      <div class="hero-copy">
        ${commercialBadge()}
        <p class="eyebrow" style="color:#bcdcff">Washington DC commercial service</p>
        <h1>Emergency Commercial Door Repair &amp; Locksmith in Washington DC</h1>
        <p class="hero-subtitle">Fast help for failed commercial locks, panic bars, exit devices, door closers and doors that will not close, latch or secure.</p>
        <div class="hero-actions">${compactCallButton('hero')}<a class="button button-secondary" href="#services">View Commercial Services</a></div>
        <p class="service-area-line">Washington DC first · Nearby Northern Virginia · Nearby Maryland</p>
      </div>
      ${heroImage(homeImage)}
    </div>
  </section>
  ${trustBar()}
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Choose the problem</p><h2>What is the commercial door doing?</h2><p>Start with the symptom. Each option opens the page built for that specific repair or project.</p></div><div class="problem-grid">${homeProblems.map(([label, href, service]) => `<a class="problem-card" href="${href}" data-service-card="${service}"><span class="icon-box" aria-hidden="true">!</span><span>${escapeHtml(label)}</span></a>`).join('')}</div></div>
  </section>
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
    ])}</div><aside class="callout"><h3>Commercial lock and door service</h3><p>We work on commercial locks, cylinders, rekeys, master-key systems and business entry doors throughout the Washington DC service area.</p>${callButton('Call About Commercial Service', 'body')}</aside></div>
  </section>
  <section class="section section-navy">
    <div class="wrap"><div class="section-heading"><p class="eyebrow" style="color:#bcdcff">Life-safety hardware</p><h2>Panic bars, exit devices, closers and fire doors</h2><p>Repair pages diagnose existing failures. Installation and inspection-request pages use a scheduled scope so the call to action matches the buyer’s task.</p></div><div class="grid-3">${serviceCard('Fire door inspection request', 'Scheduled opening counts, scope preparation and provider-qualification confirmation.', '/fire-door-inspection-washington-dc', 'fire_door_inspection')}${serviceCard('Exit device repair', 'Commercial exit device diagnosis for rim, mortise and vertical-rod configurations.', '/exit-device-repair-washington-dc', 'exit_device_repair')}${serviceCard('Panic bar installation', 'Assessment for new, replacement and retrofit panic or exit hardware.', '/panic-bar-installation-washington-dc', 'panic_bar_installation')}</div></div>
  </section>
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Planned installation and security</p><h2>Coordinate doors, frames, hardware and controlled entry</h2><p>Planned projects begin with measurements, opening counts, building constraints and clear trade responsibilities.</p></div><div class="grid-3">${serviceCard('Commercial door installation', 'Door/frame measurement, replacement planning and hardware coordination.', '/commercial-door-installation-washington-dc', 'commercial_door_installation')}${serviceCard('Commercial access control', 'Door-side locks, strikes, exit hardware and integrator coordination.', '/access-control-systems-washington-dc', 'access_control')}${serviceCard('Fire door repair', 'Known closing, latching, hardware or inspection-deficiency correction needs.', '/fire-door-repair-washington-dc', 'fire_door_repair')}</div></div>
  </section>
  <section class="section section-alt">
    <div class="wrap grid-2"><div><p class="eyebrow">Property and facility managers</p><h2>Send the operational context with the work request</h2><p>Include the work-order reference, access contact, opening identifier, approval limits, billing requirements and requested documentation. Availability of written estimates, COI, W-9, invoicing or recurring programs is not assumed and must be confirmed before scheduling.</p></div><article class="card"><h3>Useful request details</h3>${formatList(['Property or company name', 'Exact opening and service location', 'Onsite contact and access window', 'Security or egress impact', 'Photos and existing report items', 'Required estimate or documentation format'])}</article></div>
  </section>
  <section class="section">
    <div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial door photos</p><h2>Identify the hardware before the service conversation</h2><p>These existing site images show commercial hardware. They are not presented as client case studies, reviews or location-verified completed jobs.</p></div><div class="photo-grid">${photoCards()}</div></div>
  </section>
  <section class="section">
    <div class="wrap grid-2"><div><p class="eyebrow">Service area</p><h2>Washington DC is the priority</h2><p>Requests are reviewed first for Washington DC, then nearby Northern Virginia and nearby Maryland. The exact commercial address or ZIP is required to confirm availability.</p></div><div class="grid-3">${serviceCard('Washington DC', 'Primary commercial door and locksmith service area.', '/washington-dc', 'washington_dc')}${serviceCard('Northern Virginia', 'Nearby Northern Virginia commercial service requests.', '/northern-virginia', 'northern_virginia')}${serviceCard('Maryland', 'Nearby Maryland commercial service requests.', '/maryland', 'maryland')}</div></div>
  </section>
  <section class="section section-alt"><div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial FAQ</p><h2>Commercial service questions</h2></div>${renderFaqs(homeFaqs)}</div></section>
  <section class="section final-cta"><div class="wrap"><h2>Commercial door and locksmith service in Washington DC</h2><p>Call for commercial door repair, lock service, panic hardware, closers, rekeys and planned door projects.</p><div class="button-row">${callButton('Call Commercial Door & Locksmith Service', 'body')}<a class="button button-secondary" href="#services">View Commercial Services</a></div></div></section>
</main>
${footer()}
${stickyCall()}
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
    title: 'Commercial Door & Locksmith Services Washington DC',
    description: 'Commercial door repair, panic hardware, closer, lock, rekey, fire door and installation services for Washington DC business properties.',
    h1: 'Commercial Door & Locksmith Services in Washington DC',
    subtitle: 'The primary service-area hub for Washington DC businesses, facilities and managed properties.',
    image: homeImage,
    areas: ['Downtown and central business districts', 'Northwest, Northeast, Southwest and Southeast DC', 'Commercial offices and managed buildings', 'Retail, restaurant, education, medical and warehouse properties']
  },
  {
    slug: 'northern-virginia',
    service: 'northern_virginia_commercial_service',
    location: 'Nearby Northern Virginia',
    title: 'Commercial Door & Locksmith Services Northern Virginia',
    description: 'Request commercial door, lock, panic hardware, closer and fire door service for nearby Northern Virginia business and managed properties.',
    h1: 'Commercial Door & Locksmith Service in Northern Virginia',
    subtitle: 'Commercial service requests for nearby Northern Virginia businesses and managed properties. Exact location is required to confirm availability.',
    image: {
      src: '/assets/img-ac0dc74c141fc9b7.jpg',
      width: 525,
      height: 700,
      alt: 'Commercial exterior doors and metal frames',
      caption: 'Commercial door and frame hardware shown; the image location is not published.'
    },
    areas: ['Alexandria commercial properties', 'Arlington commercial properties', 'Nearby Northern Virginia offices and retail', 'Managed buildings, schools, medical facilities and warehouses']
  },
  {
    slug: 'maryland',
    service: 'maryland_commercial_service',
    location: 'Nearby Maryland',
    title: 'Commercial Door & Locksmith Services Maryland',
    description: 'Request commercial door, lock, panic hardware, closer and fire door service for nearby Maryland businesses and managed properties.',
    h1: 'Commercial Door & Locksmith Service in Nearby Maryland',
    subtitle: 'Commercial service requests for nearby Maryland businesses and managed properties. Exact city or ZIP is required to confirm availability.',
    image: {
      src: '/assets/img-466c8958117610c9.jpg',
      width: 900,
      height: 506,
      alt: 'Commercial entry door and threshold area',
      caption: 'Commercial entry opening shown; the image location is not published.'
    },
    areas: ['Bethesda-area commercial properties', 'Silver Spring-area commercial properties', 'Nearby Maryland offices and retail', 'Managed buildings, schools, medical facilities and warehouses']
  }
];

const locationServiceLinks = [
  { title: 'Emergency commercial door repair', description: 'Doors that will not close, latch or secure; frame, hinge, closer and break-in problems.', href: '/commercial-door-repair-washington-dc', service: 'commercial_door_repair' },
  { title: 'Commercial locksmith', description: 'Business lockouts, commercial locks, rekeys, cylinders and key-control planning.', href: '/commercial-locksmith-washington-dc', service: 'commercial_locksmith' },
  { title: 'Panic bar repair', description: 'Stuck bars, failed latch retraction, strike alignment and relatching problems.', href: '/panic-bar-repair-washington-dc', service: 'panic_bar_repair' },
  { title: 'Door closer repair', description: 'Leaking, slamming, slow-closing or non-latching commercial door closers.', href: '/door-closer-repair-washington-dc', service: 'door_closer_repair' },
  { title: 'Fire door inspection request', description: 'Scheduled opening counts, scope preparation and provider-qualification confirmation.', href: '/fire-door-inspection-washington-dc', service: 'fire_door_inspection' },
  { title: 'Commercial door installation', description: 'Door and frame measurement, replacement planning and hardware coordination.', href: '/commercial-door-installation-washington-dc', service: 'commercial_door_installation' }
];

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
<body class="has-sticky-call" data-service="${escapeAttribute(page.service)}" data-location="${escapeAttribute(page.location)}">
${header()}
<main id="main-content">
  <section class="hero"><div class="hero-grid wrap"><div class="hero-copy">${breadcrumbs(page.h1, currentPath, null)}${commercialBadge()}<p class="eyebrow" style="color:#bcdcff">Commercial service area</p><h1>${escapeHtml(page.h1)}</h1><p class="hero-subtitle">${escapeHtml(page.subtitle)}</p><div class="hero-actions">${callButton('Call Commercial Dispatch', 'hero')}${photoCta('#area-request', 'hero')}</div></div>${heroImage(page.image)}</div></section>
  ${trustBar()}
  <section class="section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Commercial services</p><h2>Choose the failed opening or planned project</h2><p>Each service page explains a distinct buyer problem. The request form still needs the exact commercial location to confirm coverage.</p></div><div class="grid-3">${locationServiceLinks.map((item) => serviceCard(item.title, item.description, item.href, item.service)).join('')}</div></div></section>
  <section class="section section-alt"><div class="wrap grid-2"><div><p class="eyebrow">Area context</p><h2>Commercial properties in ${escapeHtml(page.location)}</h2><p>This page is a regional service hub, not a substitute for the page describing the actual door, lock or hardware problem.</p>${formatList(page.areas)}</div><aside class="callout"><h3>What to include</h3>${formatList(['Business or organization name', 'Exact city, ZIP and service address', 'Affected door and hardware type', 'Whether the opening closes, latches and secures', 'Onsite contact and access window', 'Photo when it can be shared safely'])}${qualificationNotice('service_area')}</aside></div></section>
  <section class="section" id="area-request"><div class="wrap grid-2"><div><p class="eyebrow">Request commercial service</p><h2>Send the exact service location</h2><p>The regional name alone is not enough to confirm availability. Include the city or ZIP and the affected commercial opening.</p>${callButton('Call Commercial Dispatch', 'form')}</div><div class="form-panel">${emergencyForm(formConfig)}</div></div></section>
  <section class="section final-cta"><div class="wrap"><h2>Need help with a commercial door or lock?</h2><p>Commercial door, lock and hardware service is available throughout this service area.</p><div class="button-row">${callButton('Call Commercial Dispatch', 'body')}${photoCta('#area-request', 'body')}</div></div></section>
</main>${footer()}${stickyCall()}</body></html>`;
}

function supportPage({ slug, title, description, h1, eyebrow, bodyHtml, image = homeImage, robots = 'index,follow,max-image-preview:large', service = 'site_information', sticky = false, type = 'WebPage' }) {
  const currentPath = slug ? `/${slug}` : '/';
  return `${head({ title, description, pathName: currentPath, image, schema: simpleSchema(title, description, currentPath, type, h1), robots })}
<body class="${sticky ? 'has-sticky-call' : ''}" data-service="${escapeAttribute(service)}" data-location="Washington DC service area">
${header()}
<main id="main-content">
  <section class="hero"><div class="hero-grid wrap"><div class="hero-copy">${slug ? breadcrumbs(h1, currentPath, null) : ''}${commercialBadge()}<p class="eyebrow" style="color:#bcdcff">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(h1)}</h1><p class="hero-subtitle">${escapeHtml(description)}</p></div>${heroImage(image)}</div></section>
  ${bodyHtml}
</main>${footer()}${sticky ? stickyCall() : ''}</body></html>`;
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
    bodyHtml: `${trustBar()}<section class="section"><div class="wrap grid-2"><div><p class="eyebrow">Commercial service</p><h2>Door, lock and hardware work for commercial properties</h2><p>The service pages cover work for property managers, facility managers, building engineers, commercial landlords, offices, retail stores, restaurants, schools, medical facilities, warehouses, general contractors and multifamily property-management companies.</p></div><article class="card"><h3>Primary work categories</h3>${formatList(['Commercial door repair', 'Business lockouts, locks and rekeys', 'Panic bars and exit devices', 'Door closers', 'Fire door inspection and repair requests', 'Commercial door installation and access-control coordination'])}</article></div></section><section class="section section-alt"><div class="wrap grid-2"><div><p class="eyebrow">Verified public information</p><h2>What this site can state today</h2><p>The configured public name is ${escapeHtml(business.publicName)}, the consistent site phone is ${escapeHtml(phone.display)}, and the priority area is Washington DC with nearby Northern Virginia and Maryland.</p><p>License, insurance, hours, response time, W-9, COI, written estimates, commercial invoicing, social profiles and other trust claims are intentionally not displayed until the business confirms them.</p></div><aside class="callout"><h3>Request service</h3><p>Use the page matching the failed hardware or planned project, or call about the door or lock condition.</p>${callButton('Call Commercial Dispatch', 'body')}</aside></div></section>`
  });
}

function galleryPage() {
  const images = business.existingPhotos.map((photo) => `<figure class="photo-card"><picture><source srcset="${escapeAttribute(webpSource(photo.src))}" type="image/webp"><img src="${escapeAttribute(photo.src)}" width="${photo.width}" height="${photo.height}" alt="${escapeAttribute(photo.subject)}" loading="lazy" decoding="async"></picture><figcaption>${escapeHtml(photo.subject)}. Client, property and exact location are not identified.</figcaption></figure>`).join('');
  return supportPage({
    slug: 'gallery',
    title: 'Commercial Door & Lock Hardware Photos | Washington DC',
    description: 'Reference photos of commercial doors, panic hardware, closers, locks and access-control openings. Client and exact location details are not published.',
    h1: 'Commercial Door & Lock Hardware Photos',
    eyebrow: 'Existing site photo library',
    service: 'commercial_hardware_gallery',
    sticky: true,
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Photo-use policy</p><h2>Commercial hardware without invented job stories</h2><p>These images were already present in the site repository. They are shown as hardware references only. They are not presented as customer testimonials, location-verified projects, recent work or proof of a particular outcome.</p></div><div class="photo-grid">${images}</div></div></section><section class="section final-cta"><div class="wrap"><h2>Have a photo of the failed commercial opening?</h2><p>Attach it to the short request form on the relevant repair page.</p><div class="button-row">${callButton('Call Commercial Dispatch', 'body')}<a class="button button-secondary" href="/commercial-door-repair-washington-dc#service-request" data-photo-cta>Send a Door Photo</a></div></div></section>`
  });
}

function privacyPage() {
  return supportPage({
    slug: 'privacy-policy',
    title: `Privacy Policy | ${business.publicName}`,
    description: 'Privacy information for commercial service forms, phone-click measurement, campaign attribution and optional photo uploads on this website.',
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
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><h2>Information submitted for commercial service</h2><p>Service forms may collect a business or organization name, contact name, phone number, work email when supplied, service location, building type, requested service, opening count, preferred date, message and optional image files. Do not upload images containing people, IDs, access credentials, confidential documents or information unrelated to the door or hardware.</p><p><strong>Policy review status:</strong> the legal business identity, effective date, dedicated privacy contact, retention terms and required consent language still need owner or legal approval before deployment.</p></div><div class="grid-2"><article class="card"><h3>Attribution and measurement</h3><p>The site stores landing page, referrer, UTM parameters and the presence/value of advertising click identifiers such as gclid, gbraid and wbraid in the browser session and copies them into submitted forms. Phone and CTA clicks may be placed in a local data layer; they are not treated as booked jobs.</p></article><article class="card"><h3>Form processor</h3><p>Forms currently post to the FormSubmit endpoint configured in this repository and deliver to the configured recipient. That recipient and the business’s retention, deletion and access-request process require owner confirmation. Avoid sending sensitive data through the form.</p></article><article class="card"><h3>Third-party tools</h3><p>The existing configuration loads Ahrefs Web Analytics after the page load. Its continued use and the corresponding disclosure or consent requirements need owner or legal review. GTM, GA4, Google Ads and call-tracking IDs are not active; this policy must be updated before those tools are enabled.</p></article><article class="card"><h3>Questions</h3><p>Call <a href="tel:${phone.e164}" data-business-phone-link data-cta-location="body"><span data-business-phone>${phone.display}</span></a> with privacy questions. Legal business identity, mailing address and a dedicated privacy contact still require confirmation.</p></article></div></div></section>`
  });
}

function termsPage() {
  return supportPage({
    slug: 'terms-of-service',
    title: `Website Terms | ${business.publicName}`,
    description: 'Website terms for requesting commercial door, lock, inspection and installation service. Form submission does not confirm dispatch or an appointment.',
    h1: 'Website Terms of Service',
    eyebrow: 'Commercial service requests',
    service: 'terms',
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><h2>Website requests are not confirmed appointments</h2><p>Submitting a form or clicking a phone link does not guarantee dispatch, arrival time, price, scope, parts availability, inspection result or appointment. Service availability and the authorized commercial scope must be confirmed directly.</p></div><div class="grid-2"><article class="card"><h3>Commercial authorization</h3><p>The requester should be authorized to seek work for the business or property and should provide accurate access, opening and contact information.</p></article><article class="card"><h3>Photos and files</h3><p>Only submit files the requester is allowed to share. Do not include people, credentials, confidential documents or unrelated personal information.</p></article><article class="card"><h3>Inspection and code information</h3><p>General website information is not legal, engineering or authority approval. Applicable requirements and final acceptance are project-specific.</p></article><article class="card"><h3>Verified scope controls</h3><p>License, insurance, hours, response times, documentation, payment terms and project capabilities are not promised by this website unless included in an approved service agreement.</p></article></div>${qualificationNotice('terms')}</div></section>`
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
    bodyHtml: `<section class="section"><div class="wrap"><div class="section-heading"><h2>Diagnose the question, then choose the service page</h2><p>Articles are informational. They should direct a reader to one relevant transactional page without presenting general guidance as a site inspection or code decision.</p></div><div class="grid-3">${entries.map((entry) => `<article class="card"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.description)}</p><a class="card-link" href="${escapeAttribute(entry.href)}">Read the guide →</a></article>`).join('')}</div></div></section>`
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
    bodyHtml: `<section class="section"><div class="wrap grid-2"><div><h2>Choose the closest commercial service</h2>${renderRelated([{ href: '/commercial-door-repair-washington-dc', label: 'Emergency commercial door repair' }, { href: '/commercial-locksmith-washington-dc', label: 'Commercial locksmith' }, { href: '/panic-bar-repair-washington-dc', label: 'Panic bar repair' }, { href: '/door-closer-repair-washington-dc', label: 'Door closer repair' }, { href: '/fire-door-inspection-washington-dc', label: 'Fire door inspection' }])}</div><aside class="callout"><h3>Active commercial security problem?</h3><p>Call for commercial door, lock and hardware service.</p>${callButton('Call Commercial Dispatch', 'body')}</aside></div></section>`
  });
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
  ['404.html', notFoundPage()]
].forEach(([file, content]) => {
  if (writeIfChanged(path.join(root, file), content)) changed += 1;
});

console.log(`Built ${allServicePages.length + locationPages.length + 8} canonical/support pages; ${changed} files changed.`);
