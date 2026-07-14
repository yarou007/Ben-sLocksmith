# Internal-link map

Audit date: 2026-07-14  
Final redirect authority: `data/redirects.json`.

## Pre-edit audit findings

- The repository snapshot contained very high link counts to generic legacy service URLs, diffusing relevance among near-duplicates.
- `/storefront-door-repair-washington-dc` had no inbound HTML link and was the only genuine indexable orphan in the pre-edit crawl.
- The four `/city-*` routes were intentionally orphaned legacy documents, but many additional thin city/service pages were still linked and indexable.
- Links mixed root-relative and document-relative forms.

Those points describe the pre-edit crawl. They are retained as the audit baseline, not as the final linking recommendation.

## Final link architecture

- Every internal link uses a root-relative, lowercase, extensionless final canonical path.
- No internal link points to any of the 63 sources in `data/redirects.json`; links go directly to the source's final target.
- Alexandria and Arlington service intent is consolidated into `/northern-virginia`. There are no retained city/service permutation destinations.
- Bethesda and Silver Spring service intent is consolidated into `/maryland`. There are no retained city/service permutation destinations.
- `/dmv-commercial-locksmith` is not a hub or internal-link destination; broad DMV links point to `/`, `/northern-virginia`, or `/maryland` according to intent.
- `/new-york`, `/door-repair-nyc`, and `/blog-how-to-fix-door-closer-nyc` remain accessible with `noindex,follow` but are excluded from `sitemap.xml`, the generated blog hub, DC navigation, and DC related-location modules pending owner confirmation of the New York service area.
- All redirect targets are final routes and none appears as a redirect source, preventing documented redirect chains.
- The homepage links directly to each primary service owner; articles use descriptive, problem-specific anchors and avoid boilerplate grids of services and cities.

## Homepage destination set

| Destination | Recommended anchor / problem cue | CTA event service value |
|---|---|---|
| `/commercial-door-repair-washington-dc` | emergency commercial door repair; door will not close/latch; break-in damage | `commercial_door_repair` |
| `/commercial-locksmith-washington-dc` | commercial locksmith; business lockout; key-control help | `commercial_locksmith` |
| `/panic-bar-repair-washington-dc` | panic bar is stuck; panic bar repair | `panic_bar_repair` |
| `/panic-bar-installation-washington-dc` | new panic bar or exit-device installation | `panic_bar_installation` |
| `/door-closer-repair-washington-dc` | leaking or slamming door closer | `door_closer_repair` |
| `/exit-device-repair-washington-dc` | exit device failed | `exit_device_repair` |
| `/commercial-door-lock-repair-washington-dc` | commercial lock is jammed | `commercial_door_lock_repair` |
| `/commercial-rekey-washington-dc` | rekey a business after key/employee change | `commercial_rekey` |
| `/fire-door-inspection-washington-dc` | fire door inspection scope and report-needs request | `fire_door_inspection` |
| `/fire-door-repair-washington-dc` | fire door deficiency correction | `fire_door_repair` |
| `/commercial-door-installation-washington-dc` | new commercial door and frame | `commercial_door_installation` |
| `/access-control-systems-washington-dc` | access control for commercial doors | `access_control` |
| `/service-office-lockout` | office/business lockout | `office_lockout` |
| `/storefront-door-repair-washington-dc` | storefront door cannot close or secure | `storefront_door_repair` |

## Homepage service-area destinations

| Destination | Recommended anchor / purpose | Rule |
|---|---|---|
| `/washington-dc` | Washington DC commercial service area | Local hub; avoid duplicating the specialist service pages. |
| `/northern-virginia` | Northern Virginia commercial locksmith and door service | Final owner for the consolidated Alexandria/Arlington permutations. |
| `/maryland` | Nearby Maryland commercial locksmith and door service | Final owner for the consolidated Bethesda/Silver Spring permutations. |

New York is not part of the primary DC homepage navigation, trust bar, paid-search layout, related-location modules, sitemap, or generated blog hub. The three retained New York legacy pages are `noindex,follow`; this reversible state preserves access without inviting indexation until the business confirms whether New York is a genuine service area.

## Cross-link rules by page family

| Source family | Required contextual destinations | Rule |
|---|---|---|
| Emergency door repair | Panic bar repair, closer repair, exit-device repair, commercial lock repair, commercial locksmith, fire-door repair | Link from the matching symptom, not a generic service list. |
| Panic bar repair | Panic bar installation, exit-device repair, closer repair, fire-door inspection | Explain repair versus replacement or inspection context. |
| Door closer repair | Emergency door repair, fire-door inspection, commercial door installation | Link latching, fire-rated, and replacement scenarios. |
| Commercial locksmith | Commercial rekey, lock repair, master keys, restricted keys, office lockout | Keep door/egress repair outside the locksmith-intent core. |
| Fire-door inspection | Fire-door repair, closer repair, exit-device repair, panic-bar repair | Scheduled CTA remains primary; correction links are secondary. |
| Installation / access control | Door installation, access control, panic installation, locksmith | Use quote/project language rather than emergency-only copy. |
| Informational articles | Exactly one primary transactional page plus one relevant geography/hub when useful | Avoid boilerplate links to every service/city. |
| DC location hub | All primary DC transactional pages | Use short descriptive service summaries; do not copy entire service sections. |
| Northern Virginia hub | Relevant final specialty pages where service coverage is confirmed | Own Alexandria/Arlington intent itself; never link back to the consolidated city permutations. |
| Maryland hub | Relevant final specialty pages where service coverage is confirmed | Own Bethesda/Silver Spring intent itself; never link back to the consolidated city permutations. |

## Redirect-safe internal destinations

Each row names a final redirect target followed by its exact legacy sources. For the retained indexable architecture, links in HTML, schema, breadcrumbs, `llms.txt`, and generated modules must use the final target rather than an alias. The mapping mirrors `data/redirects.json` and is single-hop. `/new-york` is the exception to the linking recommendation: it remains the destination for `/city-new-york`, but it is a noindex holding route and must not be added to DC promotional modules.

| Final destination | Exact redirect sources that must never receive internal links |
|---|---|
| `/` | `/dmv-commercial-locksmith` |
| `/access-control-systems-washington-dc` | `/access-control-systems`<br>`/business-security-solutions`<br>`/service-access-control` |
| `/commercial-door-installation-washington-dc` | `/service-door-installation` |
| `/commercial-door-lock-repair-washington-dc` | `/service-door-hardware` |
| `/commercial-door-repair-washington-dc` | `/door-repair-washington-dc` |
| `/commercial-locksmith-washington-dc` | `/commercial-locksmith-services`<br>`/emergency-commercial-locksmith`<br>`/emergency-commercial-locksmith-washington-dc`<br>`/locksmith-washington-dc`<br>`/service-locksmith` |
| `/commercial-rekey-washington-dc` | `/service-business-lock-change`<br>`/service-commercial-rekey`<br>`/service-tenant-lock-change` |
| `/door-closer-repair-washington-dc` | `/service-commercial-door-closer-installation`<br>`/service-door-closer-adjustment`<br>`/service-door-closers` |
| `/exit-device-repair-washington-dc` | `/service-exit-devices` |
| `/fire-door-inspection-washington-dc` | `/annual-fire-door-inspection-washington-dc`<br>`/fire-door-compliance-washington-dc`<br>`/nfpa-80-fire-door-inspection`<br>`/service-fire-door-compliance`<br>`/service-fire-doors` |
| `/fire-door-repair-washington-dc` | `/fire-door-deficiency-repair` |
| `/maryland` | `/bethesda-md-commercial-locksmith`<br>`/city-maryland`<br>`/commercial-door-repair-bethesda-md`<br>`/commercial-door-repair-silver-spring-md`<br>`/commercial-locksmith-bethesda-md`<br>`/commercial-locksmith-silver-spring-md`<br>`/door-closer-repair-bethesda-md`<br>`/door-closer-repair-silver-spring-md`<br>`/emergency-commercial-locksmith-bethesda-md`<br>`/emergency-commercial-locksmith-silver-spring-md`<br>`/fire-door-inspection-bethesda-md`<br>`/fire-door-inspection-maryland`<br>`/fire-door-inspection-silver-spring-md`<br>`/panic-bar-repair-bethesda-md`<br>`/panic-bar-repair-silver-spring-md`<br>`/silver-spring-md-commercial-locksmith` |
| `/new-york` | `/city-new-york` |
| `/northern-virginia` | `/city-northern-virginia`<br>`/commercial-door-repair-alexandria-va`<br>`/commercial-door-repair-arlington-va`<br>`/commercial-locksmith-alexandria-va`<br>`/commercial-locksmith-arlington-va`<br>`/door-closer-repair-alexandria-va`<br>`/door-closer-repair-arlington-va`<br>`/emergency-commercial-locksmith-alexandria-va`<br>`/emergency-commercial-locksmith-arlington-va`<br>`/fire-door-inspection-alexandria-va`<br>`/fire-door-inspection-arlington-va`<br>`/fire-door-inspection-northern-virginia`<br>`/locksmith-alexandria-va`<br>`/locksmith-arlington-va`<br>`/locksmith-virginia`<br>`/panic-bar-repair-alexandria-va`<br>`/panic-bar-repair-arlington-va` |
| `/panic-bar-installation-washington-dc` | `/service-exit-device-installation`<br>`/service-panic-bar-installation` |
| `/panic-bar-repair-washington-dc` | `/service-panic-bars` |
| `/washington-dc` | `/city-washington-dc` |

## Pre-edit inbound baseline and post-consolidation requirement

The counts below are retained from the repository audit and are not claims about the final generated site. After consolidation, each target must receive direct links and none of its redirect aliases may remain linked.

| Target | Pre-edit internal link instances | Post-consolidation requirement |
|---|---:|---|
| `/` | 308 | Direct brand/home links plus the broad DMV intent formerly assigned to `/dmv-commercial-locksmith`. |
| `/commercial-locksmith-washington-dc` | 27 | Direct homepage, hub, and related-service links; no redirect aliases. |
| `/commercial-door-repair-washington-dc` | 17 | Direct homepage, hub, and related-service links; no redirect aliases. |
| `/panic-bar-repair-washington-dc` | 27 | Direct homepage, hub, and related-service links; no redirect aliases. |
| `/panic-bar-installation-washington-dc` | 0 | Add direct homepage, relevant service, and project links; no redirect aliases. |
| `/door-closer-repair-washington-dc` | 23 | Direct homepage, hub, and related-service links; no redirect aliases. |
| `/exit-device-repair-washington-dc` | 11 | Direct homepage, hub, and related-service links; no redirect aliases. |
| `/commercial-door-lock-repair-washington-dc` | 15 | Direct homepage, hub, and related-service links; no redirect aliases. |
| `/commercial-rekey-washington-dc` | 3 | Direct homepage, locksmith, property-manager, and key-control links; no redirect aliases. |
| `/fire-door-inspection-washington-dc` | 33 | Direct homepage, scheduled-service, and related-repair links; no redirect aliases. |
| `/fire-door-repair-washington-dc` | 17 | Direct homepage, inspection, and emergency-door links; no redirect aliases. |
| `/commercial-door-installation-washington-dc` | 1 | Add direct homepage and project-service links; no redirect aliases. |
| `/access-control-systems-washington-dc` | 1 | Add direct homepage and project-service links; no redirect aliases. |

The final location hubs `/northern-virginia` and `/maryland` must receive direct homepage/service-area links because they now absorb all corresponding city/service permutations.

## Breadcrumb patterns

- Service: Home → Commercial services → Current service.
- Location hub: Home → Service areas → Washington DC, Northern Virginia, or Maryland.
- Article: Home → Commercial door resources → Current article.
- Consolidated city/service breadcrumbs are removed; they must not point to redirect sources.
- `BreadcrumbList` JSON-LD must match visible breadcrumb text and use absolute final canonical URLs.

## Validation criteria

- No indexable page is orphaned.
- No internal anchor points to a source in `data/redirects.json`, an `.html` URL, or a parameterized tracking URL.
- Every final canonical route is linked from at least one crawlable hub.
- Intentionally noindexed New York legacy routes are exempt from the indexable-page hub requirement and receive no promotional links from DC pages or the generated blog hub.
- `/northern-virginia` receives every Alexandria/Arlington alias directly; `/maryland` receives every Bethesda/Silver Spring alias directly; `/` receives `/dmv-commercial-locksmith` directly.
- No redirect target is also a redirect source.
- Anchors describe the destination problem/service; repeated “learn more” anchors are removed.
- DC pages and paid-search layouts do not promote New York in primary navigation, trust bars, or related-location modules.
- `/new-york`, `/door-repair-nyc`, and `/blog-how-to-fix-door-closer-nyc` remain `noindex,follow` and absent from `sitemap.xml` until the owner confirms the market and selects a permanent keep/rebuild/redirect/delete action.
