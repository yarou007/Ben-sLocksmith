# Task completion and business-goal implementation

Updated November 11, 2026. This checklist distinguishes implemented website features, owner-confirmed facts, and external business results.

## Confirmed business facts

The owner confirmed on November 11:

- 202-643-4062 is the WhatsApp number.
- The business operates 24/7 and offers free estimates.
- Detailed targeting should cover Downtown DC, Capitol Hill, Georgetown, Navy Yard, NoMa, Dupont Circle, Adams Morgan, U Street, Arlington, Alexandria, Bethesda and Silver Spring.
- No additional response-time, credential, review, manufacturer, warranty or administrative claims were supplied. Those claims remain omitted from the public website. This does not assert that a credential does or does not exist.

## Website task checklist

| Requested work | Implementation / disposition | Evidence |
| --- | --- | --- |
| A short audit before editing | Completed, with conversion, mobile, trust and SEO findings | Original audit; `docs/conversion-upgrade.md` |
| Commercial-only DC hero and clear promise | Implemented; security and safe exit operation remain central | `index.html`, shared hero source |
| Primary phone CTA and secondary photo/quote CTA | Implemented with the canonical phone and confirmed WhatsApp number | Shared header, heroes, footer and contact components |
| Three to four hero proof points | Four factual points: commercial-only, 24/7, free estimates and DC/nearby VA/MD | Shared trust strip |
| Who-we-serve strip with business-type icons | Implemented for restaurants, retail, offices, medical, schools, multi-tenant buildings and property managers; churches and government-adjacent properties are included in copy | Homepage |
| Property/facility manager template | Implemented with work orders, site contacts, approval requirements, multiple properties, mini FAQs and CTA | Homepage and `/service-property-manager-locksmith` |
| Restaurants/retail template | Implemented with lockouts, storefront/break-in problems, reopening priorities, mini FAQs and photo CTA | Homepage and emergency door repair page |
| Offices/medical template | Implemented with rekeying, master-key planning, staff access and access-control door hardware | Homepage and commercial locksmith page |
| Fire-door/compliance template | Implemented with panic bars, closers, inspection-item repair requests, scope boundaries, mini FAQs and CTA | Homepage and fire-door repair page |
| COI/W-9, recurring maintenance and single-contact placeholders | Prepared in owner data/checklist; availability is not claimed because the owner supplied no such facts | Owner placeholder registry and segment request guidance |
| Short lead capture on homepage and every canonical service page | Active WhatsApp quote form with name, phone, business type, address/ZIP, problem, urgency and optional photo | Homepage, all 17 service pages, all three regional pages |
| Optional photo handling | Local preview; native file sharing where supported; explicit attachment-in-WhatsApp fallback | `assets/quote-form.js` |
| Direct website upload/submission | Remains coming soon as specified in the original brief; the active form sends the visitor into WhatsApp rather than pretending to POST to a nonexistent endpoint | Quote-form explanation, privacy page |
| Property-manager qualification | Optional business/property name, work order, opening count and project/access notes | Active quote form |
| Emergency call versus planned quote decision | Implemented; selecting Emergency now in the form also surfaces the call route | Shared request block and form |
| Sticky mobile Call/Send Photo actions | Implemented with 48px+ targets and equal-width controls | Shared mobile bar |
| Floating desktop call button | Implemented | Shared contact component |
| GA4 click hooks | Implemented for calls, WhatsApp and form preparation; actual sends are not inferred from preparation | `assets/site.js`, `assets/quote-form.js` |
| Google Ads conversion placeholders | Implemented; valid configured direct tags initialize the Ads destination and use the supplied label | Tag generator, call hook, business config |
| UTM/gclid capture and hidden fields | Implemented; not appended to customer messages or exposed as personal analytics payloads | Active form and attribution helper |
| Thank-you/follow-up state/page | Implemented inline and at noindex `/thank-you`; directs the visitor to finish sending in WhatsApp and keep their phone available | Form ready state and follow-up page |
| Callback within X minutes | Placeholder retained; no numeric promise because the owner supplied no target | Follow-up source and owner registry |
| Four-step process | Implemented: contact, scope/estimate discussion, visit arrangements and operation/closeout review | Homepage and service content |
| Reviews and Google rating badge | Complete conditional rendering templates; unpublished because no genuine review/profile evidence was supplied | Proof-content data and renderer |
| Licensing/insurance | Complete verified-data slots; public claims omitted as requested | Proof renderer and trust configuration |
| Brands serviced | Complete approved-data template; no unsupported brand/service relationship is published | Proof-content data and renderer |
| Before/after jobs with captions | Complete approved-data template; no job outcome or before/after story was fabricated | Proof renderer; existing photos remain hardware references |
| Warranty/guarantee | Placeholder and rendering support prepared; no terms invented | Warranty config and owner registry |
| Pricing transparency without invented prices | Implemented with confirmed free estimates, price factors and scope discussion | Homepage/service pricing block |
| 360–430px mobile layout | Implemented and browser tested; call CTA visible, no horizontal overflow or sticky overlap in tested states | Browser validation |
| Navigation, spacing, contrast and target sizes | Implemented with an earlier navigation breakpoint, 48px+ main controls, named landmarks and corrected footer contrast | Shared CSS and browser/axe checks |
| Theme variables and semantic accessible markup | Implemented, including native form labels, required fields, status regions and keyboard navigation | Shared CSS/HTML/JS |
| Image optimization and layout stability | Existing WebP sources/dimensions retained; lazy loading below the fold; fixed preview dimensions; inline critical CSS and deferred scripts | Generated pages and shared assets |
| Titles, descriptions, headings and internal links | Commercial/service intent retained; homepage/regional metadata updated with confirmed hours and free estimates; local service links added | Generated head and regional content |
| LocalBusiness/Locksmith/Service schema | Implemented with real phone, service areas and 24/7 hours; no invented street address | Generated JSON-LD |
| FAQPage and BreadcrumbList schema | Implemented; regional FAQs now have matching visible content and markup | Canonical service/regional pages |
| Detailed DC/Northern VA/Maryland targeting | Implemented as 12 distinct local sections within the three existing regional URLs, with jump links, use cases, services and estimate CTAs | `/washington-dc#downtown` and other location anchors |
| Preserve existing URLs and ranking content | Existing sitemap URL set and redirect map retained; useful service/blog content preserved | Route/sitemap validation |
| Eight to ten blog/resource topics and outlines | Ten supplied, favoring improvements to existing relevant articles | `docs/conversion-upgrade.md` |
| Updated organized HTML/CSS/JS | Implemented in the existing source/generator structure; no framework or new build requirement | Changed source and generated files |
| Changelog and every ADD placeholder | Supplied with current owner-confirmed/omitted statuses | `docs/conversion-upgrade.md`, owner registry |
| 24-hour/week/month next steps, GBP, call tracking and Ads recommendations | Supplied; expanded with goal measurements and local targeting | Upgrade guide and measurement checklist below |

## Business-goal measurement

Website changes support all five goals. More calls, higher-value clients and rankings are business outcomes to measure after publication, not outcomes established by a local code test.

| Goal | Implemented support | Measure after publication |
| --- | --- | --- |
| More calls and qualified photos | 24/7/free-estimate copy, prominent calls, direct WhatsApp links, qualified form and photo handoff | Connected/qualified calls; WhatsApp conversations actually received; request references; estimates and bookings |
| Higher-value commercial clients | Commercial-only positioning; four buyer segments; property/medical/office use cases; work-order and opening-count fields | Property/facility leads, multiple openings/buildings, planned projects, quoted scope and won work |
| DC neighborhood/local SEO | Twelve detailed local sections, contextual service links, verified service areas, metadata, FAQ/breadcrumb and business schema | Search Console impressions/clicks by area and service, indexed URLs, relevant landing-page inquiries |
| Excellent emergency mobile experience | Visible phone CTA, 48px+ main controls, no tested overflow/overlap, source-rendered contact fallback, lightweight vanilla code | Real-device usability, production Lighthouse/Core Web Vitals, call/quote completion by device |
| Trust under pressure | Actual hours, free estimates, clear pricing factors, real phone/WhatsApp route, process and honest scope | Contact completion, qualified lead feedback and business conversations; add genuine proof only when supplied |

### Google Business Profile

Use the actual business name, canonical phone and website, accurate commercial services, confirmed 24/7 hours and actual service areas. Verify the profile's public details in the business account. No account changes, fabricated address or reviews are part of this code update.

### Call tracking and Google Ads

The website keeps 202-643-4062 as its canonical phone and dedicated WhatsApp number. Tracking-number replacement hooks and Ads fields are ready, with no invented tracking number or account ID. Use connected/qualified-call conversion measurement as the primary business outcome; phone/WhatsApp clicks and form preparation are contact intent.

Suggested landing views use existing routes with `?layout=paid`: emergency commercial door repair, commercial locksmith, panic-bar repair and door-closer repair. Keep each ad group aligned with its service, confirmed location and relevant local regional section. Schedule around the actual confirmed 24/7 availability. Do not imply an arrival time or a free repair visit from the free-estimate offer.

Suggested message themes: “Commercial Door Repair DC,” “24/7 Business Door & Lock Help,” “Panic Bar Repair,” and “Free Commercial Estimates.” No ad spending, campaign activation or account edits have been performed.

### Lead log

`docs/commercial-lead-log-template.csv` provides a simple way to compare actual received calls/WhatsApp requests with estimates and won work. The WhatsApp form includes a request reference that the operator can record. Enter real received requests only; preparing the form is not a confirmed lead.

## Publication and verification

The existing host is connected to the GitHub repository through Vercel. The source and static deployment output are prepared; publication status and the current validation results are recorded separately in `docs/conversion-validation.md`. A local score does not verify live-domain analytics delivery, phone reception or a business conversation.
