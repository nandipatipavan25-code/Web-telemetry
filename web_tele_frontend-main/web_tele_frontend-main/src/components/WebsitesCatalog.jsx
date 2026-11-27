import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Globe, Plus, Search, Star, ExternalLink, Activity, ShieldCheck,
  Trash2, RefreshCw, Lock, ArrowUpRight, Filter, Layers, CheckCircle2,
  AlertCircle, X, Eye, Zap, Shield, Clock, Server, Check
} from 'lucide-react';
import { Icon3DGlobe, Icon3DServer, Icon3DLock, Icon3DSpeed, Icon3DShield } from './Icons3D';

const AVATAR_PALETTES = [
  { bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900/60' },
  { bg: 'bg-sky-100 dark:bg-sky-950/80', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-900/60' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/60' },
  { bg: 'bg-teal-100 dark:bg-teal-950/80', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-900/60' },
  { bg: 'bg-cyan-100 dark:bg-cyan-950/80', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900/60' },
  { bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/60' },
  { bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/60' },
];

const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&#0*38;/gi, '&')
    .replace(/&#8211;|&ndash;/gi, '–')
    .replace(/&#8212;|&mdash;/gi, '—')
    .replace(/&#8217;|&#0*39;|&apos;/gi, "'")
    .replace(/&#8220;|&#8221;|&quot;/gi, '"')
    .replace(/&nbsp;/gi, ' ')
    .trim();
};

const getDomainInitials = (hostname) => {
  const clean = (hostname || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const parts = clean.split('.');
  const name = parts[0] || 'site';
  if (name.length <= 2) return name.toUpperCase();
  return (name[0] + (name[1] || '')).toUpperCase();
};

const getAvatarPalette = (hostname) => {
  const clean = (hostname || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

export default function WebsitesCatalog({
  targets = [],
  pagination = null,
  isLoading = false,
  onSelectWebsite,
  onAddWebsite,
  onDeleteWebsite,
  onToggleFavorite,
  onRefreshTargets,
  onOpenClientView,
  isScanning = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites' | 'online' | 'offline' | 'maintenance' | 'hosting'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [analysisFrequency, setAnalysisFrequency] = useState('1h'); // '1h' | '3h' | '6h' | '12h' | '24h'
  const [serviceType, setServiceType] = useState('maintenance'); // 'hosting' | 'maintenance'
  const [addError, setAddError] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Trigger backend pagination / filtering when search, filter, or page changes
  useEffect(() => {
    if (typeof onRefreshTargets === 'function') {
      const delayDebounce = setTimeout(() => {
        onRefreshTargets(true, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          filter: filterMode
        });
      }, 200);
      return () => clearTimeout(delayDebounce);
    }
  }, [currentPage, searchTerm, filterMode]);

  const safeTargets = Array.isArray(targets) ? targets : [];

  // Determine pagination parameters (from backend if supplied, fallback to frontend)
  const isBackendPaginated = !!(pagination && typeof pagination.totalItems === 'number' && pagination.totalItems > 0);

  const totalPages = isBackendPaginated
    ? (pagination.totalPages || 1)
    : Math.max(1, Math.ceil(safeTargets.length / ITEMS_PER_PAGE));

  const safeCurrentPage = isBackendPaginated
    ? (pagination.currentPage || currentPage)
    : Math.min(currentPage, Math.max(totalPages, 1));

  const totalItemsCount = isBackendPaginated
    ? pagination.totalItems
    : safeTargets.length;

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  // When backend pagination is active, targets already contains ONLY the current page slice
  const paginatedTargets = isBackendPaginated
    ? safeTargets
    : safeTargets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const firstVisibleWebsite = totalItemsCount === 0
    ? 0
    : (isBackendPaginated ? (pagination.startIndex || startIndex + 1) : startIndex + 1);

  const lastVisibleWebsite = isBackendPaginated
    ? (pagination.endIndex || Math.min(startIndex + ITEMS_PER_PAGE, totalItemsCount))
    : Math.min(startIndex + ITEMS_PER_PAGE, totalItemsCount);

  const handleOpenAddModal = () => {
    setNewUrlInput('');
    setAnalysisFrequency('1h');
    setServiceType('maintenance');
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewUrlInput('');
    setAnalysisFrequency('1h');
    setServiceType('maintenance');
    setAddError('');
  };

  const handleSubmitAddWebsite = async (e) => {
    if (e) e.preventDefault();
    let val = newUrlInput.trim();
    if (!val) {
      setAddError('Please enter a website URL');
      return;
    }
    if (!/^https?:\/\//i.test(val)) {
      val = 'https://' + val;
    }

    setSubmittingAdd(true);
    setAddError('');

    try {
      await onAddWebsite(val, analysisFrequency, serviceType);
      setIsAddModalOpen(false);
      setNewUrlInput('');
    } catch (err) {
      setAddError(err.message || 'Failed to add and audit website.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const getScoreBadgeClass = (score) => {
    const s = score || 85;
    if (s >= 85) return { 
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', 
      ring: 'border-emerald-500',
      label: 'Optimal'
    };
    if (s >= 70) return { 
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', 
      ring: 'border-amber-500',
      label: 'Fair'
    };
    return { 
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800', 
      ring: 'border-rose-500',
      label: 'Action Req.'
    };
  };

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── TOP HERO HEADER BANNER ── */}
      <div className="elevated-card rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0 shadow-xs">
            <Icon3DGlobe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white tracking-tight">
                Websites Catalog
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                {totalItemsCount} {totalItemsCount === 1 ? 'Site' : 'Sites'} Managed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Client websites under active maintenance and cloud hosting with automated uptime monitoring.
            </p>
          </div>
        </div>

        {/* Action Controls: Refresh + Add Website */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onRefreshTargets}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Refresh website catalog"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 h-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 text-white" />
            <span className="text-white">Add Website</span>
          </button>
        </div>
      </div>

      {/* ── FILTERS & SEARCH TOOLBAR ── */}
      <div className="elevated-card rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-[#A8B5C7]" />
          <input
            type="text"
            placeholder="Search site name or domain..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-[42px] pl-10 pr-9 bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#7D8EA3] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Sites' },
            { id: 'maintenance', label: '🛠️ Maintenance' },
            { id: 'hosting', label: '☁️ Hosting' },
            { id: 'favorites', label: '★ Favorites' },
            { id: 'online', label: '● Online' },
            { id: 'offline', label: '▲ Down / Alerts' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setFilterMode(f.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterMode === f.id
                  ? 'bg-blue-600 !text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID OF ELEVATED WEBSITE CARDS ── */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 animate-pulse px-1">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Synchronizing monitored catalog...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={`skeleton-${idx}`}
                className="elevated-card rounded-2xl p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                  <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                  <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                </div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : paginatedTargets.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTargets.map((site) => {
              let hostname = site.url;
              try { hostname = new URL(site.url).hostname; } catch (e) { hostname = site.url; }
              const rawName = typeof site.name === 'string' ? site.name : (site.name?.text || hostname);
              const siteNameStr = decodeHtmlEntities(rawName) || hostname;
              const badge = getScoreBadgeClass(site.performanceScore);
              const isUp = site.isUp !== false;
              const initials = getDomainInitials(hostname);
              const palette = getAvatarPalette(hostname);

              return (
                <div
                  key={site.url}
                  className="elevated-card rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] p-5 sm:p-6 flex flex-col justify-between group transition-all duration-200 shadow-3d-sm hover:shadow-3d hover:-translate-y-1 space-y-4"
                >
                  <div>
                    {/* Top Row: Domain Avatar + Hostname + Status + Pin */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Domain Avatar / Favicon */}
                        <div className={`w-11 h-11 rounded-xl ${palette.bg} ${palette.text} ${palette.border} border flex items-center justify-center font-medium text-xs shrink-0 shadow-xs relative overflow-hidden`}>
                          <img
                            src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=64`}
                            alt={hostname}
                            className="w-7 h-7 rounded-lg object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center font-medium text-xs font-mono">
                            {initials}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white text-sm tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <span className="truncate">{hostname}</span>
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                              title="Open website in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {siteNameStr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(site);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={site.isFavorite ? 'Unpin website' : 'Pin to favorites'}
                        >
                          <Star className={`w-4 h-4 ${site.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                        </button>

                        {/* Status Pill */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 ${
                          isUp
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-600 dark:bg-rose-400'}`} />
                          {isUp ? 'Operational' : `Down (${site.statusCode || 436})`}
                        </span>
                      </div>
                    </div>

                    {/* Badges Row: Service Package + Security Status */}
                    <div className="flex items-center gap-2 flex-wrap mt-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-medium border ${
                        site.serviceType === 'hosting'
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                      }`}>
                        {site.serviceType === 'hosting' ? '☁️ Cloud Hosting' : '🛠️ Maintenance'}
                      </span>

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-medium border ${
                        site.malwareStatus === 'malware'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : site.malwareStatus === 'suspicious'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {site.malwareStatus === 'malware' ? '❌ Malware' : site.malwareStatus === 'suspicious' ? '⚠️ Notice' : '🛡️ Secured'}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Checks Every {site.analysisFrequency || '1h'}</span>
                      </span>
                    </div>

                    {/* Integrated Telemetry Strip (Sleek horizontal divider layout) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 text-center">
                      <div className="px-2">
                        <span className="text-[10px] text-slate-400 block font-normal">Response Speed</span>
                        <span className="text-xs font-medium text-slate-900 dark:text-white font-mono mt-0.5 block">
                          {site.loadTimeMs ? `${(site.loadTimeMs / 1000).toFixed(2)}s` : '—'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {site.loadTimeMs < 4000 ? 'Fast' : site.loadTimeMs < 8000 ? 'Normal' : 'Heavy'}
                        </span>
                      </div>

                      <div className="px-2">
                        <span className="text-[10px] text-slate-400 block font-normal">SSL Certificate</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                          {site.sslDaysRemaining ? `${site.sslDaysRemaining}d` : 'Active'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {site.sslIssuer ? site.sslIssuer.split(' ')[0] : 'AutoSSL'}
                        </span>
                      </div>

                      <div className="px-2">
                        <span className="text-[10px] text-slate-400 block font-normal">Health &amp; SEO</span>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
                          {site.performanceScore ? `${site.performanceScore}%` : '85%'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {site.grade ? `Grade ${site.grade}` : 'Good'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Solid High-Contrast Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectWebsite(site.url)}
                      className="flex-1 h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span className="text-white">View Full Telemetry</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                    </button>

                    {onOpenClientView && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenClientView(site.url);
                        }}
                        className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                        title="Open client performance dashboard"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="hidden sm:inline">Client View</span>
                      </button>
                    )}

                    {onDeleteWebsite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to remove ${site.url} from monitored catalog?`)) {
                            onDeleteWebsite(site.url);
                          }
                        }}
                        className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="Remove website from catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── CLEAN, INTUITIVE PAGINATION ── */}
          {totalPages > 1 && (
            <div className="elevated-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-3d-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {firstVisibleWebsite}-{lastVisibleWebsite}
                </strong>{' '}
                of{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {totalItemsCount}
                </strong>{' '}
                monitored websites
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                >
                  Previous
                </button>

                {/* Smart pagination numbers (max 7 chips) */}
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 2)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-1 text-slate-400 text-xs font-mono">…</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 min-w-8 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            safeCurrentPage === page
                              ? 'bg-blue-600 border-blue-600 !text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="elevated-card rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl icon-pedestal flex items-center justify-center p-2 mx-auto mb-4">
            <Icon3DGlobe className="w-12 h-12" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-medium text-lg">No Websites Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {searchTerm || filterMode !== 'all'
              ? 'No websites matched your active search query or filter tags.'
              : 'You have not added any website targets to your SRE monitoring catalog yet.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
          >
            + Add Your First Website
          </button>
        </div>
      )}

      {/* ── MODAL DIALOG: Add New Website (Portalled to document.body to bypass transformed ancestors & eliminate hover jump) ── */}
      {isAddModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
          onClick={handleCloseAddModal}
        >
          <div
            className="bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#2B3B53] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl icon-pedestal flex items-center justify-center p-1.5 shrink-0">
                  <Icon3DServer className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Track New Website</h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B5C7]">Configure real-time SRE telemetry and automated monitoring probes.</p>
                </div>
              </div>
              <button
                onClick={handleCloseAddModal}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-[#A8B5C7] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1D2B42] transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitAddWebsite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] block mb-1.5">
                  Target Domain or URL
                </label>
                <div className="form-input-container">
                  <Globe className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7] shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. gaconsulting.in or https://my-site.com"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none font-mono"
                  />
                </div>
                {addError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {addError}
                  </p>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block mb-1.5">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['wordpress.org', 'gaconsulting.in', 'github.com', 'google.com'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewUrlInput(`https://${preset}`)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-[#1D2B42] hover:bg-slate-200 dark:hover:bg-[#253653] border border-slate-200 dark:border-[#2B3B53] rounded-lg text-xs font-mono text-slate-700 dark:text-[#F1F5F9] transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Type Tracking Selector */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#2B3B53]">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] block mb-2">
                  Service Tracking Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceType('maintenance')}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      serviceType === 'maintenance'
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-[#1D2B42] border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#A8B5C7] hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        🛠️ Website Maintenance
                      </span>
                      {serviceType === 'maintenance' && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-relaxed">
                      Complete diagnostics: Uptime, SSL, Malware, SEO, Performance, Database & WP.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('hosting')}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      serviceType === 'hosting'
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 ring-2 ring-sky-500/20 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-[#1D2B42] border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#A8B5C7] hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                        ☁️ Hosting Service
                      </span>
                      {serviceType === 'hosting' && (
                        <span className="h-2 w-2 rounded-full bg-sky-600 dark:bg-sky-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-relaxed">
                      Core infrastructure tracking: Uptime, SSL certificate, and Malware audits only.
                    </p>
                  </button>
                </div>
              </div>

              {/* Performance Analysis Frequency Selector */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#2B3B53]">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] flex items-center justify-between mb-2">
                  <span>Performance Analysis Interval</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                    Every {analysisFrequency === '1h' ? '1 Hour' : analysisFrequency === '3h' ? '3 Hours' : analysisFrequency === '6h' ? '6 Hours' : analysisFrequency === '12h' ? '12 Hours' : '24 Hours'}
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: '1h', label: '1 Hr' },
                    { id: '3h', label: '3 Hrs' },
                    { id: '6h', label: '6 Hrs' },
                    { id: '12h', label: '12 Hrs' },
                    { id: '24h', label: '24 Hrs' }
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setAnalysisFrequency(freq.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-medium transition-all border text-center cursor-pointer ${
                        analysisFrequency === freq.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border-slate-200 dark:border-[#2B3B53] hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#2B3B53]">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 h-[40px] bg-slate-100 hover:bg-slate-200 dark:bg-[#1D2B42] dark:hover:bg-[#253653] text-slate-700 dark:text-[#F1F5F9] text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 h-[40px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {submittingAdd ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Auditing &amp; Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Audit &amp; Track Website</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
