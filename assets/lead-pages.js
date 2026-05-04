(function () {
  var CONFIG = {
    phoneRaw: '7032440559',
    phoneLabel: '703-244-0559',
    formSubmitEndpoint: 'https://formsubmit.co/dclockanddoor@gmail.com',
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    fbPixelId: '000000000000000',
    social: [
      {
        id: 'x',
        label: 'X',
        href: 'https://x.com/dcemergencylock',
        iconClass: 'fa-brands fa-x-twitter'
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/dc-emergency-lock-and-door',
        iconClass: 'fa-brands fa-linkedin-in'
      },
      {
        id: 'youtube',
        label: 'YouTube',
        href: 'https://www.youtube.com/@dcemergencylockanddoor',
        iconClass: 'fa-brands fa-youtube'
      },
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://www.facebook.com/profile.php?id=61574339060945',
        iconClass: 'fa-brands fa-facebook-f'
      }
    ]
  };

  function safeText(value) {
    return (value || '').toString().trim();
  }

  function slugFromPath(pathname) {
    if (!pathname || pathname === '/') return 'home';
    return pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  }

  function trackEvent(eventName, payload) {
    if (!eventName) return;

    var enriched = Object.assign(
      {
        event: eventName,
        page_slug: slugFromPath(window.location.pathname)
      },
      payload || {}
    );

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(enriched);

    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, payload || {});
      } catch (e) {
        // Ignore analytics runtime issues.
      }
    }

    if (typeof window.fbq === 'function') {
      try {
        window.fbq('trackCustom', eventName, payload || {});
      } catch (e) {
        // Ignore analytics runtime issues.
      }
    }
  }

  function applyTrackingAttributes() {
    var anchors = document.querySelectorAll('a');

    anchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href') || '';
      var text = safeText(anchor.textContent).toLowerCase();

      if (href.indexOf('tel:') === 0) {
        anchor.classList.add('track-phone-click');
        anchor.setAttribute('data-track', 'phone_click');
        anchor.setAttribute('data-event', 'phone_click');
      }

      if (text.indexOf('request inspection') !== -1) {
        anchor.classList.add('track-request-inspection');
        anchor.setAttribute('data-track', 'request_inspection_click');
        anchor.setAttribute('data-event', 'service_cta_click');
      }

      if (text.indexOf('get quote') !== -1 || text.indexOf('free quote') !== -1 || text.indexOf('free estimate') !== -1) {
        anchor.classList.add('track-get-estimate');
        anchor.setAttribute('data-track', 'get_free_estimate_click');
        anchor.setAttribute('data-event', 'quote_form_open');
        anchor.textContent = 'Request a Free Estimate';
      }

      if (text.indexOf('emergency') !== -1) {
        anchor.classList.add('track-emergency-service');
        if (!anchor.hasAttribute('data-track')) {
          anchor.setAttribute('data-track', 'emergency_service_click');
        }
        if (!anchor.hasAttribute('data-event')) {
          anchor.setAttribute('data-event', 'service_cta_click');
        }
      }

      if (!anchor.hasAttribute('data-event') && (anchor.classList.contains('btn') || anchor.classList.contains('lead-btn'))) {
        anchor.setAttribute('data-event', 'service_cta_click');
      }

      if (href === '#' && text === 'privacy') {
        anchor.setAttribute('href', '/privacy-policy');
      }

      if (href === '#' && text === 'terms') {
        anchor.setAttribute('href', '/terms-of-service');
      }
    });

    var buttons = document.querySelectorAll('button, input[type="submit"]');
    buttons.forEach(function (button) {
      if (button.classList.contains('track-quote-submit')) {
        button.setAttribute('data-event', 'quote_form_submit');
        if (!button.hasAttribute('data-track')) {
          button.setAttribute('data-track', 'quote_form_submit');
        }
        return;
      }

      if (!button.hasAttribute('data-event')) {
        button.setAttribute('data-event', 'service_cta_click');
      }
    });
  }

  function enhanceImages() {
    var images = document.querySelectorAll('img');
    var firstMeaningfulImageSet = false;

    images.forEach(function (img, index) {
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      if (!img.hasAttribute('loading') && index > 0) {
        img.setAttribute('loading', 'lazy');
      }

      if (!firstMeaningfulImageSet && !img.hasAttribute('fetchpriority')) {
        var inHero = !!img.closest('.hero, .lead-hero');
        if (inHero || index === 0) {
          img.setAttribute('fetchpriority', 'high');
          firstMeaningfulImageSet = true;
        }
      }

      if (!img.hasAttribute('alt') || !safeText(img.getAttribute('alt'))) {
        var src = img.getAttribute('src') || 'service image';
        var fallback = src
          .split('/')
          .pop()
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\bimg\b/gi, '')
          .trim();
        img.setAttribute('alt', fallback || 'Commercial locksmith service photo');
      }
    });
  }

  function ensureStickyStyles() {
    if (document.getElementById('lead-pages-sticky-style')) return;
    var style = document.createElement('style');
    style.id = 'lead-pages-sticky-style';
    style.textContent =
      '.sticky-mobile-call{position:fixed;left:10px;right:10px;bottom:10px;z-index:999;display:none;align-items:center;justify-content:center;gap:8px;text-decoration:none;background:#dc2626;color:#fff;font-weight:800;font-size:14px;border-radius:999px;padding:12px 18px;box-shadow:0 4px 18px rgba(15,30,46,.25)}' +
      '.global-free-estimate{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:10px;background:#dc2626;color:#fff;font-weight:800;text-decoration:none;box-shadow:0 6px 20px rgba(220,38,38,.28)}' +
      '.global-free-estimate:hover{background:#b91c1c}' +
      '.estimate-trustline{margin-top:12px;font-size:12px;color:rgba(255,255,255,.82);font-weight:600}' +
      '.lead-cta-row + .estimate-trustline,.hero-actions + .estimate-trustline{color:inherit;opacity:.8}' +
      '.request-service-extra{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:2px}' +
      '.request-service-field{display:flex;flex-direction:column;gap:4px}' +
      '.request-service-field label{font-size:12px;font-weight:700;color:#3a4f3a}' +
      '.request-service-field input,.request-service-field select,.request-service-field textarea{width:100%;border:1px solid #d8e4d8;border-radius:8px;padding:10px;background:#fff;color:#1c2b1c;font:inherit}' +
      '.request-service-field textarea{min-height:96px;resize:vertical}' +
      '.request-service-full{grid-column:1 / -1}' +
      '@media (max-width:900px){.sticky-mobile-call{display:inline-flex}body{padding-bottom:64px}.request-service-extra{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  function addStickyMobileCall() {
    if (document.querySelector('.sticky-mobile-call')) {
      return;
    }

    var existingSticky = document.querySelector('.sticky-call');
    if (existingSticky) {
      existingSticky.classList.add('track-phone-click', 'track-emergency-service');
      existingSticky.setAttribute('data-track', 'phone_click');
      existingSticky.setAttribute('aria-label', 'Call now ' + CONFIG.phoneLabel);
      return;
    }

    var sticky = document.createElement('a');
    sticky.href = 'tel:' + CONFIG.phoneRaw;
    sticky.className = 'sticky-mobile-call track-phone-click track-emergency-service';
    sticky.setAttribute('data-track', 'phone_click');
    sticky.setAttribute('aria-label', 'Call now ' + CONFIG.phoneLabel);
    sticky.textContent = 'Emergency Service: ' + CONFIG.phoneLabel;
    document.body.appendChild(sticky);
  }

  function addHiddenInput(form, name, value) {
    var field = form.querySelector('input[name="' + name + '"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  }

  function createInputField(config) {
    var wrap = document.createElement('div');
    wrap.className = 'request-service-field' + (config.full ? ' request-service-full' : '');

    var label = document.createElement('label');
    label.setAttribute('for', config.id);
    label.textContent = config.label;

    var field;
    if (config.type === 'textarea') {
      field = document.createElement('textarea');
    } else if (config.type === 'select') {
      field = document.createElement('select');
      (config.options || []).forEach(function (optionConfig) {
        var option = document.createElement('option');
        option.value = optionConfig.value;
        option.textContent = optionConfig.label;
        if (optionConfig.selected) option.selected = true;
        field.appendChild(option);
      });
    } else {
      field = document.createElement('input');
      field.type = config.type || 'text';
    }

    field.id = config.id;
    field.name = config.name;
    if (config.placeholder) field.placeholder = config.placeholder;
    if (config.required) field.required = true;

    wrap.appendChild(label);
    wrap.appendChild(field);

    return wrap;
  }

  function appendFieldIfMissing(form, container, query, config) {
    if (form.querySelector(query)) return;
    container.appendChild(createInputField(config));
  }

  function ensureRequestServiceFormSection() {
    var hasQuoteForm = !!document.querySelector('form.quote-form, form.request-service-form');
    if (hasQuoteForm) return;

    var section = document.createElement('section');
    section.className = 'sec sec-white request-service-component';
    section.id = 'request-service-form-section';
    section.innerHTML =
      '<div class="wrap">' +
      '<div style="background:#fff;border:1px solid #d8e4d8;border-left:4px solid #1d5fb8;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(0,0,0,.07)">' +
      '<h2 style="font-size:22px;color:#0f1e2e;margin-bottom:10px">Request Service</h2>' +
      '<p style="font-size:14px;color:#3a4f3a;margin-bottom:14px">Tell us what you need and we will respond quickly. For urgent requests call <a href="tel:' +
      CONFIG.phoneRaw +
      '" style="color:#1d5fb8;font-weight:700">' +
      CONFIG.phoneLabel +
      '</a>.</p>' +
      '<form class="quote-form request-service-form" id="request-service-form" action="https://formsubmit.co/dclockanddoor@gmail.com" method="POST" style="display:grid;gap:10px">' +
      '<div class="request-service-extra"></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="submit" class="btn btn-primary track-quote-submit" data-track="quote_form_submit" data-event="quote_form_submit">Request a Free Estimate</button>' +
      '<a href="tel:' +
      CONFIG.phoneRaw +
      '" class="btn btn-red track-phone-click" data-track="phone_click" data-event="phone_click">Call ' +
      CONFIG.phoneLabel +
      '</a></div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</section>';

    var insertionPoint = document.querySelector('.cta-band') || document.querySelector('footer') || document.body.lastElementChild;
    if (insertionPoint && insertionPoint.parentNode) {
      insertionPoint.parentNode.insertBefore(section, insertionPoint);
    } else {
      document.body.appendChild(section);
    }
  }

  function enhanceRequestForms() {
    var forms = document.querySelectorAll('form.quote-form, form.request-service-form');
    var index = 0;

    forms.forEach(function (form) {
      index += 1;
      form.classList.add('quote-form', 'request-service-form');

      // Keep all lead forms on the same verified FormSubmit inbox, even if a stale HTML copy had an older endpoint.
      form.setAttribute('action', CONFIG.formSubmitEndpoint);

      if (!form.id) {
        form.id = index === 1 ? 'request-service-form' : 'request-service-form-' + index;
      }

      var extras = form.querySelector('.request-service-extra');
      if (!extras) {
        extras = document.createElement('div');
        extras.className = 'request-service-extra';
        var firstRow = form.querySelector('button[type="submit"],input[type="submit"]');
        var host = firstRow && firstRow.parentElement ? firstRow.parentElement : form.lastElementChild;
        if (host && host.parentElement === form) {
          form.insertBefore(extras, host);
        } else {
          form.appendChild(extras);
        }
      }

      appendFieldIfMissing(form, extras, '[name="Company name"],[name="company_name"],[name="Company"],#request-company', {
        id: 'request-company-' + index,
        name: 'Company name',
        label: 'Company name',
        type: 'text',
        placeholder: 'Your business name',
        required: true
      });

      appendFieldIfMissing(form, extras, '[name="Contact name"],[name="contact_name"],[name="Name"],#request-contact', {
        id: 'request-contact-' + index,
        name: 'Contact name',
        label: 'Contact name',
        type: 'text',
        placeholder: 'Full name',
        required: true
      });

      appendFieldIfMissing(form, extras, '[name="Phone"],[name="phone"],[type="tel"],#request-phone', {
        id: 'request-phone-' + index,
        name: 'Phone',
        label: 'Phone number',
        type: 'tel',
        placeholder: '(###) ###-####',
        required: true
      });

      appendFieldIfMissing(form, extras, '[name="Email"],[name="email"],[type="email"],#request-email', {
        id: 'request-email-' + index,
        name: 'Email',
        label: 'Email',
        type: 'email',
        placeholder: 'name@company.com',
        required: true
      });

      appendFieldIfMissing(form, extras, '[name="Service location"],[name="Location"],select[name*="location" i],#request-location', {
        id: 'request-location-' + index,
        name: 'Service location',
        label: 'Service location',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select location', selected: true },
          { value: 'Washington DC', label: 'Washington DC' },
          { value: 'Virginia', label: 'Virginia' },
          { value: 'Maryland', label: 'Maryland' },
          { value: 'New York', label: 'New York' }
        ]
      });

      appendFieldIfMissing(form, extras, '[name="Service needed"],[name="service_needed"],#request-service-needed', {
        id: 'request-service-needed-' + index,
        name: 'Service needed',
        label: 'Service needed',
        type: 'text',
        placeholder: 'Commercial locksmith, panic bar repair, fire door inspection...',
        required: true
      });

      appendFieldIfMissing(form, extras, '[name="Urgency"],select[name*="urgency" i],#request-urgency', {
        id: 'request-urgency-' + index,
        name: 'Urgency',
        label: 'Urgency',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select urgency', selected: true },
          { value: 'Emergency', label: 'Emergency' },
          { value: 'Same day', label: 'Same day' },
          { value: 'Scheduled', label: 'Scheduled' }
        ]
      });

      appendFieldIfMissing(form, extras, '[name="Issue description"],[name="Message"],textarea', {
        id: 'request-issue-' + index,
        name: 'Issue description',
        label: 'Describe the issue',
        type: 'textarea',
        full: true,
        placeholder: 'Tell us what is happening, address, and urgency level.',
        required: true
      });

      var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        submitButton.classList.add('track-quote-submit');
        submitButton.setAttribute('data-track', 'quote_form_submit');
        submitButton.setAttribute('data-event', 'quote_form_submit');
        if (submitButton.tagName.toLowerCase() === 'button') {
          submitButton.textContent = 'Request a Free Estimate';
        } else {
          submitButton.value = 'Request a Free Estimate';
        }
      }

      addHiddenInput(form, '_subject', 'New service request from ' + slugFromPath(window.location.pathname));
      addHiddenInput(form, '_captcha', 'false');
      addHiddenInput(form, '_next', window.location.origin + window.location.pathname + '?submitted=1');
    });
  }

  function enforceGlobalFormSubmitEndpoint() {
    var forms = document.querySelectorAll('form[action*="formsubmit.co"]');
    forms.forEach(function (form) {
      form.setAttribute('action', CONFIG.formSubmitEndpoint);
    });
  }

  function attachLeadFormHandlers() {
    var forms = document.querySelectorAll('form.quote-form, form.request-service-form');

    forms.forEach(function (form) {
      if (form.getAttribute('data-lead-bound') === 'true') return;
      form.setAttribute('data-lead-bound', 'true');

      form.addEventListener('submit', function () {
        var summaryParts = [];
        Array.from(form.elements).forEach(function (field) {
          if (!field.name || field.type === 'hidden' || field.type === 'submit' || field.type === 'button' || field.type === 'file') {
            return;
          }
          var value = safeText(field.value);
          if (!value) return;
          summaryParts.push(field.name + ': ' + value);
        });

        var pageTag = slugFromPath(window.location.pathname);
        var summary = 'Request from ' + pageTag + '\n' + summaryParts.join('\n');

        addHiddenInput(form, 'lead_summary', summary);

        trackEvent('quote_form_submit', {
          form_id: form.id || 'request-service-form',
          location: safeText((form.querySelector('[name="Service location"]') || {}).value)
        });
      });
    });
  }

  function ensurePrimaryCta() {
    var target = document.querySelector('.hero-actions') || document.querySelector('.lead-cta-row');
    if (!target) return;

    if (target.querySelector('.js-free-estimate-cta')) return;

    var cta = document.createElement('a');
    cta.href = '#request-service-form';
    cta.className = 'global-free-estimate js-free-estimate-cta track-get-estimate';
    cta.setAttribute('data-track', 'get_free_estimate_click');
    cta.setAttribute('data-event', 'quote_form_open');
    cta.textContent = 'Request a Free Estimate';
    target.appendChild(cta);

    var trustline = target.parentElement && target.parentElement.querySelector('.estimate-trustline');
    if (!trustline) {
      trustline = document.createElement('p');
      trustline.className = 'estimate-trustline';
      trustline.textContent = 'Licensed DC, VA, MD & NY · $2M insured · Avg response under 45 minutes';
      target.insertAdjacentElement('afterend', trustline);
    }
  }

  function ensureNavAccessibility() {
    var navs = document.querySelectorAll('nav');
    navs.forEach(function (nav, index) {
      if (!nav.hasAttribute('aria-label')) {
        if (nav.classList.contains('nav')) {
          nav.setAttribute('aria-label', 'Primary');
        } else if (nav.classList.contains('bc-nav')) {
          nav.setAttribute('aria-label', 'Breadcrumb');
        } else {
          nav.setAttribute('aria-label', 'Site navigation ' + (index + 1));
        }
      }
    });
  }

  function buildSocialLink(item) {
    var a = document.createElement('a');
    a.className = 'social-link';
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', item.label + ' (opens in a new tab)');
    a.title = item.label;

    var i = document.createElement('i');
    i.className = item.iconClass;
    i.setAttribute('aria-hidden', 'true');
    a.appendChild(i);

    return a;
  }

  function ensureSocialLinks() {
    var containers = document.querySelectorAll('.nav-social');

    containers.forEach(function (container) {
      CONFIG.social.forEach(function (item) {
        var exists = Array.from(container.querySelectorAll('a')).some(function (link) {
          return (link.getAttribute('href') || '').indexOf(item.href) === 0;
        });
        if (!exists) {
          container.appendChild(buildSocialLink(item));
        }
      });
    });
  }

  function ensureExpandedServiceMenus() {
    var expandedLinks = [
      { href: '/service-panic-bar-installation', label: 'Panic Bar Installation' },
      { href: '/service-exit-device-installation', label: 'Exit Device Installation' },
      { href: '/service-door-closer-adjustment', label: 'Door Closer Adjustment' },
      { href: '/service-commercial-door-closer-installation', label: 'Door Closer Installation' },
      { href: '/service-fire-door-compliance', label: 'Fire Door Compliance' },
      { href: '/service-commercial-rekey', label: 'Commercial Rekey' },
      { href: '/service-business-lock-change', label: 'Business Lock Change' },
      { href: '/service-restricted-key-systems', label: 'Restricted Key Systems' },
      { href: '/service-office-lockout', label: 'Office Lockout Service' },
      { href: '/service-property-manager-locksmith', label: 'Property Manager Locksmith' },
      { href: '/service-tenant-lock-change', label: 'Tenant Lock Change Service' }
    ];

    var containers = [];
    document.querySelectorAll('.sb-box').forEach(function (box) {
      var heading = safeText((box.querySelector('h4') || {}).textContent).toLowerCase();
      if (heading === 'all services') containers.push(box);
    });

    document.querySelectorAll('footer .footer-col').forEach(function (col) {
      var heading = safeText((col.querySelector('h4') || {}).textContent).toLowerCase();
      if (heading === 'services') containers.push(col);
    });

    containers.forEach(function (container) {
      var list = container.querySelector('ul');
      if (list) {
        expandedLinks.forEach(function (item) {
          var exists = Array.from(list.querySelectorAll('a')).some(function (a) {
            return (a.getAttribute('href') || '') === item.href;
          });
          if (exists) return;
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.label;
          a.setAttribute('data-event', 'service_cta_click');
          li.appendChild(a);
          list.appendChild(li);
        });
      } else {
        expandedLinks.forEach(function (item) {
          var exists = Array.from(container.querySelectorAll('a')).some(function (a) {
            return (a.getAttribute('href') || '') === item.href;
          });
          if (exists) return;
          var a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.label;
          a.setAttribute('data-event', 'service_cta_click');
          container.appendChild(a);
        });
      }
    });
  }

  function wireClickTracking() {
    document.addEventListener('click', function (event) {
      var target = event.target.closest('a,button,input[type="submit"]');
      if (!target) return;

      var trackName = target.getAttribute('data-event') || target.getAttribute('data-track');
      if (!trackName) return;

      trackEvent(trackName, {
        element_text: safeText(target.textContent || target.value || target.getAttribute('aria-label') || 'interaction'),
        href: target.getAttribute('href') || ''
      });
    });
  }

  function removeLegacyAnalyticsNotice() {
    var candidates = document.querySelectorAll('div,aside,p,span');
    candidates.forEach(function (node) {
      var text = safeText(node.textContent).toLowerCase().replace(/\s+/g, ' ');
      if (!text) return;

      var isMatch =
        text.indexOf('analytics setup pending') !== -1 ||
        text.indexOf('placeholder ids in head scripts') !== -1;
      if (!isMatch) return;

      node.remove();
    });
  }

  function announceSubmissionIfNeeded() {
    var params = new URLSearchParams(window.location.search);
    if (!params.has('submitted')) return;

    var box = document.createElement('div');
    box.style.background = '#ecfdf3';
    box.style.border = '1px solid #86efac';
    box.style.color = '#14532d';
    box.style.padding = '12px 14px';
    box.style.borderRadius = '10px';
    box.style.margin = '12px auto';
    box.style.maxWidth = '1160px';
    box.style.fontWeight = '700';
    box.textContent = 'Thanks. We received your request. For urgent service, please call ' + CONFIG.phoneLabel + '.';

    var host = document.querySelector('.lead-wrap') || document.querySelector('.wrap') || document.body;
    host.insertAdjacentElement('afterbegin', box);

    params.delete('submitted');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', clean);
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureStickyStyles();
    ensureNavAccessibility();
    applyTrackingAttributes();
    enhanceImages();
    ensureSocialLinks();
    ensureExpandedServiceMenus();
    ensurePrimaryCta();
    ensureRequestServiceFormSection();
    enhanceRequestForms();
    enforceGlobalFormSubmitEndpoint();
    addStickyMobileCall();
    attachLeadFormHandlers();
    wireClickTracking();
    removeLegacyAnalyticsNotice();
    announceSubmissionIfNeeded();
  });
})();
