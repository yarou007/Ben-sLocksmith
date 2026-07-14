# Post-implementation checklist

Last updated: 2026-07-14

This is the release gate for the SEO/CRO implementation. A checked item means only the evidence stated in that row was produced; it does not imply that the whole release passed. Re-run every release-gate check after the final generated files are built and immediately before deployment.

Status conventions:

- `[x]` completed with evidence recorded below
- `[ ]` pending, failed, or not yet evidenced
- “External” requires a deployed URL, inbox/provider, Google account, external validator, or real-device/browser matrix and cannot be proven by repository inspection or one local Chromium run

## Release evidence record

| Field | Value |
|---|---|
| Commit SHA tested | Not committed: local working tree based on `9a67e22`; an exact release commit has not been tested |
| Branch | `master` |
| Build timestamp and timezone | Recorded local run on 2026-07-14 (`Africa/Tunis`); exact final-release timestamp pending |
| Preview deployment URL | _Not created or tested_ |
| Production deployment URL | Existing origin: `https://dcemergencylockanddoor.com`; this implementation has not been deployed or verified there |
| Tester | Codex, local static checks and headless Chromium only |
| Static QA report | Recorded local `npm test`: 127 HTML pages, 59 sitemap URLs, 1,834 internal links, 692 asset references, 176 images, 61 forms, 5,611 checks, 0 issues. Re-run against the exact release commit before deployment. |
| Local browser QA | Headless Chromium: 40 automated interaction checks passed, with local screenshots of representative desktop/mobile pages. Safari/WebKit and real-device testing remain pending. |
| Lighthouse reports | _Pending_ |
| GTM Preview session/screenshot | _Pending_ |
| GA4 DebugView evidence | _Pending_ |
| Form-delivery evidence | _Pending_ |

## Completed source-level checks

These checks were run locally on 2026-07-14. They do not prove deployment behavior, real form delivery, third-party tag configuration, Safari/WebKit behavior, or owner approval. Because the working tree is uncommitted, repeat the build and QA against the exact release commit.

| Status | Check | Command | Evidence |
|---|---|---|---|
| [x] | Shared browser JavaScript parses | `node --check assets/site.js` | Exit code 0; no output |
| [x] | Business configuration is valid JSON, the phone is valid E.164, and conversion integrations remain inactive | Node assertion against `data/business.json` | Parsed successfully; `+17032440559` is valid; GTM/GA4/Ads/call tracking are null; the existing production Ahrefs key is preserved separately |
| [x] | Required event names and the diagnostic attempt event are present in source | Node source review against `assets/site.js` | Required call, form, photo, service-card, and qualification events plus `form_submit_attempt` are present |
| [x] | Event semantics and configuration were compared with the measurement plan | Source review plus local headless-Chromium interaction checks | Source creates `event_id`/`lead_id`; the local browser checks confirmed hero/sticky call deduplication, form start/attempt behavior, matched recent provider-return success, and suppression of bare success URLs. GTM, GA4, Ads, and delivery verification remain pending. |

## Business-data and claim gate

Complete this section with `docs/human-verification-checklist.md` open. An empty configuration value is safer than an invented claim.

| Status | Check | Pass condition | Evidence/owner |
|---|---|---|---|
| [ ] | Identity | Legal name, approved display name, phone, and service-area model are owner-confirmed | _Pending_ |
| [ ] | Contact routing | The configured number reaches the commercial-service workflow during every advertised hour | _Pending_ |
| [ ] | Address | A genuine eligible public address is approved, or address markup remains omitted for a service-area business | _Pending_ |
| [ ] | Hours | Any “24/7,” after-hours, or availability wording is explicitly confirmed | _Pending_ |
| [ ] | Trust claims | License, insurance, same-day, response-time, COI, W-9, estimates, and invoicing claims render only when confirmed | _Pending_ |
| [ ] | Proof | Every photo, caption, testimonial, review, logo, certification, and case study has source and publication approval | _Pending_ |
| [ ] | Services/brands | Fire-door capabilities, property types, and each brand relationship use accurate wording | _Pending_ |
| [x] | DC market focus | DC pages and paid-search mode do not prominently promote New York | Verified in local source/static QA. The three unverified New York legacy routes remain accessible as `noindex,follow` and are excluded from the sitemap and generated blog hub pending owner confirmation. |
| [x] | Commercial-service focus | Primary pages describe commercial door and locksmith work positively, contain no negative caller-rejection copy, and retain direct phone links | Verified in generated source and static QA; this does not confirm the owner's full service policy. |
| [ ] | Privacy | Processor, photo, analytics, advertising, click-ID, consent, retention, and privacy-contact requirements are approved | _Pending_ |

Suggested pre-release claim review:

```bash
rg -ni '24/7|same[- ]day|response time|licensed|insured|certified|guaranteed|w-9|certificate of insurance|\bcoi\b|rating|reviews?|best|number one|#1' --glob '*.html' --glob '*.json' --glob '*.mjs'
```

Review each result in the context of final, non-redirected routes. Informational discussion of a term is not automatically a claim, and a configured redirect-source file is not a live final page.

## Build and automated static QA

Run the commands against the exact commit being deployed. Save untruncated output with the release record.

The checked rows below record successful local working-tree runs, not a release-commit sign-off. The recorded build generated 28 core/support pages and a 59-URL sitemap; the recorded QA crawl completed 5,611 assertions with zero issues. Re-run the full sequence against the exact release commit before deployment.

| Status | Check | Command/procedure | Pass condition | Evidence |
|---|---|---|---|---|
| [x] | Patch hygiene | `git diff --check` | Exit code 0 | Recorded local working-tree run exited 0 with no output. Release-commit rerun pending. |
| [x] | JavaScript/module syntax | `npm run lint` | Every checked file exits 0 | Recorded local run passed 23 JavaScript modules and 5 JSON files. Final-release rerun pending. |
| [x] | Data/config validation | `npm run typecheck` and static QA | Exit code 0; no invented enabled trust values | Recorded local run passed 17 service configurations and 63 redirects and confirmed every generated Vercel redirect rule uses explicit status code 301; trust integrations remain null/disabled. Final-release rerun pending. |
| [x] | Generated browser config | Generated-file comparison in build/static QA | Phone/integration values match `data/business.json`; no hand-edited drift | Recorded local QA passed with `+17032440559`; GTM/GA4/Ads/call tracking remain unconfigured. Final-release rerun pending. |
| [x] | Lint | `npm run lint` | Exit code 0; meaningful warnings resolved | Recorded local run exited 0. Final-release rerun pending. |
| [x] | Type/config check | `npm run typecheck` | Exit code 0 | Recorded local run exited 0. Final-release rerun pending. |
| [x] | Production build | `npm run build` | Exit code 0; generated core pages, redirects, sitemap, and Vercel output are current | Recorded local run exited 0 and generated 28 core/support pages, the redirect configuration, 59 sitemap URLs, and a 194-file `public/` deployment bundle. No deployment was performed; final-release rerun pending. |
| [x] | Repeatable build | Re-run the production build without source changes, then inspect generated output | No unexplained generated drift | The second recorded local build reported 0 generated core-page changes, 0 legacy sanitizer changes, current Vercel rules, the same 59-URL sitemap, and a regenerated 194-file `public/` bundle. Release-commit rerun pending. |
| [x] | Vercel output contract | Inspect `vercel.json` and generated `public/` | `outputDirectory` is `public`; required site files exist; source/config directories are not copied | Local validation passed for `index.html`, `404.html`, shared CSS/JS, robots, and sitemap; `scripts/`, `data/`, `docs/`, `package.json`, and `vercel.json` are absent from the publish bundle. |
| [x] | Static site QA | `npm test` | Process exits 0 with zero issues | Recorded local run passed 5,611 checks across 127 pages, 59 sitemap URLs, 1,834 internal links, 692 asset references, 176 images, and 61 forms. Release-commit rerun pending. |
| [x] | Metadata/link inventory | `npm test` static crawl | No unexplained missing metadata, duplicate titles/descriptions, invalid JSON-LD, broken links, or orphan final routes | Covered by the recorded local 5,611-check crawl with zero issues. Preview HTTP behavior remains untested. |

Package scripts now exist. Completion still cannot be claimed until they pass against the exact release commit and the external release gates below are satisfied.

### Static QA acceptance criteria

The recorded local static crawl passed each criterion below. These are source-level results and must be repeated after final generation; they do not prove deployed status codes, response headers, or search-engine behavior.

- [x] Every final indexable page has one unique nonempty title, one unique nonempty description, one H1, a logical heading hierarchy, and `lang`/viewport metadata.
- [x] Every final indexable page has an absolute self-referencing HTTPS canonical on the preferred hostname, without query parameters or fragments.
- [x] Redirect sources are absent from the XML sitemap and no internal link points to a redirect source.
- [x] Every internal target and fragment exists; there are no orphan final service pages.
- [x] Every sitemap URL maps to a final self-canonical, indexable source page.
- [x] Every JSON-LD block parses, uses the configured phone/name/origin, and contains no fake address, hours, rating, review, license, or certification.
- [x] FAQ JSON-LD appears only where the same questions and answers are visible.
- [x] Every `tel:` link is exactly `tel:+17032440559` before any approved runtime replacement, and visible phone text matches it.
- [x] Every lead form contains exactly one hidden field for landing page, referrer, five UTMs, `gclid`, `gbraid`, and `wbraid`.
- [x] Every form control has a programmatic label; `tel`/`email` input types and autofill attributes are appropriate.
- [x] Every meaningful image has accurate alt text and intrinsic width/height; decorative images use empty alt.
- [x] The LCP/hero image is not lazy-loaded; below-the-fold images are lazy-loaded where appropriate.
- [x] Important CSS, JavaScript, images, and JSON-LD are not blocked by robots rules.
- [x] No final DC page or DC paid-search layout contains prominent New York links or promotion; the three retained New York legacy pages are `noindex,follow` and absent from the sitemap.

## Preview-deployment HTTP and crawl checks — external

Use a Vercel preview or deployment that applies the real redirect/clean-URL configuration. A basic static file server cannot prove Vercel redirect behavior.

Set the preview origin for command examples:

```bash
export PREVIEW_ORIGIN='https://replace-with-preview-host.example'
```

| Status | Check | Procedure | Pass condition | Evidence |
|---|---|---|---|---|
| [ ] | Preferred protocol/host | Request HTTP, HTTPS, `www`, and apex variants with `curl -sSI` | One permanent hop to the preferred HTTPS apex, then 200 | _Pending_ |
| [ ] | Alias redirects | Test every source in `data/redirects.json`, including `.html` variants | Exactly one 301 hop to the intended final URL; no chain, loop, soft 404, or query loss | _Pending_ |
| [ ] | Lowercase/clean URLs | Test representative uppercase, trailing-slash, `.html`, and `/index` requests | Behavior matches the documented convention without multiple hops | _Pending_ |
| [ ] | Sitemap status | Extract each `<loc>` from `/sitemap.xml` and request it | Every URL returns final 200, is indexable, and self-canonical | _Pending_ |
| [ ] | Robots | Request `/robots.txt` and its declared sitemap | 200; important assets are allowed; sitemap URL is correct | _Pending_ |
| [ ] | 404 behavior | Request a unique nonexistent path | Real 404 status with useful accessible page and `noindex`; not a 200 soft 404 | _Pending_ |
| [ ] | Parameters | Test UTMs, `gclid`, `gbraid`, `wbraid`, and paid layout parameters | Page remains 200, canonical stays parameter-free, attribution survives navigation, no parameter URL enters sitemap | _Pending_ |
| [ ] | Headers | Inspect HTML and static asset response headers | Intended cache and security headers apply; no mixed content | _Pending_ |
| [ ] | External crawl | Crawl the preview with a crawler configured to render JavaScript if possible | No broken internal URLs, redirect-source links, duplicate indexable parameter URLs, or blocked essential assets | _Pending_ |

For sitemap status testing, retain a CSV with URL, first status, final status, hop count, canonical, robots directive, and response time.

## Browser layout, accessibility, and mobile-call QA — local and external

The local headless-Chromium suite passed 40 automated interaction checks and representative desktop/mobile screenshot review. Checked rows mean only that local Chromium scope passed. Current Safari/WebKit, real iPhone/Android hardware, screen-reader testing, a full keyboard audit, and deployed third-party overlays remain pending.

| Status | Check | Pass condition | Evidence |
|---|---|---|---|
| [x] | Homepage | Hero, problem selection, trust content, forms, FAQs, and final CTA render without clipping or overlap | Passed representative local desktop/mobile Chromium review. |
| [x] | Emergency page | Call CTA and short form are visible above the fold at representative mobile/desktop widths | Passed local desktop/mobile Chromium review. |
| [x] | Scheduled page | Fire-door inspection/installation pages prioritize scheduled quote workflow while preserving a phone option | Passed local mobile Chromium review of the fire-door request page; owner confirmation of inspection capability remains pending. |
| [x] | Mobile sticky bar — local viewport | Visible at the intended mobile width, uses the configured `tel:` link and accessible label, and leaves content space | Passed emulated-mobile Chromium checks. Real iOS safe-area behavior remains pending. |
| [ ] | Overlay conflicts | Sticky call bar does not overlap consent banners, browser UI, form controls, chat, or validation messages | _Pending_ |
| [x] | Paid-search mode | `?layout=paid` and `?lp=paid` create a minimal header, focused service/location content, primary/secondary CTAs, and a visible privacy link without changing canonical | Passed local Chromium checks, including runtime `noindex`, clean canonical, privacy link, and UTM retention. Deployed parameter handling remains pending. |
| [x] | Navigation | Mobile menu exposes correct expanded state, closes with Escape/link activation, and returns focus appropriately | Passed local Chromium interaction checks. |
| [ ] | Keyboard/focus | Skip link, nav, CTAs, forms, accordions, and footer are reachable in logical order with visible focus | Menu/Escape/focus-return behavior passed locally; a complete keyboard and assistive-technology audit is pending. |
| [ ] | Touch targets | Primary controls meet practical 44×44 CSS-pixel target sizing and are not crowded | _Pending_ |
| [x] | Forms — local behavior | Labels, required validation, file-size error, form-start/attempt state, and duplicate-submit guard work in Chromium | Passed local automated checks. Provider delivery, mobile keyboard behavior, and screen-reader usability remain pending. |
| [ ] | Contrast/motion | Text/control contrast passes; `prefers-reduced-motion` removes nonessential movement | _Pending_ |
| [x] | Image behavior — source/local | Hero is eager with intrinsic dimensions; below-fold images defer and representative views render without visible breakage | Passed source/static and local screenshot review. Lighthouse/field LCP and CLS remain pending. |
| [ ] | Zoom/reflow | Content remains usable at 200% zoom and 320 CSS pixels without two-dimensional scrolling | _Pending_ |
| [x] | 404 page — local rendering | Dedicated page renders with `noindex` and usable navigation | Passed local Chromium check; deployed 404 HTTP status remains pending. |
| [ ] | Browser/device matrix | Current Safari/WebKit, real iPhone safe area, Android hardware, and desktop Chrome all pass | Only local headless Chromium was tested. |

Still required: run an automated accessibility scan on the homepage and at least one emergency, scheduled, location, article, paid-mode, privacy, and 404 page. Manually verify keyboard and screen-reader naming because the local interaction suite cannot prove those experiences.

## Form delivery and spam controls — external

Do not use real sensitive building/security information for testing. Use an owner-approved test company, test contact, and benign image.

| Status | Test | Pass condition | Evidence |
|---|---|---|---|
| [ ] | Recipient ownership | Owner confirms the configured FormSubmit inbox and processor activation | _Pending_ |
| [ ] | Emergency form | One complete request reaches the approved destination with correct visible and hidden fields | _Pending_ |
| [ ] | Scheduled form | One complete scheduled request reaches the approved destination with correct fields | _Pending_ |
| [ ] | Photo upload | Approved file type/size arrives intact and retention/deletion handling is understood | _Pending_ |
| [ ] | Attribution | Test UTMs and one approved test click-ID value survive at least one internal navigation and appear in the lead record | _Pending_ |
| [ ] | Success state | Success UI appears only after the provider return and does not claim a booking | _Pending_ |
| [ ] | Failure state | Validation and a controlled provider/network failure are understandable and never emit a success event | _Pending_ |
| [ ] | Honeypot | Populating the hidden field prevents delivery without revealing filtering details or firing a lead event | _Pending_ |
| [ ] | Duplicate submit | Double click/tap does not create duplicate requests or duplicate success events | _Pending_ |
| [ ] | Inbox operations | Reply-to, subject, spam placement, notification ownership, response SLA, backup handling, and deletion process are approved | _Pending_ |

Local behavior evidence, which does not prove provider delivery:

- [x] Required-field and oversized-photo errors appeared without emitting success events.
- [x] A valid local submit attempt created one pending `lead_id`, emitted one diagnostic attempt event, and engaged the double-submit guard.
- [x] A simulated matched recent provider return emitted one success/lead pair with lead continuity and cleared pending state; a bare success-marker URL showed no success UI and emitted no lead event.
- [x] Forms contain the provider `_honey` field and the documented attribution fields. Provider-side filtering and inbox receipt remain untested.

The browser now separates `form_submit_attempt` from the matched provider-return success events. Do not make a form event Primary until recipient delivery, spam screening, and `lead_id` continuity have been verified end to end.

## Data layer, GTM, GA4, and Google Ads — external

### Browser/data-layer checks before publishing tags

- [x] Local Chromium confirmed one `phone_click` plus one placement event for tested hero and sticky calls, without duplicates.
- [ ] Confirm the footer placement event and remaining untested phone-link placements in the deployed tag environment.
- [ ] Confirm other/header/body call links produce `phone_click` without a false placement event.
- [x] Local Chromium confirmed `form_start` fires once after the first meaningful field interaction on the tested form.
- [x] Local Chromium confirmed a valid form submit emits one diagnostic `form_submit_attempt` before navigation and no immediate success/commercial-lead event.
- [x] Local Chromium confirmed a simulated matched recent `?submitted=1` return emits one `form_submit_success` and one `commercial_lead_submit` with the same `lead_id`, removes the marker, and clears pending state.
- [x] Local Chromium confirmed a bare `?submitted=1` URL emits no lead analytics event; the source applies the same guard to expired pending state.
- [x] Local Chromium confirmed client validation emits `form_submit_error` without a success event in the tested invalid/oversized-file cases.
- [ ] Confirm the photo CTA, service card, and each 60%-visible qualification notice emit their documented event once.
- [x] Local source/browser review confirmed common parameters include page path/title, configured service/location, CTA/device context, UTMs, and click-ID presence booleans in the tested flows.
- [x] Source/static review confirmed raw `gclid`/`gbraid`/`wbraid` and form personal data are reserved for form fields and not copied into `dataLayer`; recheck in GTM Preview before publishing tags.
- [x] Local Chromium confirmed paid-mode UTM retention and pending-lead continuity; the documented session-attribution policy still requires deployed cross-page verification.

These local checks validate the website event producer only. They do not show that a GTM container, GA4 property, Google Ads conversion, or call-tracking provider received or processed any event.

### GTM Preview

- [ ] Add only the owner-approved container ID and verify the container loads once.
- [ ] Create one Custom Event trigger and GA4 event mapping per documented event.
- [ ] Verify every relevant tag fires once in Tag Assistant; verify irrelevant tags do not fire.
- [ ] Choose GTM or the optional direct Ads call hook for a website-call conversion, never both.
- [ ] Keep phone clicks, form starts, photo clicks, service-card clicks, and qualification views secondary/diagnostic.
- [ ] Save a Tag Assistant session or screenshots showing event parameters and firing counts.

### GA4 DebugView

- [ ] Enable debug mode only for the test browser and execute the full interaction matrix in the measurement plan.
- [ ] Confirm event order/counts and all useful low-cardinality parameters.
- [ ] Confirm no personal data or raw click identifiers appear.
- [ ] Verify Realtime and then normal reports after processing; DebugView alone is not conversion evidence.
- [ ] Configure internal/developer traffic filters only after testing their effect.

### Google Ads and call tracking

- [ ] Use only an approved Google forwarding number or call-tracking provider; do not invent a replacement number.
- [ ] Verify displayed and dialed numbers match before, during, and after dynamic number replacement on desktop and mobile.
- [ ] Verify a connected test call is attributed once and call reporting contains the expected duration/source metadata.
- [ ] Make a genuinely qualified commercial-call action Primary only after its qualification rule is approved and tested.
- [ ] Keep raw `phone_click` and placement clicks Secondary.
- [ ] Choose at most one acknowledged form-success event as an interim Ads conversion, and only after end-to-end delivery/spam tests; never import `form_submit_attempt`.
- [ ] Test offline qualified-lead/booked-job import with stable IDs, timestamps/timezone, approved values, and deduplication before campaign bidding uses it.

## Structured-data validation — static and external

- [x] Recorded local static QA parsed every JSON-LD block without an issue; repeat against the exact release commit.
- [ ] Google Rich Results Test reports no syntax or eligibility errors on representative final URLs.
- [ ] Schema.org Validator reports no unexplained errors on Organization, WebSite, Service, BreadcrumbList, and FAQPage graphs.
- [x] Local source/static QA confirms structured business name, phone, canonical URL, service area, and visible page content agree; owner approval of identity/service area remains pending.
- [x] Local source/static QA confirms no unverified address, opening hours, ratings, reviews, price range, licenses, certifications, social profiles, or guarantees are emitted by the centralized schema generator.
- [x] Local static QA confirms breadcrumb schema URLs match visible breadcrumbs and final canonical URLs.

Record validator URL, tested page, timestamp, warnings, and disposition for each external validation.

## Core Web Vitals and performance — external

Run Lighthouse or PageSpeed Insights on the homepage and at least one emergency and one scheduled page, mobile and desktop, using the deployed build.

| Status | Check | Pass condition | Evidence |
|---|---|---|---|
| [ ] | LCP | Hero image is the intended LCP, not lazy-loaded, appropriately sized, and not delayed by nonessential scripts | _Pending_ |
| [ ] | CLS | Images, forms, fonts, banners, and sticky bar reserve space; no visible layout jump | _Pending_ |
| [ ] | INP | CTA/menu/form handlers respond promptly and do not register duplicate heavy listeners | _Pending_ |
| [ ] | Third parties | Only approved tags load; nonessential tags are delayed without breaking attribution | _Pending_ |
| [ ] | Fonts/CSS | No blocking unused webfont dependency; critical styles arrive without flash or broken layout | _Pending_ |
| [ ] | Images | Correct dimensions, encoding, compression, lazy policy, and responsive behavior | _Pending_ |
| [ ] | Cache/compression | Static assets receive appropriate long-lived caching and transfer compression | _Pending_ |

Record Lighthouse version, emulation, URL, run count, median LCP/CLS/INP proxy/total blocking time, score, and trace/report location. Lab scores are diagnostics; monitor field Core Web Vitals after enough real-user data exists.

## Search Console release steps — external

- [ ] Verify the preferred Domain property and HTTPS URL-prefix property ownership.
- [ ] Submit `https://dcemergencylockanddoor.com/sitemap.xml` and confirm it can be fetched.
- [ ] Inspect the homepage and every primary canonical service URL; compare Google-selected and user-declared canonicals.
- [ ] Request indexing for the homepage and highest-priority changed pages only; avoid mass repeated requests.
- [ ] Inspect representative redirect sources and confirm Google observes the permanent redirect to the planned target.
- [ ] Review Page Indexing for duplicate without user-selected canonical, alternate canonical, soft 404, redirect error, and crawled/discovered-not-indexed changes.
- [ ] Review Enhancements/Rich Results and Core Web Vitals after recrawl.
- [ ] Compare mobile and desktop query/page CTR, especially emergency door repair, commercial locksmith, panic bar, closer, lock repair, and fire-door inspection queries.
- [ ] Annotate deployment date, redirect-map version, title changes, and measurement changes outside Search Console for later comparison.

## 30-day measurement and validation plan

Do not judge the SEO work from a few days of impressions. Use qualified commercial outcomes, not raw traffic, as the primary business lens.

| Window | Actions | Decision metrics |
|---|---|---|
| Day 0–2 | Validate deployment, redirects, sitemap, canonical selection, form delivery, phone routing, and tag firing; fix critical defects immediately | 200/redirect/error rates, form delivery, duplicate events, call connectivity |
| Day 3–7 | Review GSC discovery/indexing and Ads search terms; reconcile phone clicks with connected calls and forms with received leads | Indexed priority pages, qualified-call rate, commercial qualification rate, wrong-service demand |
| Day 8–14 | Compare page/query CTR and position by device; review form error rate, CTA placement, call duration/disposition, and CWV diagnostics | CTR for priority queries, connected-to-qualified rate, form success rate, mobile-vs-desktop gaps |
| Day 15–21 | Refine weak titles/snippets only where impressions are sufficient; improve confusing form/CTA content; add only approved proof | Qualified calls per landing page, booked-job rate, conversion lag, search-term quality |
| Day 22–30 | Reconcile GA4/Ads/call provider/CRM, check redirect/index coverage, and produce a cohort report versus the pre-release baseline | Qualified leads, booked jobs, cost per qualified lead, offline match/duplicate rates, canonical/index stability |

At day 30, document what is known, what remains statistically uncertain, and the next controlled test. Do not declare a winner from page views, scrolls, or raw phone taps.

## Final sign-off

- [ ] Production-equivalent build exited 0.
- [ ] Static QA exited 0 against the final generated files.
- [ ] Preview HTTP/redirect/sitemap crawl passed.
- [ ] Homepage and representative service/location/article/paid/404 pages passed mobile, desktop, keyboard, and accessibility review.
- [ ] Emergency and scheduled forms delivered to the approved destination.
- [ ] Required events fired once with no personal data; GTM/GA4/Ads access-dependent steps are either completed or explicitly left inactive.
- [ ] Every enabled business/trust/proof claim has an approval record.
- [ ] Owner approved phone, service areas, lead workflow, and privacy behavior.
- [ ] Release evidence record at the top of this document is complete.

Release decision: **Pending**  
Approver: _Pending_  
Date/time: _Pending_  
Known exceptions: working tree is uncommitted, so build/QA/patch hygiene must be repeated against the eventual release commit; no preview or production deployment was tested; real form delivery and recipient ownership are unverified; GTM, GA4, Google Ads, and call tracking are unconfigured/unverified; Lighthouse, external schema validators, Search Console, Safari/WebKit, real-device, full keyboard, screen-reader, and owner claim/privacy approvals remain pending.
