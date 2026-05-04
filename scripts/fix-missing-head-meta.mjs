import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://dcemergencylockanddoor.com';

const pages = {
  'blog-commercial-locksmith-pricing-dc.html': {
    title: 'Commercial Locksmith Pricing DC | Cost Guide for Businesses',
    description:
      'Commercial locksmith pricing in Washington DC: what affects cost for lockouts, rekeys, panic bars, door hardware, and emergency after-hours service.',
    image: `${DOMAIN}/assets/img-02691dacdfba1f73.jpg`
  },
  'blog-commercial-security-dc.html': {
    title: 'Commercial Security DC | Locks, Doors & Access Control',
    description:
      'Commercial security guide for Washington DC businesses covering lock upgrades, door hardening, rekeys, access control planning, and break-in prevention.',
    image: `${DOMAIN}/assets/img-956a4955d1ddb21c.jpg`
  },
  'blog-door-closer-problems.html': {
    title: 'Commercial Door Closer Problems DC | Practical Fix Guide',
    description:
      'Door closer problems in commercial buildings explained: slamming, leaking oil, non-latching doors, and when to schedule emergency repair service.',
    image: `${DOMAIN}/assets/img-9e19b3ab02e1d2d8.jpg`
  },
  'blog-door-not-locking-washington-dc.html': {
    title: 'Door Not Locking in Washington DC | Commercial Fix Guide',
    description:
      'Door not locking properly in Washington DC? Learn common commercial causes, quick checks, and when to call for same-day locksmith and hardware repair.',
    image: `${DOMAIN}/assets/img-6c9f60cefc5f9de6.jpg`
  },
  'blog-emergency-locksmith-situations-dc.html': {
    title: 'Emergency Commercial Locksmith DC | Urgent Scenarios Guide',
    description:
      'Emergency commercial locksmith situations in DC: business lockouts, break-ins, failed panic bars, and urgent door hardware fixes with fast dispatch.',
    image: `${DOMAIN}/assets/img-af734f238d1e0eb7.jpg`
  },
  'blog-secure-store-after-break-in-dc.html': {
    title: 'Secure Store After Break-In DC | Emergency Lock Steps',
    description:
      'How to secure your store after a break-in in Washington DC with emergency lock changes, rekeying, and rapid commercial door security recovery steps.',
    image: `${DOMAIN}/assets/img-94ae8ed1d777b872.jpg`
  }
};

for (const [file, meta] of Object.entries(pages)) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');

  if (/<title>[\s\S]*?<\/title>/i.test(html) && /<meta\s+name=["']description["']/i.test(html) && /<link\s+rel=["']canonical["']/i.test(html)) {
    continue;
  }

  const canonical = `${DOMAIN}/${file.replace(/\.html$/, '')}`;
  const block = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>${meta.title}</title>\n<meta name="description" content="${meta.description}">\n<meta name="robots" content="index,follow">\n<link rel="canonical" href="${canonical}">\n<link rel="icon" type="image/png" href="assets/locksmith.png">\n<meta property="og:type" content="article">\n<meta property="og:title" content="${meta.title}">\n<meta property="og:description" content="${meta.description}">\n<meta property="og:url" content="${canonical}">\n<meta property="og:image" content="${meta.image}">\n<meta property="og:image:alt" content="${meta.title}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${meta.title}">\n<meta name="twitter:description" content="${meta.description}">\n<meta name="twitter:image" content="${meta.image}">\n`;

  html = html.replace(/<head>\s*/i, `<head>\n${block}`);
  fs.writeFileSync(full, html);
}

console.log('Patched missing metadata blocks.');
