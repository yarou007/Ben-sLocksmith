(function () {
  var BUSINESS_PHONE = '7032440559';
  var PHONE_LABEL = '703-244-0559';

  function safeText(value) {
    return (value || '').toString().trim();
  }

  function slugFromPath(pathname) {
    if (!pathname || pathname === '/') return 'home';
    return pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  }

  function applyTrackingAttributes() {
    var anchors = document.querySelectorAll('a');
    anchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href') || '';
      var text = safeText(anchor.textContent).toLowerCase();

      if (href.indexOf('tel:') === 0) {
        anchor.classList.add('track-phone-click');
        anchor.setAttribute('data-track', 'phone_click');
      }

      if (text.indexOf('request inspection') !== -1) {
        anchor.classList.add('track-request-inspection');
        anchor.setAttribute('data-track', 'request_inspection_click');
      }

      if (text.indexOf('get quote') !== -1 || text.indexOf('free quote') !== -1) {
        anchor.classList.add('track-get-quote');
        anchor.setAttribute('data-track', 'get_quote_click');
      }

      if (text.indexOf('emergency') !== -1) {
        anchor.classList.add('track-emergency-service');
        if (!anchor.hasAttribute('data-track')) {
          anchor.setAttribute('data-track', 'emergency_service_click');
        }
      }

      if (href === '#' && text === 'privacy') {
        anchor.setAttribute('href', '/privacy-policy');
      }

      if (href === '#' && text === 'terms') {
        anchor.setAttribute('href', '/terms-of-service');
      }
    });
  }

  function enhanceImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (img, index) {
      if (!img.hasAttribute('loading') && index > 0) {
        img.setAttribute('loading', 'lazy');
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

  function addStickyMobileCall() {
    if (document.querySelector('.sticky-call') || document.querySelector('.sticky-mobile-call')) {
      return;
    }

    var sticky = document.createElement('a');
    sticky.href = 'tel:' + BUSINESS_PHONE;
    sticky.className = 'sticky-mobile-call track-phone-click track-emergency-service';
    sticky.setAttribute('data-track', 'emergency_service_click');
    sticky.setAttribute('aria-label', 'Call now ' + PHONE_LABEL);
    sticky.textContent = 'Emergency Service: ' + PHONE_LABEL;
    document.body.appendChild(sticky);
  }

  function ensureStickyStyles() {
    if (document.getElementById('lead-pages-sticky-style')) return;
    var style = document.createElement('style');
    style.id = 'lead-pages-sticky-style';
    style.textContent =
      '.sticky-mobile-call{position:fixed;left:10px;right:10px;bottom:10px;z-index:999;display:none;align-items:center;justify-content:center;gap:8px;text-decoration:none;background:#dc2626;color:#fff;font-weight:800;font-size:14px;border-radius:999px;padding:12px 18px;box-shadow:0 4px 18px rgba(15,30,46,.25)}' +
      '@media (max-width:900px){.sticky-mobile-call{display:inline-flex}body{padding-bottom:64px}}';
    document.head.appendChild(style);
  }

  function attachLeadFormHandlers() {
    var forms = document.querySelectorAll('.quote-form');

    forms.forEach(function (form) {
      var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        submitButton.classList.add('track-quote-submit');
        submitButton.setAttribute('data-track', 'quote_submit');
      }

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
        var summary = 'Quote request from ' + pageTag + '\n' + summaryParts.join('\n');

        var hiddenSummary = form.querySelector('input[name="lead_summary"]');
        if (!hiddenSummary) {
          hiddenSummary = document.createElement('input');
          hiddenSummary.type = 'hidden';
          hiddenSummary.name = 'lead_summary';
          form.appendChild(hiddenSummary);
        }
        hiddenSummary.value = summary;

        if (!form.querySelector('input[name="_subject"]')) {
          var subject = document.createElement('input');
          subject.type = 'hidden';
          subject.name = '_subject';
          subject.value = 'New inspection request from ' + pageTag;
          form.appendChild(subject);
        }

        if (!form.querySelector('input[name="_captcha"]')) {
          var captcha = document.createElement('input');
          captcha.type = 'hidden';
          captcha.name = '_captcha';
          captcha.value = 'false';
          form.appendChild(captcha);
        }

        if (!form.querySelector('input[name="_next"]')) {
          var next = document.createElement('input');
          next.type = 'hidden';
          next.name = '_next';
          next.value = window.location.origin + window.location.pathname + '?submitted=1';
          form.appendChild(next);
        }
      });
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
    box.textContent = 'Thanks, your request was submitted. For immediate service call ' + PHONE_LABEL + '.';

    var host = document.querySelector('.lead-wrap') || document.body;
    host.insertAdjacentElement('afterbegin', box);

    params.delete('submitted');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', clean);
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureStickyStyles();
    applyTrackingAttributes();
    enhanceImages();
    addStickyMobileCall();
    attachLeadFormHandlers();
    announceSubmissionIfNeeded();
  });
})();
