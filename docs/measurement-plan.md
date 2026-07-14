# Measurement plan

Last updated: 2026-07-14

## Measurement objective

Measure qualified commercial calls and successful commercial service requests without treating traffic, scrolling, or a phone-link tap as a booked job. The implementation should remain compatible with Google Tag Manager (GTM), Google Analytics 4 (GA4), Google Ads, and a future call-tracking or CRM provider.

No production IDs or tracking phone numbers are documented here. Use only owner-approved IDs and the configured public business number.

## Outcome hierarchy

| Level | Outcome | Recommended optimization use |
|---|---|---|
| Business outcome | Qualified commercial call, qualified scheduled-service request, booked commercial job | Primary Google Ads conversion once the call/CRM workflow can verify it |
| Lead | Successful, spam-screened commercial form request | Primary only while deeper qualified/booked outcomes are unavailable; later make secondary |
| Intent | Phone click, photo CTA click, form start | Secondary observation only |
| Engagement | Service-card click, qualification-notice view | Diagnostic only; never a primary conversion |

A `phone_click` means that a visitor activated a `tel:` link. It does not prove that the call connected, was answered, was commercial, was qualified, or became a job.

## Implementation status and release gate

The current website implementation was code-reviewed against this plan on 2026-07-14. This is a source-code assessment, not evidence that GTM, GA4, Google Ads, call delivery, or form delivery works in production.

| Capability | Current source behavior | Release status |
|---|---|---|
| Central configuration | Public phone and integration placeholders live in `data/business.json`; generated browser configuration is read by `assets/site.js` | Implemented; business values still need owner confirmation |
| Data-layer helper | `window.DCELDAnalytics.track()` pushes the required event names and common page/campaign parameters to `window.dataLayer` | Implemented; local headless-browser interaction checks passed, while GTM/GA4 delivery remains external |
| GTM loading | The container is loaded only when `gtmContainerId` matches a `GTM-…` value | Inactive because the configured ID is `null` |
| Existing Ahrefs analytics | The active production key is centralized and loaded after `window.load`, during idle time when available | Preserved from production; owner/privacy approval still required |
| Call tracking | All `tel:` activations emit `phone_click`; hero, sticky, and footer placements also emit one placement event | Local browser checks passed for hero and sticky deduplication; GTM and connected-call testing remain pending |
| Form attribution | Session landing page, referrer, UTMs, `gclid`, `gbraid`, and `wbraid` are copied into hidden form fields | Implemented; end-to-end delivery and privacy approval pending |
| Submission events | `form_submit_attempt` records the valid browser submit attempt. `form_submit_success` and `commercial_lead_submit` fire only after a recent pending request returns through `?submitted=1` | Local matched/bare-return browser checks passed; end-to-end provider delivery still requires testing before conversion use |
| Deduplication | Every data-layer event has a UUID-style `event_id`; each valid form attempt creates a non-personal `lead_id`, includes it in the submitted form, and reuses it on the acknowledged return | Local browser continuity and duplicate-submit guards passed; provider/CRM reconciliation remains pending |
| Ads call hook | Direct Ads call conversion parameters and dynamic-number replacement are inert until owner-approved values are configured | Access- and provider-dependent |

Current configuration deliberately contains no GTM, GA4, Google Ads, call-tracking, or replacement-number values. Keep those fields `null` until their owner, account, consent requirements, and test process are confirmed. Ahrefs is the exception: its already-active production key is preserved and delayed off the critical rendering path; confirm ownership and privacy requirements before release.

`ga4MeasurementId` is currently a reserved configuration field; `assets/site.js` does not load GA4 directly from it. GA4 delivery therefore requires an approved GTM setup unless a separately reviewed loader is implemented. After changing `data/business.json`, run the production generator/build so `assets/business-config.js` is refreshed; do not hand-edit the generated browser configuration.

## Data-layer contract

Use `window.DCELDAnalytics.track()` as the only website-code path that pushes data-layer events. GTM should listen for those custom events and deliver them to GA4. Do not also configure a second click listener that sends the same interaction.

`assets/site.js` contains an optional direct Google Ads website-call hook that runs only when `googleAdsCallIntegrationMode` is explicitly set to `direct_gtag`, approved conversion ID/label values are present, and `gtag()` exists. Choose either that hook or a GTM Ads tag for the call action—never both. The preferred rollout is GTM-managed delivery with the direct mode and values left `null` until a controlled integration test.

Example:

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'phone_click',
  event_sequence: 1,
  event_id: 'event_00000000-0000-0000-0000-000000000000',
  page_path: '/panic-bar-repair-washington-dc',
  page_title: 'Panic Bar Repair Washington DC',
  service: 'panic_bar_repair',
  location: 'Washington DC',
  cta_location: 'hero',
  device_context: 'mobile',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'dc_panic_bar',
  utm_term: 'panic bar repair',
  utm_content: 'hero_call',
  gclid_present: true,
  gbraid_present: false,
  wbraid_present: false
});
```

Do not push names, email addresses, phone numbers, street addresses, full messages, uploaded filenames, raw click IDs, or other personal data into GA4 or GTM.

## Common event parameters

| Parameter | Format | Rule |
|---|---|---|
| `event_sequence` | Positive integer | Current page-local sequence counter; useful for debugging but not a durable cross-page deduplication key |
| `event_id` | Prefixed UUID/fallback ID | Unique identifier generated for each data-layer event; do not register it as a GA4 custom dimension |
| `lead_id` | Prefixed UUID/fallback ID | Non-personal identifier generated for a valid form attempt and reused on its acknowledged return events |
| `page_path` | String | Canonical pathname, excluding tracking parameters |
| `page_title` | String | Current document title |
| `service` | Stable snake_case enum | Examples: `commercial_door_repair`, `panic_bar_repair`, `fire_door_inspection` |
| `location` | Configured page string | Current pages use visible values such as `Washington DC`; normalize in GTM only if an approved reporting taxonomy requires it |
| `cta_location` | Configured component string | Current common values include `header`, `hero`, `sticky`, `body`, `form`, `footer`, `service_card`, and section-specific values |
| `device_context` | Enum | `mobile`, `tablet`, or `desktop`, determined consistently from an approved breakpoint policy |
| `utm_source` | String | Preserved attribution value when present |
| `utm_medium` | String | Preserved attribution value when present |
| `utm_campaign` | String | Preserved attribution value when present |
| `utm_term` | String | Preserved attribution value when present |
| `utm_content` | String | Preserved attribution value when present |
| `gclid_present` | Boolean | Presence only in analytics; preserve the raw ID in the lead record, not GA4 |
| `gbraid_present` | Boolean | Presence only in analytics |
| `wbraid_present` | Boolean | Presence only in analytics |
| `form_type` | Enum | `emergency` or `scheduled`; omit when irrelevant |
| `phone_source` | Enum | `configured_business_number` unless an approved runtime replacement changes the eligible link to `dynamic_number` |

GTM should provide defaults for missing optional fields so tags do not fail. Do not infer a city or service from user-entered free text when a page/config value is available. Treat `event_id` and `lead_id` as deduplication/reconciliation values, not report dimensions.

## Event specification

### Phone events

| Event | Trigger | Additional parameters | Conversion status |
|---|---|---|---|
| `phone_click` | Every deliberate activation of a configured `tel:` link | `phone_source`, `link_text`, `cta_location` | Secondary only |
| `sticky_phone_click` | Same activation when `cta_location=sticky` | Same as `phone_click` | Diagnostic/secondary |
| `hero_phone_click` | Same activation when `cta_location=hero` | Same as `phone_click` | Diagnostic/secondary |
| `footer_phone_click` | Same activation when `cta_location=footer` | Same as `phone_click` | Diagnostic/secondary |

For a hero, sticky, or footer call tap, emit one canonical `phone_click` and exactly one placement-specific event. Never emit the same event name twice for one interaction. Do not mark placement-specific events as conversions.

### Form events

| Event | Trigger | Additional parameters | Conversion status |
|---|---|---|---|
| `form_start` | First meaningful interaction with a form, once per form/page view | `form_id`, `form_type` | Secondary |
| `form_submit_attempt` | A valid, non-honeypot browser submit immediately before navigation to the processor | `form_id`, `form_type`, `lead_id`, `cta_location`, `service_requested` | Diagnostic only |
| `form_submit_success` | A `?submitted=1` return has a matching pending `lead_id` created in the same browser session within the prior hour | `form_id`, `form_type`, `lead_id`, `cta_location`, `service_requested` | Candidate web-lead conversion only after end-to-end delivery is verified |
| `form_submit_error` | Client validation failure, a photo total above the configured 10 MB processor limit, or an explicit `?form_error=1` return state | `form_id`, `form_type`, `error_type`; never error text containing user input | Diagnostic only |
| `commercial_lead_submit` | Same acknowledged, recent pending return as `form_submit_success` | `form_id`, `form_type`, `lead_id`, `cta_location`, `service_requested` | Candidate web-lead conversion only after delivery and spam qualification are verified; never a booked-job claim |

The pending-session requirement prevents a bare success URL from displaying a sent confirmation or generating lead events. A matched provider return is still not an authenticated CRM receipt. Before treating either success event as Primary, verify that the approved recipient actually received the request, the `lead_id` arrived intact, and spam/commercial qualification rules are working. A later server/CRM-confirmed event remains the stronger outcome.

### Supporting events

| Event | Trigger | Additional parameters | Conversion status |
|---|---|---|---|
| `photo_cta_click` | Activation of the current form-upload CTA | `cta_location`, `destination` | Secondary |
| `service_card_click` | Activation of a service/problem card | `selected_service`, `destination`, `cta_location` | Diagnostic only |
| `qualification_notice_view` | Qualification notice reaches the configured visibility threshold, once per notice/page view | `cta_location` | Diagnostic only |

The current qualification observer uses a 60% threshold. Page views and scrolling are not lead conversions. If multiple notices appear on a page, each notice can emit once; reports should therefore not interpret this event as unique users or leads.

## UTM and click-ID preservation

1. The implementation reads only this allowlist: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `gbraid`, and `wbraid`.
2. It stores the first landing pathname and first referrer for the browser session. Incoming campaign values on a later page overwrite the stored value for that campaign key; separate first-touch/latest-touch campaign records are not implemented.
3. Values are assigned to input `.value` properties rather than rendered as HTML. UTM values are capped at 200 characters, click identifiers at 512, landing paths at 500, and referrers at 1,000; ASCII control characters are removed before session storage or form population. The receiving system must still validate its own fields.
4. The sessionStorage behavior and all advertising identifiers require approval under the final privacy/consent policy.
5. At initialization and again on submit, the site populates these hidden fields:

   - Landing page
   - Referrer
   - UTM source
   - UTM medium
   - UTM campaign
   - UTM term
   - UTM content
   - `gclid`
   - `gbraid`
   - `wbraid`

6. The data layer receives only click-ID presence booleans. Raw click IDs are sent only as hidden form fields to the configured provider; verify recipient delivery, retention, consent, and access before production Ads use.
7. Tracking parameters must not alter canonicals or create indexable variants. Removing parameters from the displayed URL must not erase the preserved attribution record.
8. Test direct, organic, referral, Google Ads (`gclid`), iOS (`gbraid`/`wbraid`), internal navigation, and multi-page form journeys.

## GTM configuration

Create one Custom Event trigger for each event in this plan. Create Data Layer Variables for the common and event-specific parameters, then map them into GA4 Event tags.

Recommended safeguards:

- Load one GTM container only.
- Use one GA4 configuration/Google tag only.
- Do not combine direct `gtag()` dispatch with GTM delivery for the same events.
- Use a lookup/default for missing service and location values.
- Add an exception so development/test traffic is excluded from production reporting where appropriate.
- Do not configure `phone_click`, placement-specific call clicks, `form_start`, `photo_cta_click`, `service_card_click`, or `qualification_notice_view` as primary Ads conversions.
- Keep the public business number visible unless an approved Google forwarding number or call-tracking provider dynamically replaces it.

Production setup requires an owner-approved GTM container ID, GA4 measurement ID, Google Ads account/conversion IDs and labels, and call-tracking provider configuration.

## How to test in GTM Preview

1. Open GTM Preview/Tag Assistant against the production-like preview URL.
2. Confirm the container connects once and that no second GTM or direct GA4 configuration is loaded.
3. Clear session attribution, open a URL containing test UTMs and a non-production test click identifier, then navigate to a second page.
4. Trigger each CTA placement and form state from the test matrix below.
5. Select each Custom Event in Tag Assistant and inspect the Data Layer tab.
6. Confirm required parameters are present, values match the documented current contract, raw personal data is absent, and the GA4 tag fires once.
7. For a form, verify `form_start` fires once, `form_submit_attempt` fires once before navigation, and neither success event fires on button click. The matched provider-return page should produce one `form_submit_success` and one `commercial_lead_submit` with the same `lead_id`. Confirm a controlled validation failure produces one `form_submit_error`.
8. Confirm a sticky/hero/footer call emits one `phone_click` plus one correct placement event—not duplicate events of the same name.
9. Confirm blocked validation, double taps, back/forward navigation, and repeated component initialization do not duplicate events.
10. Confirm no production Google Ads conversion is triggered during testing unless the account uses an explicitly approved test process.

### Minimum interaction matrix

| Test | Expected events |
|---|---|
| Hero call | `phone_click`, `hero_phone_click` |
| Mobile sticky call | `phone_click`, `sticky_phone_click` |
| Footer call | `phone_click`, `footer_phone_click` |
| Begin emergency form | One `form_start` with `form_type=emergency` |
| Emergency submit attempt | One `form_submit_attempt`; no success or commercial-lead event before navigation |
| Successful emergency provider return | One `form_submit_success` and one `commercial_lead_submit` sharing the pending `lead_id`; independently confirm delivery |
| Bare or expired success URL | No sent confirmation and no form-success or commercial-lead event; marker is removed from the address bar |
| Client validation failure | One `form_submit_error`; no attempt, commercial-lead, or success event |
| Photos over 10 MB total | One `form_submit_error` with `error_type=file_size`; no navigation, attempt, commercial-lead, or success event |
| Provider/network failure | No success event; document the actual browser/provider behavior because no client fetch handler exists |
| Scheduled inspection request | Form events with `form_type=scheduled` |
| Photo CTA | One `photo_cta_click` with `destination` and `cta_location` |
| Service card | One `service_card_click` with `selected_service` and `destination` |
| Qualification notice visible | One `qualification_notice_view` per notice after 60% visibility |

## How to test in GA4 DebugView

1. Enable `debug_mode` only for the test browser through GTM Preview or an approved debug mechanism.
2. Open GA4 Admin > DebugView and select the test device.
3. Perform the interaction matrix and confirm events arrive in order with the expected parameters.
4. Open individual events to verify service, location, CTA placement, form type, attribution fields, and click-ID presence flags.
5. Confirm event counts match the physical interactions and that no event appears twice because of both dataLayer and direct `gtag()` delivery.
6. Confirm no names, emails, phone numbers, addresses, messages, filenames, or raw click IDs appear.
7. Allow normal processing time, then verify events in Realtime and standard reports. DebugView success alone does not prove a Google Ads conversion is configured.
8. Register only useful low-cardinality event parameters as GA4 custom dimensions. Avoid unnecessary high-cardinality dimensions such as raw `lead_id` or click IDs.

## Google Ads qualified-call conversions

Use an Ads-native website call conversion, call asset/call ad reporting, or an approved call-tracking provider that can report connected-call metadata. Do not invent or manually hardcode a tracking number.

Recommended configuration:

1. Create a Google Ads conversion action such as `Qualified commercial phone call`.
2. Use `Phone call lead` as the category and set counting to **One** per ad interaction.
3. Set a meaningful minimum call duration only after reviewing real call data; duration is a qualification proxy, not proof of a booked job.
4. Prefer CRM/provider disposition such as commercial service area + relevant service need over duration alone when available.
5. Mark the qualified-call action **Primary** and include it in the campaign-specific conversion goal.
6. Keep `phone_click` and its placement events **Secondary** and excluded from account-default goals.
7. Test number replacement on desktop and mobile, confirm the visible number remains owner-approved, and ensure the `tel:` destination matches the displayed number.
8. Avoid double counting the same call through both an Ads-native conversion and an imported GA4 phone click.

## Form and micro-conversion settings in Google Ads

- `form_submit_attempt`: diagnostic only; never a conversion.
- `commercial_lead_submit` and `form_submit_success`: candidate interim web-lead conversions only after the matched provider return, inbox/CRM delivery, `lead_id`, and spam-screening workflow are tested. Choose one conversion source for this outcome, not both. Make it Secondary once qualified-lead/booked-job imports are reliable.
- `phone_click`, placement phone clicks, `form_start`, `photo_cta_click`, `service_card_click`, and `qualification_notice_view`: secondary or observation-only.
- Do not import page views or scroll events as conversions.
- Use one conversion source for each outcome to prevent GA4/Ads duplication.

## Offline qualified-call and booked-job path

1. Persist the submitted `lead_id` in the approved lead system and retain the call provider's `call_id` for each tracked call.
2. Store available `gclid`, `gbraid`, or `wbraid`, event timestamp with timezone, landing page, service, service area, and consent state in the approved CRM/lead store.
3. Add controlled outcome fields such as `commercial_qualified`, `service_area_qualified`, `qualified_at`, `booked_job`, `booked_at`, and approved job value. Do not expose these records client-side.
4. Create separate Ads conversion actions, for example:

   - `Qualified commercial lead`
   - `Booked commercial job`

5. Upload the outcome using the supported Google Ads offline conversion workflow. Use the click identifier, conversion action, timestamp/timezone, value/currency where approved, and a stable order/lead identifier for deduplication.
6. If Enhanced Conversions for Leads is adopted, hash approved first-party email/phone data using Google's specified process and only under the confirmed privacy/consent policy.
7. Retract or adjust conversions when the Ads workflow supports it and a lead was later identified as spam, duplicate, outside the service area, or otherwise not accepted by the business.
8. Validate uploads in Google Ads diagnostics, compare a sample against CRM records, and monitor lag, match rate, duplicate rate, qualified rate, and booked-job rate.
9. After sufficient volume and data quality, optimize bidding toward qualified leads or booked jobs rather than phone clicks or raw form submissions.

## Reporting and QA guardrails

Report by landing page, service, location, device, CTA location, campaign, and outcome stage. The core funnel is:

`landing session -> call/form intent -> connected or submitted lead -> qualified commercial lead -> booked job`

Weekly QA should check:

- Event volume changes and duplicate rates
- Form success/error ratio
- Phone clicks versus connected calls
- Connected calls versus qualified commercial calls
- Wrong-service and out-of-area disqualification rate
- Successful forms versus qualified and booked outcomes
- Attribution completeness for UTMs and click IDs
- Ads/GA4/CRM reconciliation
- No personal data in analytics payloads

## Access-dependent items

The following cannot be completed in code without account access and owner confirmation:

- Publish the production GTM container
- Configure the GA4 property and custom dimensions
- Create Google Ads conversion actions, goals, and labels
- Configure Google forwarding numbers or a call-tracking provider
- Set qualified-call duration/disposition rules
- Connect a CRM or lead destination for offline conversion imports
- Approve consent and privacy behavior
