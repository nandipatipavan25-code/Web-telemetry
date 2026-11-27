import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Globe, Activity, ShieldCheck, CheckCircle2, AlertTriangle,
  Clock, Search, RefreshCw, Lock, Zap,
  ExternalLink, ChevronRight, AlertCircle,
  Layers, ArrowRight, ShieldAlert, Sparkles, HeartHandshake,
  Check, X, BarChart3
} from 'lucide-react';
import { Icon3DGlobe, Icon3DServer, Icon3DLock, Icon3DSpeed, Icon3DShield } from './Icons3D';
import FleetPieCharts from './FleetPieCharts';
import { API_BASE } from '../apiConfig';

// Domain color palette for personalized lettermark avatars (Blue-aligned, High contrast in Light & Dark modes)
const AVATAR_PALETTES = [
  { bg: 'bg-blue-50 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900/60' },
  { bg: 'bg-sky-50 dark:bg-sky-950/80', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-900/60' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/60' },
  { bg: 'bg-teal-50 dark:bg-teal-950/80', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-900/60' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/80', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900/60' },
  { bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/60' },
  { bg: 'bg-rose-50 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/60' },
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

export default function CentralDashboard({
  isDark = true,
  onSelectWebsite,
  onOpenCatalogues,
  onOpenClientView
}) {
  const [websites, setWebsites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState('all'); // 'all' | 'maintenance' | 'hosting' | 'down' | 'ssl_urgent'
  const [sortBy, setSortBy] = useState('status'); // 'status' | 'speed' | 'score' | 'ssl' | 'name'
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  // Fetch all websites and real alerts from gawebtelemetry.com
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const targetsRes = await axios.get(`${API_BASE}/targets`, {
        params: { limit: 100 }
      });

      let sitesList = [];
      if (targetsRes.data && Array.isArray(targetsRes.data.targets)) {
        sitesList = targetsRes.data.targets;
      } else if (Array.isArray(targetsRes.data)) {
        sitesList = targetsRes.data;
      }

      // Deduplicate websites by normalized URL to prevent repeated table rows
      const seenUrls = new Set();
      const dedupedSites = sitesList.filter((site) => {
        if (!site || !site.url) return false;
        const key = site.url.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
        if (seenUrls.has(key)) return false;
        seenUrls.add(key);
        return true;
      });

      setWebsites(dedupedSites);

      try {
        const alertsRes = await axios.get(`${API_BASE}/alerts`);
        if (Array.isArray(alertsRes.data)) {
          setAlerts(alertsRes.data.slice(0, 50));
        }
      } catch (alertErr) {
        console.warn('Could not load alerts feed:', alertErr.message);
      }

      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to load central dashboard data:', err);
      setError('Unable to reach gawebtelemetry.com. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aggregated fleet metrics computed from live data
  const metrics = useMemo(() => {
    const total = websites.length;
    if (total === 0) {
      return {
        total: 0,
        upCount: 0,
        downCount: 0,
        availabilityPct: '100',
        avgLoadTimeMs: 0,
        avgPerfScore: 0,
        avgSeoScore: 0,
        sslValidCount: 0,
        sslUrgentCount: 0,
        maintenanceCount: 0,
        hostingCount: 0,
        fastCount: 0,
        normalCount: 0,
        heavyCount: 0
      };
    }

    const upSites = websites.filter(s => s.isUp);
    const downSites = websites.filter(s => !s.isUp);
    const maintenanceSites = websites.filter(s => s.serviceType === 'maintenance');
    const hostingSites = websites.filter(s => s.serviceType === 'hosting');

    const totalLoadTime = websites.reduce((acc, s) => acc + (s.loadTimeMs || 0), 0);
    const avgLoadTimeMs = Math.round(totalLoadTime / total);

    const validPerf = websites.filter(s => typeof s.performanceScore === 'number' && s.performanceScore > 0);
    const avgPerfScore = validPerf.length ? Math.round(validPerf.reduce((a, s) => a + s.performanceScore, 0) / validPerf.length) : 0;

    const validSeo = websites.filter(s => typeof s.seoScore === 'number' && s.seoScore > 0);
    const avgSeoScore = validSeo.length ? Math.round(validSeo.reduce((a, s) => a + s.seoScore, 0) / validSeo.length) : 0;

    const sslValidCount = websites.filter(s => (s.sslDaysRemaining || 0) > 0).length;
    const sslUrgentCount = websites.filter(s => (s.sslDaysRemaining || 0) > 0 && s.sslDaysRemaining <= 45).length;

    const fastCount = websites.filter(s => (s.loadTimeMs || 0) > 0 && s.loadTimeMs < 4000).length;
    const heavyCount = websites.filter(s => (s.loadTimeMs || 0) >= 8000).length;
    const normalCount = total - fastCount - heavyCount;

    return {
      total,
      upCount: upSites.length,
      downCount: downSites.length,
      availabilityPct: ((upSites.length / total) * 100).toFixed(1),
      avgLoadTimeMs,
      avgPerfScore,
      avgSeoScore,
      sslValidCount,
      sslUrgentCount,
      maintenanceCount: maintenanceSites.length,
      hostingCount: hostingSites.length,
      fastCount,
      normalCount,
      heavyCount
    };
  }, [websites]);

  // Clean, human-readable helper functions
  const cleanHostname = (rawUrl) => {
    try {
      const parsed = new URL(rawUrl);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      return (rawUrl || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
    }
  };

  const getDomainInitials = (rawUrl) => {
    const host = cleanHostname(rawUrl);
    const parts = host.split('.');
    const name = parts[0] || 'site';
    if (name.length <= 2) return name.toUpperCase();
    return (name[0] + (name[1] || '')).toUpperCase();
  };

  const getAvatarPalette = (rawUrl) => {
    const host = cleanHostname(rawUrl);
    let hash = 0;
    for (let i = 0; i < host.length; i++) {
      hash = host.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Filtered and sorted website directory
  const filteredWebsites = useMemo(() => {
    return websites.filter(site => {
      const matchSearch =
        searchQuery === '' ||
        site.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.name && site.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (filterService === 'maintenance') return site.serviceType === 'maintenance';
      if (filterService === 'hosting') return site.serviceType === 'hosting';
      if (filterService === 'down') return !site.isUp;
      if (filterService === 'ssl_urgent') return (site.sslDaysRemaining || 0) <= 45;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'status') {
        if (a.isUp !== b.isUp) return a.isUp ? 1 : -1; // Down sites on top
        return (b.loadTimeMs || 0) - (a.loadTimeMs || 0);
      }
      if (sortBy === 'speed') return (a.loadTimeMs || 0) - (b.loadTimeMs || 0);
      if (sortBy === 'score') return (b.performanceScore || 0) - (a.performanceScore || 0);
      if (sortBy === 'ssl') return (a.sslDaysRemaining || 999) - (b.sslDaysRemaining || 999);
      if (sortBy === 'name') return cleanHostname(a.url).localeCompare(cleanHostname(b.url));
      return 0;
    });
  }, [websites, searchQuery, filterService, sortBy]);

  if (loading) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">
          Checking website health...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gathering live uptime, response speeds, and SSL certificates across your client websites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">

      {/* ── 1. WARM HUMAN EXECUTIVE GREETING BANNER ── */}
      <div className="elevated-card rounded-2xl p-6 sm:p-7 relative overflow-hidden bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                metrics.downCount === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${metrics.downCount === 0 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {metrics.downCount === 0 ? `All ${metrics.total} Websites Online` : `${metrics.upCount} of ${metrics.total} Websites Online`}
              </span>
              <span className="text-xs text-slate-600 dark:text-[#A8B5C7] font-normal">
                Last checked {formatTimeAgo(lastRefreshedAt)} · Next routine health check in ~45m
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
              {metrics.downCount === 0
                ? 'Everything is running smoothly across your client fleet.'
                : `${metrics.upCount} client ${metrics.upCount === 1 ? 'website is' : 'websites are'} healthy. ${metrics.downCount} ${metrics.downCount === 1 ? 'site requires' : 'sites require'} attention today.`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B5C7] leading-relaxed font-normal">
              Continuous uptime tracking, loading speed audits, and SSL certificate renewals for all client domains.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#1D2B42] text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#253653] transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
              title={`Run a manual health check across all ${metrics.total} websites`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-[#A8B5C7]'}`} />
              <span>{refreshing ? 'Checking status...' : 'Check All Sites Now'}</span>
            </button>

            <button
              onClick={onOpenCatalogues}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all shadow-sm cursor-pointer active:scale-95"
              title="Open full catalog workflow"
            >
              <Globe className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-white">Browse Catalogues</span>
              <ChevronRight className="w-3.5 h-3.5 text-white opacity-90 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between shadow-3d-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 2. THREE BALANCED HUMAN PILLAR CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Pillar 1: Availability & Uptime */}
        <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-600 dark:text-[#A8B5C7]">
                Fleet Availability &amp; Uptime
              </span>
              <div className="w-8 h-8 rounded-xl icon-pedestal flex items-center justify-center p-1">
                <Icon3DServer className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">
                {metrics.availabilityPct}%
              </span>
              <span className="text-xs text-slate-500 dark:text-[#A8B5C7] font-normal">
                today
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-600 dark:text-[#A8B5C7] font-normal">
              <strong className="text-slate-900 dark:text-white font-semibold">{metrics.upCount} of {metrics.total} sites</strong> responding with HTTP 200 OK.
            </div>

            {/* Segmented fleet health visualizer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53]">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B5C7] mb-1.5">
                <span>Fleet Status Breakdown</span>
                <span className="font-medium text-slate-800 dark:text-white">{metrics.downCount === 0 ? '100% Nominal' : `${metrics.downCount} Incident`}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-[#1D2B42] overflow-hidden flex progress-track">
                <div
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-700"
                  style={{ width: `${(metrics.upCount / Math.max(metrics.total, 1)) * 100}%` }}
                  title={`${metrics.upCount} sites up`}
                />
                {metrics.downCount > 0 && (
                  <div
                    className="bg-rose-500 h-full rounded-r-full transition-all duration-700"
                    style={{ width: `${(metrics.downCount / Math.max(metrics.total, 1)) * 100}%` }}
                    title={`${metrics.downCount} sites down`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-xs text-slate-500 dark:text-[#A8B5C7]">
            <span>Target SLA: &gt;99.9%</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Auto-ping every 60s</span>
          </div>
        </div>

        {/* Pillar 2: Loading Speed & User Experience */}
        <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-600 dark:text-[#A8B5C7]">
                Speed &amp; User Experience
              </span>
              <div className="w-8 h-8 rounded-xl icon-pedestal flex items-center justify-center p-1">
                <Icon3DSpeed className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight">
                {metrics.avgLoadTimeMs > 1000 ? `${(metrics.avgLoadTimeMs / 1000).toFixed(2)}s` : `${metrics.avgLoadTimeMs}ms`}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#A8B5C7] font-normal">
                average load time
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-600 dark:text-[#A8B5C7] font-normal">
              Average SEO Grade: <strong className="text-slate-900 dark:text-white font-semibold">{metrics.avgSeoScore}/100</strong> · Performance: <strong className="text-slate-900 dark:text-white font-semibold">{metrics.avgPerfScore}/100</strong>
            </div>

            {/* Speed distribution pills */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53]">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B5C7] mb-2">
                <span>Speed Distribution</span>
                <span>{metrics.total} audited sites</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/40">
                  <span className="block font-semibold text-xs">{metrics.fastCount}</span>
                  <span>Fast (&lt;4s)</span>
                </div>
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/40">
                  <span className="block font-semibold text-xs">{metrics.normalCount}</span>
                  <span>Normal (4–8s)</span>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/40">
                  <span className="block font-semibold text-xs">{metrics.heavyCount}</span>
                  <span>Heavy (&gt;8s)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-xs text-slate-500 dark:text-[#A8B5C7]">
            <span>Mobile 4G &amp; Desktop</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">CDN Acceleration</span>
          </div>
        </div>

        {/* Pillar 3: Security & SSL Protection */}
        <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-600 dark:text-[#A8B5C7]">
                Security &amp; SSL Certificates
              </span>
              <div className="w-8 h-8 rounded-xl icon-pedestal flex items-center justify-center p-1">
                <Icon3DLock className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">
                {metrics.total > 0 ? Math.round((metrics.sslValidCount / metrics.total) * 100) : 100}% Secured
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-600 dark:text-[#A8B5C7] font-normal">
              <strong className="text-slate-900 dark:text-white font-semibold">{metrics.sslValidCount} of {metrics.total} domains</strong> have active HTTPS certificates.
            </div>

            {/* Renewal Horizon */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53]">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B5C7] mb-2">
                <span>Renewal Schedule</span>
                <span>AutoSSL Managed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53]">
                  <span className="text-slate-600 dark:text-[#A8B5C7] block text-[11px]">Renewing in &lt;45 Days</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400 text-xs mt-0.5 block">
                    {metrics.sslUrgentCount} domains
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53]">
                  <span className="text-slate-600 dark:text-[#A8B5C7] block text-[11px]">Valid &gt;60 Days</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs mt-0.5 block">
                    {Math.max(metrics.total - metrics.sslUrgentCount, 0)} domains
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-xs text-slate-500 dark:text-[#A8B5C7]">
            <span>Let's Encrypt / cPanel AutoSSL</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Automatic Renewals</span>
          </div>
        </div>

      </div>

      {/* ── 3. FLEET HEALTH & PERFORMANCE PIE CHARTS ── */}
      <FleetPieCharts
        websites={websites}
        metrics={metrics}
        isDark={isDark}
        onOpenCatalogues={onOpenCatalogues}
      />

      {/* ── 4. HUMAN ACTION ROW: WHAT NEEDS ATTENTION & FLEET SERVICE BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column: Action Items Requiring Attention */}
        <div className="lg:col-span-2 elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2B3B53] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Items Requiring Attention Today
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-[#A8B5C7] font-normal">
                {metrics.downCount === 0 ? 'Zero active incidents' : `${metrics.downCount} ${metrics.downCount === 1 ? 'domain' : 'domains'} needing check`}
              </span>
            </div>

            {metrics.downCount === 0 ? (
              <div className="py-8 text-center text-slate-600 dark:text-[#A8B5C7] text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  All {metrics.total} websites are healthy and responding normally.
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7]">
                  No downtime or critical outages detected on the latest audit cycle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {websites.filter(s => !s.isUp).map((site) => {
                  const domain = cleanHostname(site.url);
                  const initials = getDomainInitials(site.url);

                  return (
                    <div
                      key={site.url}
                      className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center font-medium text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 !text-white uppercase tracking-wider">
                                HTTP {site.statusCode || 436} Outage
                              </span>
                              <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                                {domain}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                · Checked {formatTimeAgo(site.checkedAt || site.lastScannedAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              The website failed the automated probe and is not loading for visitors. Recommended action: Check server hosting or upstream CDN proxy settings.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => onSelectWebsite(site.url)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
                          >
                            Inspect Telemetry
                          </button>
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-800 transition-colors shadow-xs"
                            title="Visit website in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B5C7]">
            <span>Automated multi-region pings run continuously</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{metrics.availabilityPct}% Operational Today</span>
          </div>
        </div>

        {/* Right Column: Fleet Services Breakdown */}
        <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2B3B53] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Client Service Packages
                </h3>
              </div>
              <span className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium">
                {metrics.total} Active Sites
              </span>
            </div>

            <div className="space-y-4">
              {/* Maintenance package */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-[#F1F5F9] mb-1.5">
                  <span className="font-medium">🛠️ Website Maintenance</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{metrics.maintenanceCount} sites</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1D2B42] rounded-full h-2.5 overflow-hidden progress-track">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(metrics.maintenanceCount / Math.max(metrics.total, 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1.5">Includes plugin updates, security scanning, and daily offsite backups.</p>
              </div>

              {/* Hosting package */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-[#F1F5F9] mb-1.5">
                  <span className="font-medium">☁️ Cloud Hosting Service</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{metrics.hostingCount} sites</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1D2B42] rounded-full h-2.5 overflow-hidden progress-track">
                  <div
                    className="bg-sky-500 dark:bg-sky-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(metrics.hostingCount / Math.max(metrics.total, 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1.5">Includes high-availability VPS hosting, NVMe caching, and DDoS filtering.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53] text-xs text-slate-600 dark:text-[#A8B5C7] leading-relaxed">
            Need to add a new client website? Navigate to Catalogues to register new domains.
          </div>
        </div>

      </div>

      {/* ── 4. COMPLETE MONITORED WEBSITES OVERVIEW DIRECTORY ── */}
      <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm space-y-4">

        {/* Directory Header & Interactive Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2B3B53] pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              All Monitored Websites ({filteredWebsites.length})
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">
              Live status, loading response times, SEO ratings, and SSL certificates for your entire client portfolio.
            </p>
          </div>

          {/* Search bar & Filter controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[210px] sm:min-w-[230px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#A8B5C7]" />
              <input
                type="text"
                placeholder="Search domain name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] pl-9 pr-8 rounded-xl text-xs bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-normal"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-[#A8B5C7] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Select */}
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="h-[42px] px-3 rounded-xl text-xs bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9] focus:outline-none font-normal"
            >
              <option value="all">All Services ({metrics.total})</option>
              <option value="maintenance">Maintenance ({metrics.maintenanceCount})</option>
              <option value="hosting">Hosting ({metrics.hostingCount})</option>
              <option value="down">Incidents ({metrics.downCount})</option>
              <option value="ssl_urgent">SSL &lt; 45d ({metrics.sslUrgentCount})</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[42px] px-3 rounded-xl text-xs bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9] focus:outline-none font-normal"
            >
              <option value="status">Sort: Status Priority</option>
              <option value="speed">Sort: Fastest Speed</option>
              <option value="score">Sort: Highest Score</option>
              <option value="ssl">Sort: SSL Expiry Date</option>
              <option value="name">Sort: Domain Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pb-1">
          <button
            onClick={() => setFilterService('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterService === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] hover:bg-slate-200 dark:hover:bg-[#253653]'
            }`}
          >
            All Sites ({metrics.total})
          </button>
          <button
            onClick={() => setFilterService('down')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterService === 'down'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
            }`}
          >
            Needs Attention ({metrics.downCount})
          </button>
          <button
            onClick={() => setFilterService('maintenance')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterService === 'maintenance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100'
            }`}
          >
            🛠️ Maintenance ({metrics.maintenanceCount})
          </button>
          <button
            onClick={() => setFilterService('hosting')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterService === 'hosting'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 hover:bg-sky-100'
            }`}
          >
            ☁️ Hosting ({metrics.hostingCount})
          </button>
          <button
            onClick={() => setFilterService('ssl_urgent')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterService === 'ssl_urgent'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            🔒 SSL Due Soon ({metrics.sslUrgentCount})
          </button>
        </div>

        {/* Websites Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2B3B53] text-xs font-semibold text-slate-600 dark:text-[#A8B5C7] uppercase tracking-wider">
                <th className="py-3 px-2.5">Website &amp; Client Domain</th>
                <th className="py-3 px-2.5">Service</th>
                <th className="py-3 px-2.5">Status</th>
                <th className="py-3 px-2.5">Speed</th>
                <th className="py-3 px-2.5">Perf</th>
                <th className="py-3 px-2.5">SEO</th>
                <th className="py-3 px-2.5">SSL Cert</th>
                <th className="py-3 px-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2B3B53]/70 font-normal">
              {filteredWebsites.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 dark:text-[#A8B5C7] text-xs">
                    No websites match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredWebsites.map((site) => {
                  const domain = cleanHostname(site.url);
                  const initials = getDomainInitials(site.url);
                  const palette = getAvatarPalette(site.url);
                  const isMaintenance = site.serviceType === 'maintenance';
                  const cleanTitle = decodeHtmlEntities(site.name) || domain;

                  return (
                    <tr
                      key={site.url}
                      className="hover:bg-blue-50/50 dark:hover:bg-[#1D2B42]/70 transition-colors group"
                    >
                      {/* Website with Domain Lettermark Avatar */}
                      <td className="py-3 px-2.5">
                        <div className="flex items-center gap-2.5 min-w-[165px] max-w-[230px]">
                          <div className={`w-8 h-8 rounded-xl ${palette.bg} ${palette.text} ${palette.border} border flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-[#F1F5F9] truncate text-xs flex items-center gap-1.5">
                              <span className="truncate">{domain}</span>
                              <a
                                href={site.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-500 hover:text-blue-600 dark:text-[#A8B5C7] dark:hover:text-blue-400 transition-colors shrink-0"
                                title="Open website in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] truncate mt-0.5" title={cleanTitle}>
                              {cleanTitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service Package */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                          isMaintenance
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        }`}>
                          {isMaintenance ? '🛠️ Maintenance' : '☁️ Hosting'}
                        </span>
                      </td>

                      {/* Availability Status */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          site.isUp
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${site.isUp ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-600 dark:bg-rose-400 animate-pulse'}`} />
                          <span>{site.isUp ? 'Operational' : `Down (${site.statusCode || 436})`}</span>
                        </span>
                      </td>

                      {/* Response Speed */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-800 dark:text-[#F1F5F9] font-medium">
                          {site.loadTimeMs ? `${(site.loadTimeMs / 1000).toFixed(2)}s` : '—'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7]">
                          {site.loadTimeMs < 4000 ? 'Fast' : site.loadTimeMs < 8000 ? 'Normal' : 'Heavy'}
                        </div>
                      </td>

                      {/* Performance Score */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${
                            (site.performanceScore || 0) >= 80 ? 'text-emerald-700 dark:text-emerald-400' :
                            (site.performanceScore || 0) >= 60 ? 'text-blue-700 dark:text-blue-400' :
                            'text-amber-700 dark:text-amber-400'
                          }`}>
                            {site.performanceScore || '—'}/100
                          </span>
                          {site.grade && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#F1F5F9] font-mono">
                              {site.grade}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SEO Score */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold">
                          {site.seoScore ? `${site.seoScore}/100` : '—'}
                        </span>
                      </td>

                      {/* SSL Certificate */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-[#F1F5F9]">
                          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>
                            {site.sslDaysRemaining ? `${site.sslDaysRemaining}d` : 'Active'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7]">
                          {site.sslIssuer ? site.sslIssuer.split(' ')[0] : 'AutoSSL'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectWebsite(site.url)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-[#1D2B42] dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200/70 dark:border-[#2B3B53] transition-all cursor-pointer shadow-xs"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-[#A8B5C7]">
          <span>Showing {filteredWebsites.length} of {metrics.total} client websites</span>
          <span>Telemetry updated automatically from live monitoring API</span>
        </div>

      </div>

    </div>
  );
}
