(function () {
  'use strict';

  function init() {
    var config = window.DCELD_CONFIG || {};
    var analytics = window.DCELDAnalytics;
    var number = String((config.photoContact || {}).whatsappNumber || (config.phone || {}).e164 || '').replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(number)) return;

    document.querySelectorAll('[data-quote-form]').forEach(function (form) {
      var fields = form.querySelector('[data-quote-fields]');
      var submit = form.querySelector('[data-quote-submit]');
      var status = form.querySelector('[data-quote-status]');
      var ready = form.querySelector('[data-quote-ready]');
      var chat = form.querySelector('[data-quote-whatsapp-link]');
      var photo = form.elements.attachment;
      var preview = form.querySelector('[data-quote-photo-preview]');
      var image = form.querySelector('[data-quote-photo-image]');
      var filename = form.querySelector('[data-quote-photo-name]');
      var share = form.querySelector('[data-quote-share]');
      var emergency = form.querySelector('[data-quote-emergency]');
      var selectedPhoto = null;
      var previewUrl = '';
      var started = false;
      var requestId = '';

      function field(name, limit) {
        var control = form.elements[name];
        return String(control ? control.value : '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, limit || 200);
      }
      function track(name, extra) {
        if (!analytics) return;
        analytics.track(name, Object.assign({ form_type: 'whatsapp_quote', form_id: form.id, cta_location: 'form' }, extra || {}));
      }
      function announce(message, error) {
        status.textContent = message;
        status.dataset.status = error ? 'error' : '';
      }
      function canSharePhoto() {
        try {
          return Boolean(selectedPhoto && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [selectedPhoto] }));
        } catch (error) { return false; }
      }
      function clearPhoto() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = '';
        selectedPhoto = null;
        photo.value = '';
        image.removeAttribute('src');
        image.hidden = true;
        preview.hidden = true;
        filename.textContent = '';
        share.hidden = true;
      }
      function valid() {
        form.elements.contact_name.setCustomValidity(field('contact_name') ? '' : 'Enter your name.');
        form.elements.service_location.setCustomValidity(field('service_location') ? '' : 'Enter the business address or ZIP.');
        var digits = field('phone', 30).replace(/\D/g, '');
        form.elements.phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Enter a phone number with 10 to 15 digits.');
        return form.reportValidity();
      }
      function message() {
        var lines = [
          'Hi DC Emergency Lock & Door. I would like a free estimate for commercial service.',
          'Name: ' + field('contact_name', 80),
          'Phone: ' + field('phone', 30),
          'Business type: ' + field('business_type', 80),
          'Business address / ZIP: ' + field('service_location', 180),
          'Problem: ' + field('problem_type', 200),
          'Urgency: ' + field('urgency', 40)
        ];
        [['company_name', 'Business / property', 120], ['work_order', 'Work order', 80], ['opening_count', 'Door count', 4], ['message', 'Details', 500]].forEach(function (item) {
          var text = field(item[0], item[2]);
          if (text) lines.push(item[1] + ': ' + text);
        });
        lines.push(selectedPhoto ? 'I have a door photo to attach in this conversation.' : 'I can send door and hardware photos in this conversation.');
        lines.push('Website page: ' + window.location.pathname);
        lines.push('Request reference: ' + requestId);
        return lines.join('\n');
      }
      function prepare() {
        if (!valid()) {
          announce('Please complete the highlighted request details.', true);
          track('quote_validation_error');
          return null;
        }
        if (!requestId) requestId = 'Q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
        form.elements.lead_id.value = requestId;
        var text = message();
        chat.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
        ready.hidden = false;
        announce('Your details are ready. Send the prepared message in WhatsApp to request service.');
        track('quote_request_ready', { lead_id: requestId, business_type: field('business_type', 80), urgency: field('urgency', 40), has_photo: Boolean(selectedPhoto) });
        return text;
      }

      // Attribution stays in the form. It is not appended to customer messages.
      var attribution = analytics ? analytics.attribution : {};
      Object.keys(attribution).forEach(function (name) {
        if (form.elements[name]) form.elements[name].value = attribution[name] || '';
      });
      form.elements.page_path.value = window.location.pathname;
      form.elements.page_title.value = document.title;

      form.addEventListener('focusin', function () {
        if (!started) { started = true; track('quote_form_start'); }
      });
      form.addEventListener('input', function (event) {
        if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
        if (!ready.hidden) {
          ready.hidden = true;
          announce('Details updated. Continue in WhatsApp to prepare the revised request.');
        }
      });
      form.elements.urgency.addEventListener('change', function () {
        emergency.hidden = field('urgency') !== 'Emergency now';
      });
      photo.addEventListener('change', function () {
        ready.hidden = true;
        var file = photo.files && photo.files[0];
        if (!file) { clearPhoto(); return; }
        var validType = /^(?:image\/(?:jpeg|png|webp|heic|heif))$/i.test(file.type) || (!file.type && /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name));
        if (!validType || file.size > 10 * 1024 * 1024) {
          clearPhoto();
          announce('Choose a JPG, PNG, WebP or HEIC photo up to 10 MB, or attach it directly in WhatsApp.', true);
          track('quote_photo_error', { error_type: validType ? 'file_size' : 'file_type' });
          return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        selectedPhoto = file;
        filename.textContent = file.name;
        preview.hidden = false;
        try {
          previewUrl = URL.createObjectURL(file);
          image.hidden = false;
          image.src = previewUrl;
        } catch (error) { image.hidden = true; }
        share.hidden = !canSharePhoto();
        announce(canSharePhoto() ? 'Photo selected. Use Share request and photo, then choose WhatsApp.' : 'Photo selected. Attach it inside WhatsApp after opening the prepared request.');
        track('quote_photo_selected', { size_bucket: file.size > 5 * 1024 * 1024 ? '5_to_10mb' : 'up_to_5mb' });
      });
      image.addEventListener('error', function () { image.hidden = true; });
      form.querySelector('[data-quote-photo-remove]').addEventListener('click', function () {
        clearPhoto();
        ready.hidden = true;
        announce('Photo removed. You can still send photos directly in WhatsApp.');
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!prepare()) return;
        ready.focus();
        // A real link preserves browser/app handoff. The visitor sends the
        // message in WhatsApp; preparation is never recorded as a delivered lead.
        chat.click();
      });
      share.addEventListener('click', function () {
        var text = prepare();
        if (!text || !canSharePhoto()) return;
        share.disabled = true;
        announce('Choose WhatsApp in the sharing menu and select the business conversation.');
        track('quote_photo_share_open');
        navigator.share({ files: [selectedPhoto], text: text, title: 'Commercial door service request' }).then(function () {
          announce('Return to the WhatsApp conversation to check your message and photos.');
          track('quote_photo_share_return');
        }).catch(function (error) {
          announce(error.name === 'AbortError' ? 'Sharing cancelled. You can still open the prepared WhatsApp request.' : 'Use the WhatsApp request button and attach the photo in the conversation.', error.name !== 'AbortError');
        }).finally(function () { share.disabled = false; });
      });

      fields.disabled = false;
      submit.disabled = false;
      form.setAttribute('aria-disabled', 'false');
      form.hidden = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
