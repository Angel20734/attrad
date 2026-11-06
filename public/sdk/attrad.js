/**
 * Attrad Attribution SDK v1.0.0
 * Lightweight First-Touch Attribution & WhatsApp Lead Capture
 * Size: < 3.2 KB gzipped | Zero dependencies
 */
(function (window, document) {
  'use strict';

  var STORAGE_KEY = '_attrad_first_touch';
  var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  function getQueryParam(name) {
    var regex = new RegExp('[?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : null;
  }

  function generateRefCode() {
    var randomNum = Math.floor(100 + Math.random() * 900);
    return '#REF-' + randomNum;
  }

  function getOrInitAttribution() {
    var now = Date.now();
    var stored = null;

    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {}

    // First-touch estricto: Si ya existe una atribución dentro de los últimos 30 días, se respeta intacta
    if (stored && stored.timestamp && now - stored.timestamp < THIRTY_DAYS_MS && stored.ad_id) {
      return stored;
    }

    var adId = getQueryParam('ad_id') || getQueryParam('fbclid') || getQueryParam('gclid') || getQueryParam('ttclid') || 'organic_direct';
    var utmSource = getQueryParam('utm_source') || (document.referrer.indexOf('instagram') > -1 ? 'instagram' : (document.referrer.indexOf('facebook') > -1 ? 'facebook' : (document.referrer.indexOf('google') > -1 ? 'google' : 'meta')));
    var utmMedium = getQueryParam('utm_medium') || 'paid_social';
    var utmCampaign = getQueryParam('utm_campaign') || 'campana_general';
    var utmContent = getQueryParam('utm_content') || null;

    var newAttribution = {
      ad_id: adId,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      ref_code: generateRefCode(),
      landing_url: window.location.href,
      referrer: document.referrer || 'direct',
      timestamp: now,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAttribution));
    } catch (e) {}

    return newAttribution;
  }

  function dispatchCaptureEvent(apiKey, endpoint, extraData) {
    var attr = getOrInitAttribution();
    var payload = {
      api_key: apiKey,
      ad_id: attr.ad_id,
      ref_code: attr.ref_code,
      utm_source: attr.utm_source,
      utm_medium: attr.utm_medium,
      utm_campaign: attr.utm_campaign,
      utm_content: attr.utm_content,
      landing_url: window.location.href,
      referrer: document.referrer,
      customer_phone: extraData && extraData.phone ? extraData.phone : null,
      customer_name: extraData && extraData.name ? extraData.name : null,
      timestamp: new Date().toISOString()
    };

    // Disparar evento en el DOM para entornos de prueba locales (SPA / Vite)
    try {
      var customEvent = new CustomEvent('attrad:capture', { detail: payload });
      window.dispatchEvent(customEvent);
    } catch (e) {}

    // Envío asíncrono no bloqueante vía sendBeacon
    var jsonString = JSON.stringify(payload);
    var sent = false;

    if (navigator.sendBeacon) {
      var blob = new Blob([jsonString], { type: 'application/json' });
      sent = navigator.sendBeacon(endpoint, blob);
    }

    if (!sent) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(jsonString);
      } catch (err) {}
    }
  }

  function attachWhatsAppListeners(apiKey, endpoint) {
    document.addEventListener('click', function (event) {
      var target = event.target.closest('a');
      if (!target) return;

      var href = target.getAttribute('href') || '';
      var isWhatsApp = href.indexOf('wa.me') > -1 || href.indexOf('whatsapp.com') > -1;

      if (!isWhatsApp) return;

      var attr = getOrInitAttribution();
      var refTag = ' [' + attr.ref_code + ']';

      // Inyectar el código de referencia en el texto del chat de WhatsApp si no está presente
      try {
        var url = new URL(href, window.location.origin);
        var currentText = url.searchParams.get('text') || '';
        if (currentText.indexOf(attr.ref_code) === -1) {
          url.searchParams.set('text', currentText ? currentText + refTag : 'Hola, me gustaría más información' + refTag);
          target.setAttribute('href', url.toString());
        }
      } catch (e) {
        if (href.indexOf('text=') > -1) {
          if (href.indexOf(encodeURIComponent(attr.ref_code)) === -1) {
            target.setAttribute('href', href + encodeURIComponent(refTag));
          }
        } else {
          var sep = href.indexOf('?') > -1 ? '&' : '?';
          target.setAttribute('href', href + sep + 'text=' + encodeURIComponent('Hola' + refTag));
        }
      }

      // Enviar captura de evento sin retrasar la navegación
      dispatchCaptureEvent(apiKey, endpoint, {
        phone: target.getAttribute('data-phone') || null
      });
    }, true);
  }

  // API Global
  window.Attrad = {
    version: '1.0.0',
    init: function (apiKey, options) {
      if (!apiKey) {
        console.warn('[Attrad] Se requiere un API Key para inicializar.');
        return;
      }
      var opts = options || {};
      var endpoint = opts.endpoint || 'https://api.attrad.com/functions/v1/capture-lead';
      getOrInitAttribution();
      attachWhatsAppListeners(apiKey, endpoint);
    },
    track: function (apiKey, extraData, options) {
      var opts = options || {};
      var endpoint = opts.endpoint || 'https://api.attrad.com/functions/v1/capture-lead';
      dispatchCaptureEvent(apiKey, endpoint, extraData);
    },
    getAttribution: function () {
      return getOrInitAttribution();
    }
  };

  // Auto-inicialización con data-api-key en etiqueta <script>
  var scriptTag = document.currentScript;
  if (scriptTag) {
    var key = scriptTag.getAttribute('data-api-key');
    var customEndpoint = scriptTag.getAttribute('data-endpoint');
    if (key) {
      window.Attrad.init(key, { endpoint: customEndpoint || undefined });
    }
  }
})(window, document);
