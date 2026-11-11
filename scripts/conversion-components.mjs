import { segments, ownerPlaceholders } from '../data/conversion-content.mjs';

const escape = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const safeLink = (value = '') => /^https:\/\//.test(value) ? value : '';

export function conversionComponents(business, proof = {}) {
  const phone = business.phone;
  const paths = {
    building: 'M4 21V3h16v18M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3',
    store: 'M3 10h18l-2-6H5l-2 6Zm2 0v11h14V10M9 21v-7h6v7M3 10v2m6-2v2m6-2v2m6-2v2',
    office: 'M4 21V4h10v17M14 10h6v11M8 8h2m-2 4h2m-2 4h2M2 21h20',
    medical: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z',
    school: 'm2 9 10-6 10 6-10 6-10-6Zm4 3v7l6 3 6-3v-7M22 9v8',
    exit: 'M14 21H4V3h10M10 12h12m-4-4 4 4-4 4',
    manager: 'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3a7 7 0 0 1 14 0v3M2 21h20',
    phone: 'M6 3h3l2 5-2 2a15 15 0 0 0 5 5l2-2 5 2v3a3 3 0 0 1-3 3A18 18 0 0 1 3 6a3 3 0 0 1 3-3Z'
  };
  function icon(name) {
    return `<svg class="service-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name] || paths.building}"/></svg>`;
  }
  function whatsappUrl(context = '') {
    const number = String(business.photoContact?.whatsappNumber || phone.e164).replace(/\D/g, '');
    const message = `Hi DC Emergency Lock & Door. I need commercial door or lock service${context ? ` (${context})` : ''}.\nBusiness type/name: \nAddress or ZIP: \nDoor/lock problem: \nUrgency (now / today / this week / planned): \nContact name and phone: \nI can attach door and hardware photos in this chat.`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }
  function photoCta(context = '', location = 'body', label = 'Send a Door Photo on WhatsApp') {
    return `<a class="button button-secondary" href="${escape(whatsappUrl(context))}" data-component="SendPhotoCTA" data-photo-cta data-contact-channel="whatsapp" data-cta-location="${escape(location)}">${escape(label)}</a>`;
  }
  function call(location = 'body') {
    return `<a class="button button-primary" href="tel:${escape(phone.e164)}" data-business-phone-link data-dynamic-number-eligible data-cta-location="${escape(location)}" aria-label="Call ${escape(phone.display)}">Call <span data-business-phone>${escape(phone.display)}</span></a>`;
  }
  function stickyActions() {
    return `<nav class="sticky-mobile-actions" data-component="StickyMobileActionBar" aria-label="Quick contact actions"><a class="sticky-mobile-action sticky-mobile-call" href="tel:${escape(phone.e164)}" data-business-phone-link data-dynamic-number-eligible data-cta-location="sticky" aria-label="Call now: ${escape(phone.display)}">${icon('phone')}<span>Call now</span></a><a class="sticky-mobile-action sticky-mobile-photo" href="${escape(whatsappUrl())}" data-photo-cta data-contact-channel="whatsapp" data-cta-location="sticky">Send Photo<span class="sticky-channel">WhatsApp</span></a></nav><a class="desktop-call" href="tel:${escape(phone.e164)}" data-business-phone-link data-dynamic-number-eligible data-cta-location="floating" aria-label="Call ${escape(phone.display)}">${icon('phone')}<span>Call <span data-business-phone>${escape(phone.display)}</span></span></a>`;
  }
  function quoteForm(page) {
    const id = `${page.service || 'commercial'}-quote-form`;
    const options = page.symptoms || ['Door will not close or latch', 'Panic bar / exit device', 'Door closer problem', 'Business lockout', 'Commercial lock / rekey', 'Fire door repair or inspection request', 'Door installation', 'Access-control door hardware'];
    return `<form id="${escape(id)}" class="quote-form" data-quote-form data-form-type="whatsapp" aria-describedby="${id}-help" aria-disabled="true" hidden>
      <div class="quote-form-heading"><p class="eyebrow">Free commercial estimate</p><h3>Prepare your WhatsApp request</h3><p id="${id}-help">Fill in the details, then send the prepared message in WhatsApp. Call 24/7 for an urgent commercial door problem.</p></div>
      <fieldset class="quote-fieldset" data-quote-fields disabled><legend class="visually-hidden">Your commercial service request</legend><div class="form-grid">
      <div class="field"><label for="${id}-name">Name <span aria-hidden="true">*</span></label><input id="${id}-name" name="contact_name" autocomplete="name" maxlength="80" required></div>
      <div class="field"><label for="${id}-phone">Phone <span aria-hidden="true">*</span></label><input id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" required></div>
      <div class="field"><label for="${id}-type">Business type <span aria-hidden="true">*</span></label><select id="${id}-type" name="business_type" required><option value="">Choose business type</option>${['Property / facility management', 'Restaurant', 'Retail', 'Office', 'Medical office', 'School', 'Church', 'Multi-tenant building', 'Government-adjacent building', 'Other commercial property'].map(x => `<option>${escape(x)}</option>`).join('')}</select></div>
      <div class="field"><label for="${id}-address">Business address or ZIP <span aria-hidden="true">*</span></label><input id="${id}-address" name="service_location" autocomplete="street-address" maxlength="180" required></div>
      <div class="field"><label for="${id}-problem">Door or lock problem <span aria-hidden="true">*</span></label><select id="${id}-problem" name="problem_type" required><option value="">Choose the closest problem</option>${options.map(x => `<option>${escape(x)}</option>`).join('')}<option>Other commercial request</option></select></div>
      <div class="field"><label for="${id}-urgency">Urgency <span aria-hidden="true">*</span></label><select id="${id}-urgency" name="urgency" required><option value="">Choose urgency</option><option>Emergency now</option><option>Today</option><option>This week</option><option>Planned project</option></select></div>
      <div class="field field-full"><p class="quote-emergency" data-quote-emergency role="status" hidden>For an unsecured door or urgent business lockout, ${call('form', 'Call now')}. You can also send the details below.</p></div>
      <div class="field field-full"><label for="${id}-photo">Optional door photo</label><input id="${id}-photo" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-describedby="${id}-photo-help"><p id="${id}-photo-help" class="field-hint">Choose a photo to preview. Attach it in WhatsApp after opening the chat, or use the photo-sharing button when available. Up to 10 MB.</p><div class="quote-photo-preview" data-quote-photo-preview hidden><img data-quote-photo-image width="240" height="180" alt="Selected door photo preview" hidden><span data-quote-photo-name></span><button class="button button-secondary" type="button" data-quote-photo-remove>Remove photo</button></div></div>
      </div>
      <details class="quote-project-details"><summary>Property-manager or project details (optional)</summary><div class="form-grid"><div class="field"><label for="${id}-company">Business or property name</label><input id="${id}-company" name="company_name" autocomplete="organization" maxlength="120"></div><div class="field"><label for="${id}-work-order">Work-order reference</label><input id="${id}-work-order" name="work_order" maxlength="80"></div><div class="field"><label for="${id}-openings">Number of doors</label><input id="${id}-openings" name="opening_count" type="number" min="1" max="999" step="1" inputmode="numeric"></div><div class="field field-full"><label for="${id}-notes">Door, access or project details</label><textarea id="${id}-notes" name="message" maxlength="500" rows="3" placeholder="Describe the opening, access contact, deadline or inspection item."></textarea></div></div></details>
      ${['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid','landing_page','referrer','page_path','page_title','lead_id'].map(name => `<input type="hidden" name="${name}" value="">`).join('')}
      <div class="button-row"><button class="button button-primary" type="submit" data-quote-submit disabled>Continue in WhatsApp</button><button class="button button-secondary" type="button" data-quote-share hidden>Share request and photo</button></div>
      </fieldset>
      <p class="form-status" data-quote-status role="status" aria-live="polite"></p>
      <div class="quote-ready" data-quote-ready tabindex="-1" hidden><h4>Finish in WhatsApp</h4><p>Send the prepared message and attach your door photos in the conversation. Keep your phone available so we can discuss your request.</p><a class="button button-secondary" href="${escape(whatsappUrl(page.h1 || ''))}" target="_blank" rel="noopener noreferrer" data-quote-whatsapp-link data-photo-cta data-contact-channel="whatsapp" data-cta-location="form">Open the prepared WhatsApp request</a><p class="field-hint">WhatsApp opens in a new tab or app. <a href="/thank-you?channel=whatsapp">What happens next</a>.</p></div>
      <p class="form-note">Photos and request details are sent through WhatsApp. Direct website submissions are coming soon. <a href="/privacy-policy">Privacy policy</a>.</p>
    </form>`;
  }
  function requestSection(page = {}, id = 'service-request') {
    return `<section class="section request-section" id="${escape(id)}"><div class="wrap"><div class="section-heading"><p class="eyebrow">Choose your next step</p><h2>Need help now, or planning a project?</h2><p>Commercial properties only. Have your business address and door problem ready.</p></div><div class="grid-2 decision-grid"><article class="decision-card decision-urgent"><p class="eyebrow">Unsecured door or business lockout</p><h3>Call now</h3><p>Tell us whether the door closes, latches, locks and releases. We will discuss availability for your exact location.</p>${call('decision')}<p class="contact-note">For an urgent security or exit-hardware problem, start with a call.</p></article><article class="decision-card"><p class="eyebrow">Quote or planned commercial work</p><h3>Get a free estimate</h3><p>Share your business type, address or ZIP, problem and urgency. Add a full-door photo and a close-up of the hardware in WhatsApp.</p>${photoCta(page.h1 || '', 'quote', 'Send a Photo for a Free Estimate')}<p class="contact-note">We review the details with you before agreeing the scope. Photos help with an initial assessment; some work needs a site visit.</p></article></div>${quoteForm(page)}</div></section>`;
  }
  function whoWeServe() {
    return `<section class="who-strip" aria-labelledby="who-heading"><div class="wrap"><h2 id="who-heading">Commercial service for your business</h2><ul class="who-list">${[['Restaurants','store'],['Retail','store'],['Offices','office'],['Medical','medical'],['Schools','school'],['Multi-tenant buildings','building'],['Property managers','manager']].map(([label,name])=>`<li>${icon(name)}<span>${label}</span></li>`).join('')}</ul><p>Also serving churches and government-adjacent commercial properties.</p></div></section>`;
  }
  function segmentSection(only) {
    const selected = only ? segments.filter(s => s.id === only) : segments;
    return `<section class="section section-alt" id="business-segments"><div class="wrap"><div class="section-heading"><p class="eyebrow">Built around your building</p><h2>Commercial door problems, business-specific priorities</h2></div><div class="segment-grid">${selected.map(s => `<article class="segment-card" id="${s.id}"><div class="segment-label">${icon(s.icon)}<p class="eyebrow">${escape(s.label)}</p></div><h3>${escape(s.heading)}</h3><p>${escape(s.intro)}</p><ul class="check-list">${s.benefits.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><div class="mini-faq">${s.faqs.map(f=>`<details><summary>${escape(f.question)}</summary><p>${escape(f.answer)}</p></details>`).join('')}</div>${s.photo ? photoCta(s.label,'segment',s.cta) : `<a class="button button-secondary" href="${s.href}" data-service-card="${s.id}">${escape(s.cta)}</a>`}</article>`).join('')}</div></div></section>`;
  }
  function howItWorks() {
    return `<section class="section section-navy"><div class="wrap"><div class="section-heading"><p class="eyebrow" style="color:#bcdcff">How it works</p><h2>From the first call to a working door</h2></div><ol class="workflow-grid">${[
      ['Call or send a door photo', 'Tell us the business address, problem and urgency. For a door you cannot secure, call first.'],
      ['Review scope and a price range', 'Discuss the likely work, site access and what needs inspection before you approve a visit.'],
      ['Arrange the technician visit', 'Agree availability, access and the onsite contact for your property.'],
      ['Check operation and close out', 'Review closing, latching and exit operation. Tell us which photos or work-order details you need.']
    ].map(([title,body],i)=>`<li><span class="step-number" aria-hidden="true">${i+1}</span><h3>${title}</h3><p>${body}</p></li>`).join('')}</ol></div></section>`;
  }
  function pricingSection() {
    return `<section class="section pricing-section"><div class="wrap grid-2"><div><p class="eyebrow">Pricing transparency</p><h2>Understand the work before you approve it</h2><p>The cost depends on the door and frame condition, hardware type, parts, number of openings, access arrangements and urgency. A clear photo helps narrow the initial scope.</p><p>Request a free estimate and ask what the quote includes: the visit, labor, parts and any follow-up work. We discuss the scope with you; inspection may reveal conditions a photo cannot show.</p>${photoCta('Quote request','pricing','Send Photos to Discuss a Quote')}</div><aside class="card" aria-label="Quote preparation checklist"><h3>Useful details for a better quote</h3><ul class="check-list"><li>Full opening and close-up hardware photos</li><li>Whether the door closes, latches, locks and releases</li><li>Hardware brand or model from a visible label</li><li>Business address, opening count and urgency</li><li>Work-order requirements and site access</li></ul></aside></div></section>`;
  }
  function proofSection() {
    const reviews = (proof.testimonials || []).filter(x => x.approvedForPublication && x.text && x.attribution && safeLink(x.sourceUrl));
    const brands = (proof.hardwareBrands || []).filter(x => x.approvedForPublication && x.name && x.approvedWording);
    const photos = (proof.jobPhotos || []).filter(x => x.approvedForPublication && x.src && x.width && x.height && x.caption);
    const credentials = [...(proof.licenses || []), ...(proof.insurance || [])].filter(x => x.approvedForPublication && x.approvedWording);
    const cases = (proof.caseStudies || []).filter(x => x.approvedForPublication && x.problem && x.workCompleted && x.outcome && x.images?.length >= 2 && x.images.every(p => p.src && p.width && p.height && p.alt && p.caption));
    const warranty = business.warranty?.verified && business.warranty?.text;
    const rating = business.googleRating;
    const ratingHtml = rating?.verified && safeLink(rating.url) && rating.value && rating.count ? `<a class="rating-badge" href="${escape(rating.url)}">Google rating: ${escape(rating.value)} / 5 · ${escape(rating.count)} reviews</a>` : '';
    return `${reviews.length || ratingHtml ? `<section class="section"><div class="wrap"><h2>What commercial customers say</h2>${ratingHtml}<div class="grid-3">${reviews.map(r=>`<figure class="card"><blockquote><p>${escape(r.text)}</p></blockquote><figcaption>${escape(r.attribution)} · <a href="${escape(r.sourceUrl)}">Read the original review</a></figcaption></figure>`).join('')}</div></div></section>` : ''}
    ${brands.length ? `<section class="section section-alt"><div class="wrap"><h2>Commercial hardware we service</h2><ul class="brand-list">${brands.map(b=>`<li><strong>${escape(b.name)}</strong> — ${escape(b.approvedWording)}</li>`).join('')}</ul></div></section>` : ''}
    ${photos.length ? `<section class="section"><div class="wrap"><h2>Commercial door work in detail</h2><div class="photo-grid">${photos.map(p=>`<figure class="photo-card"><img src="${escape(p.src)}" width="${Number(p.width)}" height="${Number(p.height)}" alt="${escape(p.alt || p.caption)}" loading="lazy" decoding="async"><figcaption>${escape(p.caption)}</figcaption></figure>`).join('')}</div></div></section>` : ''}
    ${cases.length ? `<section class="section"><div class="wrap"><h2>Before and after commercial door work</h2>${cases.map(c=>`<article class="card"><h3>${escape(c.hardwareOrDoorType || 'Commercial door repair')}</h3><p>${escape(c.problem)}</p><div class="grid-2">${c.images.map(p=>`<figure class="photo-card"><img src="${escape(p.src)}" width="${Number(p.width)}" height="${Number(p.height)}" alt="${escape(p.alt)}" loading="lazy" decoding="async"><figcaption>${escape(p.caption)}</figcaption></figure>`).join('')}</div><p>${escape(c.workCompleted)}</p><p>${escape(c.outcome)}</p></article>`).join('')}</div></section>` : ''}
    ${credentials.length || warranty ? `<section class="section section-alt"><div class="wrap"><h2>Credentials and workmanship</h2>${credentials.map(c=>`<p>${escape(c.approvedWording)}</p>`).join('')}${warranty ? `<h3>Warranty</h3><p>${escape(warranty)}</p>` : ''}</div></section>` : ''}
    <template data-owner-proof-placeholder><section aria-label="Owner content placeholders">${Object.entries(ownerPlaceholders).map(([key,label])=>`<p>[ADD: ${key} — ${escape(label)}]</p>`).join('')}</section></template>`;
  }
  return { icon, whatsappUrl, photoCta, stickyActions, quoteForm, requestSection, whoWeServe, segmentSection, howItWorks, pricingSection, proofSection };
}
