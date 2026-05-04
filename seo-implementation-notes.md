# SEO + Conversion Ops Notes (2026)

## 1) DNS Email Authentication

Add these DNS TXT records for `dcemergencylockanddoor.com`:

- SPF (`@`):
  - `v=spf1 include:_spf.google.com ~all`
  - If you use more senders, include each authorized sender domain once.
- DMARC (`_dmarc`):
  - Phase 1 monitor: `v=DMARC1; p=none; rua=mailto:dmarc@dcemergencylockanddoor.com; ruf=mailto:dmarc@dcemergencylockanddoor.com; fo=1; adkim=s; aspf=s; pct=100`
  - Phase 2 partial quarantine (after 2-4 weeks of clean reports): `v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@dcemergencylockanddoor.com; adkim=s; aspf=s`
  - Phase 3 full quarantine/reject (after remediation): `v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@dcemergencylockanddoor.com; adkim=s; aspf=s`

If mail is sent by Microsoft 365 or another provider, replace SPF include values accordingly.

## 2) GTM + GA4 + Facebook Pixel

Place live IDs in the GTM config block injected in page `<head>`:

- `gtmId`: replace `GTM-XXXXXXX`
- `ga4Id`: replace `G-XXXXXXXXXX`
- `fbPixelId`: replace `000000000000000`

Create GTM tags/triggers:

- GA4 Config tag on all pages.
- Facebook Pixel base tag on all pages.
- Event trigger where `event equals phone_click`.
- Event trigger where `event equals request_service_form_submit`.
- Optional: `event equals get_free_estimate_click`.

## 3) Performance + Core Web Vitals Deployment

If deployed on Vercel, HTTPS + HTTP/2/3 are enabled by default.

Recommended platform settings:

- Brotli/GZIP compression enabled.
- Long cache headers for versioned assets in `/assets/*`.
- Keep HTML caching conservative unless ISR/static revalidation strategy is defined.
- Serve images in modern formats (WebP/AVIF) where possible.

Suggested `vercel.json` header additions:

- `Cache-Control: public, max-age=31536000, immutable` for `/assets/(.*)`.
- `Strict-Transport-Security` for HTTPS hardening.

## 4) Validation Workflow

Run these live checks after deploy:

- Google PageSpeed Insights for homepage + top service pages.
- Google Rich Results Test on homepage + at least one service page + one location page.
- Confirm `robots.txt`, `sitemap.xml`, and `llms.txt` load from root.
- Verify GTM preview mode captures:
  - phone click events
  - form submit events

