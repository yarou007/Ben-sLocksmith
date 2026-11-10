# Commercial conversion upgrade

Updated November 10, 2026. Local implementation for DC Emergency Lock & Door.

## Changelog

- Shortened the homepage hero around securing a business and restoring safe exit operation. Added direct Call and photo-quote CTAs.
- Connected photo buttons to WhatsApp on the supplied business number, +1 703-244-0559. Prefilled messages ask for business type/name, address or ZIP, problem, urgency and contact details. A photo is attached inside WhatsApp, not automatically uploaded by the website. The owner must confirm the account is active on this number.
- Kept the mobile contact bar, made the Call and Photo controls equal-width, and added a desktop floating call action.
- Fixed the navigation breakpoint that caused tablet overflow; enlarged the menu target to 48px. Shortened phone heroes and removed portrait hero photos from the small-screen layout.
- Added an icon-based commercial audience strip and reusable sections for property/facility managers, restaurants/retail, offices/medical buildings, and fire doors/exit hardware. Each includes pain points, benefits, mini FAQs and a specific CTA.
- Added a call-versus-quote block, four-step process, pricing explanation and future lead form. The homepage and all 17 canonical service pages have the shared request block.
- The future form includes name, phone, business type, business address/ZIP, problem, urgency and optional photo. It is collapsed, explicitly coming soon, disabled in HTML and JavaScript, and has no submission endpoint. No submission is simulated.
- Added source-rendered attribution fields for UTM parameters, gclid, gbraid, wbraid, landing page and referrer. Fields populate even while the form is disabled.
- Connected existing custom event hooks to the existing GA4 Google tag. A configured GTM container switches delivery to the data layer to avoid sending the same custom event by two routes. Photo clicks include a WhatsApp event.
- Added a noindex `/thank-you` follow-up destination for future integration. It explains the next step without claiming receipt of a message or promising an unverified callback time.
- Retained existing service copy, internal service routes, blog articles, redirect rules and all 59 sitemap URLs. Rewrote hedging in the main commercial content and photo captions.
- Added Locksmith/LocalBusiness entity types to the shared Organization entity, retaining Service, visible FAQ and breadcrumb markup. No address, rating, hours, license or guarantee was invented.
- Prepared data-driven reviews, Google rating badge, confirmed brands, credentials, approved before/after work and warranty sections. Empty/unverified proof stays out of the customer interface. Owner placeholders live in inert HTML templates/comments and this checklist.
- Inlined a small critical CSS layer; retained WebP sources, explicit image dimensions, lazy loading below the fold, and deferred vanilla JavaScript.

## Files and maintenance

- `scripts/build-core-pages.mjs`: existing page generator, hero, navigation, footer, schema, regional pages and follow-up page.
- `scripts/conversion-components.mjs`: shared WhatsApp CTAs, form preview, request routing, segment rendering, process, pricing and approved proof.
- `data/conversion-content.mjs`: four reusable segment templates, coverage candidates and the complete owner-placeholder registry.
- `data/business.json`: phone, WhatsApp number, verification flags, GA/Ads IDs, pending/verified coverage, Google rating and warranty.
- `data/proof-content.json`: approved reviews, manufacturers, credential wording and job/case-study photos. Its existing entry templates describe the required evidence fields. Before/after case-study images additionally need `src`, `width`, `height`, `alt` and `caption`.
- `assets/critical.css`, `assets/site.css`, `assets/site.js`: mobile layout, component styling, navigation, attribution and event delivery.
- `scripts/sanitize-legacy-pages.mjs`, `assets/legacy-safety.css`: persistent WhatsApp/photo actions and the matching desktop call action on retained pages.
- `scripts/qa-site.mjs`: existing static QA plus a regression check that photo CTAs reach prefilled WhatsApp conversations.

The delivered HTML/CSS/JS is directly serveable. No framework, package installation or new runtime build requirement was added. The repository already contained page-generation scripts; their source was updated alongside the HTML so an existing regeneration will preserve these changes.

If maintaining the generated sources, use the existing commands in this order:

```sh
node scripts/build-core-pages.mjs
node scripts/sanitize-legacy-pages.mjs
node scripts/build-core-pages.mjs
node scripts/generate-sitemap.mjs
npm run qa
```

The existing `node scripts/prepare-deploy-output.mjs` copies the ready static files into the existing `public/` hosting output. Deployment has not been performed by this change.

## Owner-fill checklist

All `[ADD: ...]` keys used by this change are listed below. Replace facts in the data sources and regenerate the corresponding static HTML. Do not publish placeholder text as a business claim.

| Placeholder | Owner input |
| --- | --- |
| `[ADD: RESPONSE_TIME]` | Typical response/arrival range, geographic limits and conditions |
| `[ADD: SERVICE_HOURS]` | Actual operating hours and after-hours or 24/7 availability |
| `[ADD: LICENSE_INSURANCE]` | Verified licensing jurisdictions/details and approved insurance wording |
| `[ADD: WHATSAPP_ACCOUNT]` | Confirm WhatsApp is active on +17032440559 or supply the correct number |
| `[ADD: GOOGLE_RATING]` | Google Business Profile URL, current rating and review count |
| `[ADD: TESTIMONIALS]` | Approved review text, attribution, source link and date |
| `[ADD: HARDWARE_BRANDS]` | Confirmed manufacturers serviced and approved wording |
| `[ADD: BEFORE_AFTER]` | Approved before/after photos, dimensions, captions and documented outcomes |
| `[ADD: WARRANTY]` | Written workmanship/parts warranty terms, exclusions and claim process |
| `[ADD: VENDOR_DOCUMENTS]` | COI, W-9, invoicing, purchase orders and single-contact capabilities |
| `[ADD: MAINTENANCE]` | Recurring maintenance scope, schedule and multi-building coverage |
| `[ADD: FIRE_INSPECTIONS]` | Inspection provider qualifications, reporting and correction scope |
| `[ADD: DC_NEIGHBORHOODS]` | Confirm each DC neighborhood listed in the coverage checklist |
| `[ADD: VA_CITIES]` | Confirm Arlington and Alexandria coverage |
| `[ADD: MD_CITIES]` | Confirm Bethesda and Silver Spring coverage |
| `[ADD: FORM_DELIVERY]` | Verified submission endpoint, file handling and recipient before enabling the form |
| `[ADD: CALLBACK_WINDOW]` | Realistic callback window in minutes, hours and operating conditions |
| `[ADD: ADS_CONVERSIONS]` | Google Ads conversion ID/label and chosen call measurement method |
| `[ADD: CALL_TRACKING]` | Call tracking provider, numbers and qualified-call definition |
| `[ADD: PUBLIC_ADDRESS]` | Confirmed public business address, or keep the service-area setup |
| `[ADD: PRIVACY_DETAILS]` | Legal identity, privacy contact, effective date, retention and applicable consent details |

Verified hours, response targets and credentials can appear in the hero proof strip via `business.trust`. Review text, brand statements and job photos render only when their entries are explicitly approved. The Google badge uses `business.googleRating`; warranty wording uses `business.warranty`.

## Coverage confirmation

The brief confirms Washington DC, nearby Northern Virginia and nearby Maryland. The following finer-grained coverage is pending confirmation, recorded in `business.coverage` and source comments on the regional pages:

| Regional page | Confirm each location before adding a coverage claim | Useful commercial context |
| --- | --- | --- |
| `/washington-dc` | Downtown, Capitol Hill, Georgetown, Navy Yard, NoMa, Dupont Circle, Adams Morgan, U Street | Office access windows; restaurant/retail entrances; tenant contacts; deliveries; exact door identifiers |
| `/northern-virginia` | Arlington, Alexandria | Managed offices, mixed-use commercial openings and multi-location work orders |
| `/maryland` | Bethesda, Silver Spring | Medical-office access, storefront entrances and property-management requirements |

After confirmation, move supported names into the regional `verified` array and remove them from `pending`. The regional template will display the confirmed list. Do not expand schema or claim response times for unconfirmed geography.

The existing city/service redirects were preserved. Review Search Console landing-page traffic, impressions and backlinks before considering any future consolidation or restoration.

## Measurement and activation

- Treat `phone_click` and `whatsapp_click` as contact-intent events, not confirmed leads. `hero_phone_click`, `sticky_phone_click` and `footer_phone_click` are placement diagnostics; do not count them again as primary conversions.
- Direct GA4 delivery uses the existing measurement ID. A nonempty GTM container ID disables direct custom-event delivery; configure matching GA4 event tags inside that container before switching.
- Test actual delivery in GA4 Realtime/DebugView after publishing. Browser tests verify event commands and values, not access to the Analytics account.
- Google Ads IDs and call tracking remain unconfigured. Select the measurement method before filling conversion placeholders. Count qualified calls separately from clicks and booked work separately from calls.
- If using dynamic call numbers, keep the canonical business number in schema and business listings. Replace both visible digits and `tel:` destinations consistently on eligible website CTAs; WhatsApp continues to use its dedicated configured number.
- Keep the coming-soon form disabled until the delivery endpoint, recipient, uploads and callback promise are verified. A future success state must depend on a confirmed submission, not a click or a query parameter alone.
- Confirm privacy wording, retention and applicable consent requirements with the business owner before activating new processors or tracking services.

Reference: [GA4 event setup](https://developers.google.com/analytics/devguides/collection/ga4/events), [Google Ads call measurement](https://support.google.com/google-ads/answer/6095882).

Schema uses known service-area facts. An actual public address is omitted because none was supplied. Google local-business rich-result requirements should be checked against real business details; adding a type alone does not establish eligibility. FAQ markup does not guarantee a search enhancement. Reference: [Google LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business).

## Prioritized next steps

### Within 24 hours

1. Confirm WhatsApp works on the configured number; test the homepage and sticky Photo links on a real phone. Confirm an attached photo reaches the business.
2. Supply actual hours, response expectations, license/insurance wording and the public Google Business Profile link. Fill verified facts rather than publishing empty badges.
3. Review the local pages and publish through the existing hosting workflow when ready; then test calls, WhatsApp, CSS assets and GA4 events on the real domain.
4. Check the Google Business Profile name, primary phone, commercial services, categories, website link and actual service areas. Use the appropriate service-area setup if customers are not served at a public business address. [Google service-area guidance](https://support.google.com/business/answer/9157481).

### This week

1. Add approved review excerpts and two documented before/after jobs. Request reviews from real commercial customers through the existing business process.
2. Confirm each neighborhood/city in the coverage matrix and publish supported locations in the existing regional pages.
3. Configure qualified-call measurement, test call-tracking number replacement if adopted, and verify GA4/Ads conversions without duplicate click/placement conversions.
4. Prepare tightly matched Google Ads landing experiences using existing routes: commercial door repair, panic bar repair, door closer repair and commercial locksmith. The existing `?layout=paid` view removes distracting navigation; keep the canonical service URL and verify its noindex parameter view. Use real service areas and actual staffed hours. Exclude residential, automotive, DIY and job-seeker intent in campaign targeting.
5. Supply vendor document, maintenance and warranty details. Review whether the future online form is still needed once WhatsApp lead quality is measured.

### This month

1. Review Search Console by query and landing page before changing any existing slug or redirect. Separate commercial inquiries from irrelevant traffic.
2. Improve two to four existing resources using the outlines below; link each to one primary commercial service and the relevant contact action.
3. Compare calls, connected/qualified calls, WhatsApp conversations, quoted projects and won commercial work by campaign and service.
4. Add the verified form delivery integration when available, including actual receipt confirmation and an approved callback window.
5. Refresh verified photos, reviews, credentials, coverage and mobile performance after meaningful changes.

## Ten resource topics and outlines

Improve an existing relevant URL where indicated; do not replace ranking content wholesale or create a second article for the same intent. These are outlines, not published compliance advice. Verify jurisdiction-specific requirements and inspection qualifications before writing regulatory claims.

1. **The commercial door work-order checklist for property managers.** Outline: property/suite/door identifiers; observed closing/latching/locking/release symptoms; photos and brand labels; access contact and approval limit; required closeout documents. Link to `/service-property-manager-locksmith`; CTA: discuss a work order. A new resource can be considered after checking existing article coverage.
2. **What to prepare after a fire door fails inspection in DC.** Improve `/blog/what-happens-if-fire-door-fails-inspection`. Outline: record the exact report item; identify the opening; separate repair from inspection; agree documentation and access; coordinate acceptance with the responsible inspector. Link to `/fire-door-repair-washington-dc`.
3. **A commercial door closes but will not latch: what the manager should report.** Improve `/blog-why-commercial-door-wont-latch-properly`. Outline: safe observations; door/frame alignment; latch/strike clues; closer behavior; useful photos; when to call about an unsecured opening. Link to `/commercial-door-repair-washington-dc`.
4. **Panic-bar repair signs on busy restaurant and retail exits.** Improve `/blog-panic-bar-repair-signs-exit-device-needs-service`. Outline: stuck touchpad; failed release or relatching; loose hardware; information to record; service request checklist. Link to `/panic-bar-repair-washington-dc`.
5. **A leaking or slamming closer: adjustment or replacement?** Improve `/blog-why-door-closer-leaking`. Outline: observed symptoms; closer/arm/door relationships; photos and model details; limits of remote quoting; repair visit scope. Link to `/door-closer-repair-washington-dc`.
6. **Rekeying an office after staff or tenant turnover.** Improve `/blog-when-should-business-rekey-locks`. Outline: access inventory; authorized key holders; compatible rekey versus replacement; shared access and master keys; scheduling turnover. Link to `/commercial-rekey-washington-dc`.
7. **Planning master keys across multiple commercial buildings.** Improve `/blog-master-key-system-guide-offices-property-managers`. Outline: door inventory; access hierarchy; authorization; restricted-key requirements to discuss; rollout and future changes. Link to `/master-key-systems`.
8. **Securing a storefront after a break-in.** Improve `/blog-secure-store-after-break-in-dc`. Outline: immediate business contact and safety needs; document door/frame/lock damage; temporary securing versus permanent repair; identify separate glazing/board-up requirements; plan reopening. Link to `/commercial-door-repair-washington-dc`.
9. **Door hardware and access-control integrator responsibilities.** Improve `/blog-access-control-systems-small-business-what-to-know`. Outline: mechanical door operation; hardware symptoms; reader/software versus door work; integrator contact; planned access and acceptance checks. Link to `/access-control-systems-washington-dc`.
10. **What affects a commercial door and locksmith quote in Washington DC?** Improve `/blog-commercial-locksmith-pricing-dc`. Outline: opening condition; hardware and parts; opening counts; access/urgency; useful photos; inclusions, exclusions and follow-up. Publish no prices until supplied. Link to the matching repair or locksmith service.

## Validation

Final validation results are recorded in `docs/conversion-validation.md`. Local laboratory measurements are distinct from live-domain field performance and delivery to external accounts.
