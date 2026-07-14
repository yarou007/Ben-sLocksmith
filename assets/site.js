(function () {
  'use strict';

  var config = window.DCELD_CONFIG || {};
  var attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
  var eventSequence = 0;

  function uniqueId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return prefix + '_' + window.crypto.randomUUID();
    }
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  function safeStorage(type) {
    try {
      return window[type];
    } catch (error) {
      return null;
    }
  }

  function value(valueToClean) {
    return String(valueToClean || '').trim();
  }

  function boundedText(valueToClean, maximumLength) {
    return value(valueToClean).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maximumLength);
  }

  function attributionValue(key, valueToClean) {
    return boundedText(valueToClean, /^(?:gclid|gbraid|wbraid)$/.test(key) ? 512 : 200);
  }

  function currentDevice() {
    if (window.matchMedia && window.matchMedia('(max-width: 760px)').matches) return 'mobile';
    if (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) return 'tablet';
    return 'desktop';
  }

  function readAttribution() {
    var storage = safeStorage('sessionStorage');
    var params = new URLSearchParams(window.location.search);
    var stored = {};

    attributionKeys.forEach(function (key) {
      var incoming = attributionValue(key, params.get(key));
      if (incoming && storage) storage.setItem('dceld_' + key, incoming);
      stored[key] = incoming || (storage ? attributionValue(key, storage.getItem('dceld_' + key)) : '');
    });

    if (storage && !storage.getItem('dceld_landing_page')) {
      storage.setItem('dceld_landing_page', boundedText(window.location.pathname, 500));
    }
    if (storage && !storage.getItem('dceld_referrer')) {
      storage.setItem('dceld_referrer', boundedText(document.referrer || 'direct', 1000));
    }

    stored.landing_page = storage ? boundedText(storage.getItem('dceld_landing_page'), 500) : boundedText(window.location.pathname, 500);
    stored.referrer = storage ? boundedText(storage.getItem('dceld_referrer'), 1000) : boundedText(document.referrer || 'direct', 1000);
    return stored;
  }

  var attribution = readAttribution();

  function basePayload(extra) {
    return Object.assign(
      {
        page_path: window.location.pathname,
        page_title: document.title,
        service: value(document.body.dataset.service) || 'general_commercial_service',
        location: value(document.body.dataset.location) || 'Washington DC service area',
        device_context: currentDevice(),
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_term: attribution.utm_term,
        utm_content: attribution.utm_content,
        gclid_present: Boolean(attribution.gclid),
        gbraid_present: Boolean(attribution.gbraid),
        wbraid_present: Boolean(attribution.wbraid)
      },
      extra || {}
    );
  }

  function track(eventName, parameters) {
    if (!eventName) return;
    eventSequence += 1;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      Object.assign(
        {
          event: eventName,
          event_sequence: eventSequence,
          event_id: uniqueId('event')
        },
        basePayload(parameters)
      )
    );
  }

  window.DCELDAnalytics = {
    track: track,
    attribution: attribution,
    basePayload: basePayload
  };

  function loadGtmIfConfigured() {
    var gtmId = value(config.analytics && config.analytics.gtmContainerId);
    if (!/^GTM-[A-Z0-9]+$/i.test(gtmId)) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    document.head.appendChild(script);
  }

  function loadAhrefsIfConfigured() {
    var analyticsKey = value(config.analytics && config.analytics.ahrefsAnalyticsKey);
    if (!analyticsKey) return;
    var load = function () {
      if (document.querySelector('script[src="https://analytics.ahrefs.com/analytics.js"]')) return;
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://analytics.ahrefs.com/analytics.js';
      script.dataset.key = analyticsKey;
      document.head.appendChild(script);
    };
    window.addEventListener('load', function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(load, { timeout: 2500 });
      } else {
        window.setTimeout(load, 1);
      }
    }, { once: true });
  }

  function inferCtaLocation(element) {
    var explicit = value(element.dataset.ctaLocation);
    if (explicit) return explicit;
    if (element.closest('.sticky-mobile-call')) return 'sticky';
    if (element.closest('.hero')) return 'hero';
    if (element.closest('.site-footer')) return 'footer';
    if (element.closest('form, .form-panel, .hero-form')) return 'form';
    if (element.closest('.card, .problem-card')) return 'service_card';
    return 'body';
  }

  function applyConfiguredPhone() {
    var phone = config.phone || {};
    var e164 = value(phone.e164);
    var display = value(phone.display);
    if (!e164 || !display) return;

    document.querySelectorAll('[data-business-phone]').forEach(function (node) {
      node.textContent = display;
    });
    document.querySelectorAll('a[data-business-phone-link]').forEach(function (anchor) {
      anchor.href = 'tel:' + e164;
      anchor.dataset.phoneSource = 'configured_business_number';
    });

    var dynamic = value(config.analytics && config.analytics.dynamicNumber);
    if (!dynamic) return;
    var dynamicDial = dynamic.replace(/[^+\d]/g, '');
    if (!/^\+?[1-9]\d{7,14}$/.test(dynamicDial)) return;
    document.querySelectorAll('[data-dynamic-number-eligible]').forEach(function (anchor) {
      anchor.href = 'tel:' + dynamicDial;
      anchor.dataset.phoneSource = 'dynamic_number';
      var label = anchor.querySelector('[data-business-phone]');
      if (label) label.textContent = dynamic;
      var accessibleLabel = anchor.getAttribute('aria-label');
      if (accessibleLabel && accessibleLabel.includes(display)) {
        anchor.setAttribute('aria-label', accessibleLabel.replace(display, dynamic));
      }
    });
  }

  function configureNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!button || !menu) return;

    function setOpen(open) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.dataset.open = open ? 'true' : 'false';
      button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    }

    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (event) {
      if (button.getAttribute('aria-expanded') !== 'true') return;
      if (event.target.closest('[data-nav-toggle], [data-nav-menu]')) return;
      setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        button.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && button.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  }

  function configureLegacyNavigation() {
    var button = document.querySelector('.ham, .hamburger, .menu-toggle');
    var menu = document.querySelector('.mob-nav');
    if (!button || !menu) return;

    function sync() {
      var open = menu.classList.contains('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    sync();
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.ham, .hamburger, .menu-toggle, .mob-close, .mob-nav a')) return;
      window.setTimeout(sync, 0);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !menu.classList.contains('open')) return;
      menu.classList.remove('open');
      sync();
      button.focus();
    });
  }

  function configureLegacyFaqs() {
    var questions = document.querySelectorAll('.faq-q');
    questions.forEach(function (question, index) {
      var answer = question.nextElementSibling;
      if (!answer || !answer.classList.contains('faq-a')) return;
      var questionId = question.id || 'legacy-faq-question-' + (index + 1);
      var answerId = answer.id || 'legacy-faq-answer-' + (index + 1);
      question.id = questionId;
      answer.id = answerId;
      question.setAttribute('role', 'button');
      question.setAttribute('tabindex', '0');
      question.setAttribute('aria-controls', answerId);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', questionId);

      function syncAll() {
        questions.forEach(function (item) {
          var itemAnswer = item.nextElementSibling;
          if (!itemAnswer || !itemAnswer.classList.contains('faq-a')) return;
          var expanded = window.getComputedStyle(itemAnswer).display !== 'none';
          item.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
      }

      question.addEventListener('click', function () {
        window.setTimeout(syncAll, 0);
      });
      question.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        question.click();
      });
      syncAll();
    });
  }

  function enablePaidSearchLayout() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('layout') !== 'paid' && params.get('lp') !== 'paid') return;
    document.body.classList.add('paid-search-mode');
    document.body.dataset.layout = 'paid_search';
    var robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', 'noindex,follow,max-image-preview:large');
  }

  function phoneEventName(location) {
    if (location === 'sticky') return 'sticky_phone_click';
    if (location === 'hero') return 'hero_phone_click';
    if (location === 'footer') return 'footer_phone_click';
    return '';
  }

  function googleAdsCallIntegration(anchor) {
    var analytics = config.analytics || {};
    var conversionId = value(analytics.googleAdsConversionId);
    var callLabel = value(analytics.googleAdsCallLabel);
    var integrationMode = value(analytics.googleAdsCallIntegrationMode);
    if (integrationMode === 'direct_gtag' && conversionId && callLabel && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: conversionId + '/' + callLabel,
        value: 1,
        currency: 'USD'
      });
    }
    if (typeof window.DCELDOnPhoneClick === 'function') {
      window.DCELDOnPhoneClick(anchor, basePayload({ cta_location: inferCtaLocation(anchor) }));
    }
  }

  function configureClickTracking() {
    document.addEventListener('click', function (event) {
      var target = event.target.closest('a,button');
      if (!target) return;

      if (target.matches('a[href^="tel:"]')) {
        var location = inferCtaLocation(target);
        var payload = {
          cta_location: location,
          link_text: value(target.textContent),
          phone_source: value(target.dataset.phoneSource) || 'configured_business_number'
        };
        track('phone_click', payload);
        var placementEvent = phoneEventName(location);
        if (placementEvent) track(placementEvent, payload);
        googleAdsCallIntegration(target);
        return;
      }

      if (target.matches('[data-photo-cta]')) {
        track('photo_cta_click', {
          cta_location: inferCtaLocation(target),
          destination: target.getAttribute('href') || ''
        });
      }

      if (target.matches('[data-service-card]')) {
        track('service_card_click', {
          cta_location: inferCtaLocation(target),
          selected_service: value(target.dataset.serviceCard),
          destination: target.getAttribute('href') || ''
        });
      }
    });
  }

  function setHidden(form, name, hiddenValue) {
    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) return;
    input.value = hiddenValue || '';
  }

  function populateFormAttribution(form) {
    setHidden(form, 'landing_page', attribution.landing_page || window.location.pathname);
    setHidden(form, 'referrer', attribution.referrer);
    attributionKeys.forEach(function (key) {
      setHidden(form, key, attribution[key]);
    });
    setHidden(form, 'page_path', window.location.pathname);
    setHidden(form, 'page_title', document.title);
  }

  function showFormStatus(form, status, message) {
    var region = form.querySelector('[data-form-status]');
    if (!region) return;
    region.dataset.status = status;
    region.textContent = message;
  }

  function configureForms() {
    document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
      populateFormAttribution(form);
      var formType = value(form.dataset.formType) || 'service_request';
      var started = false;
      var invalidTracked = false;

      form.addEventListener('focusin', function (event) {
        if (started || !event.target.matches('input,select,textarea')) return;
        started = true;
        track('form_start', {
          form_type: formType,
          form_id: form.id,
          cta_location: value(form.dataset.ctaLocation) || 'body'
        });
      });

      form.addEventListener(
        'invalid',
        function () {
          if (invalidTracked) return;
          invalidTracked = true;
          track('form_submit_error', {
            form_type: formType,
            form_id: form.id,
            error_type: 'client_validation'
          });
          showFormStatus(form, 'error', 'Please complete the required fields highlighted above.');
        },
        true
      );

      form.addEventListener('input', function () {
        invalidTracked = false;
        showFormStatus(form, '', '');
      });

      form.addEventListener('submit', function (event) {
        if (form.dataset.submitting === 'true') {
          event.preventDefault();
          return;
        }
        var honeypot = form.querySelector('input[name="_honey"]');
        if (honeypot && value(honeypot.value)) {
          event.preventDefault();
          showFormStatus(form, 'error', 'The request could not be sent. Please call or reload the page and try again.');
          return;
        }

        var totalFileBytes = 0;
        form.querySelectorAll('input[type="file"]').forEach(function (input) {
          Array.from(input.files || []).forEach(function (file) {
            totalFileBytes += Number(file.size) || 0;
          });
        });
        if (totalFileBytes > 10 * 1024 * 1024) {
          event.preventDefault();
          track('form_submit_error', {
            form_type: formType,
            form_id: form.id,
            error_type: 'file_size'
          });
          showFormStatus(form, 'error', 'Attached photos exceed 10 MB total. Choose smaller files or call for commercial service.');
          return;
        }

        populateFormAttribution(form);
        form.dataset.submitting = 'true';
        form.querySelectorAll('button[type="submit"],input[type="submit"]').forEach(function (button) {
          button.disabled = true;
          button.setAttribute('aria-disabled', 'true');
        });
        var leadId = uniqueId('lead');
        setHidden(form, 'lead_id', leadId);
        var serviceRequested = value((form.querySelector('[name="problem_type"], [name="service_requested"]') || {}).value);
        var ctaLocation = value(form.dataset.ctaLocation) || 'body';
        var storage = safeStorage('sessionStorage');
        if (storage) {
          storage.setItem(
            'dceld_pending_form',
            JSON.stringify({
              form_id: form.id,
              form_type: formType,
              lead_id: leadId,
              service_requested: serviceRequested,
              cta_location: ctaLocation,
              submitted_at: Date.now()
            })
          );
        }
        track('form_submit_attempt', {
          form_type: formType,
          form_id: form.id,
          lead_id: leadId,
          cta_location: ctaLocation,
          service_requested: serviceRequested
        });
        showFormStatus(form, '', 'Sending your commercial service request…');
      });
    });
  }

  function announceSubmissionResult() {
    var params = new URLSearchParams(window.location.search);
    var success = params.get('submitted') === '1';
    var failure = params.get('form_error') === '1';
    if (!success && !failure) return;

    var storage = safeStorage('sessionStorage');
    var pending = {};
    try {
      pending = JSON.parse(storage ? storage.getItem('dceld_pending_form') || '{}' : '{}');
    } catch (error) {
      pending = {};
    }
    var pendingIsRecent = Boolean(
      pending.lead_id
      && Number(pending.submitted_at)
      && Date.now() - Number(pending.submitted_at) >= 0
      && Date.now() - Number(pending.submitted_at) < 60 * 60 * 1000
    );

    if (success && !pendingIsRecent) {
      params.delete('submitted');
      params.delete('form');
      var cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      return;
    }

    var banner = document.createElement('div');
    banner.className = 'wrap form-status';
    banner.setAttribute('role', success ? 'status' : 'alert');
    banner.setAttribute('aria-live', success ? 'polite' : 'assertive');
    banner.dataset.status = success ? 'success' : 'error';
    banner.textContent = success
      ? 'Your commercial service request was sent. For an urgent security or egress problem, call the number shown on this page.'
      : 'The request could not be confirmed. Please call or try the form again.';
    var main = document.querySelector('main');
    if (main) main.insertAdjacentElement('afterbegin', banner);

    var resultPayload = {
      form_type: pending.form_type || value(params.get('form')) || 'service_request',
      form_id: pending.form_id || 'unknown',
      lead_id: pending.lead_id || '',
      cta_location: pending.cta_location || 'body',
      service_requested: pending.service_requested || '',
      error_type: failure ? 'submission_confirmation_error' : ''
    };
    if (pendingIsRecent) {
      track(success ? 'form_submit_success' : 'form_submit_error', resultPayload);
      if (success) track('commercial_lead_submit', resultPayload);
    }

    if (storage) storage.removeItem('dceld_pending_form');
    params.delete('submitted');
    params.delete('form_error');
    params.delete('form');
    var nextUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState({}, '', nextUrl);
  }

  function observeQualificationNotices() {
    var notices = document.querySelectorAll('[data-qualification-notice]');
    if (!notices.length) return;

    function mark(node) {
      if (node.dataset.tracked === 'true') return;
      node.dataset.tracked = 'true';
      track('qualification_notice_view', {
        cta_location: value(node.dataset.ctaLocation) || 'body'
      });
    }

    if (!('IntersectionObserver' in window)) {
      notices.forEach(mark);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          mark(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    notices.forEach(function (notice) {
      observer.observe(notice);
    });
  }

  function setCopyrightYear() {
    document.querySelectorAll('[data-current-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  loadGtmIfConfigured();
  loadAhrefsIfConfigured();

  document.addEventListener('DOMContentLoaded', function () {
    enablePaidSearchLayout();
    applyConfiguredPhone();
    configureNavigation();
    configureLegacyNavigation();
    configureLegacyFaqs();
    configureClickTracking();
    configureForms();
    announceSubmissionResult();
    observeQualificationNotices();
    setCopyrightYear();
  });
})();
