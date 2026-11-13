# Commercial conversion upgrade

Updated November 11, 2026. Implementation for DC Emergency Lock & Door.

The complete current task disposition is in `docs/task-completion-checklist.md`. On November 11, the owner confirmed WhatsApp, 24/7 hours, free estimates and all 12 requested target locations. Unsupported credential, review, brand and warranty claims remain unpublished.

## Changelog

- Shortened the homepage hero around securing a business and restoring safe exit operation. Added direct Call and photo-quote CTAs.
- Connected photo buttons to the owner-confirmed WhatsApp number, +1 202-643-4062. Prefilled messages request business type/name, address or ZIP, problem, urgency and contact details. Photo attachment is completed in WhatsApp or through the optional device sharing action.
- Kept the mobile contact bar, made the Call and Photo controls equal-width, and added a desktop floating call action.
- Fixed the navigation breakpoint that caused tablet overflow; enlarged the menu target to 48px. Shortened phone heroes and removed portrait hero photos from the small-screen layout.
- Added an icon-based commercial audience strip and reusable sections for property/facility managers, restaurants/retail, offices/medical buildings, and fire doors/exit hardware. Each includes pain points, benefits, mini FAQs and a specific CTA.
- Added a call-versus-quote block, four-step process, pricing explanation and working WhatsApp quote form. The homepage, all 17 canonical service pages and all three regional pages have the shared request block.
- The active WhatsApp quote form includes name, phone, business type, business address/ZIP, problem, urgency, optional photo preview and optional property-manager details. It validates the fields, prepares the message and opens WhatsApp. Native photo sharing is offered where supported; otherwise the visitor attaches photos in WhatsApp. Direct website POST/upload delivery remains coming soon; it is never simulated.
- Added source-rendered attribution fields for UTM parameters, gclid, gbraid, wbraid, landing page and referrer. The form populates them without sending names, phone numbers, addresses or photos into analytics.
- Connected existing custom event hooks to the existing GA4 Google tag. A configured GTM container switches delivery to the data layer to avoid sending the same custom event by two routes. Photo clicks include a WhatsApp event.
- Added a noindex `/thank-you` follow-up destination for future integration. It explains the next step without claiming receipt of a message or promising an unverified callback time.
- Retained existing service copy, internal service routes, blog articles, redirect rules and all 59 sitemap URLs. Rewrote hedging in the main commercial content and photo captions.
- Added Locksmith/LocalBusiness entity types, owner-confirmed 24/7 hours and 12 confirmed target places to the shared business entity. Service, visible FAQ and breadcrumbs remain. No street address, rating, credential or guarantee was invented.
- Prepared data-driven reviews, Google rating badge, confirmed brands, credentials, approved before/after work and warranty sections. Empty/unverified proof stays out of the customer interface. Owner placeholders live in inert HTML templates/comments and this checklist.
- Inlined a small critical CSS layer; retained WebP sources, explicit image dimensions, lazy loading below the fold, and deferred vanilla JavaScript.

## Files and maintenance

- `scripts/build-core-pages.mjs`: existing page generator, hero, navigation, footer, schema, regional pages and follow-up page.
- `scripts/conversion-components.mjs`: shared WhatsApp CTAs, active quote-form markup, request routing, segment rendering, process, pricing and approved proof.
- `data/conversion-content.mjs`: four reusable segment templates, 12 distinct location profiles and the complete owner-placeholder registry.
- `data/business.json`: phone, WhatsApp number, verification flags, GA/Ads IDs, pending/verified coverage, Google rating and warranty.
- `data/proof-content.json`: approved reviews, manufacturers, credential wording and job/case-study photos. Its existing entry templates describe the required evidence fields. Before/after case-study images additionally need `src`, `width`, `height`, `alt` and `caption`.
- `assets/critical.css`, `assets/site.css`, `assets/site.js`, `assets/quote-form.js`: mobile layout, component styling, navigation, attribution and event delivery.
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

| Placeholder | Current owner-provided disposition |
| --- | --- |
| `[ADD: RESPONSE_TIME]` | Not supplied: omit numeric arrival and response guarantees |
| `[ADD: SERVICE_HOURS]` | Confirmed by owner: 24/7 service |
| `[ADD: LICENSE_INSURANCE]` | Not supplied: no public license or insurance claim |
| `[ADD: WHATSAPP_ACCOUNT]` | Confirmed by owner: WhatsApp receives messages on +12026434062 |
| `[ADD: GOOGLE_RATING]` | Not supplied: Google badge remains unpublished |
| `[ADD: TESTIMONIALS]` | Not supplied: testimonial placeholders remain unpublished |
| `[ADD: HARDWARE_BRANDS]` | Not supplied: no manufacturer service or affiliation claim |
| `[ADD: BEFORE_AFTER]` | Not supplied: use reference photos without completed-job claims |
| `[ADD: WARRANTY]` | Not supplied: no public guarantee or warranty claim |
| `[ADD: VENDOR_DOCUMENTS]` | Not supplied: discuss requirements without promising administrative capabilities |
| `[ADD: MAINTENANCE]` | Not supplied: no recurring maintenance program claim |
| `[ADD: FIRE_INSPECTIONS]` | Inspection provider qualifications, reporting and correction scope |
| `[ADD: DC_NEIGHBORHOODS]` | Confirmed target locations: Downtown, Capitol Hill, Georgetown, Navy Yard, NoMa, Dupont Circle, Adams Morgan and U Street |
| `[ADD: VA_CITIES]` | Confirmed target locations: Arlington and Alexandria |
| `[ADD: MD_CITIES]` | Confirmed target locations: Bethesda and Silver Spring |
| `[ADD: FORM_DELIVERY]` | WhatsApp quote preparation is active; direct website submission remains coming soon |
| `[ADD: CALLBACK_WINDOW]` | Realistic callback window in minutes, hours and operating conditions |
| `[ADD: ADS_CONVERSIONS]` | Google Ads conversion ID/label and chosen call measurement method |
| `[ADD: CALL_TRACKING]` | Call tracking provider, numbers and qualified-call definition |
| `[ADD: PUBLIC_ADDRESS]` | Confirmed public business address, or keep the service-area setup |
| `[ADD: PRIVACY_DETAILS]` | Legal identity, privacy contact, effective date, retention and applicable consent details |

Verified hours, response targets and credentials can appear in the hero proof strip via `business.trust`. Review text, brand statements and job photos render only when their entries are explicitly approved. The Google badge uses `business.googleRating`; warranty wording uses `business.warranty`.

## Coverage confirmation

The brief confirms Washington DC, nearby Northern Virginia and nearby Maryland. The owner confirmed all finer-grained target locations below. They now have distinct public sections, jump links, service links and estimate CTAs in the existing regional pages:

| Regional page | Confirmed target locations | Useful commercial context |
| --- | --- | --- |
| `/washington-dc` | Downtown, Capitol Hill, Georgetown, Navy Yard, NoMa, Dupont Circle, Adams Morgan, U Street | Office access windows; restaurant/retail entrances; tenant contacts; deliveries; exact door identifiers |
| `/northern-virginia` | Arlington, Alexandria | Managed offices, mixed-use commercial openings and multi-location work orders |
| `/maryland` | Bethesda, Silver Spring | Medical-office access, storefront entrances and property-management requirements |

All listed locations are now in the regional `verified` arrays; the `pending` arrays are empty. Do not add a numeric response or arrival promise: the owner did not supply one.

The existing city/service redirects were preserved. Review Search Console landing-page traffic, impressions and backlinks before considering any future consolidation or restoration.

## Measurement and activation

- Treat `phone_click` and `whatsapp_click` as contact-intent events, not confirmed leads. `hero_phone_click`, `sticky_phone_click` and `footer_phone_click` are placement diagnostics; do not count them again as primary conversions.
- Direct GA4 delivery uses the existing measurement ID. A nonempty GTM container ID disables direct custom-event delivery; configure matching GA4 event tags inside that container before switching.
- Test actual delivery in GA4 Realtime/DebugView after publishing. Browser tests verify event commands and values, not access to the Analytics account.
- Google Ads IDs and call tracking remain unconfigured. Select the measurement method before filling conversion placeholders. Count qualified calls separately from clicks and booked work separately from calls.
- If using dynamic call numbers, keep the canonical business number in schema and business listings. Replace both visible digits and `tel:` destinations consistently on eligible website CTAs; WhatsApp continues to use its dedicated configured number.
- The WhatsApp quote form is active. Keep any future direct server-delivery endpoint disabled until it is real and verified. Record `quote_request_ready` as preparation, not a confirmed lead. A direct website success state must depend on actual submission confirmation.
- Confirm privacy wording, retention and applicable consent requirements with the business owner before activating new processors or tracking services.

Reference: [GA4 event setup](https://developers.google.com/analytics/devguides/collection/ga4/events), [Google Ads call measurement](https://support.google.com/google-ads/answer/6095882).

Schema uses known service-area facts. An actual public address is omitted because none was supplied. Google local-business rich-result requirements should be checked against real business details; adding a type alone does not establish eligibility. FAQ markup does not guarantee a search enhancement. Reference: [Google LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business).

## Prioritized next steps

### Within 24 hours

1. WhatsApp is confirmed. After publication, test the homepage, prepared form and sticky Photo links on a real phone; verify an attached photo reaches the business.
2. 24/7 hours and free estimates are confirmed and published in the files. Unsupported response-time, credential, review and brand claims remain omitted at the owner’s instruction.
3. Review the local pages and publish through the existing hosting workflow when ready; then test calls, WhatsApp, CSS assets and GA4 events on the real domain.
4. Check the Google Business Profile name, primary phone, commercial services, categories, website link and actual service areas. Use the appropriate service-area setup if customers are not served at a public business address. [Google service-area guidance](https://support.google.com/business/answer/9157481).

### This week

1. If genuine review excerpts or documented before/after jobs become available, add them through the prepared approval-gated proof templates. None were supplied for this implementation.
2. The 12 named locations now have detailed targeting in the existing regional pages. Check local landing-page inquiries and Search Console performance after publication.
3. Configure qualified-call measurement, test call-tracking number replacement if adopted, and verify GA4/Ads conversions without duplicate click/placement conversions.
4. Prepare tightly matched Google Ads landing experiences using existing routes: commercial door repair, panic bar repair, door closer repair and commercial locksmith. The existing `?layout=paid` view removes distracting navigation; keep the canonical service URL and verify its noindex parameter view. Use real service areas and actual staffed hours. Exclude residential, automotive, DIY and job-seeker intent in campaign targeting.
5. Supply vendor document, maintenance and warranty details. Review whether the future online form is still needed once WhatsApp lead quality is measured.

### This month

1. Review Search Console by query and landing page before changing any existing slug or redirect. Separate commercial inquiries from irrelevant traffic.
2. Improve two to four existing resources using the outlines below; link each to one primary commercial service and the relevant contact action.
3. Compare calls, connected/qualified calls, WhatsApp conversations, quoted projects and won commercial work by campaign and service.
4. If direct server delivery is later desired, connect a verified submission integration. The current WhatsApp flow already prepares qualified requests; any future receipt confirmation must correspond to actual delivery.
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

Final validation results are recorded in `docs/conversion-validation.md`. Local laboratory measurements are distinct from live-domain field performance and delivery to external accounts. Photo sharing follows the device capabilities described in the [Web Share API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
