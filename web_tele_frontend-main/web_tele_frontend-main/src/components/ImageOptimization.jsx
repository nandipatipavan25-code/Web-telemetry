import { Image, AlertTriangle, CheckCircle2, Info, Zap, ExternalLink } from 'lucide-react';

/**
 * Derives image optimization info from an image src URL.
 * Format, potential size warnings, and recommendations are inferred
 * from filename/extension since we cannot fetch actual file sizes
 * from the frontend without a proxy.
 */
const analyzeImageSrc = (src = '') => {
  const lower = src.toLowerCase().split('?')[0];
  const ext = lower.split('.').pop() || '';

  const FORMAT_MAP = {
    jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', gif: 'GIF',
    webp: 'WebP', svg: 'SVG', avif: 'AVIF', bmp: 'BMP',
    tiff: 'TIFF', ico: 'ICO',
  };
  const format = FORMAT_MAP[ext] || ext.toUpperCase() || 'Unknown';

  const isModernFormat = ['webp', 'avif', 'svg'].includes(ext);
  const isLossless     = ['png', 'bmp', 'tiff', 'gif'].includes(ext);
  const isLegacy       = ['jpeg', 'jpg', 'png', 'bmp', 'gif'].includes(ext);

  const warnings = [];
  const recs     = [];

  if (isLegacy && !isModernFormat) {
    warnings.push('Not using modern format');
    recs.push('Convert to WebP or AVIF for 25–35% smaller file size with same quality.');
  }
  if (isLossless && ext !== 'svg') {
    warnings.push('Lossless format — may be uncompressed');
    recs.push('Use lossy compression or WebP to reduce file size.');
  }
  if (ext === 'gif') {
    warnings.push('GIF format — prefer video or WebP for animations');
    recs.push('Replace animated GIFs with WebP animations or short MP4 videos.');
  }
  if (!src.includes('loading=') && !lower.includes('lazy')) {
    recs.push('Add loading="lazy" attribute to defer off-screen image loading.');
  }

  const needsOptimization = warnings.length > 0;

  return { format, warnings, recs, needsOptimization, isModernFormat };
};

export default function ImageOptimization({ seoData, crawlData }) {
  const imageAnalysis = seoData?.imageAnalysis || {};
  const siteWideImages = crawlData?.siteWideImages || null;

  const totalImages   = siteWideImages ? siteWideImages.totalImages   : (imageAnalysis.totalImages || 0);
  const withAlt       = siteWideImages ? siteWideImages.withAlt        : (imageAnalysis.withAlt || 0);
  const missingAlt    = siteWideImages ? siteWideImages.missingAlt     : ((imageAnalysis.missingAlt || 0) + (imageAnalysis.emptyAlt || 0));
  const pagesScanned  = siteWideImages ? siteWideImages.pagesScanned   : 1;

  // Build image list from whatever source is available
  const rawImages = siteWideImages
    ? (siteWideImages.missingAltImages || []).map(i => ({ src: i.src, altStatus: i.altStatus, foundOnPage: i.foundOnPage }))
    : (imageAnalysis.missingAltSrcs || []).map(i => ({ src: typeof i === 'string' ? i : i.src, altStatus: 'missing', foundOnPage: null }));

  // Analyse each image
  const analysed = rawImages.map(img => ({
    ...img,
    ...analyzeImageSrc(img.src || ''),
  }));

  const needsOptimization = analysed.filter(i => i.needsOptimization).length;
  const modernFormatCount = analysed.filter(i => i.isModernFormat).length;
  const legacyCount       = analysed.filter(i => !i.isModernFormat && i.format !== 'Unknown').length;

  if (!seoData && !crawlData) {
    return (
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-8 text-center animate-fade-in-up shadow-3d-sm">
        <Image className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-3 animate-bounce" />
        <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9]">No Image Data</h4>
        <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Run a scan to generate image optimization recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Overview KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">Total Images</p>
          <p className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9]">{totalImages}</p>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1">{pagesScanned} page{pagesScanned > 1 ? 's' : ''} scanned</p>
        </div>
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">ALT Tags Present</p>
          <p className="text-3xl font-medium text-emerald-700 dark:text-emerald-400">{withAlt}</p>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1">{missingAlt} missing</p>
        </div>
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">Need Optimization</p>
          <p className={`text-3xl font-medium ${needsOptimization > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{needsOptimization}</p>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1">of {analysed.length} analysed</p>
        </div>
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">Modern Format</p>
          <p className={`text-3xl font-medium ${modernFormatCount > legacyCount ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{modernFormatCount}</p>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1">{legacyCount} using legacy formats</p>
        </div>
      </div>

      {/* ── General Recommendations ──────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
        <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
          <Zap className="text-amber-600 dark:text-amber-400 h-5 w-5" /> Optimization Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: '🔄', title: 'Convert to WebP / AVIF',       desc: 'Modern formats are 25–35% smaller than JPEG/PNG with equal visual quality. Use tools like Squoosh or cwebp.' },
            { icon: '📐', title: 'Add Width & Height Attributes',  desc: 'Specify width and height on every <img> to prevent Cumulative Layout Shift (CLS) — a Core Web Vital.' },
            { icon: '⏳', title: 'Enable Lazy Loading',            desc: 'Add loading="lazy" to all below-fold images. This defers their download and improves initial page load.' },
            { icon: '🗜',  title: 'Compress Before Upload',        desc: 'Run images through TinyPNG, Squoosh, or ImageOptim before uploading. Aim for < 200KB per image.' },
            { icon: '📱', title: 'Use Responsive Images',          desc: 'Use srcset and sizes to serve appropriately sized images for each device resolution.' },
            { icon: '🏷',  title: 'Add Descriptive ALT Text',      desc: `${missingAlt} image${missingAlt !== 1 ? 's' : ''} missing ALT attributes. ALT text improves accessibility and image SEO.` },
          ].map((r, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl">
              <span className="text-lg shrink-0 mt-0.5">{r.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9]">{r.title}</p>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-Image Analysis Table ─────────────────────────────────────── */}
      {analysed.length > 0 && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
            <Image className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Image Analysis
            <span className="ml-auto text-xs text-slate-600 dark:text-[#A8B5C7] font-medium">{analysed.length} images</span>
          </h3>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0">
                <tr className="border-b border-slate-200 dark:border-[#2B3B53] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider text-[11px] bg-slate-50 dark:bg-[#111B2E]">
                  <th className="py-2.5 px-3">Image URL</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">ALT Status</th>
                  <th className="py-2.5 px-3">Issues</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analysed.map((img, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <a href={img.src} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline truncate flex items-center gap-1 transition-colors"
                        title={img.src}>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{img.src?.split('/').pop()?.substring(0, 30) || img.src?.substring(0, 30)}</span>
                      </a>
                      {img.foundOnPage && (
                        <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono truncate mt-0.5">
                          📄 {img.foundOnPage.replace(/^https?:\/\/[^/]+/, '') || '/'}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${img.isModernFormat ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                        {img.format || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-medium ${img.altStatus === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : img.altStatus === 'empty' ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {img.altStatus === 'ok' ? '✓ Present' : img.altStatus === 'empty' ? '⚠ Empty' : '✗ Missing'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {img.warnings.slice(0, 2).map((w, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded text-[11px] font-medium">
                            ⚠ {w.split(' ').slice(0, 3).join(' ')}
                          </span>
                        ))}
                        {img.warnings.length === 0 && <span className="text-[11px] text-emerald-700 dark:text-emerald-400">✓ OK</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        {img.recs.slice(0, 1).map((r, i) => (
                          <p key={i} className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-tight">{r.split('.')[0]}.</p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All clean */}
      {analysed.length === 0 && totalImages === 0 && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-[#A8B5C7]">No images detected on this page. Run a full site crawl from the Site Analysis tab for site-wide image data.</p>
        </div>
      )}
      {analysed.length === 0 && totalImages > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50/70 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 rounded-xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">All {totalImages} images have ALT text — no images needing immediate optimization were identified.</p>
        </div>
      )}

    </div>
  );
}
