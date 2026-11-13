# Completed website validation

Validated November 11, 2026. The active WhatsApp quote form, owner-confirmed business facts and detailed local targeting are included. See `docs/task-completion-checklist.md` for every requested task and the treatment of unsupported claims.

## Static QA

`npm run qa` passed: 5,969 checks; 128 HTML pages; 59 sitemap URLs; 1,877 internal links; 733 local asset references; 198 images; 61 form elements. This includes 17 canonical service configurations and 63 redirect definitions. Syntax checks passed for 27 JavaScript modules and 5 JSON configuration files.

All 59 original sitemap URLs were retained. `data/redirects.json`, `vercel.json` and `package.json` are unchanged. The existing generation/deployment-output scripts were reused; no framework, dependency or new build requirement was added.

The 21 main pages have working client-side WhatsApp quote forms. Retained redirect-source legacy forms remain disabled. The active quote form is hidden/disabled in source HTML until its handler is ready; phone and WhatsApp links remain available without JavaScript. Direct server submissions remain coming soon.

## Responsive and accessibility verification

- Tested the homepage, 17 canonical service pages and three regional pages at 360 × 640, 390 × 844, 430 × 932, 800 × 800, 1101 × 800 and 1440 × 900: 126 route/viewport cases.
- No observed horizontal overflow, hero-call/sticky-bar overlap, visible owner placeholders or JavaScript errors.
- Tested main buttons, navigation toggles, service-card links, sticky actions and disclosure controls meet the 48px height target.
- Axe returned zero selected WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice violations on the homepage, emergency commercial door repair page, property-manager page and DC regional page.
- These automated tests cover the tested states; they do not establish complete WCAG conformance by themselves.

## Functional quote-form verification

- Required fields and invalid phone-number handling passed.
- Prepared WhatsApp requests include contact name/phone, business type, address/ZIP, problem and urgency, plus optional property/work-order, opening count and notes.
- The destination is the confirmed WhatsApp number +1 202-643-4062.
- UTM and gclid hidden fields populate correctly.
- Local photo preview works; the native photo-sharing branch was tested with a mocked device share API. Unsupported devices retain the attach-in-WhatsApp fallback.
- Unsupported image types and files over 10 MB are rejected with usable guidance. Photo selection does not claim an upload or delivered message.
- No name, contact phone or address was included in the inspected analytics events.
- Preparation and handoff do not produce `generate_lead`, `commercial_lead_submit` or fake delivery-success events. Actual message sending remains the visitor's explicit action in WhatsApp.
- The no-JavaScript phone/WhatsApp fallback and initialization with blocked session storage passed.
- All external requests were blocked during browser tests; no calls, messages or photos were sent. Real-device WhatsApp reception and GA4 DebugView receipt require a live verification.

## Mobile Lighthouse

Local mobile laboratory run, Lighthouse 12.8.2, simulated throttling. Analytics requests were blocked to avoid sending test traffic to production accounts.

| Category | Score |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

| Metric | Result |
| --- | --- |
| First contentful paint | 1.1 s |
| Largest contentful paint | 2.0 s |
| Cumulative layout shift | 0 |
| Total blocking time | 0 ms |

These are local scores. Production hosting, analytics, network conditions and real devices affect actual performance. Raw reports are in `/tmp/dc-complete-lighthouse.json` and `/tmp/dc-complete-lighthouse.html`; the portable summary is `docs/conversion-validation.json`.

## Business facts and local targeting

The owner confirmed 24/7 availability, free estimates, the WhatsApp number and the 12 requested target locations. The three regional pages contain eight DC neighborhood sections, two Northern Virginia sections and two Maryland sections. The shared business schema includes the confirmed places and all-week 24/7 hours. Regional FAQ markup matches the visible questions.

No unsupported response-time, review/rating, credential, brand, warranty or administrative capability was published. Existing images remain reference hardware images, not invented before/after jobs. The optional proof renderers and owner placeholders remain prepared.

## Deployment status

The existing `public/` output contains 197 files and matches the source for the edited homepage, regional pages, follow-up page, CSS, JavaScript and business config. Nothing has been published by this run. The existing repository is connected to Vercel; publication is separate from the completed file changes.
