import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
}

const relatedMap = {
  'service-panic-bars.html': [
    ['/service-exit-devices', 'Exit Device Repair'],
    ['/service-fire-door-compliance', 'Fire Door Compliance'],
    ['/service-door-hardware', 'Commercial Door Hardware'],
    ['/service-door-closers', 'Door Closer Repair'],
    ['/service-panic-bar-installation', 'Panic Bar Installation']
  ],
  'service-door-closers.html': [
    ['/service-panic-bars', 'Panic Bar Repair'],
    ['/fire-door-repair-washington-dc', 'Fire Door Repair'],
    ['/service-door-hardware', 'Commercial Door Hardware'],
    ['/service-door-closer-adjustment', 'Door Closer Adjustment'],
    ['/service-commercial-door-closer-installation', 'Door Closer Installation']
  ],
  'service-fire-doors.html': [
    ['/service-fire-door-compliance', 'Fire Door Compliance'],
    ['/service-panic-bar-installation', 'Panic Bar Installation'],
    ['/service-door-closer-adjustment', 'Door Closer Adjustment'],
    ['/service-exit-device-installation', 'Exit Device Installation'],
    ['/service-exit-devices', 'Exit Device Repair'],
    ['/service-panic-bars', 'Panic Bar Repair']
  ],
  'service-locksmith.html': [
    ['/service-commercial-rekey', 'Commercial Rekey Service'],
    ['/master-key-systems', 'Master Key Systems'],
    ['/service-access-control', 'Access Control Installation'],
    ['/service-business-lock-change', 'Business Lock Change'],
    ['/service-office-lockout', 'Office Lockout Service']
  ]
};

for (const [file, links] of Object.entries(relatedMap)) {
  let html = read(file);
  const linkHtml = links
    .map(
      ([href, label]) =>
        `<a href="${href}" style="color:var(--blue);font-size:13px;font-weight:600">${label} →</a>`
    )
    .join('');

  html = html.replace(
    /(<p[^>]*>Related Services<\/p>\s*)<div style="display:flex;flex-wrap:wrap;gap:12px">[\s\S]*?<\/div>/,
    `$1<div style="display:flex;flex-wrap:wrap;gap:12px">${linkHtml}</div>`
  );

  write(file, html);
}

const allServiceLinks = `
<div class="lead-inline-links">
  <a href="/service-locksmith">Commercial Locksmith</a>
  <a href="/emergency-commercial-locksmith">Emergency Commercial Locksmith</a>
  <a href="/service-panic-bars">Panic Bar Repair</a>
  <a href="/service-panic-bar-installation">Panic Bar Installation</a>
  <a href="/service-exit-devices">Exit Device Repair</a>
  <a href="/service-exit-device-installation">Exit Device Installation</a>
  <a href="/service-door-closers">Door Closer Repair</a>
  <a href="/service-door-closer-adjustment">Door Closer Adjustment</a>
  <a href="/service-commercial-door-closer-installation">Door Closer Installation</a>
  <a href="/service-fire-doors">Fire Door Inspection</a>
  <a href="/service-fire-door-compliance">Fire Door Compliance</a>
  <a href="/service-commercial-rekey">Commercial Rekey Service</a>
  <a href="/service-business-lock-change">Business Lock Change</a>
  <a href="/master-key-systems">Master Key Systems</a>
  <a href="/service-restricted-key-systems">Restricted Key Systems</a>
  <a href="/service-access-control">Access Control Installation</a>
  <a href="/service-door-hardware">Commercial Door Hardware</a>
  <a href="/service-office-lockout">Office Lockout Service</a>
  <a href="/service-property-manager-locksmith">Property Manager Locksmith Service</a>
  <a href="/service-tenant-lock-change">Tenant Lock Change Service</a>
</div>`;

const localSections = {
  'city-washington-dc.html': {
    intro:
      'Commercial locksmith Washington DC, emergency commercial locksmith Washington DC, panic bar repair Washington DC, door closer repair Washington DC, fire door inspection Washington DC, commercial rekey service Washington DC, and access control installation Washington DC are all supported with same-day and 24/7 emergency dispatch.',
    faq: [
      ['How fast can you respond in Washington DC?', 'Many emergency calls are dispatched same day with rapid response across all DC commercial corridors.'],
      ['Do you handle panic bars and exit devices in DC?', 'Yes. We repair and install panic bars and exit devices for commercial properties across Washington DC.'],
      ['Can you help with fire door compliance in DC?', 'Yes. We support inspections, deficiency correction, and code-compliant hardware updates.'],
      ['Do you work with property managers in Washington DC?', 'Yes. Property and facility managers are a core part of our commercial client base.']
    ]
  },
  'city-northern-virginia.html': {
    intro:
      'Commercial locksmith Northern Virginia, emergency commercial locksmith Northern Virginia, panic bar repair Northern Virginia, door closer repair Northern Virginia, fire door inspection Northern Virginia, commercial rekey service Northern Virginia, and access control installation Northern Virginia are available across Arlington, Alexandria, and surrounding NoVA markets.',
    faq: [
      ['Do you provide same-day service in Northern Virginia?', 'Yes. Same-day and emergency response is available for many NoVA business lock and door issues.'],
      ['Can you service offices and retail in Arlington and Alexandria?', 'Yes. We support offices, retail sites, mixed-use buildings, and managed properties throughout NoVA.'],
      ['Do you offer after-hours commercial locksmith support in NoVA?', 'Yes. After-hours and 24/7 emergency commercial locksmith service is available.'],
      ['Can you install access control systems in Northern Virginia?', 'Yes. We install and service access control for office and commercial properties.']
    ]
  },
  'city-maryland.html': {
    intro:
      'Commercial locksmith Maryland, emergency commercial locksmith Maryland, panic bar repair Maryland, door closer repair Maryland, fire door inspection Maryland, commercial rekey service Maryland, and access control installation Maryland are available for businesses and property teams throughout key Maryland service areas.',
    faq: [
      ['Do you serve Bethesda and Silver Spring for commercial locksmith work?', 'Yes. We provide commercial locksmith and door hardware support across Bethesda, Silver Spring, and nearby markets.'],
      ['Can you rekey businesses in Maryland after employee turnover?', 'Yes. Commercial rekey service and business lock change are available with same-day options.'],
      ['Do you help with fire door inspection and compliance in Maryland?', 'Yes. We support fire door inspections, correction planning, and compliance-focused repair work.'],
      ['Do you support property managers in Maryland?', 'Yes. We provide recurring portfolio locksmith service for property and facility teams.']
    ]
  },
  'city-new-york.html': {
    intro:
      'Commercial locksmith New York, emergency commercial locksmith New York, panic bar repair New York, door closer repair New York, fire door inspection New York, commercial rekey service New York, and access control installation New York are available through scheduled and emergency commercial routes.',
    faq: [
      ['Do you provide emergency commercial locksmith support in New York?', 'Yes. Emergency and scheduled support is available for commercial lock and door hardware needs in New York service zones.'],
      ['Can you repair panic bars and exit devices in NYC businesses?', 'Yes. We handle panic bar and exit device repair and installation for commercial properties.'],
      ['Do you support office lockouts and tenant lock changes in New York?', 'Yes. We provide office lockout response, rekeying, and tenant turnover lock service.'],
      ['Can you help with commercial fire door compliance in New York?', 'Yes. We provide inspection support and correction services for fire door compliance workflows.']
    ]
  }
};

for (const [file, data] of Object.entries(localSections)) {
  let html = read(file);
  if (html.includes('id="local-keyword-targeting"')) {
    continue;
  }

  const faqHtml = data.faq
    .map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`)
    .join('');

  const insert = `
<section class="sec sec-alt" id="local-keyword-targeting">
  <div class="wrap">
    <div class="prose seo-box fi">
      <h2>Local Commercial Locksmith Keywords for This Area</h2>
      <p>${data.intro}</p>
      <h2>Services Available in This Area</h2>
      ${allServiceLinks}
      <h2>Area-Specific FAQs</h2>
      ${faqHtml}
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
        <a href="tel:7032440559" class="btn btn-primary" data-event="phone_click">Call 24/7: 703-244-0559</a>
        <a href="#request-service-form" class="btn btn-red" data-event="quote_form_open">Request a Free Estimate</a>
      </div>
    </div>
  </div>
</section>
`;

  html = html.replace(/<section class="cta-band">/, `${insert}\n<section class="cta-band">`);
  write(file, html);
}

let blogHub = read('blog.html');
if (!blogHub.includes('id="new-seo-guides"')) {
  const newGuidesSection = `
<section class="sec sec-white" id="new-seo-guides">
  <div class="wrap">
    <p class="sec-label">New Guides</p>
    <h2 class="sec-title">New Commercial Locksmith Resources</h2>
    <div class="lead-inline-links" style="margin-top:14px">
      <a href="/blog-fire-door-inspection-checklist-businesses-washington-dc">Fire Door Inspection Checklist for Businesses in Washington DC</a>
      <a href="/blog-panic-bar-repair-signs-exit-device-needs-service">Panic Bar Repair: Signs Your Exit Device Needs Service</a>
      <a href="/blog-door-closer-not-closing-common-causes-fixes">Door Closer Not Closing? Common Causes and Fixes</a>
      <a href="/blog-when-should-business-rekey-locks">When Should a Business Rekey Its Locks?</a>
      <a href="/blog-master-key-system-guide-offices-property-managers">Master Key System Guide for Offices and Property Managers</a>
      <a href="/blog-access-control-systems-small-business-what-to-know">Access Control Systems for Small Businesses: What to Know</a>
      <a href="/blog-why-commercial-door-wont-latch-properly">Why Your Commercial Door Won’t Latch Properly</a>
      <a href="/blog-emergency-commercial-locksmith-after-break-in">Emergency Commercial Locksmith: What to Do After a Break-In</a>
      <a href="/blog-fire-door-compliance-mistakes-businesses-avoid">Fire Door Compliance Mistakes Businesses Should Avoid</a>
      <a href="/blog-panic-bar-vs-exit-device-difference">Panic Bar vs Exit Device: What Is the Difference?</a>
    </div>
  </div>
</section>
`;

  blogHub = blogHub.replace(/<section class="cta-band">/, `${newGuidesSection}\n<section class="cta-band">`);
  write('blog.html', blogHub);
}

console.log('Patched related links, location keyword sections, and blog hub links.');
