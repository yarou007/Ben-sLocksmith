# Human verification checklist

Last updated: 2026-07-14

Do not publish a claim or activate an integration until an authorized business owner marks it confirmed and supplies the approved value/source. Use configuration flags or TODO values for anything still pending.

## Current unresolved configuration

The following status comes from `data/business.json`; none of these rows is an owner approval.

| Item | Current repository value | Required decision |
|---|---|---|
| Public phone | `703-244-0559` / `+17032440559`, consistent with the prior site | Confirm ownership, call routing, display format, and commercial-call handling |
| Form destination | FormSubmit endpoint for `dc...@gmail.com` (full value remains in configuration) | Confirm recipient ownership, activate/approve the FormSubmit workflow, and test delivery and replies |
| Legal name and address | `null` | Supply the legal name and decide whether schema/GBP should use a genuine public address or service-area-only setup |
| Hours and operational trust claims | All unverified/disabled | Approve exact values and evidence, or leave unpublished |
| Analytics and Ads IDs | GTM, GA4, Google Ads, call tracking, and dynamic number values are `null`; the existing production Ahrefs key is preserved | Confirm Ahrefs ownership/privacy approval and supply other owner-approved IDs only after testing decisions |
| Search Console verification | Existing production Google verification token is preserved in generated pages | Confirm the token belongs to the intended Search Console property and retain or replace it under owner control |
| Social profiles | URLs present but every profile is marked unverified | Confirm ownership and exact canonical URLs before publishing or adding to schema |
| Hardware brands | List present but marked unverified | Confirm which brands are serviced, installed, stocked, or authorized; these are different claims |
| Proof | Case studies, testimonials, licenses, certifications, insurance, and customer-logo arrays are empty | Add only approved source material |
| New York market | Listed only as a legacy market needing confirmation | Confirm whether it remains a genuine market; do not promote it on DC landing pages or DC paid-search pages |

## Business identity and contact

- [ ] Legal business name and approved public/display name
- [ ] Verified public phone number (codebase currently uses `703-244-0559`)
- [ ] Confirmation that the phone line accepts and routes qualified commercial calls from every advertised service area and after-hours period
- [ ] Genuine business address, or confirmation that the business is service-area-only and the address must be omitted/hidden
- [ ] Primary service areas and any excluded areas, with Washington DC, nearby Northern Virginia, and nearby Maryland prioritized
- [ ] Google Business Profile URL and confirmed service-area/address setup
- [ ] Verified service hours and whether 24/7 dispatch is accurate
- [ ] Approved email/contact channel for public inquiries
- [ ] Domain, preferred hostname, hosting/Vercel project, and DNS ownership for deployment and redirect validation

## Licenses, insurance, and operational claims

- [ ] License jurisdiction(s), exact legal wording, license number(s), issuing authority, and approval to publish
- [ ] Insurance status and exact approved wording; do not publish limits or coverage details without approval
- [ ] Certificate of insurance (COI) availability
- [ ] W-9 availability
- [ ] Commercial invoicing options and payment terms that may be stated publicly
- [ ] Written-estimate availability and any conditions
- [ ] Same-day service availability and any conditions
- [ ] Real response-time claim backed by current records; otherwise publish no time guarantee/statistic
- [ ] Emergency/after-hours dispatch process and whether a live dispatcher/no-voicemail claim is accurate
- [ ] Multi-location support, work-order references, before/after documentation, and scheduled-maintenance capabilities

## Services, proof, and reputation

- [ ] Final positive commercial-service wording and confirmation that callers should not see negative service-rejection language
- [ ] Verified services and property/building types served
- [ ] Hardware brands actually serviced, installed, stocked, or authorized; distinguish each claim
- [ ] Fire-door inspection/report/correction capabilities and legally reviewed compliance wording
- [ ] Genuine case studies and completed-job details approved for publication
- [ ] Ownership, date, general location, caption, and approval for each job photo
- [ ] Review/testimonial source URLs, exact approved excerpts, reviewer attribution/privacy approval, and current rating if any
- [ ] Certifications and approved certification wording
- [ ] Social profile URLs: Instagram, TikTok, YouTube, Facebook, X, LinkedIn, and any others intended for publication
- [ ] Google Business Profile name/category/phone/website consistency with the approved site identity; do not copy an address into schema unless it is eligible and public

## Lead handling and privacy

- [ ] Form recipient/inbox ownership, FormSubmit activation status, backup recipient, and responsible response team
- [ ] Approved emergency-form and scheduled-service-form workflow
- [ ] Approved messaging/photo-submission channel; do not invent an SMS or messaging number
- [ ] Approval for the form processor and photo uploads, including access controls and retention/deletion policy
- [ ] Permitted photo file types, file-size limit, malware handling, and a process for deleting sensitive building/security images
- [ ] End-to-end test showing a submission reaches the approved inbox/CRM with all expected fields and attribution, without exposing the recipient or data to an unapproved party
- [ ] Spam-protection method and acceptable user friction
- [ ] Privacy-policy requirements and legal reviewer/owner
- [ ] Consent requirements for analytics, advertising, call recording, enhanced conversions, and form processing
- [ ] Data retention, deletion, processor disclosure, and data-subject/contact process
- [ ] Public privacy contact, policy effective date, and approved disclosures for FormSubmit, GTM/GA4, Google Ads, call tracking, sessionStorage, and click identifiers

## Analytics and advertising access

- [ ] Inventory and approval for every active analytics/advertising ID or property, including Ahrefs and any Meta Pixel
- [ ] Google Tag Manager container ID and account access
- [ ] GA4 measurement ID, property name, timezone, currency, and admin access
- [ ] Google Ads account ID
- [ ] Google Ads website conversion IDs and labels
- [ ] Decision to send the website-call conversion through GTM or the optional direct code hook; never enable both for the same call
- [ ] Google Ads qualified-call conversion action, counting rule, duration/disposition threshold, and campaign goal
- [ ] Call-tracking provider, approved forwarding-number behavior, recording disclosure, and provider access
- [ ] CRM/lead system and owner for qualified-call, qualified-lead, and booked-job status
- [ ] Offline conversion import method and approved conversion values
- [ ] Enhanced Conversions for Leads approval and consent requirements, if used
- [ ] Internal/test traffic rules and staff test contacts
- [ ] Google Search Console owner access for both the preferred Domain property and URL-prefix property, if maintained
- [ ] Consent-management platform and region-specific default consent settings, if legally required

## Approval record

Record the approver, source document/account, approval date, and exact approved wording/value for each completed item. Re-verify time-sensitive information—hours, service areas, licenses, insurance, reviews, tracking IDs, and provider settings—before major releases.

| Item | Approved value/wording | Source | Approver | Approval date | Recheck date |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
