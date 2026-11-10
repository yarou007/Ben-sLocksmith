# Conversion upgrade validation

Validated locally on November 10, 2026. Source changes are applied and the existing `public/` deployment output is refreshed. No deployment or external account update was performed.

## Mobile Lighthouse

Lighthouse 12.8.2, mobile form factor, simulated throttling, local HTTP static server. Analytics network requests to Google Tag Manager/Analytics and Ahrefs were blocked during the laboratory measurement so the test did not send page or conversion traffic to external accounts.

| Category | Score |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

| Metric | Result |
| --- | --- |
| First contentful paint | 1.1 s |
| Largest contentful paint | 1.8 s |
| Cumulative layout shift | 0 |
| Total blocking time | 0 ms |
| Speed index | 1.1 s |

These are local laboratory results, not live-domain field measurements. A previous local run scored 96 for performance; the final recorded run scored 99. Production hosting, third-party tags, network conditions and device performance affect results. The temporary server did not add compression or production caching headers. The full local Lighthouse reports are `/tmp/dc-lighthouse-current.json` and `/tmp/dc-lighthouse-current.html`.

## Static checks

`npm run qa` passed, including existing syntax, data and site checks:

- 26 JavaScript modules and 5 JSON configuration files parsed.
- 17 canonical service configurations and 63 canonical redirects validated.
- 128 HTML pages, 59 sitemap URLs, 1,810 internal links, 704 asset references, 177 images and 61 form elements scanned.
- 5,660 checks passed with no reported issues. Retained redirect-source forms remain disabled; the visible canonical request previews are collapsed and coming soon.
- Added a regression check that photo CTAs reach a prefilled WhatsApp conversation instead of a disabled request form.
- `git diff --check` passed.

## Browser checks

Checked the homepage, all 17 canonical service pages and all three regional pages at 360 × 640, 390 × 844, 430 × 932, 800 × 800, 1100 × 800 and 1440 × 900: 126 route/viewport combinations. Added final homepage checks at the 1101px and 1150px navigation boundaries.

- No horizontal overflow or hero-call/sticky-bar overlap in the tested layouts.
- Tested buttons, menu toggles, card CTAs, sticky actions and disclosure controls meet the 48px height target.
- The 360px homepage hero Call button now appears at y=352–400px, clear of the sticky bar. In the audit it appeared at y=571–619px and overlapped the bar on a 640px-high viewport.
- Mobile menu opens, Escape closes it, and focus returns to the menu control.
- All tested photo links point to the configured WhatsApp number and include the business/location/problem/urgency prompts.
- No visible owner placeholders, enabled future forms or browser JavaScript errors.
- Axe scans of the homepage, emergency commercial door repair page and property-manager page returned zero violations for the selected WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice rules. Automated checks cover the tested states and do not establish complete WCAG conformance by themselves.
- Exactly one direct GA4 `phone_click` command and one `whatsapp_click` command per respective click; existing data-layer hooks remain available.
- A configured GTM ID suppresses the parallel direct custom-event command.
- UTM and gclid values populate the hidden fields.
- Page initialization remains functional when access to session storage throws.

Actual calls and messages were prevented during browser checks. GA4 command generation was verified locally; receipt in GA4 DebugView and actual WhatsApp account delivery still need a real-domain check.

## URL and deployment preservation

- Confirmed the XML sitemap retains exactly the same 59 URLs as the original checkout.
- `data/redirects.json`, `vercel.json` and `package.json` are unchanged. No new build step or dependency was added.
- `/thank-you` is new, noindex and excluded from the sitemap.
- The existing deployment-output script copied 196 static files into `public/`. Homepage, CSS, JavaScript, business config, follow-up page and sitemap match the edited source files byte for byte.
- Unverified proof and neighborhood expansion are staged in data/templates, with the complete owner checklist in `docs/conversion-upgrade.md`.
