# Keyword-to-URL map

Decision date: 2026-07-14  
URL standard: `https://dcemergencylockanddoor.com` + lowercase extensionless path, no trailing slash except root.  
Implementation authority: `data/redirects.json`.

## Audit framing and final decision

The pre-edit crawl found a large set of near-duplicate `service-*`, Alexandria, Arlington, Bethesda, and Silver Spring landing pages. Early audit recommendations preserved those URLs conditionally until keyword ownership, unique-content value, links, and redirect risk could be reviewed.

That review is complete. The final architecture does **not** retain the thin city/service permutations as canonical pages:

- Alexandria and Arlington permutations consolidate directly to `/northern-virginia`.
- Bethesda and Silver Spring permutations consolidate directly to `/maryland`.
- Regional fire-door variants consolidate to their appropriate location hub.
- `/dmv-commercial-locksmith` consolidates directly to `/`.
- Every source in `data/redirects.json` points to a final canonical route, never another redirect source.

This section records the post-audit implementation decision. It does not rewrite the historical finding that these pages existed and competed before consolidation.

## Primary transactional ownership

| Keyword / intent family | Primary canonical URL | Page role | Primary conversion |
|---|---|---|---|
| commercial door repair and locksmith Washington DC | `/` | Brand/service overview; routes urgent problems to specialists | Hero phone call |
| commercial locksmith DC; business locksmith DC | `/commercial-locksmith-washington-dc` | Lockouts, mortise/cylinders, rekeys, key control, master-key planning | Phone + emergency form |
| emergency door repair; emergency commercial door repair DC; commercial door repair DC | `/commercial-door-repair-washington-dc` | Urgent door, frame, latch, hinge, closer, exit hardware and break-in failures | Emergency phone + short form |
| panic bar repair; push bar repair; crash bar repair DC | `/panic-bar-repair-washington-dc` | Diagnose and repair an existing device | Phone + emergency form |
| panic bar installation; exit device installation DC | `/panic-bar-installation-washington-dc` | New, replacement and retrofit installation assessment | Scheduled quote form |
| door closer service; door closer repair DC | `/door-closer-repair-washington-dc` | Leaking, slamming, slow, open, and non-latching closer diagnosis | Phone + emergency form |
| exit device repair Washington DC | `/exit-device-repair-washington-dc` | Rim, mortise and vertical-rod exit-device diagnosis/repair | Phone + emergency form |
| commercial door lock repair DC | `/commercial-door-lock-repair-washington-dc` | Lock body, cylinder, latch, strike and mortise failures | Phone + emergency form |
| commercial rekey Washington DC | `/commercial-rekey-washington-dc` | Employee turnover, tenant change, key-control reset | Phone + scheduled form |
| fire door inspection Washington DC; NFPA 80 inspection request | `/fire-door-inspection-washington-dc` | Scheduled scope request; provider qualifications, reporting and correction capability remain verification-gated | Scheduled service form |
| fire door repair / deficiency correction DC | `/fire-door-repair-washington-dc` | Repair/correction after failure or inspection | Phone + scheduled form |
| commercial door installation Washington DC | `/commercial-door-installation-washington-dc` | Measurement, door/frame/hardware coordination and project workflow | Scheduled estimate form |
| commercial access control Washington DC | `/access-control-systems-washington-dc` | Door-side access-control assessment and coordination | Scheduled estimate form |
| office lockout Washington DC | `/service-office-lockout` | Qualified office/business lockout only | Phone call |
| storefront door repair Washington DC | `/storefront-door-repair-washington-dc` | Aluminum/storefront door and hardware problems; no glass-service claims without verification | Phone + short form |
| master key systems Washington DC | `/master-key-systems` | Key hierarchy and planned system work | Scheduled form |
| restricted key systems Washington DC | `/service-restricted-key-systems` | Key-control consultation | Scheduled form |
| property manager locksmith Washington DC | `/service-property-manager-locksmith` | Work-order and portfolio needs, gated by verified capabilities | Scheduled form |

## Location ownership

| Geography / intent family | Final canonical owner | Final implementation rule |
|---|---|---|
| Washington DC service-area discovery | `/washington-dc` | Location hub; individual DC services remain owned by the transactional pages above. |
| Alexandria and Arlington commercial locksmith, emergency locksmith, door repair, closer repair, panic bar repair, and fire-door inspection | `/northern-virginia` | All thin city/service permutations redirect here in one hop. The hub provides the regional overview and routes users to final specialty pages where useful. |
| Northern Virginia regional fire-door inspection and commercial locksmith | `/northern-virginia` | Regional variants redirect here directly; no intermediate Alexandria, Arlington, or service URL. |
| Bethesda and Silver Spring commercial locksmith, emergency locksmith, door repair, closer repair, panic bar repair, and fire-door inspection | `/maryland` | All thin city/service permutations redirect here in one hop. The hub provides the regional overview and routes users to final specialty pages where useful. |
| Maryland regional fire-door inspection and commercial locksmith | `/maryland` | Regional variants redirect here directly; no intermediate Bethesda, Silver Spring, or service URL. |
| Broad DMV commercial locksmith | `/` | `/dmv-commercial-locksmith` redirects directly to the homepage; it is not a retained hub. |
| Unverified New York legacy intent | `/new-york`, `/door-repair-nyc`, and `/blog-how-to-fix-door-closer-nyc` | Retained as accessible legacy pages with `noindex,follow`, self-referencing canonicals, and no sitemap inclusion while service-area ownership is unconfirmed. `/city-new-york` redirects directly to `/new-york`. These routes are excluded from the generated blog hub and all DC promotion. Owner confirmation is required before they are indexed, rebuilt, redirected, or removed. |

## Final single-hop consolidation registry

The table below mirrors the authoritative `data/redirects.json` registry. These are exact path-to-path destinations. No target in this table is also a redirect source, so the documented plan contains no redirect chain.

| Redirect source | Final canonical target |
|---|---|
| `/access-control-systems` | `/access-control-systems-washington-dc` |
| `/annual-fire-door-inspection-washington-dc` | `/fire-door-inspection-washington-dc` |
| `/bethesda-md-commercial-locksmith` | `/maryland` |
| `/business-security-solutions` | `/access-control-systems-washington-dc` |
| `/city-maryland` | `/maryland` |
| `/city-new-york` | `/new-york` |
| `/city-northern-virginia` | `/northern-virginia` |
| `/city-washington-dc` | `/washington-dc` |
| `/commercial-door-repair-alexandria-va` | `/northern-virginia` |
| `/commercial-door-repair-arlington-va` | `/northern-virginia` |
| `/commercial-door-repair-bethesda-md` | `/maryland` |
| `/commercial-door-repair-silver-spring-md` | `/maryland` |
| `/commercial-locksmith-alexandria-va` | `/northern-virginia` |
| `/commercial-locksmith-arlington-va` | `/northern-virginia` |
| `/commercial-locksmith-bethesda-md` | `/maryland` |
| `/commercial-locksmith-services` | `/commercial-locksmith-washington-dc` |
| `/commercial-locksmith-silver-spring-md` | `/maryland` |
| `/dmv-commercial-locksmith` | `/` |
| `/door-closer-repair-alexandria-va` | `/northern-virginia` |
| `/door-closer-repair-arlington-va` | `/northern-virginia` |
| `/door-closer-repair-bethesda-md` | `/maryland` |
| `/door-closer-repair-silver-spring-md` | `/maryland` |
| `/door-repair-washington-dc` | `/commercial-door-repair-washington-dc` |
| `/emergency-commercial-locksmith` | `/commercial-locksmith-washington-dc` |
| `/emergency-commercial-locksmith-alexandria-va` | `/northern-virginia` |
| `/emergency-commercial-locksmith-arlington-va` | `/northern-virginia` |
| `/emergency-commercial-locksmith-bethesda-md` | `/maryland` |
| `/emergency-commercial-locksmith-silver-spring-md` | `/maryland` |
| `/emergency-commercial-locksmith-washington-dc` | `/commercial-locksmith-washington-dc` |
| `/fire-door-compliance-washington-dc` | `/fire-door-inspection-washington-dc` |
| `/fire-door-deficiency-repair` | `/fire-door-repair-washington-dc` |
| `/fire-door-inspection-alexandria-va` | `/northern-virginia` |
| `/fire-door-inspection-arlington-va` | `/northern-virginia` |
| `/fire-door-inspection-bethesda-md` | `/maryland` |
| `/fire-door-inspection-maryland` | `/maryland` |
| `/fire-door-inspection-northern-virginia` | `/northern-virginia` |
| `/fire-door-inspection-silver-spring-md` | `/maryland` |
| `/locksmith-alexandria-va` | `/northern-virginia` |
| `/locksmith-arlington-va` | `/northern-virginia` |
| `/locksmith-virginia` | `/northern-virginia` |
| `/locksmith-washington-dc` | `/commercial-locksmith-washington-dc` |
| `/nfpa-80-fire-door-inspection` | `/fire-door-inspection-washington-dc` |
| `/panic-bar-repair-alexandria-va` | `/northern-virginia` |
| `/panic-bar-repair-arlington-va` | `/northern-virginia` |
| `/panic-bar-repair-bethesda-md` | `/maryland` |
| `/panic-bar-repair-silver-spring-md` | `/maryland` |
| `/service-access-control` | `/access-control-systems-washington-dc` |
| `/service-business-lock-change` | `/commercial-rekey-washington-dc` |
| `/service-commercial-door-closer-installation` | `/door-closer-repair-washington-dc` |
| `/service-commercial-rekey` | `/commercial-rekey-washington-dc` |
| `/service-door-closer-adjustment` | `/door-closer-repair-washington-dc` |
| `/service-door-closers` | `/door-closer-repair-washington-dc` |
| `/service-door-hardware` | `/commercial-door-lock-repair-washington-dc` |
| `/service-door-installation` | `/commercial-door-installation-washington-dc` |
| `/service-exit-device-installation` | `/panic-bar-installation-washington-dc` |
| `/service-exit-devices` | `/exit-device-repair-washington-dc` |
| `/service-fire-door-compliance` | `/fire-door-inspection-washington-dc` |
| `/service-fire-doors` | `/fire-door-inspection-washington-dc` |
| `/service-locksmith` | `/commercial-locksmith-washington-dc` |
| `/service-panic-bar-installation` | `/panic-bar-installation-washington-dc` |
| `/service-panic-bars` | `/panic-bar-repair-washington-dc` |
| `/service-tenant-lock-change` | `/commercial-rekey-washington-dc` |
| `/silver-spring-md-commercial-locksmith` | `/maryland` |

Before redirect activation, useful unique copy, approved images, and relevant link equity from each source are merged into the final target where appropriate. For retained indexable routes, internal links, breadcrumbs, schema URLs, the XML sitemap, and `llms.txt` must reference the final target directly rather than relying on a redirect. The New York holding route is the explicit exception: `/city-new-york` still redirects to `/new-york`, but `/new-york` remains `noindex,follow` and is omitted from the sitemap and DC promotional links pending owner confirmation.

## Content safeguards

- Informational articles keep a question/education intent and link to one transactional owner; they must not reuse the service-page title/H1 pattern.
- Northern Virginia and Maryland hubs need useful regional service context, not a grid of swapped-city doorway pages. Alexandria, Arlington, Bethesda, and Silver Spring intent is consolidated into those hubs.
- UTM, `gclid`, `gbraid`, `wbraid`, and paid-layout parameters never create a new canonical URL. Canonicals remain the parameter-free service URL.
- The proposed `/emergency-commercial-door-repair-washington-dc` slug is intentionally not created: `/commercial-door-repair-washington-dc` owns that intent, and `/door-repair-washington-dc` points directly to it.
- The proposed access-control-commercial-doors slug is intentionally not created: `/access-control-systems-washington-dc` is already descriptive and indexable.
- `/dmv-commercial-locksmith` is not an internal-link destination or retained canonical; broad DMV discovery is owned by `/` with direct links to `/northern-virginia` and `/maryland`.
- `/new-york`, `/door-repair-nyc`, and `/blog-how-to-fix-door-closer-nyc` remain accessible for visitors and link discovery but use `noindex,follow` and are excluded from `sitemap.xml` and the generated DC blog hub. This is a reversible holding state pending owner confirmation of the New York service area; it is not an assertion that New York service is available.
