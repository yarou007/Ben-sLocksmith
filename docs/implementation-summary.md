# SEO/CRO implementation summary

Implementation date: 2026-07-14  
Production origin configured in source: `https://dcemergencylockanddoor.com`  
Release status: source implementation and local QA complete; deployment, form delivery, business claims, and analytics-account integrations still require external verification.

## Outcome

The static site now has a deliberate commercial-service Washington DC architecture, a shared conversion system, centralized business data, differentiated transactional service pages, deterministic generation, and automated site QA. The implementation emphasizes commercial door and locksmith work without using negative service-rejection language or interfering with direct phone calls.

Repository counts at handoff:

- 127 HTML documents in the implemented-site crawl; the pre-edit audit recorded 125 before the new panic-bar-installation and 404 pages were added.
- 28 canonical/support pages produced by `scripts/build-core-pages.mjs`.
- 17 differentiated service configurations across `data/service-pages-locksmith.mjs`, `data/service-pages-hardware.mjs`, and `data/service-pages-planned.mjs`.
- 59 final canonical URLs in `sitemap.xml`.
- 63 exact redirect sources in `data/redirects.json`.
- Three legacy New York pages are `noindex,follow` and excluded from the sitemap pending confirmation that New York is a real current market.

This is not evidence that the source has been deployed to production or that an external form, analytics tag, call conversion, or redirect has worked on the live origin.

## Audit findings addressed

The full baseline and URL-by-URL decision table are in `docs/seo-cro-audit.md`. The main findings were:

- Static HTML on Vercel had no repeatable build, lint, configuration validation, or crawl-based test workflow.
- Commercial search intent was fragmented among near-duplicate locksmith, door repair, panic/exit hardware, closer, fire-door, access-control, and city/service pages.
- The only phone number consistently present in the audited source was `703-244-0559` (`+17032440559`). It is now centralized but still requires owner confirmation.
- Forms used an existing FormSubmit inbox while shared JavaScript suppressed parts of the intended request funnel. Recipient ownership and delivery were not proven.
- GTM, GA4, Google Ads, and call-tracking values were placeholders. An existing Ahrefs key was present.
- Repeated schema and copy exposed unsupported license, insurance, hours, response-time, review, address, certification, compliance, reporting, brand, and service claims.
- Images lacked source-level intrinsic sizing and responsive delivery; hero loading, webfonts, repeated third-party assets, sticky UI, and duplicated scripts created performance and CLS/INP risks.
- Internal linking distributed relevance to legacy aliases, while the storefront repair route was orphaned.
- Accessibility weaknesses included incomplete mobile-menu state, inconsistent focus treatment, sticky-bar collision risk, and weak form status/error semantics.

The implementation centralizes uncertain facts as disabled configuration values rather than publishing placeholders as claims.

## Change groups

| Group | Primary files | Result |
|---|---|---|
| Audit and planning | `docs/seo-cro-audit.md`, `docs/keyword-url-map.md`, `docs/internal-link-map.md` | Records the pre-edit crawl, one canonical owner per valuable intent, consolidation decisions, and final internal-link rules. |
| Business and proof data | `data/business.json`, `data/proof-content.json` | Centralizes phone, service areas, trust flags, integrations, proof collections, and explicit verification TODOs. Empty or unverified facts do not render as trust claims. |
| Differentiated service content | `data/service-pages-locksmith.mjs`, `data/service-pages-hardware.mjs`, `data/service-pages-planned.mjs` | Defines 17 pages by buyer problem, intent, CTA type, related services, and visible FAQs. |
| Shared page/conversion system | `scripts/build-core-pages.mjs`, `assets/site.css`, `assets/site.js`, `assets/business-config.js` | Generates semantic pages, positive commercial-service context, call CTAs, mobile sticky call bar, service-page forms, breadcrumbs, verified-only trust output, paid-search mode, and data-layer events. The homepage is call-focused and has no form. |
| Legacy safety pass | `scripts/sanitize-legacy-pages.mjs`, `assets/legacy-safety.css` | Removes placeholder tracking and unsupported claims/schema, normalizes shared assets, improves metadata/accessibility, rewrites internal links, and applies verification gates to legacy content. |
| Technical SEO and delivery | `data/redirects.json`, `scripts/build-vercel-config.mjs`, `scripts/generate-sitemap.mjs`, `scripts/prepare-deploy-output.mjs`, `vercel.json`, `robots.txt`, `sitemap.xml`, `404.html`, `site.webmanifest`, `favicon.ico`, `llms.txt` | Establishes the preferred clean URL convention, explicit single-hop 301 redirect registry, final sitemap, crawl rules, security/cache headers, manifest/favicon, a noindex 404 document, and a clean `public/` Vercel output containing only deployable files. |
| Images and performance | `assets/*.webp`, generated `<picture>`/image markup, shared CSS/JS | Adds WebP derivatives, intrinsic dimensions, responsive sources, eager/fetch-priority hero loading, lazy below-fold loading, system fonts, and delayed nonessential analytics. |
| Measurement documentation | `docs/measurement-plan.md`, `docs/post-implementation-checklist.md` | Defines event semantics, attribution, conversion hierarchy, GTM/GA4/Ads setup, test procedures, and the external release gate. |
| QA tooling | `package.json`, `scripts/check-syntax.mjs`, `scripts/validate-site-data.mjs`, `scripts/qa-site.mjs`, `scripts/site-audit.mjs` | Adds deterministic build, syntax checks, data/redirect validation, metadata/link/schema/form/image QA, and repeatable site inventory. |

## Routes created and rebuilt

Two routes are new in the working tree:

- `/panic-bar-installation-washington-dc` — separates planned installation/retrofit intent from repair.
- `/404` — accessible, useful, and `noindex,follow`; its actual HTTP 404 response still must be tested on a Vercel preview.

The generator retains and rebuilds these existing transactional routes rather than inventing competing slugs:

- `/commercial-locksmith-washington-dc`
- `/commercial-door-repair-washington-dc` — owns emergency commercial door repair intent; no competing `/emergency-commercial-door-repair-washington-dc` route was created.
- `/panic-bar-repair-washington-dc`
- `/door-closer-repair-washington-dc`
- `/exit-device-repair-washington-dc`
- `/commercial-door-lock-repair-washington-dc`
- `/commercial-rekey-washington-dc`
- `/fire-door-inspection-washington-dc`
- `/fire-door-repair-washington-dc`
- `/commercial-door-installation-washington-dc`
- `/access-control-systems-washington-dc` — retains the existing descriptive URL instead of creating a competing access-control slug.
- `/storefront-door-repair-washington-dc`
- `/master-key-systems`
- `/service-office-lockout`
- `/service-property-manager-locksmith`
- `/service-restricted-key-systems`

The other generated canonical/support routes are:

- `/`
- `/washington-dc`, `/northern-virginia`, and `/maryland`
- `/about`, `/gallery`, `/privacy-policy`, `/terms-of-service`, `/blog`, and `/sitemap`

Retained informational articles receive a shared safety/technical pass rather than being replaced by thin transactional copies.

## Routes merged and redirected

`data/redirects.json` is the sole redirect authority. It contains 63 source paths, and no configured target is also a source. `scripts/build-vercel-config.mjs` expands that registry into 259 explicit `statusCode: 301` delivery rules for legacy aliases, `.html` forms, and hostname normalization. The source files remain in the repository as migration inputs, but final navigation, schema, breadcrumbs, `llms.txt`, and the XML sitemap point directly to the canonical destinations.

The major consolidations are:

- Five generic/emergency DC locksmith aliases into `/commercial-locksmith-washington-dc`.
- The older DC door-repair alias into `/commercial-door-repair-washington-dc`.
- Generic panic-bar, exit-device, door-closer, door-hardware, rekey, installation, access-control, fire-door, and compliance aliases into their differentiated service owners.
- Alexandria and Arlington city/service permutations into `/northern-virginia`.
- Bethesda and Silver Spring city/service permutations into `/maryland`.
- Broad `/dmv-commercial-locksmith` intent into `/`.
- `/city-washington-dc`, `/city-northern-virginia`, `/city-maryland`, and `/city-new-york` into their clean location routes.

The exact 63-path table and keyword rationale are in `docs/keyword-url-map.md`; direct-link replacement requirements are in `docs/internal-link-map.md`. Preview HTTP tests remain mandatory because repository inspection cannot prove Vercel status codes, hop counts, query preservation, hostname normalization, or 404 behavior.

## Pages and claims requiring human verification

| Area | Pages/components affected | Required confirmation before publishing the claim or enabling the feature |
|---|---|---|
| Business identity | All pages, Organization/Service schema, `/about`, footer | Legal name, approved display name, public phone, service-area-only/address model, preferred hostname, and Google Business Profile. |
| Availability and trust | Homepage, service heroes, trust bars, final CTAs | Hours, 24/7 or after-hours dispatch, same-day service, response-time wording, license, insurance, written estimates, COI, W-9, commercial invoicing, and property-manager processes. |
| Fire-door scope | `/fire-door-inspection-washington-dc`, `/fire-door-repair-washington-dc`, and fire-door articles | Whether formal inspections are performed directly/coordinated/subcontracted, personnel qualifications, report format, deficiency-correction scope, rated-opening constraints, and AHJ-appropriate wording. |
| Proof and reputation | `/gallery`, homepage proof/case-study areas, brand/proof data | Ownership and approval for each photo/caption; genuine jobs, testimonials, review sources, customer logos, certifications, social profiles, hardware-brand relationships, and dates/general locations. |
| Forms and photos | Every emergency/scheduled form, `/privacy-policy` | Form recipient ownership, FormSubmit activation, response team, backup workflow, approved photo types/size/retention/deletion, processor disclosure, spam controls, and end-to-end delivery. |
| Advertising and privacy | All tracked pages and forms | Consent rules, analytics/advertising disclosures, session attribution/click-ID handling, call recording, retention, privacy contact, policy effective date, and legal approval. |
| New York | `/new-york`, `/door-repair-nyc`, `/blog-how-to-fix-door-closer-nyc` | Confirm whether New York is a real current service market. These pages are currently `noindex,follow`, absent from the sitemap, and not promoted from the DC architecture. |

Until confirmed, the central flags remain false/null and public proof arrays remain empty. The complete owner worksheet is `docs/human-verification-checklist.md`.

## Business information still needed

- Legal business name and approved public name.
- Owner-confirmed phone routing, advertised service hours, after-hours procedure, and service-area/exclusion boundaries.
- Genuine public address or confirmation that this is a service-area business whose address must remain omitted.
- License wording/numbers/jurisdictions, insurance wording, COI, W-9, commercial invoicing, written estimates, same-day availability, and evidence-backed response-time wording.
- Confirmed services, property types, fire-door inspection/report/correction capabilities, and hardware-brand relationships.
- Google Business Profile and approved social URLs.
- Source/approval for job photos, case studies, reviews/testimonials, ratings, certifications, logos, and other proof.
- Form inbox ownership, processor activation, response owner, backup recipient, approved messaging/photo channel, and privacy/retention rules.
- GTM container, GA4 property/measurement ID, Google Ads account/conversion IDs and labels, call-tracking provider, approved dynamic-number behavior, CRM ownership, and offline-import method.
- Privacy-policy owner/contact, effective date, processor disclosures, consent requirements, and retention/deletion rules.
- Vercel/DNS/hosting ownership and Search Console access.

## Analytics, GTM, GA4, Ads, and call-tracking steps

The website exposes one data-layer contract through `assets/site.js`; all account IDs and call-replacement values remain null in `data/business.json`. The existing Ahrefs key is preserved and delayed, but its ownership/privacy status still needs approval.

1. Confirm the tracking/privacy owner and inventory every currently active tag before adding anything.
2. Supply one approved GTM container ID, rebuild the site so `assets/business-config.js` is regenerated, and confirm the container loads once.
3. In GTM, create Custom Event triggers and GA4 Event tags from `docs/measurement-plan.md`. Map the documented common fields and keep personal data, filenames, and raw click identifiers out of the data layer.
4. In GA4 DebugView, exercise the full matrix: hero/sticky/footer calls, form start, blocked/valid form submit, matched and bare return states, photo CTA, service card, and qualification notice. Confirm one physical interaction does not create duplicate events.
5. Treat `phone_click`, placement clicks, form starts, photo clicks, service-card clicks, and qualification views as secondary/diagnostic. A phone-link tap is not a connected or qualified call.
6. Verify FormSubmit recipient delivery, spam filtering, and `lead_id` continuity before using one acknowledged form-success event as an interim conversion. Never use `form_submit_attempt` as a conversion.
7. Configure an approved Google Ads website-call or call-tracking conversion. Keep the owner-approved public number visible, test desktop/mobile number replacement, and define a qualified-commercial-call rule from connected-call/disposition evidence.
8. Choose either GTM-managed website-call delivery or the optional `direct_gtag` hook; do not enable both for the same action.
9. Make a genuinely qualified call Primary only after the workflow is tested. Keep raw phone clicks Secondary, and avoid importing both GA4 and Ads-native versions of the same outcome.
10. When a CRM can return qualified-lead/booked-job status, import those offline outcomes using stable click/lead IDs, timestamps, deduplication, and approved values. Test before bidding uses them.

## Google Search Console validation

After an approved preview and production deployment:

1. Verify the preferred Domain property and the HTTPS apex URL-prefix property, if both are maintained.
2. Confirm `robots.txt` and `sitemap.xml` return 200, then submit the sitemap containing the 59 final canonical URLs.
3. Inspect `/`, `/commercial-door-repair-washington-dc`, `/commercial-locksmith-washington-dc`, `/panic-bar-repair-washington-dc`, `/door-closer-repair-washington-dc`, `/fire-door-inspection-washington-dc`, `/northern-virginia`, and `/maryland`.
4. Check live-test rendering, crawl allowance, self-canonical selection, mobile usability, structured data, and the final response status before requesting indexing for only the highest-priority changed URLs.
5. Inspect representative redirect sources from each consolidation cluster. Confirm Google sees a permanent single-hop redirect to the intended target and no source remains in the sitemap or internal links.
6. Inspect the three New York URLs and confirm their `noindex,follow` state until the market decision is approved.
7. Monitor Page indexing for duplicate/canonical anomalies, crawled-not-indexed pages, soft 404s, redirect errors, and parameter variants. Do not request indexing for redirect, noindex, paid-layout, or tracking-parameter URLs.
8. Annotate the release date and compare query/page/device performance against the supplied seven-day baseline: 753 impressions, 5 clicks, 0.66% CTR, and approximate weighted position 28.2.
9. Watch the priority query/page pairs, especially emergency door repair, door closer services, panic-bar repair/installation, commercial locksmith DC, commercial lock repair, fire-door inspection, the homepage, and office lockout.

## Practical 30-day measurement plan

| Window | Actions | Decision signals |
|---|---|---|
| Before launch | Complete owner claim review; test Vercel redirects/404/sitemap; validate forms; run browser/accessibility/Lighthouse checks; connect and debug approved analytics only. | Zero release-gate failures; confirmed inbox and call routing; no duplicate tags or conversions. |
| Days 1–3 | Annotate deployment in GA4, Ads, and GSC; submit sitemap; inspect priority URLs; test one approved commercial call and each form type; review server/tag errors. | Final 200/indexable URLs, single-hop aliases, connected call attribution, delivered form plus `lead_id`, no PII in analytics. |
| Days 4–7 | Review GSC discovery/indexing and Ads search terms; reconcile phone clicks with connected calls and form successes with received leads; review irrelevant paid-search demand without adding caller-rejection copy. | Qualified-commercial-call rate, lead-delivery rate, wrong-service demand, index coverage, priority-query impressions/CTR. |
| Days 8–14 | Compare mobile and desktop CTR/position by query and landing page. Inspect titles/snippets only where impressions are sufficient; review call/form CTA placement and error rates. | Changes in CTR versus the baseline, call connection/qualification, form start-to-delivery, device gaps, high-impression low-CTR pages. |
| Days 15–21 | Strengthen contextual internal links for pages gaining impressions; add only owner-approved local proof/photos; resolve crawl or canonical anomalies; review search terms and conversion-quality notes with dispatch. | New priority-query coverage, fewer orphan/duplicate signals, higher qualified-lead share, no new claim/compliance risk. |
| Days 22–30 | Evaluate performance by service, page, device, source, and location. Promote only verified qualified calls or qualified/booked outcomes to Primary. Build the next test backlog without rewriting multiple title/content variables at once. | Qualified calls, qualified scheduled requests, booked jobs if available, cost per qualified lead, query-level CTR/position, wrong-lead rate, Core Web Vitals. |

Use qualified calls and delivered commercial requests as the operating measures. Page views, scroll depth, phone clicks, and form starts are diagnostics, not business outcomes.

## QA evidence and external limitations

Local repository evidence for this implementation includes:

- `npm run build` generated 28 canonical/support pages, the Vercel rules, a 59-URL sitemap, and a clean 194-file `public/` deployment bundle.
- `npm run qa` covers JavaScript/module syntax, business/service/redirect configuration, and the full static crawl.
- The final recorded static run reported `QA PASSED — 0 issues`: 127 pages, 59 sitemap URLs, 1,834 internal links, 692 asset references, 176 images, 61 forms, and 5,611 checks.
- Configuration validation covered the 17 service definitions, all 63 redirect sources, the explicit 301 status of every generated Vercel redirect rule, and the required `public` Vercel output directory.
- A local headless-Chromium interaction pass exercised 40 checks across mobile navigation/sticky calls, event deduplication, form validation/attribution/success guards, paid mode, scheduled service, 404, and a legacy article. Desktop/mobile visual captures were also reviewed locally.

These results prove source generation and local behavior only. Before release, rerun the exact commands against the final commit and record the SHA/output in `docs/post-implementation-checklist.md`.

The following remain outside repository proof:

- No production or Vercel preview deployment was performed as part of this handoff.
- Permanent HTTP status/hop behavior, preferred-host normalization, query preservation, real 404 status, response headers, compression, and sitemap URL responses require a deployed Vercel preview.
- FormSubmit inbox activation, recipient ownership, file delivery, spam handling, reply workflow, failure behavior, and end-to-end `lead_id` continuity are unverified.
- GTM Preview, GA4 DebugView, Google Ads conversions, connected-call attribution, dynamic number replacement, CRM/offline imports, and consent behavior are unverified because approved account IDs/access were not supplied.
- Rich Results Test, Schema.org Validator, Search Console live inspection, PageSpeed Insights/field Core Web Vitals, and a rendered external crawl remain pending.
- Local Chromium checks do not replace Safari/WebKit, physical iOS safe-area, Android, screen-reader, keyboard-only, 200% zoom, contrast, and automated accessibility testing on the deployed build.
- Business identity, trust, service-capability, proof, and legal/privacy claims remain gated by `docs/human-verification-checklist.md`.

Do not mark the release complete until the production build is rerun on the final source and every applicable external gate in `docs/post-implementation-checklist.md` has recorded evidence or an explicit owner-approved disposition.
