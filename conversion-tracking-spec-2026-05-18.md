# Conversion Tracking Spec (GA4 + GTM)

## Events Fired by Website Code

- `phone_click`
  - Trigger: any `tel:` link click
  - Parameters: `page_slug`, `element_text`, `href`

- `quote_form_open`
  - Trigger: quote CTA clicks
  - Parameters: `page_slug`, `element_text`, `href`

- `quote_form_submit`
  - Trigger: quote form submit button or form submission
  - Parameters: `page_slug`, `form_id`, `location`

- `quote_form_confirmation_view`
  - Trigger: post-submit confirmation state (`?submitted=1`)
  - Parameters: `page_slug`

- `service_cta_click`
  - Trigger: service CTA button/link interactions
  - Parameters: `page_slug`, `element_text`, `href`

## GTM Recommendations

1. Create GA4 Event tags for each event above.
2. Mark `phone_click` and `quote_form_submit` as primary conversions in GA4.
3. Create secondary conversion for `quote_form_open` for funnel visibility.
4. Build a funnel exploration:
   - page_view -> quote_form_open -> quote_form_submit -> quote_form_confirmation_view
5. Add call-only conversion segment by landing page slug for local SEO ROI tracking.

## Required Production IDs

Replace placeholders currently in HTML:
- `GTM-XXXXXXX`
- `G-XXXXXXXXXX`

