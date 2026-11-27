import { useState, useEffect, useRef } from 'react';
import {
  FileText, Image, Link, Link2Off, Globe, Layers, CheckCircle2,
  AlertTriangle, AlertCircle, Info, Search, Cpu, Code, Package,
  BarChart2, ExternalLink, Hash, RefreshCw
} from 'lucide-react';

// Category colour mapping for tech stack badges
const CATEGORY_COLORS = {
  'Framework':     'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'UI Library':    'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  'CMS':           'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'E-Commerce':    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  'Builder':       'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
  'Backend':       'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  'Server':        'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-[#A8B5C7] border-slate-200 dark:border-slate-500/20',
  'CDN':           'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  'CSS Framework': 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'JS Library':    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'Animation':     'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
  '3D Library':    'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  'Data Viz':      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'Analytics':     'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
  'Support':       'bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-500/20',
  'Payments':      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
};

const categoryColor = (cat) => CATEGORY_COLORS[cat] || 'bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border-slate-200 dark:border-[#2B3B53]';

const CONFIDENCE_LABELS = {
  high:   { label: 'High (Sitemap)', color: 'text-emerald-700 dark:text-emerald-400' },
  medium: { label: 'Medium (Links)', color: 'text-amber-700 dark:text-amber-400' },
  low:    { label: 'Low (Estimate)', color: 'text-slate-600 dark:text-[#A8B5C7]' },
};

export default function SiteAnalysisDashboard({ pageAnalysisData, seoData, activeAlerts = [], crawlData = null, crawlLoading = false, altHighlight = false }) {
  const [techFilter, setTechFilter] = useState('');
  const [imgPageFilter, setImgPageFilter] = useState('all');
  const altSectionRef = useRef(null);

  // Auto-scroll + highlight when altHighlight prop is set
  useEffect(() => {
    if (altHighlight && altSectionRef.current) {
      altSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [altHighlight]);

  if (!pageAnalysisData && !seoData && !crawlData && !crawlLoading) {
    return (
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-10 text-center max-w-2xl mx-auto my-6 animate-fade-in-up">
        <BarChart2 className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-bounce" />
        <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-base">No Site Analysis Data Yet</h4>
        <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2 max-w-md mx-auto">
          Enter a URL above and click <strong className="text-blue-600 dark:text-blue-400">Run Scan</strong> to generate
          page count, image analysis, meta description, technology stack, and link reports.
        </p>
      </div>
    );
  }

  // ── Data extraction ──────────────────────────────────────────────────────
  // Guard: Ensure crawlData actually belongs to the current target domain (prevents cross-site state leaks)
  const currentHostname = (() => {
    try { return new URL(seoData?.url || pageAnalysisData?.url || '').hostname; } catch (e) { return ''; }
  })();
  const crawlHostname = (() => {
    try { return new URL(crawlData?.url || '').hostname; } catch (e) { return ''; }
  })();
  const isCrawlValidForSite = !crawlHostname || !currentHostname || crawlHostname === currentHostname;

  // crawlData (deep BFS crawl) takes priority over pageAnalysisData (quick homepage scan)
  const deepCrawl     = isCrawlValidForSite ? (crawlData?.siteWideImages || null) : null;
  const crawlMeta     = isCrawlValidForSite ? (crawlData?.crawlMeta || null) : null;
  const deepPageCount = isCrawlValidForSite ? (crawlData?.pageCount || null) : null;

  const {
    pageCount: quickPageCount = { estimatedPages: 0, sitemapCount: 0, internalLinkCount: 0, source: 'unknown', confidence: 'low' },
    techStack = [],
  } = pageAnalysisData || {};

  // Use deep crawl page count if available, else quick estimate
  const pageCount = deepPageCount || quickPageCount;

  const {
    metaDescription = { text: '', status: 'warning', message: '' },
    imageAnalysis = { totalImages: 0, withAlt: 0, missingAlt: 0, emptyAlt: 0, missingAltSrcs: [], status: 'ok', message: '' },
    links = { internalCount: 0, externalCount: 0, brokenCount: 0, brokenLinks: [] },
    permalinks = { tested: 0, failedCount: 0, brokenUrls: [], isRewriteFailure: false, status: 'ok' },
  } = seoData || {};

  // Priority: deep BFS crawl > quick site-wide > homepage-only seoData
  const imgSource    = deepCrawl;
  const usingSiteWide = imgSource && imgSource.pagesScanned > 0;

  const totalImages      = usingSiteWide ? imgSource.totalImages      : (imageAnalysis?.totalImages || 0);
  const withAltCount     = usingSiteWide ? imgSource.withAlt          : (imageAnalysis?.withAlt || 0);
  const missingAltCount  = usingSiteWide ? imgSource.missingAlt       : ((imageAnalysis?.missingAlt || 0) + (imageAnalysis?.emptyAlt || 0));
  const lazyLoadedCount  = usingSiteWide ? (imgSource.lazyLoaded || 0) : 0;
  const altCompliancePct = usingSiteWide ? imgSource.altCompliancePct  : (totalImages > 0 ? Math.round((withAltCount / totalImages) * 100) : 100);
  const pagesScanned     = usingSiteWide ? imgSource.pagesScanned      : 1;
  const perPage          = usingSiteWide ? (imgSource.perPage || [])   : [];
  const missingAltImages = usingSiteWide
    ? (imgSource.missingAltImages || [])
    : (imageAnalysis?.missingAltSrcs || []).map(i => ({
        src: typeof i === 'string' ? i : i.src,
        suggestedAlt: typeof i === 'object' ? i.suggestedAlt : null,
        foundOnPage: null,
        altStatus: 'missing',
        appearsOnPages: []
      }));

  // Unique pages for the per-page filter dropdown
  const uniquePages = [...new Set(missingAltImages.map(i => i.foundOnPage).filter(Boolean))];
  const filteredMissingImgs = imgPageFilter === 'all'
    ? missingAltImages
    : missingAltImages.filter(i => i.foundOnPage === imgPageFilter);

  const brokenCount   = links?.brokenCount || 0;
  const internalCount = links?.internalCount || 0;
  const externalCount = links?.externalCount || 0;

  const metaDescText   = metaDescription?.text || '';
  const metaDescLen    = metaDescText.length;
  const metaDescStatus = !metaDescText ? 'missing' : metaDescLen < 120 ? 'short' : metaDescLen > 160 ? 'long' : 'ok';

  const filteredTech = techStack.filter(t =>
    t.name.toLowerCase().includes(techFilter.toLowerCase()) ||
    t.category.toLowerCase().includes(techFilter.toLowerCase())
  );  // Group tech by category for display
  const techByCategory = filteredTech.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  // Filter alerts relevant to this tab
  const relevantAlerts = activeAlerts.filter(a =>
    ['seo', 'performance'].includes(a.category) ||
    a.message.toLowerCase().includes('meta') ||
    a.message.toLowerCase().includes('alt') ||
    a.message.toLowerCase().includes('broken') ||
    a.message.toLowerCase().includes('image')
  );

  const confInfo = CONFIDENCE_LABELS[pageCount.confidence] || CONFIDENCE_LABELS.low;

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

      {/* ── Deep Crawl Progress / Result Banner ──────────────────────────── */}
      {crawlLoading && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-4 border-l-4 border-l-blue-600 flex items-center gap-3">
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Deep site crawl in progress...</p>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5">
              Crawling up to 100 pages to count all images across the entire website. Runs in the background — other tabs work normally.
            </p>
          </div>
        </div>
      )}
      {crawlMeta && !crawlLoading && (
        <div className={`elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-4 border-l-4 flex items-center gap-3 ${crawlMeta.crawlLimitReached ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
          {crawlMeta.crawlLimitReached
            ? <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            : <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          <div>
            <p className={`text-xs font-medium ${crawlMeta.crawlLimitReached ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {crawlMeta.crawlLimitReached
                ? `Crawl limit reached — ${crawlMeta.pagesCrawled} of ${crawlMeta.pagesDiscovered}+ pages scanned (limit: ${crawlMeta.maxPagesLimit})`
                : `Full crawl complete — ${crawlMeta.pagesCrawled} pages scanned in ${(crawlMeta.elapsedMs / 1000).toFixed(1)}s`}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5">
              Source: {crawlMeta.usedSitemap ? 'sitemap.xml + BFS link crawl' : 'BFS internal link crawl'} · Depth limit: {crawlMeta.maxDepthLimit} levels
            </p>
          </div>
        </div>
      )}

      {/* ── Row 1: KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Total Pages */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">Total Pages</span>
            <FileText className="text-blue-600 dark:text-blue-400 h-4 w-4" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-[#F1F5F9]">{pageCount.estimatedPages}</h2>
            <p className={`text-[11px] mt-1 font-medium ${deepPageCount ? 'text-emerald-700 dark:text-emerald-400' : confInfo.color}`}>
              {deepPageCount ? 'BFS crawled (accurate)' : crawlLoading ? 'crawling...' : confInfo.label}
            </p>
          </div>
        </div>

        {/* Total Images */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">Total Images</span>
            <Image className="text-blue-600 dark:text-blue-400 h-4 w-4" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-[#F1F5F9]">{totalImages}</h2>
            <p className={`text-[11px] mt-1 font-medium ${usingSiteWide ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-[#A8B5C7]'}`}>
              {usingSiteWide ? `across ${pagesScanned} pages` : crawlLoading ? 'crawling...' : 'homepage only'}
            </p>
          </div>
        </div>

        {/* Internal Links */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">Internal Links</span>
            <Link className="text-sky-600 dark:text-sky-400 h-4 w-4" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-[#F1F5F9]">{internalCount}</h2>
            <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">Same-domain links</p>
          </div>
        </div>

        {/* External Links */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">External Links</span>
            <ExternalLink className="text-emerald-600 dark:text-emerald-400 h-4 w-4" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-[#F1F5F9]">{externalCount}</h2>
            <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">Outbound links</p>
          </div>
        </div>

      </div>

      {/* ── Row 2: Broken Links + Meta Description ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Broken Links & Permalinks Card */}
        <div className={`elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between ${brokenCount > 0 || permalinks?.failedCount > 0 ? 'border-l-4 border-l-rose-500' : ''}`}>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
              <Link2Off className={`h-4 w-4 shrink-0 ${brokenCount > 0 || permalinks?.failedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              Permalinks & Broken Links Detection
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {permalinks?.failedCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full font-medium text-[11px] border bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 animate-pulse whitespace-nowrap">
                  {permalinks.isRewriteFailure ? 'REWRITE FAILURE' : `${permalinks.failedCount} BROKEN PERMALINKS`}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-medium text-[11px] border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap">
                  PERMALINKS HEALTHY
                </span>
              )}
              {brokenCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full font-medium text-[11px] border bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 whitespace-nowrap">
                  {brokenCount} DEAD
                </span>
              )}
            </div>
          </div>

          {brokenCount === 0 && permalinks?.failedCount === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50/70 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">All Subpages & Permalinks Operational</p>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">Homepage returns HTTP 200 and internal site permalinks load successfully.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {permalinks?.failedCount > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-xl text-xs space-y-1.5 mb-2">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-medium">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{permalinks.isRewriteFailure ? 'Critical: URL Rewrite / Permalinks Failure' : 'Subpage Load Failures Detected'}</span>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-200/90 leading-relaxed">
                    Homepage returned 200 OK, but {permalinks.failedCount} internal permalinks failed with 404/500 errors. Verify web server rewrite rules (.htaccess or Nginx try_files) and CMS permalink structure.
                  </p>
                  {(permalinks?.brokenUrls || []).slice(0, 3).map((bp, idx) => (
                    <div key={idx} className="p-1.5 bg-white dark:bg-[#111B2E] border border-rose-200 dark:border-rose-900/50 rounded font-mono text-[11px] text-rose-700 dark:text-rose-300 truncate">
                      {bp.url} <span className="text-rose-600 dark:text-rose-400 font-medium">({bp.reason || bp.statusCode})</span>
                    </div>
                  ))}
                </div>
              )}
              {brokenCount > 0 && (
                <div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Warning: {brokenCount} dead link{brokenCount > 1 ? 's' : ''} detected
                  </p>
                  {(links?.brokenLinks || []).slice(0, 3).map((bl, idx) => (
                    <div key={idx} className="p-2 bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-lg text-[11px] mb-1">
                      <p className="font-mono text-amber-800 dark:text-amber-300 truncate">{bl.url}</p>
                      <p className="text-slate-600 dark:text-[#A8B5C7] mt-0.5">{bl.reason} — <span className="capitalize">{bl.type}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meta Description Card */}
        <div className={`elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between ${metaDescStatus === 'missing' ? 'border-l-4 border-l-rose-500' : metaDescStatus === 'ok' ? '' : 'border-l-4 border-l-amber-500'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Meta Description
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${
              metaDescStatus === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : metaDescStatus === 'missing'
                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 animate-pulse'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
            }`}>
              {metaDescStatus === 'ok' ? 'OPTIMAL' : metaDescStatus === 'missing' ? 'MISSING' : metaDescStatus === 'short' ? 'TOO SHORT' : 'TOO LONG'}
            </span>
          </div>

          {metaDescStatus === 'missing' ? (
            <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/15 rounded-xl">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">No meta description tag found.</p>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Add a 120–160 character description to improve search engine click-through rates.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl text-xs text-slate-800 dark:text-[#F1F5F9] leading-relaxed font-mono break-words">
                {metaDescText}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-[#A8B5C7]">Length: <span className="font-medium text-slate-900 dark:text-[#F1F5F9]">{metaDescLen} chars</span></span>
                <span className={`font-medium ${metaDescStatus === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {metaDescStatus === 'ok' ? '✓ Ideal range (120–160)' : metaDescStatus === 'short' ? '⚠ Too short (min 120)' : '⚠ Too long (max 160)'}
                </span>
              </div>
              {/* Length bar */}
              <div className="w-full progress-track bg-slate-200 dark:bg-[#111B2E] rounded-full h-2 overflow-hidden border border-slate-200 dark:border-[#2B3B53]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${metaDescStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (metaDescLen / 160) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Row 3: Image Analysis ─────────────────────────────────────────── */}
      <div
        id="alt-section"
        ref={altSectionRef}
        className={`elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 transition-all duration-500 ${altHighlight ? 'sre-alt-highlight' : ''}`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base flex items-center gap-2 flex-wrap">
            <Image className="text-blue-600 dark:text-blue-400 h-5 w-5" />
            Site-Wide Image Analysis
            {usingSiteWide && (
              <span className="ml-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[11px] font-medium whitespace-nowrap">
                {pagesScanned} pages crawled
              </span>
            )}
            {!usingSiteWide && (
              <span className="ml-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53] rounded-full text-[11px] font-medium uppercase tracking-wider whitespace-nowrap">
                Homepage only
              </span>
            )}
          </h3>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">Total Images</p>
            <p className="text-2xl font-medium text-slate-900 dark:text-[#F1F5F9]">{totalImages}</p>
            {usingSiteWide && <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5">{pagesScanned} pages</p>}
          </div>
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/15 text-center">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">With ALT</p>
            <p className="text-2xl font-medium text-emerald-700 dark:text-emerald-400">{withAltCount}</p>
          </div>
          <div className="p-4 bg-rose-50/70 dark:bg-rose-500/5 rounded-xl border border-rose-200 dark:border-rose-500/15 text-center">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">Missing ALT</p>
            <p className="text-2xl font-medium text-rose-700 dark:text-rose-400">{missingAltCount}</p>
          </div>
          <div className="p-4 bg-blue-50/70 dark:bg-blue-500/5 rounded-xl border border-blue-200 dark:border-blue-500/15 text-center">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">Compliance</p>
            <p className={`text-2xl font-medium ${altCompliancePct >= 90 ? 'text-emerald-700 dark:text-emerald-400' : altCompliancePct >= 70 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>{altCompliancePct}%</p>
          </div>
        </div>

        {/* Compliance bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-[#A8B5C7] mb-1.5">
            <span>ALT Tag Compliance Rate</span>
            <span className="font-medium text-slate-900 dark:text-[#F1F5F9]">{withAltCount} / {totalImages} images</span>
          </div>
          <div className="w-full progress-track bg-slate-200 dark:bg-[#111B2E] rounded-full h-2 overflow-hidden border border-slate-200 dark:border-[#2B3B53]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${altCompliancePct >= 90 ? 'bg-emerald-500' : altCompliancePct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${altCompliancePct}%` }}
            />
          </div>
        </div>

        {/* Per-page breakdown table */}
        {perPage.length > 1 && (
          <div className="mb-5">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mb-2.5">Images Per Page</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Page URL</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">With ALT</th>
                    <th className="py-2.5 px-3 text-center">Missing ALT</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {perPage.map((p, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                      <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400 text-[11px] max-w-xs truncate" title={p.pageUrl}>
                        {p.pageUrl.replace(/^https?:\/\/[^/]+/, '') || '/'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-900 dark:text-[#F1F5F9]">{p.totalImages}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-emerald-700 dark:text-emerald-400">{p.withAlt}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-rose-700 dark:text-rose-400">{p.missingAlt}</td>
                      <td className="py-2.5 px-3 text-center">
                        {p.missingAlt === 0
                          ? <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-[11px] font-medium">OK</span>
                          : <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-[11px] font-medium animate-pulse">FIX</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Optimization recommendations */}
        <div className="space-y-2 mb-4">
          {missingAltCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">Add ALT text to {missingAltCount} image{missingAltCount > 1 ? 's' : ''} across {pagesScanned} page{pagesScanned > 1 ? 's' : ''}</p>
                <p className="text-slate-600 dark:text-[#A8B5C7] mt-0.5">Missing ALT attributes hurt accessibility (WCAG 2.1) and reduce image SEO indexing.</p>
              </div>
            </div>
          )}
          {totalImages > 20 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50/70 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/15 rounded-xl text-xs">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">Consider lazy loading for {totalImages} images</p>
                <p className="text-slate-600 dark:text-[#A8B5C7] mt-0.5">Use <code className="font-mono bg-blue-100 dark:bg-[#1D2B42] text-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">loading="lazy"</code> on below-fold images to improve LCP and page load speed.</p>
              </div>
            </div>
          )}
          {totalImages === 0 && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl text-xs">
              <Info className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7] shrink-0" />
              <p className="text-slate-600 dark:text-[#A8B5C7]">No images detected across scanned pages.</p>
            </div>
          )}
          {missingAltCount === 0 && totalImages > 0 && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50/70 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 rounded-xl text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">All {totalImages} images across {pagesScanned} page{pagesScanned > 1 ? 's' : ''} have valid ALT text — fully accessible and SEO-optimised.</p>
            </div>
          )}
        </div>

        {/* Missing ALT images list with page filter */}
        {missingAltImages.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-[#2B3B53]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium uppercase tracking-wider">
                Images Missing ALT Text ({filteredMissingImgs.length}{imgPageFilter !== 'all' ? ` on this page` : ` total`})
              </p>
              {uniquePages.length > 1 && (
                <select
                  value={imgPageFilter}
                  onChange={e => setImgPageFilter(e.target.value)}
                  className="h-[42px] bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3 text-xs text-slate-800 dark:text-[#F1F5F9] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="all">All pages ({missingAltImages.length})</option>
                  {uniquePages.map(p => (
                    <option key={p} value={p}>
                      {p.replace(/^https?:\/\/[^/]+/, '') || '/'} ({missingAltImages.filter(i => i.foundOnPage === p).length})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredMissingImgs.slice(0, 40).map((img, i) => {
                const src = img.src || (typeof img === 'string' ? img : '');
                const suggested = img.suggestedAlt;
                const page = img.foundOnPage;
                const isImage = src && /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)(\?|$)/i.test(src);
                return (
                  <div key={i} className="p-2.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg space-y-1.5">
                    <div className="flex items-start gap-2">
                      {/* Image preview thumbnail */}
                      {isImage && (
                        <a href={src} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <img
                            src={src}
                            alt=""
                            className="h-10 w-10 object-cover rounded border border-rose-200 dark:border-rose-500/20 hover:border-blue-500/40 transition-all"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </a>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Clickable image URL */}
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-rose-700 dark:text-rose-300 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 truncate flex-1 transition-colors"
                            title={src}
                          >
                            {src}
                          </a>
                          <span className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-medium border ${img.altStatus === 'empty' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                            {img.altStatus === 'empty' ? 'EMPTY ALT' : 'MISSING ALT'}
                          </span>
                        </div>
                        {page && (
                          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono truncate mt-0.5">
                            📄 {page.replace(/^https?:\/\/[^/]+/, '') || '/'}
                          </p>
                        )}
                        {suggested && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
                            💡 Suggested ALT: <em>"{suggested}"</em>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredMissingImgs.length > 40 && (
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] italic text-center py-1">
                  + {filteredMissingImgs.length - 40} more images not shown
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Row 4: Page Count Details ─────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
        <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
          <Globe className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Page Count Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">Estimated Total Pages</p>
            <p className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9]">{pageCount.estimatedPages}</p>
            <p className={`text-[11px] mt-1 font-medium ${confInfo.color}`}>Confidence: {confInfo.label}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">Sitemap.xml URLs</p>
            <p className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9]">{pageCount.sitemapCount || 0}</p>
            <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">
              {pageCount.sitemapCount > 0 ? '✓ Sitemap found and parsed' : '— Sitemap not found'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-2">Internal Links Found</p>
            <p className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9]">{pageCount.internalLinkCount || 0}</p>
            <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">Unique internal paths crawled</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-4 italic">
          Source: <span className="font-medium text-slate-800 dark:text-[#F1F5F9]">{pageCount.source === 'sitemap.xml' ? 'sitemap.xml (high accuracy)' : pageCount.source === 'internal-links' ? 'Internal link crawl (estimated)' : 'Fallback estimate'}</span>.
          {pageCount.sitemapCount === 0 && ' For accurate page counts, add a sitemap.xml to your site.'}
        </p>
      </div>

      {/* ── Row 5: Technology Stack ───────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base flex items-center gap-2">
            <Cpu className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Technology Stack Detection
            {techStack.length > 0 && (
              <span className="ml-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[11px] font-medium">
                {techStack.length} detected
              </span>
            )}
          </h3>
          {techStack.length > 0 && (
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 dark:text-[#A8B5C7] h-4 w-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter technologies..."
                value={techFilter}
                onChange={e => setTechFilter(e.target.value)}
                className="h-[42px] bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl pl-9 pr-3 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-52 shadow-2xs"
              />
            </div>
          )}
        </div>

        {techStack.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#2B3B53] rounded-2xl bg-slate-50/70 dark:bg-[#111B2E]/50">
            <Code className="h-8 w-8 text-slate-400 dark:text-[#A8B5C7] mx-auto mb-3" />
            <p className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium">No recognisable technology signatures detected.</p>
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">The site may use custom or obfuscated code, or the scan did not return enough HTML.</p>
          </div>
        ) : filteredTech.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-[#A8B5C7] italic py-4 text-center">No technologies match your filter.</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(techByCategory).map(([category, techs]) => (
              <div key={category}>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {techs.map((t, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${categoryColor(t.category)}`}>
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 6: Alerts & Recommendations ─────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
        <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
          <AlertCircle className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Alerts & Recommendations
          {relevantAlerts.length > 0 && (
            <span className="ml-1 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-full text-[11px] font-medium">
              {relevantAlerts.length}
            </span>
          )}
        </h3>

        {relevantAlerts.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-[#2B3B53] rounded-2xl bg-slate-50/70 dark:bg-[#111B2E]/50 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium">No active alerts for this site analysis.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {relevantAlerts.map((alert, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
                alert.level === 'critical'
                  ? 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'
                  : alert.level === 'warning'
                  ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300'
                  : 'bg-blue-50/80 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300'
              }`}>
                {alert.level === 'critical'
                  ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  : alert.level === 'warning'
                  ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  : <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />}
                <div>
                  <span className={`text-[11px] font-medium uppercase tracking-wider block mb-0.5 ${
                    alert.level === 'critical' ? 'text-rose-700 dark:text-rose-400' : alert.level === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'
                  }`}>{alert.level} — {alert.category}</span>
                  <p className="leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
