import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://dcemergencylockanddoor.com';
const PHONE_RAW = '7032440559';
const PHONE_LABEL = '703-244-0559';
const LASTMOD = '2026-05-07';
const FORM_SUBMIT_ENDPOINT = 'https://formsubmit.co/dclockanddoor@gmail.com';

const SOCIAL = [
  'https://x.com/dcemergencylock',
  'https://www.linkedin.com/company/dc-emergency-lock-and-door',
  'https://www.youtube.com/@dcemergencylockanddoor',
  'https://www.facebook.com/profile.php?id=61574339060945'
];

const CITIES = [
  {
    slug: 'washington-dc',
    hubPath: 'city-washington-dc',
    name: 'Washington DC',
    locality: 'Washington',
    region: 'DC',
    postalCode: '20001',
    neighborhoods: ['Downtown', 'Dupont Circle', 'Georgetown', 'Capitol Hill', 'Navy Yard', 'NoMa', 'Foggy Bottom', 'Adams Morgan']
  },
  {
    slug: 'arlington-va',
    hubPath: 'locksmith-arlington-va',
    name: 'Arlington VA',
    locality: 'Arlington',
    region: 'VA',
    postalCode: '22201',
    neighborhoods: ['Rosslyn', 'Clarendon', 'Ballston', 'Courthouse', 'Crystal City', 'Pentagon City', 'Columbia Pike']
  },
  {
    slug: 'alexandria-va',
    hubPath: 'locksmith-alexandria-va',
    name: 'Alexandria VA',
    locality: 'Alexandria',
    region: 'VA',
    postalCode: '22314',
    neighborhoods: ['Old Town', 'Del Ray', 'Carlyle', 'Eisenhower East', 'Potomac Yard', 'West End', 'King Street Corridor']
  },
  {
    slug: 'bethesda-md',
    hubPath: 'bethesda-md-commercial-locksmith',
    name: 'Bethesda MD',
    locality: 'Bethesda',
    region: 'MD',
    postalCode: '20814',
    neighborhoods: ['Downtown Bethesda', 'Woodmont Triangle', 'Friendship Heights', 'North Bethesda', 'Bradley Hills', 'Westbard']
  },
  {
    slug: 'silver-spring-md',
    hubPath: 'silver-spring-md-commercial-locksmith',
    name: 'Silver Spring MD',
    locality: 'Silver Spring',
    region: 'MD',
    postalCode: '20910',
    neighborhoods: ['Downtown Silver Spring', 'Four Corners', 'Takoma Park Edge', 'Wheaton', 'White Oak', 'Long Branch']
  }
];

const SERVICES = [
  {
    slug: 'commercial-locksmith',
    label: 'Commercial Locksmith',
    serviceType: 'Commercial Locksmith',
    kicker: '24/7 Business Lock and Door Security',
    image: 'img-af734f238d1e0eb7.jpg',
    title: (city) => `Commercial Locksmith ${city.name} | 24/7 Business Lock Service`,
    description: (city) =>
      `Need a commercial locksmith in ${city.name}? Fast lockouts, business rekeys, lock changes, and master key support with same-day service. Call ${PHONE_LABEL}.`,
    hero: (city) =>
      `When your business cannot wait, we dispatch licensed commercial locksmith technicians across ${city.name} for lockouts, rekeys, lock changes, and urgent security resets.`,
    problems: [
      'Commercial lockout before opening hours',
      'Employee termination rekey requests',
      'Master key system confusion across suites',
      'Storefront lock not turning or not latching',
      'Emergency lock change after attempted break-in'
    ],
    brands: ['Schlage', 'Medeco', 'Corbin Russwin', 'Sargent', 'BEST'],
    testimonial: {
      quote:
        'Our office lockout was resolved quickly, then they rekeyed the suite the same visit so we could reopen without losing the day.',
      byline: 'Operations Manager'
    },
    faq: (city) => [
      [`Do you offer emergency commercial locksmith service in ${city.name}?`, `Yes. We provide 24/7 emergency dispatch for lockouts, lock failures, and urgent security issues across ${city.name}.`],
      ['Can you rekey after employee turnover?', 'Yes. Commercial rekey after employee termination is one of our most requested same-day services.'],
      ['Can you build or expand a master key system?', 'Yes. We design practical master key hierarchies for offices, retail units, and managed properties.'],
      ['Do you work with property managers and facility teams?', 'Yes. We regularly support recurring service programs for property managers and building operations teams.']
    ]
  },
  {
    slug: 'emergency-commercial-locksmith',
    label: 'Emergency Commercial Locksmith',
    serviceType: 'Emergency Commercial Locksmith',
    kicker: 'Fast Response for Urgent Business Lock Problems',
    image: 'img-956a4955d1ddb21c.jpg',
    title: (city) => `Emergency Commercial Locksmith ${city.name} | 24/7 Fast Response`,
    description: (city) =>
      `Emergency commercial locksmith in ${city.name} for lockouts, failed locks, and urgent door security problems. Technician available 24/7. Call ${PHONE_LABEL}.`,
    hero: (city) =>
      `Locked out, lock failed, or security compromised? Our emergency commercial locksmith team responds across ${city.name} with same-day and after-hours service.`,
    problems: [
      'Emergency commercial lockout with staff waiting onsite',
      'Storefront door not locking after close',
      'Key snapped in cylinder during business hours',
      'After-hours break-in security reset',
      'Urgent lock replacement before opening'
    ],
    brands: ['Schlage', 'Adams Rite', 'Medeco', 'Yale', 'Arrow'],
    testimonial: {
      quote:
        'We called after a break-in and had a tech onsite fast. They secured the front door and rekeyed the building right away.',
      byline: 'Retail Store Owner'
    },
    faq: (city) => [
      [`How quickly can you respond in ${city.name}?`, 'Response time depends on traffic and queue, but emergency dispatch is available 24/7 with same-day coverage.'],
      ['Do you provide after-hours locksmith service?', 'Yes. Nights, weekends, and holiday emergency commercial calls are supported.'],
      ['Can you secure the property after a break-in?', 'Yes. We provide emergency lock changes, rekeys, and temporary security stabilization.'],
      ['Do you service offices, restaurants, and retail?', 'Yes. We handle emergency commercial locksmith calls across office, retail, restaurant, and mixed-use properties.']
    ]
  },
  {
    slug: 'panic-bar-repair',
    label: 'Panic Bar Repair',
    serviceType: 'Panic Bar Repair',
    kicker: 'Same-Day Exit Device and Crash Bar Repair',
    image: 'img-94ae8ed1d777b872.jpg',
    title: (city) => `Panic Bar Repair ${city.name} | Same-Day Exit Device Service`,
    description: (city) =>
      `Panic bar repair ${city.name} for stuck crash bars, failed exit devices, and code-focused commercial door fixes. Same-day emergency service available.`,
    hero: (city) =>
      `When an exit device fails, you need a fast and code-aware repair. We service panic bars and crash bars across ${city.name} for offices, schools, and retail sites.`,
    problems: [
      'Panic bar stuck and door will not open cleanly',
      'Exit device latch not retracting or relatching',
      'Panic bar code violation during inspection',
      'Loose touch bar and misaligned strike',
      'Emergency exit door hardware failure during business hours'
    ],
    brands: ['Von Duprin', 'Falcon', 'Detex', 'SARGENT', 'DORMAKABA'],
    testimonial: {
      quote:
        'Our panic bar failed before lunch rush. They repaired the device same day and confirmed the door latched correctly again.',
      byline: 'Restaurant Manager'
    },
    faq: (city) => [
      [`Do you repair panic bars and exit devices in ${city.name}?`, `Yes. We repair and replace panic bars, crash bars, and exit devices across ${city.name}.`],
      ['Can you fix a panic bar that is stuck closed?', 'Yes. We diagnose latch, alignment, and internal device issues and restore operation quickly.'],
      ['Do you provide emergency panic bar repair?', 'Yes. Emergency same-day service is available when egress hardware fails.'],
      ['Can you help after a failed code inspection?', 'Yes. We address common egress deficiencies and provide practical correction support.']
    ]
  },
  {
    slug: 'exit-device-repair',
    label: 'Exit Device Repair',
    serviceType: 'Exit Device Repair',
    kicker: 'Commercial Egress Hardware Service',
    image: 'img-94ae8ed1d777b872.jpg',
    title: (city) => `Exit Device Repair ${city.name} | Emergency Commercial Service`,
    description: (city) =>
      `Exit device repair ${city.name} for rim, mortise, and rod devices. Restore safe egress fast with same-day commercial service.`,
    hero: (city) =>
      `Failed exit hardware creates safety and compliance risk. We repair and replace commercial exit devices across ${city.name} with emergency and scheduled options.`,
    problems: [
      'Rim exit device not retracting latch',
      'Concealed rod device binding or misfiring',
      'Exterior trim failure on high-traffic doors',
      'Exit device dogging not functioning',
      'Door not relatching after push-to-exit use'
    ],
    brands: ['Von Duprin', 'Corbin Russwin', 'SARGENT', 'Yale', 'Falcon'],
    testimonial: {
      quote: 'They diagnosed our exit device issue quickly and replaced worn parts without needing a full door shutdown.',
      byline: 'Facility Supervisor'
    },
    faq: (city) => [
      [`Do you repair all types of exit devices in ${city.name}?`, 'Yes. We service rim, mortise, and vertical rod exit devices for commercial openings.'],
      ['Can you repair instead of replacing the whole device?', 'Often yes, depending on wear level and parts availability.'],
      ['Do you stock common exit hardware brands?', 'Yes. We carry common commercial hardware to speed same-day repairs.'],
      ['Do you offer emergency egress hardware service?', 'Yes. Emergency response is available for urgent exit device failures.']
    ]
  },
  {
    slug: 'door-closer-repair',
    label: 'Door Closer Repair',
    serviceType: 'Door Closer Repair',
    kicker: 'Fix Slamming, Leaking, and Non-Latching Doors',
    image: 'img-9e19b3ab02e1d2d8.jpg',
    title: (city) => `Door Closer Repair ${city.name} | LCN, Norton, Dorma Service`,
    description: (city) =>
      `Door closer repair ${city.name} for leaking closers, slamming doors, and latch failures. Same-day commercial service with code-conscious adjustments.`,
    hero: (city) =>
      `If your commercial door slams, drifts, or will not latch, our technicians restore smooth and secure closing across ${city.name}.`,
    problems: [
      'Door closer leaking oil and losing control',
      'Door slams and damages frame or hardware',
      'Door does not close fully or latch',
      'Backcheck and latch speed out of adjustment',
      'Fire-rated opening not self-closing correctly'
    ],
    brands: ['LCN', 'Norton', 'DORMA', 'RYOBI', 'SARGENT'],
    testimonial: {
      quote:
        'The front entrance closer was leaking and slamming. They replaced and tuned it the same day so customers could enter safely.',
      byline: 'Property Manager'
    },
    faq: (city) => [
      [`Do you handle commercial door closer emergencies in ${city.name}?`, 'Yes. We provide same-day and after-hours response for urgent closer failures.'],
      ['Can a leaking door closer be repaired?', 'In many cases a leaking closer should be replaced because hydraulic pressure cannot be restored reliably.'],
      ['Do you work on fire-rated doors?', 'Yes. We service and adjust closers with fire door compliance in mind.'],
      ['Do you carry LCN and Norton closer parts?', 'Yes. We service common closer brands including LCN, Norton, and Dorma style hardware.']
    ]
  },
  {
    slug: 'commercial-door-repair',
    label: 'Commercial Door Repair',
    serviceType: 'Commercial Door Repair',
    kicker: 'Storefront, Aluminum, and Entry Door Repair',
    image: 'img-3098e185f13f91a0.jpg',
    title: (city) => `Commercial Door Repair ${city.name} | 24/7 Service`,
    description: (city) =>
      `Commercial door repair ${city.name} for doors that will not latch, lock, or close correctly. Same-day service for offices, retail, and restaurants.`,
    hero: (city) =>
      `From latch failures to alignment problems, we provide fast commercial door repair across ${city.name} to keep businesses secure and operational.`,
    problems: [
      'Commercial door will not latch or lock',
      'Storefront door scraping frame or threshold',
      'Broken hinges, pivots, or closers',
      'Door misalignment after heavy use',
      'Entry door security issue after forced attempt'
    ],
    brands: ['Adams Rite', 'Hager', 'Pemko', 'Rockwood', 'LCN'],
    testimonial: {
      quote:
        'Our storefront door stopped locking properly. They corrected the alignment and hardware on the first visit.',
      byline: 'Retail Operations Lead'
    },
    faq: (city) => [
      [`Can you fix a commercial door that does not lock in ${city.name}?`, 'Yes. We diagnose lock, strike, alignment, and closer issues to restore secure locking.'],
      ['Do you repair storefront entry doors?', 'Yes. We service aluminum storefront doors and related commercial hardware.'],
      ['Do you offer same-day commercial door repair?', 'Yes. Same-day and emergency scheduling is available for many issues.'],
      ['Can you repair and rekey in one visit?', 'Yes. We often combine door repair and key control work to restore full security quickly.']
    ]
  },
  {
    slug: 'storefront-door-repair',
    label: 'Storefront Door Repair',
    serviceType: 'Storefront Door Repair',
    kicker: 'Same-Day Aluminum Storefront Door Service',
    image: 'img-3098e185f13f91a0.jpg',
    title: (city) => `Storefront Door Repair ${city.name} | Same-Day Glass Door Service`,
    description: (city) =>
      `Storefront door repair ${city.name} for doors that drag, do not lock, or fail to close. Emergency and same-day service for retail and restaurant entries.`,
    hero: (city) =>
      `A broken storefront door hurts security and business flow. We repair aluminum and glass entry door hardware across ${city.name} with fast turnaround.`,
    problems: [
      'Storefront door not locking at close',
      'Aluminum glass door out of alignment',
      'Bottom pivot or closer failure',
      'Handle set and latch wear from heavy traffic',
      'Post break-in door hardware damage'
    ],
    brands: ['Adams Rite', 'CRL', 'Jackson', 'Kawneer', 'YKK AP'],
    testimonial: {
      quote: 'Our storefront door was not closing after a busy weekend. They restored the closer and latch quickly.',
      byline: 'Cafe Owner'
    },
    faq: (city) => [
      [`Do you repair aluminum storefront doors in ${city.name}?`, 'Yes. We repair storefront closers, pivots, locks, and latching hardware.'],
      ['Can you service us outside normal business hours?', 'Yes. Emergency and off-hour scheduling is available for urgent storefront issues.'],
      ['Do you work with retail and restaurant properties?', 'Yes. Retail and restaurant storefront repair is a core service line.'],
      ['Can you secure the door after a break-in?', 'Yes. We provide urgent repair and lock security stabilization.']
    ]
  },
  {
    slug: 'fire-door-inspection',
    label: 'Fire Door Inspection',
    serviceType: 'Fire Door Inspection',
    kicker: 'NFPA 80 Inspection and Deficiency Support',
    image: 'img-02691dacdfba1f73.jpg',
    title: (city) => `Fire Door Inspection ${city.name} | NFPA 80 Compliance Help`,
    description: (city) =>
      `Fire door inspection ${city.name} with deficiency reporting and correction support. Protect compliance timelines with commercial NFPA 80 focused service.`,
    hero: (city) =>
      `Annual fire door inspections and deficiency follow-up for occupied commercial buildings in ${city.name}. We help teams move from failed openings to compliant operation fast.`,
    problems: [
      'Failed fire inspection due to non-latching doors',
      'Missing or damaged closer and latching hardware',
      'Panic bar and exit hardware deficiencies',
      'Unclear correction priorities after inspection',
      'Need annual inspection coordination across properties'
    ],
    brands: ['Von Duprin', 'LCN', 'Norton', 'Hager', 'SARGENT'],
    testimonial: {
      quote: 'Their report was clear and actionable, and the deficiency repairs were completed quickly for reinspection.',
      byline: 'Facilities Director'
    },
    faq: (city) => [
      [`Do you perform annual fire door inspections in ${city.name}?`, 'Yes. We support annual inspection workflows aligned with NFPA 80 expectations.'],
      ['Can you repair deficiencies after inspection?', 'Yes. We repair many common deficiencies involving closers, panic bars, latches, and hardware alignment.'],
      ['Do you provide documentation support?', 'Yes. We provide practical opening-by-opening findings to support compliance follow-up.'],
      ['Do you work with schools, offices, and mixed-use buildings?', 'Yes. We support a wide range of occupied commercial property types.']
    ]
  },
  {
    slug: 'fire-door-compliance',
    label: 'Fire Door Compliance',
    serviceType: 'Fire Door Compliance',
    kicker: 'Correct Deficiencies and Restore Code Performance',
    image: 'img-02691dacdfba1f73.jpg',
    title: (city) => `Fire Door Compliance ${city.name} | Inspection Deficiency Repairs`,
    description: (city) =>
      `Fire door compliance ${city.name} support for failed inspections, deficiency repairs, and code-focused hardware correction. Same-day priority options available.`,
    hero: (city) =>
      `If your building failed inspection, we correct high-priority fire door deficiencies across ${city.name} and help you move toward compliance quickly.`,
    problems: [
      'Failed fire inspection correction deadlines',
      'Fire door not self-closing or not latching',
      'Improper or damaged egress hardware',
      'Missing adjustment and follow-up documentation',
      'Recurring compliance findings on high-use openings'
    ],
    brands: ['LCN', 'Von Duprin', 'Falcon', 'Norton', 'SARGENT'],
    testimonial: {
      quote: 'We had multiple failed openings. They prioritized urgent life-safety items and finished repairs before our follow-up visit.',
      byline: 'Building Engineer'
    },
    faq: (city) => [
      [`Do you handle fire door compliance repairs in ${city.name}?`, 'Yes. We handle deficiency correction, hardware replacement, and adjustment work tied to compliance findings.'],
      ['Can you prioritize urgent life-safety issues first?', 'Yes. We can phase repairs based on urgency and inspection deadlines.'],
      ['Do you service panic bars and closers as part of compliance work?', 'Yes. Panic bars, exit devices, and closers are core correction categories we handle.'],
      ['Can you support property managers with recurring compliance programs?', 'Yes. We support portfolio-level inspection and correction planning.']
    ]
  },
  {
    slug: 'commercial-rekey',
    label: 'Commercial Rekey',
    serviceType: 'Commercial Rekey Service',
    kicker: 'Secure Key Control After Staff or Tenant Changes',
    image: 'img-af734f238d1e0eb7.jpg',
    title: (city) => `Commercial Rekey ${city.name} | Business Lock Security Reset`,
    description: (city) =>
      `Commercial rekey ${city.name} for employee turnover, lost keys, and tenant transitions. Fast same-day locksmith service for business security.`,
    hero: (city) =>
      `When key control is uncertain, rekey fast. We provide commercial rekey service across ${city.name} to restore access security without full hardware replacement.`,
    problems: [
      'Employee termination rekey requirements',
      'Lost keys with unknown duplicates',
      'Tenant move-out lock security reset',
      'Multi-suite key hierarchy cleanup',
      'Urgent rekey after office lockout or security incident'
    ],
    brands: ['Schlage', 'BEST', 'Medeco', 'Corbin Russwin', 'Yale'],
    testimonial: {
      quote: 'After a staffing change, they rekeyed our office and warehouse the same day with a cleaner master key plan.',
      byline: 'Logistics Manager'
    },
    faq: (city) => [
      [`Do you provide same-day commercial rekey in ${city.name}?`, 'Yes. Same-day rekey service is available for many commercial lock platforms.'],
      ['Should we rekey or replace locks?', 'We recommend the best option based on hardware condition, key control goals, and urgency.'],
      ['Can you rekey multiple suites in one visit?', 'Yes. We support multi-suite and portfolio-level rekey projects.'],
      ['Do you update master keys during rekey service?', 'Yes. We can redesign and expand master key structures as needed.']
    ]
  }
];

const CORE_SERVICE_SLUGS = [
  'commercial-locksmith',
  'emergency-commercial-locksmith',
  'panic-bar-repair',
  'door-closer-repair',
  'commercial-door-repair',
  'fire-door-inspection'
];

const DC_EXTRA_SERVICE_SLUGS = ['exit-device-repair', 'fire-door-compliance', 'commercial-rekey', 'storefront-door-repair'];

const serviceBySlug = new Map(SERVICES.map((service) => [service.slug, service]));
const cityBySlug = new Map(CITIES.map((city) => [city.slug, city]));

const pages = [];
for (const city of CITIES) {
  const serviceSlugs = [...CORE_SERVICE_SLUGS];
  if (city.slug === 'washington-dc') {
    serviceSlugs.push(...DC_EXTRA_SERVICE_SLUGS);
  }

  for (const serviceSlug of serviceSlugs) {
    const service = serviceBySlug.get(serviceSlug);
    if (!service) continue;
    pages.push({ citySlug: city.slug, serviceSlug: service.slug, slug: `${service.slug}-${city.slug}` });
  }
}

const pagesByCity = new Map();
const pagesByService = new Map();
for (const page of pages) {
  if (!pagesByCity.has(page.citySlug)) pagesByCity.set(page.citySlug, []);
  pagesByCity.get(page.citySlug).push(page);

  if (!pagesByService.has(page.serviceSlug)) pagesByService.set(page.serviceSlug, []);
  pagesByService.get(page.serviceSlug).push(page);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonScript(obj) {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}

function renderFaqHtml(faqItems) {
  return `<div class="lead-faq">${faqItems
    .map(
      ([question, answer]) =>
        `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`
    )
    .join('')}</div>`;
}

function renderLinkChips(links) {
  return links
    .map(({ href, label }) => `<a href="/${href}">${escapeHtml(label)}</a>`)
    .join('');
}

function localBusinessSchema(city, pageUrl, description) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Locksmith'],
    name: 'DC Emergency Lock & Door',
    url: pageUrl,
    telephone: '+1-703-244-0559',
    description,
    sameAs: SOCIAL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mobile Commercial Service',
      addressLocality: city.locality,
      addressRegion: city.region,
      postalCode: city.postalCode,
      addressCountry: 'US'
    },
    areaServed: [city.name, ...city.neighborhoods]
  };
}

function serviceSchema(service, city, pageUrl, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.label} ${city.name}`,
    serviceType: service.serviceType,
    description,
    areaServed: [city.name],
    provider: {
      '@type': 'LocalBusiness',
      name: 'DC Emergency Lock & Door',
      telephone: '+1-703-244-0559',
      url: DOMAIN
    },
    url: pageUrl
  };
}

function breadcrumbSchema(city, service, pageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: city.name, item: `${DOMAIN}/${city.hubPath}` },
      { '@type': 'ListItem', position: 3, name: `${service.label} ${city.name}`, item: pageUrl }
    ]
  };
}

function faqSchema(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

function pageHtml(page) {
  const city = cityBySlug.get(page.citySlug);
  const service = serviceBySlug.get(page.serviceSlug);
  const url = `${DOMAIN}/${page.slug}`;
  const faqItems = service.faq(city);
  const description = service.description(city);
  const title = service.title(city);
  const h1 = `${service.label} ${city.name}`;
  const imageAbs = `${DOMAIN}/assets/${service.image}`;

  const relatedCityPages = (pagesByCity.get(city.slug) || [])
    .filter((candidate) => candidate.slug !== page.slug)
    .slice(0, 6)
    .map((candidate) => {
      const candidateService = serviceBySlug.get(candidate.serviceSlug);
      return { href: candidate.slug, label: `${candidateService.label} ${city.name}` };
    });

  const nearbySameService = (pagesByService.get(service.slug) || [])
    .filter((candidate) => candidate.slug !== page.slug)
    .slice(0, 4)
    .map((candidate) => {
      const candidateCity = cityBySlug.get(candidate.citySlug);
      return { href: candidate.slug, label: `${service.label} ${candidateCity.name}` };
    });

  const neighborhoodItems = city.neighborhoods.map((name) => `<li>${escapeHtml(name)}</li>`).join('');
  const problemsItems = service.problems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const brandsItems = service.brands.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  const scripts = [
    localBusinessSchema(city, url, description),
    serviceSchema(service, city, url, description),
    breadcrumbSchema(city, service, url),
    faqSchema(faqItems)
  ]
    .map((obj) => jsonScript(obj))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Tag Manager -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.GTM_CONFIG = window.GTM_CONFIG || {
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    fbPixelId: '000000000000000'
  };
  (function(w,d,s,l,i){
    if(!i || i==='GTM-XXXXXXX'){ return; }
    w[l]=w[l]||[];
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',window.GTM_CONFIG.gtmId);
</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" href="assets/locksmith.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imageAbs}">
<meta property="og:image:alt" content="${escapeHtml(h1)}">
<meta property="og:site_name" content="DC Emergency Lock &amp; Door">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${imageAbs}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/lead-pages.css">
<link rel="stylesheet" href="assets/seo-growth.css">
${scripts}
</head>
<body class="lead-page">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div class="lead-topbar">Emergency? Call now - technician available 24/7: <a href="tel:${PHONE_RAW}" data-event="phone_click">${PHONE_LABEL}</a></div>
<header class="lead-hero">
  <div class="lead-wrap">
    <nav class="lead-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/${city.hubPath}">${escapeHtml(city.name)}</a><span>/</span><span>${escapeHtml(h1)}</span></nav>
    <span class="lead-kicker">${escapeHtml(service.kicker)}</span>
    <h1 class="lead-title">${escapeHtml(h1)}</h1>
    <p class="lead-subtitle">${escapeHtml(service.hero(city))}</p>
    <div class="lead-cta-row">
      <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call Now: ${PHONE_LABEL}</a>
      <a class="lead-btn lead-btn-danger" href="#request-service-form" data-event="quote_form_open">Request a Free Estimate</a>
      <a class="lead-btn lead-btn-ghost" href="${service.slug === 'emergency-commercial-locksmith' ? '#request-service-form' : `/emergency-commercial-locksmith-${city.slug}`}" data-event="${service.slug === 'emergency-commercial-locksmith' ? 'quote_form_open' : 'service_cta_click'}">${service.slug === 'emergency-commercial-locksmith' ? 'Request Emergency Dispatch' : 'Need Emergency Service?'}</a>
    </div>
    <ul class="lead-trust">
      <li>24/7 emergency and same-day commercial service</li>
      <li>Licensed and insured technicians</li>
      <li>Under 45-minute average response in active zones</li>
      <li>Panic bars, closers, exit devices, and fire door support</li>
    </ul>
  </div>
</header>
<section class="lead-section">
  <div class="lead-wrap lead-grid two">
    <article class="lead-card">
      <h2>Emergency? Call now - technician available 24/7</h2>
      <p>For urgent lock and door issues in ${escapeHtml(city.name)}, call <a href="tel:${PHONE_RAW}" data-event="phone_click">${PHONE_LABEL}</a> now. We prioritize businesses with security or egress failures.</p>
      <h2>Common problems we fix today</h2>
      <ul class="lead-list">${problemsItems}</ul>
      <div class="lead-cta-row" style="margin-top:14px">
        <a class="lead-btn lead-btn-primary" href="tel:${PHONE_RAW}" data-event="phone_click">Call for Same-Day Service</a>
        <a class="lead-btn lead-btn-danger" href="#request-service-form" data-event="quote_form_open">Get Quote</a>
      </div>
    </article>
    <aside class="lead-cta-box">
      <h3>Neighborhoods we cover in ${escapeHtml(city.name)}</h3>
      <ul class="lead-list">${neighborhoodItems}</ul>
      <h3 style="margin-top:14px">Brands we service</h3>
      <ul class="lead-list">${brandsItems}</ul>
      <p style="margin-top:12px">We work with offices, restaurants, retail stores, schools, medical facilities, and property managers.</p>
    </aside>
  </div>
</section>
<section class="lead-section alt">
  <div class="lead-wrap lead-grid three">
    <article class="lead-card"><img src="assets/${service.image}" alt="${escapeHtml(service.label)} ${escapeHtml(city.name)} job photo" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:10px"><h3>Real Job Photo: Service Visit</h3><p>Field repair and adjustment work completed onsite in ${escapeHtml(city.name)}.</p></article>
    <article class="lead-card"><img src="assets/img-9e19b3ab02e1d2d8.jpg" alt="Door closer and hardware repair ${escapeHtml(city.name)}" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:10px" loading="lazy"><h3>Real Job Photo: Door Hardware</h3><p>Closer, latch, and frame alignment work for commercial entry doors.</p></article>
    <article class="lead-card"><img src="assets/img-af734f238d1e0eb7.jpg" alt="Commercial locksmith service ${escapeHtml(city.name)}" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:10px" loading="lazy"><h3>Real Job Photo: Lock Security</h3><p>Commercial locksmith service for rekey, lock changes, and emergency access control.</p></article>
  </div>
</section>
<section class="lead-section">
  <div class="lead-wrap lead-grid two">
    <article class="lead-card">
      <h2>Client Testimonial</h2>
      <p><strong>Recent feedback:</strong></p>
      <p>"${escapeHtml(service.testimonial.quote)}"</p>
      <p style="font-size:13px;color:#4f664f">- ${escapeHtml(service.testimonial.byline)}, ${escapeHtml(city.name)}</p>
      <p style="margin-top:12px">Local credibility signals: 24/7 dispatch, licensed and insured coverage, and 4.9-star reputation for commercial response work.</p>
    </article>
    <article class="lead-card">
      <h2>Related ${escapeHtml(city.name)} Services</h2>
      <div class="lead-inline-links">${renderLinkChips(relatedCityPages)}</div>
      <h3 style="margin-top:16px">Nearby city pages</h3>
      <div class="lead-inline-links">${renderLinkChips(nearbySameService)}</div>
    </article>
  </div>
</section>
<section class="lead-section alt">
  <div class="lead-wrap">
    <article class="lead-card">
      <h2>Frequently Asked Questions</h2>
      ${renderFaqHtml(faqItems)}
    </article>
  </div>
</section>
<section class="lead-section" id="request-service-form">
  <div class="lead-wrap">
    <article class="lead-cta-box">
      <h2>Request Service in ${escapeHtml(city.name)}</h2>
      <p>Need a fast quote? Submit the form below. For urgent issues, call <a href="tel:${PHONE_RAW}" data-event="phone_click">${PHONE_LABEL}</a>.</p>
      <form class="lead-quote-form quote-form" action="${FORM_SUBMIT_ENDPOINT}" method="POST" enctype="multipart/form-data">
        <div class="lead-form-row"><div><label for="${page.slug}-name">Name</label><input id="${page.slug}-name" name="Name" required></div><div><label for="${page.slug}-business">Business name</label><input id="${page.slug}-business" name="Business name" required></div></div>
        <div class="lead-form-row"><div><label for="${page.slug}-phone">Phone</label><input id="${page.slug}-phone" name="Phone" type="tel" required></div><div><label for="${page.slug}-email">Email</label><input id="${page.slug}-email" name="Email" type="email" required></div></div>
        <div class="lead-form-row"><div><label for="${page.slug}-service">Service needed</label><input id="${page.slug}-service" name="Service needed" value="${escapeHtml(h1)}" required></div><div><label for="${page.slug}-location">Service area</label><input id="${page.slug}-location" name="Service location" value="${escapeHtml(city.name)}" required></div></div>
        <div class="lead-form-row"><div><label for="${page.slug}-urgency">Urgency</label><select id="${page.slug}-urgency" name="Urgency" required><option value="">Select urgency</option><option>Emergency</option><option>Same day</option><option>Scheduled</option></select></div><div><label for="${page.slug}-message">Issue details</label><textarea id="${page.slug}-message" name="Issue description" placeholder="Example: panic bar stuck, closer leaking oil, storefront door not locking"></textarea></div></div>
        <button class="lead-btn lead-btn-primary" type="submit" data-event="quote_form_submit">Request a Free Estimate</button>
      </form>
    </article>
  </div>
</section>
<footer class="lead-footer">
  <div class="lead-wrap">
    <p>DC Emergency Lock & Door - 24/7 Commercial Locksmith, panic bars, exit devices, door closers, and fire door compliance - <a href="tel:${PHONE_RAW}" style="color:#93c5fd;" data-event="phone_click">${PHONE_LABEL}</a></p>
  </div>
</footer>
<script src="assets/lead-pages.js?v=20260504" defer></script>
</body>
</html>`;
}

for (const page of pages) {
  const html = pageHtml(page);
  fs.writeFileSync(path.join(ROOT, `${page.slug}.html`), html);
}

function buildSitemapXml(rootDir) {
  const htmlFiles = fs
    .readdirSync(rootDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.replace(/\.html$/, ''));

  const blogDir = path.join(rootDir, 'blog');
  const blogFiles = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => `blog/${file.replace(/\.html$/, '')}`);

  const pagesForSitemap = [...htmlFiles, ...blogFiles].sort((a, b) => a.localeCompare(b));

  const entries = pagesForSitemap
    .map((page) => {
      const loc = page === 'index' ? `${DOMAIN}/` : `${DOMAIN}/${page}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

const sitemapXml = buildSitemapXml(ROOT);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml);

console.log(`Generated ${pages.length} local service-city landing pages and refreshed sitemap.xml.`);
