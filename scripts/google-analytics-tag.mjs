export function googleAnalyticsTag(analytics = {}) {
  const measurementId = analytics.ga4MeasurementId;
  if (!measurementId) return '';
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error('Invalid GA4 measurement ID.');
  }

  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${measurementId}');
</script>`;
}
