import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const map = {
  'city-washington-dc.html': [
    ['How fast can you respond in Washington DC?', 'Many emergency calls are dispatched same day with rapid response across all DC commercial corridors.'],
    ['Do you handle panic bars and exit devices in DC?', 'Yes. We repair and install panic bars and exit devices for commercial properties across Washington DC.'],
    ['Can you help with fire door compliance in DC?', 'Yes. We support inspections, deficiency correction, and code-compliant hardware updates.'],
    ['Do you work with property managers in Washington DC?', 'Yes. Property and facility managers are a core part of our commercial client base.']
  ],
  'city-northern-virginia.html': [
    ['Do you provide same-day service in Northern Virginia?', 'Yes. Same-day and emergency response is available for many NoVA business lock and door issues.'],
    ['Can you service offices and retail in Arlington and Alexandria?', 'Yes. We support offices, retail sites, mixed-use buildings, and managed properties throughout NoVA.'],
    ['Do you offer after-hours commercial locksmith support in NoVA?', 'Yes. After-hours and 24/7 emergency commercial locksmith service is available.'],
    ['Can you install access control systems in Northern Virginia?', 'Yes. We install and service access control for office and commercial properties.']
  ],
  'city-maryland.html': [
    ['Do you serve Bethesda and Silver Spring for commercial locksmith work?', 'Yes. We provide commercial locksmith and door hardware support across Bethesda, Silver Spring, and nearby markets.'],
    ['Can you rekey businesses in Maryland after employee turnover?', 'Yes. Commercial rekey service and business lock change are available with same-day options.'],
    ['Do you help with fire door inspection and compliance in Maryland?', 'Yes. We support fire door inspections, correction planning, and compliance-focused repair work.'],
    ['Do you support property managers in Maryland?', 'Yes. We provide recurring portfolio locksmith service for property and facility teams.']
  ],
  'city-new-york.html': [
    ['Do you provide emergency commercial locksmith support in New York?', 'Yes. Emergency and scheduled support is available for commercial lock and door hardware needs in New York service zones.'],
    ['Can you repair panic bars and exit devices in NYC businesses?', 'Yes. We handle panic bar and exit device repair and installation for commercial properties.'],
    ['Do you support office lockouts and tenant lock changes in New York?', 'Yes. We provide office lockout response, rekeying, and tenant turnover lock service.'],
    ['Can you help with commercial fire door compliance in New York?', 'Yes. We provide inspection support and correction services for fire door compliance workflows.']
  ]
};

for (const [file, faq] of Object.entries(map)) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');
  html = html.replace(/\s*<script id="dceld-location-faq-schema" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '\n');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };

  const block = `\n<script id="dceld-location-faq-schema" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;
  html = html.replace(/<\/head>/i, `${block}</head>`);
  fs.writeFileSync(full, html);
}

console.log('Added location FAQ schema.');
