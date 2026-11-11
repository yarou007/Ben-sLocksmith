export function googleAnalyticsTag(analytics = {}) {
  const measurementId = analytics.ga4MeasurementId;
  const adsId = analytics.googleAdsConversionId;
  const directAds = analytics.googleAdsCallIntegrationMode === 'direct_gtag' && /^AW-\d+$/.test(adsId || '');
  if (!measurementId && !directAds) return '';
  if (measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error('Invalid GA4 measurement ID.');
  }
  const tagId = measurementId || adsId;

  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${tagId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  ${measurementId ? `gtag('config', '${measurementId}');` : ''}
  ${directAds ? `gtag('config', '${adsId}');` : ''}
</script>`;
}
