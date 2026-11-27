import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  BarChart2, Globe, AlertCircle, AlertTriangle, Activity, CheckCircle2,
  Clock, ShieldAlert, RefreshCw, TrendingUp, Info, Search, Filter,
  Shield, Zap, Lock, Image, FileText, Link2Off, ExternalLink,
  Settings, Eye, XCircle, Mail, Inbox, Send
} from 'lucide-react';
import WebsiteDetail from './WebsiteDetail';

import { API_BASE } from '../apiConfig';

// ── Score badge colour helper ─────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s === null || s === undefined) return 'text-slate-500 dark:text-[#A8B5C7]';
  if (s >= 80) return 'text-emerald-700 dark:text-emerald-400';
  if (s >= 60) return 'text-amber-700 dark:text-amber-400';
  return 'text-rose-700 dark:text-rose-400';
};
const scoreBg = (s) => {
  if (s === null || s === undefined) return 'bg-slate-100 dark:bg-[#1D2B42] border-slate-200 dark:border-[#2B3B53]';
  if (s >= 80) return 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30';
  if (s >= 60) return 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30';
  return 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30';
};

// ── Screenshot thumbnail via Google Favicons + fallback ───────────────────────
const SiteThumbnail = ({ url }) => {
  const [imgErr, setImgErr] = useState(false);
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch (e) {}

  return (
    <div className="relative w-full h-32 bg-slate-100 dark:bg-[#111B2E] overflow-hidden border-b border-slate-200 dark:border-[#2B3B53] flex items-center justify-center">
      {!imgErr ? (
        <img
          src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`}
          alt={hostname}
          className="h-14 w-14 object-contain opacity-90"
          onError={() => setImgErr(true)}
        />
      ) : (
        <Globe className="h-12 w-12 text-slate-400 dark:text-[#A8B5C7]" />
      )}
      {/* Domain label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0B1220]/85 backdrop-blur-xs border-t border-slate-200/70 dark:border-[#2B3B53]/70 px-3 py-1.5">
        <p className="text-[11px] font-mono text-slate-800 dark:text-[#F1F5F9] font-medium truncate">{hostname}</p>
      </div>
    </div>
  );
};

// ── Website card ──────────────────────────────────────────────────────────────
const WebsiteCard = ({ site, onManage }) => {
  const { url, isUp, seoScore, perfScore, secScore, sslDays, sslValid, totalPages, totalImages, brokenLinks, criticalCount, warningCount, loadTimeMs, lastChecked } = site;
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch (e) { hostname = url; }

  const healthScore = seoScore !== null && perfScore !== null && secScore !== null
    ? Math.round((seoScore + perfScore + secScore) / 3)
    : null;

  return (
    <div className={`elevated-card bg-white dark:bg-[#162238] border flex flex-col rounded-2xl overflow-hidden transition-all duration-300 shadow-3d-sm ${!isUp ? 'border-rose-300 dark:border-rose-500/40' : 'border-slate-200/90 dark:border-[#2B3B53]'}`}>

      {/* Thumbnail */}
      <SiteThumbnail url={url} />

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-[#F1F5F9] truncate">{hostname}</p>
            <a href={url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate mt-0.5 transition-colors">
              <ExternalLink className="h-3 w-3 shrink-0" />
              {url.replace(/^https?:\/\//, '').substring(0, 40)}
            </a>
          </div>
          {/* Health badge */}
          {healthScore !== null && (
            <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center border-2 font-medium text-xs ${scoreBg(healthScore)} ${scoreColor(healthScore)}`}>
              {healthScore}
            </div>
          )}
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${isUp ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 animate-pulse'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isUp ? 'ONLINE' : 'DOWN'}
          </span>
          {loadTimeMs > 0 && (
            <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono">{(loadTimeMs / 1000).toFixed(2)}s</span>
          )}
          {lastChecked && (
            <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] ml-auto">{new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>

        {/* Score trio */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'SEO',  value: seoScore,  icon: TrendingUp },
            { label: 'Perf', value: perfScore, icon: Zap },
            { label: 'Sec',  value: secScore,  icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-slate-50 dark:bg-[#1D2B42] rounded-lg p-2 text-center border border-slate-200 dark:border-[#2B3B53]">
              <Icon className={`h-3 w-3 mx-auto mb-0.5 ${scoreColor(value)}`} />
              <p className={`text-sm font-medium ${scoreColor(value)}`}>{value ?? '—'}</p>
              <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] uppercase font-medium tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#A8B5C7]">
            <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{totalPages ?? '—'} pages</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#A8B5C7]">
            <Image className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>{totalImages ?? '—'} images</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link2Off className={`h-3.5 w-3.5 shrink-0 ${brokenLinks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-[#A8B5C7]'}`} />
            <span className={brokenLinks > 0 ? 'text-rose-700 dark:text-rose-400 font-medium' : 'text-slate-600 dark:text-[#A8B5C7]'}>
              {brokenLinks} broken
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className={`h-3.5 w-3.5 shrink-0 ${sslValid ? (sslDays <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-rose-600 dark:text-rose-400'}`} />
            <span className={`${sslValid ? (sslDays <= 7 ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-[#A8B5C7]') : 'text-rose-700 dark:text-rose-400 font-medium'}`}>
              {sslValid ? `${sslDays}d SSL` : 'No SSL'}
            </span>
          </div>
        </div>

        {/* Alert pills */}
        {(criticalCount > 0 || warningCount > 0) && (
          <div className="flex gap-1.5 flex-wrap">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-full text-[11px] font-medium">
                {criticalCount} CRITICAL
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 rounded-full text-[11px] font-medium">
                {warningCount} WARN
              </span>
            )}
          </div>
        )}

        {/* Email alert status */}
        <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-[#2B3B53] text-[11px]">
          <span className="text-slate-600 dark:text-[#A8B5C7] flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email Alerts
          </span>
          {site.emailAlertsEnabled ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {site.alertEmail ? site.alertEmail.split('@')[0] + '…' : 'ON'}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-[#A8B5C7] font-medium">Disabled</span>
          )}
        </div>
        {site.totalEmailsSent > 0 && (
          <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7] -mt-1">
            {site.totalEmailsSent} email{site.totalEmailsSent > 1 ? 's' : ''} sent · last: {site.lastAlertType || '—'}
          </p>
        )}

        {/* Manage button */}
        <button
          onClick={(e) => { e.stopPropagation(); onManage(site); }}
          className="mt-auto w-full h-[40px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 !text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" /> Manage
        </button>
      </div>
    </div>
  );
};
// ── Manage Modal ──────────────────────────────────────────────────────────────
const ManageModal = ({ site, onClose }) => {
  if (!site) return null;
  let hostname = '';
  try { hostname = new URL(site.url).hostname; } catch (e) { hostname = site.url; }

  return createPortal((
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-[#0B1220]/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base">{hostname}</h3>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5 font-mono">{site.url}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-[#1D2B42] hover:bg-slate-200 dark:hover:bg-[#2B3B53] border border-slate-200 dark:border-[#2B3B53] cursor-pointer transition-all">
            <XCircle className="h-4 w-4 text-slate-600 dark:text-[#A8B5C7]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Status',       value: site.isUp ? 'ONLINE' : 'DOWN',   color: site.isUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400' },
            { label: 'Health Score', value: site.seoScore !== null ? Math.round(((site.seoScore || 0) + (site.perfScore || 0) + (site.secScore || 0)) / 3) : '—', color: 'text-blue-700 dark:text-blue-400' },
            { label: 'SEO Score',    value: site.seoScore  ?? '—', color: scoreColor(site.seoScore) },
            { label: 'Perf Score',   value: site.perfScore ?? '—', color: scoreColor(site.perfScore) },
            { label: 'Sec Score',    value: site.secScore  ?? '—', color: scoreColor(site.secScore) },
            { label: 'SSL Days',     value: site.sslValid ? `${site.sslDays} days` : 'Invalid', color: site.sslValid ? (site.sslDays <= 7 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400') : 'text-rose-700 dark:text-rose-400' },
            { label: 'Total Pages',  value: site.totalPages  ?? '—', color: 'text-slate-900 dark:text-[#F1F5F9]' },
            { label: 'Total Images', value: site.totalImages ?? '—', color: 'text-slate-900 dark:text-[#F1F5F9]' },
            { label: 'Broken Links', value: site.brokenLinks,        color: site.brokenLinks > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Load Time',    value: site.loadTimeMs > 0 ? `${(site.loadTimeMs/1000).toFixed(2)}s` : '—', color: 'text-slate-900 dark:text-[#F1F5F9]' },
          ].map(row => (
            <div key={row.label} className="p-3 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl">
              <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">{row.label}</p>
              <p className={`font-medium text-sm ${row.color}`}>{row.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <a href={site.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 h-[40px] bg-slate-100 dark:bg-[#1D2B42] hover:bg-slate-200 dark:hover:bg-[#2B3B53] border border-slate-200 dark:border-[#2B3B53] text-slate-800 dark:text-[#F1F5F9] rounded-xl text-xs font-medium text-center transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" /> Open Site
          </a>
          <button onClick={onClose}
            className="flex-1 h-[40px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 !text-white rounded-xl text-xs font-medium transition-all cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  ), document.body);
};

// ── Main AdminDashboard ───────────────────────────────────────────────────────
export default function AdminDashboard({ adminName = 'SRE Admin', loginTime = 'N/A', onLogout }) {
  const [sites, setSites]           = useState([]);
  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore]   = useState('all');
  const [manageSite, setManageSite] = useState(null);
  const [detailUrl, setDetailUrl]   = useState(null);
  const [totalScans, setTotalScans] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false);

  const fetchEmailHistory = async () => {
    setEmailHistoryLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/email-history`).catch(() => ({ data: [] }));
      setEmailHistory(resp.data || []);
    } catch (e) {}
    finally { setEmailHistoryLoading(false); }
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [targetsResp, alertsResp] = await Promise.all([
        axios.get(`${API_BASE}/targets`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/alerts`).catch(() =>  ({ data: [] })),
      ]);

      const targets = targetsResp.data || [];
      const allAlerts = alertsResp.data || [];
      setAlerts(allAlerts);

      // Fetch detailed stats for every target in parallel (cap at 20 for speed)
      const top = targets.slice(0, 20);
      const [statsResults, emailConfigs] = await Promise.all([
        Promise.allSettled(
          top.map(t => axios.get(`${API_BASE}/stats?url=${encodeURIComponent(t.url)}`).catch(() => null))
        ),
        Promise.allSettled(
          top.map(t => axios.get(`${API_BASE}/email-config?url=${encodeURIComponent(t.url)}`).catch(() => null))
        ),
      ]);

      let scanCount = 0;
      const enriched = top.map((t, i) => {
        const res = statsResults[i];
        const data = res?.status === 'fulfilled' ? res.value?.data : null;
        const latest = data?.latestStatus;
        const seo     = latest?.seo     || {};
        const perf    = latest?.performance || {};
        const sec     = latest?.security   || {};

        scanCount += data?.totalChecks || 0;

        // Email config for this site
        const emailRes = emailConfigs[i];
        const emailCfg = emailRes?.status === 'fulfilled' ? emailRes.value?.data : null;

        // Alerts for this URL
        const urlAlerts = allAlerts.filter(a => a.url === t.url && !a.resolved);
        const critCount = urlAlerts.filter(a => a.level === 'critical').length;
        const warnCount = urlAlerts.filter(a => a.level === 'warning').length;

        // Page/image data from pageAnalysis
        const pa = latest?.pageAnalysis || {};
        const swi = pa?.siteWideImages || null;
        const malware = latest?.malware || { status: 'unknown', findings: [] };

        return {
          url:          t.url,
          isUp:         t.isUp,
          loadTimeMs:   latest?.loadTimeMs  || 0,
          lastChecked:  latest?.checkedAt   || t.checkedAt,
          seoScore:     seo.seoScore        ?? null,
          perfScore:    perf.performanceScore ?? null,
          secScore:     sec.securityScore   ?? null,
          sslValid:     latest?.ssl?.valid  ?? false,
          sslDays:      latest?.ssl?.daysRemaining ?? 0,
          sslIssuer:    latest?.ssl?.issuer ?? 'unknown',
          totalPages:   pa?.pageCount?.estimatedPages ?? null,
          totalImages:  swi ? swi.totalImages : (seo.imageAnalysis?.totalImages ?? null),
          brokenLinks:  seo.links?.brokenCount ?? 0,
          criticalCount: critCount,
          warningCount:  warnCount,
          totalChecks:  data?.totalChecks || 0,
          uptimePct:    data?.uptimePercentage ?? null,
          emailAlertsEnabled: emailCfg?.alertsEnabled || false,
          alertEmail:   emailCfg?.alertEmail || '',
          lastEmailSent: emailCfg?.lastEmailSent || null,
          totalEmailsSent: emailCfg?.totalEmailsSent || 0,
          lastAlertType: emailCfg?.lastAlertType || '',
          malwareStatus:   malware.status || 'unknown',
          malwareFindings: (malware.findings || []).length,
          malwareScore:    malware.score ?? null,
        };
      });

      setTotalScans(scanCount);
      setSites(enriched);
    } catch (err) {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); fetchEmailHistory(); }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const upSites        = sites.filter(s => s.isUp).length;
  const downSites      = sites.filter(s => !s.isUp).length;
  const criticalAlerts = alerts.filter(a => a.level === 'critical' && !a.resolved).length;
  const warningAlerts  = alerts.filter(a => a.level === 'warning'  && !a.resolved).length;
  const emailEnabled   = sites.filter(s => s.emailAlertsEnabled).length;
  const totalEmailsSent = sites.reduce((sum, s) => sum + (s.totalEmailsSent || 0), 0);

  // Aggregate cross-site totals for Feature 4
  const totalPagesAll    = sites.reduce((sum, s) => sum + (s.totalPages  || 0), 0);
  const totalImagesAll   = sites.reduce((sum, s) => sum + (s.totalImages || 0), 0);
  const totalBrokenAll   = sites.reduce((sum, s) => sum + (s.brokenLinks || 0), 0);
  const totalActiveAlerts = alerts.filter(a => !a.resolved).length;
  const recentUrls       = [...new Map(alerts.map(a => [a.url, a])).values()].slice(0, 5);
  const recentWarnings   = alerts.filter(a => a.level === 'warning'  && !a.resolved).slice(0, 5);
  const recentSeoIssues  = alerts.filter(a => a.category === 'seo'   && !a.resolved).slice(0, 5);
  const recentSslAlerts  = alerts.filter(a => a.category === 'ssl'   && !a.resolved).slice(0, 5);

  // Feature 5 — extra derived stats
  const totalMalwareWarnings = sites.filter(s => s.malwareStatus === 'suspicious' || s.malwareStatus === 'malware').length;
  const totalSeoIssues       = alerts.filter(a => a.category === 'seo' && !a.resolved).length;
  const totalSslAlerts       = alerts.filter(a => a.category === 'ssl' && !a.resolved).length;
  const totalActiveEmails    = sites.filter(s => s.emailAlertsEnabled).length;

  // Calculate Last Scan Time across all monitored targets
  const lastScanTime = useMemo(() => {
    if (sites.length === 0) return '—';
    const times = sites.map(s => s.lastChecked ? new Date(s.lastChecked).getTime() : 0).filter(t => t > 0);
    if (times.length === 0) return '—';
    return new Date(Math.max(...times)).toLocaleTimeString();
  }, [sites]);

  // Distribution charts data
  const seoHealthData = [
    { name: 'Good (80+)',    value: sites.filter(s => (s.seoScore || 0) >= 80).length,                                       color: '#10b981' },
    { name: 'Fair (60–79)', value: sites.filter(s => (s.seoScore || 0) >= 60 && (s.seoScore || 0) < 80).length,              color: '#f59e0b' },
    { name: 'Poor (<60)',   value: sites.filter(s => s.seoScore !== null && (s.seoScore || 0) < 60).length,                   color: '#ef4444' },
    { name: 'No Data',      value: sites.filter(s => s.seoScore === null).length,                                             color: '#475569' },
  ].filter(d => d.value > 0);

  const sslStatusData = [
    { name: 'Valid (>30d)',  value: sites.filter(s => s.sslValid && s.sslDays > 30).length,                color: '#10b981' },
    { name: 'Expiring',     value: sites.filter(s => s.sslValid && s.sslDays <= 30 && s.sslDays > 7).length, color: '#f59e0b' },
    { name: 'Critical',     value: sites.filter(s => s.sslValid && s.sslDays <= 7).length,                 color: '#ef4444' },
    { name: 'Invalid',      value: sites.filter(s => !s.sslValid).length,                                  color: '#6b7280' },
  ].filter(d => d.value > 0);

  const malwareStatusData = [
    { name: 'Clean',      value: sites.filter(s => s.malwareStatus === 'clean').length,      color: '#10b981' },
    { name: 'Suspicious', value: sites.filter(s => s.malwareStatus === 'suspicious').length, color: '#f59e0b' },
    { name: 'Malware',    value: sites.filter(s => s.malwareStatus === 'malware').length,    color: '#ef4444' },
    { name: 'Unknown',    value: sites.filter(s => !s.malwareStatus || s.malwareStatus === 'unknown').length, color: '#475569' },
  ].filter(d => d.value > 0);

  const perfScoreData = sites
    .filter(s => s.perfScore !== null)
    .map(s => ({ name: new URL(s.url).hostname.substring(0, 16), score: s.perfScore || 0 }))
    .slice(0, 8);

  // ── Filters + search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return sites.filter(s => {
      const health = s.seoScore !== null ? Math.round(((s.seoScore || 0) + (s.perfScore || 0) + (s.secScore || 0)) / 3) : null;
      if (filterStatus === 'up'   && !s.isUp) return false;
      if (filterStatus === 'down' &&  s.isUp) return false;
      if (filterScore === 'good' && (health === null || health < 80)) return false;
      if (filterScore === 'warn' && (health === null || health < 60 || health >= 80)) return false;
      if (filterScore === 'poor' && (health === null || health >= 60)) return false;
      if (search) {
        const q = search.toLowerCase();
        try { if (!new URL(s.url).hostname.includes(q) && !s.url.includes(q)) return false; }
        catch (e) { if (!s.url.toLowerCase().includes(q)) return false; }
      }
      return true;
    });
  }, [sites, filterStatus, filterScore, search]);

  // ── Trend chart data (alert counts by category) ────────────────────────────
  const categoryTrend = useMemo(() => {
    const cats = ['uptime', 'ssl', 'seo', 'wordpress', 'security', 'performance'];
    return cats.map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      active:   alerts.filter(a => a.category === cat && !a.resolved).length,
      resolved: alerts.filter(a => a.category === cat &&  a.resolved).length,
    })).filter(c => c.active + c.resolved > 0);
  }, [alerts]);

  // ── Pie chart: up vs down ──────────────────────────────────────────────────
  const pieData = [
    { name: 'Online',  value: upSites,   color: '#10b981' },
    { name: 'Offline', value: downSites, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // ── Recent activity ────────────────────────────────────────────────────────
  const recentActivity = useMemo(() =>
    [...alerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [alerts]
  );

  const CAT_LABEL = { uptime: 'Uptime', ssl: 'SSL', seo: 'SEO', wordpress: 'WordPress', security: 'Security', performance: 'Performance' };

  if (loading) return (
    <div className="py-20 text-center animate-fade-in-up">
      <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 rotate-infinite mx-auto mb-4" />
      <p className="text-slate-700 dark:text-[#F1F5F9] font-medium text-sm">Loading admin dashboard...</p>
      <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7] mt-1">Fetching stats for all monitored sites</p>
    </div>
  );

  if (error) return (
    <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-10 text-center max-w-2xl mx-auto my-6">
      <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
      <p className="text-rose-700 dark:text-rose-400 font-medium text-sm">{error}</p>
      <button onClick={fetchAll} className="mt-4 px-4 h-[40px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 !text-white rounded-xl text-xs font-medium cursor-pointer transition-all">
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 elevated-card bg-white dark:bg-[#162238] p-5 rounded-2xl border border-slate-200/90 dark:border-[#2B3B53] shadow-3d-sm">
        <div>
          <h2 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-xl flex items-center gap-2">
            <BarChart2 className="text-blue-600 dark:text-blue-400 h-6 w-6" /> Admin Dashboard
          </h2>
          <div className="flex flex-col gap-1 mt-1.5 text-xs text-slate-600 dark:text-[#A8B5C7] font-medium">
            <p>
              Welcome, <strong className="text-blue-700 dark:text-blue-400 font-medium">{adminName}</strong> · 
              Session started at <span className="font-mono text-slate-800 dark:text-[#F1F5F9]">{loginTime}</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">
              Total Websites: <span className="text-slate-800 dark:text-[#F1F5F9] font-medium">{sites.length}</span> · 
              Active Alerts: <span className="text-rose-700 dark:text-rose-400 font-medium">{totalActiveAlerts}</span> · 
              Last Scan Time: <span className="text-slate-800 dark:text-[#F1F5F9] font-medium">{lastScanTime}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={fetchAll}
            className="flex items-center gap-1.5 px-4 h-[40px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 !text-white rounded-xl text-xs font-medium cursor-pointer transition-all shadow-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh All
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-4 h-[40px] bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400 !text-white rounded-xl text-xs font-medium cursor-pointer transition-all shadow-sm">
            Logout
          </button>
        </div>
      </div>

      {/* ── KPI Overview Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Websites',    value: sites.length,    sub: `${upSites} online · ${downSites} down`,             icon: Globe,        color: 'text-blue-700 dark:text-blue-400',  iconBg: 'bg-blue-50 dark:bg-blue-500/15' },
          { label: 'Active Websites',   value: upSites,         sub: `${Math.round((upSites / Math.max(sites.length, 1)) * 100)}% availability`, icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-500/15' },
          { label: 'Critical Alerts',   value: criticalAlerts,  sub: `${warningAlerts} warnings`,                          icon: ShieldAlert,  color: criticalAlerts > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-[#A8B5C7]', iconBg: criticalAlerts > 0 ? 'bg-rose-50 dark:bg-rose-500/15' : 'bg-slate-100 dark:bg-[#1D2B42]' },
          { label: 'Total Scans',       value: totalScans,      sub: 'across all sites',                                   icon: Activity,     color: 'text-blue-700 dark:text-blue-400',  iconBg: 'bg-blue-50 dark:bg-blue-500/15' },
          { label: 'Email Alerts On',   value: emailEnabled,    sub: `${sites.length - emailEnabled} disabled`,            icon: Mail,         color: 'text-sky-700 dark:text-sky-400',     iconBg: 'bg-sky-50 dark:bg-sky-500/15' },
          { label: 'Emails Sent',       value: totalEmailsSent, sub: emailHistory.length > 0 ? `last: ${new Date(emailHistory[0]?.sentAt).toLocaleDateString()}` : 'no history', icon: Send, color: 'text-emerald-700 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-500/15' },
        ].map(kpi => (
          <div key={kpi.label} className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 flex flex-col justify-between shadow-3d-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">{kpi.label}</span>
              <div className={`${kpi.iconBg} p-1.5 rounded-lg`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <h2 className={`text-3xl font-medium tracking-tight ${kpi.color}`}>{kpi.value}</h2>
              <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── KPI Row 2: Site totals ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages Monitored',    value: totalPagesAll,    sub: 'across all websites',     icon: FileText,  color: 'text-blue-700 dark:text-blue-400',  iconBg: 'bg-blue-50 dark:bg-blue-500/15' },
          { label: 'Total Images Discovered',  value: totalImagesAll,   sub: 'site-wide crawl total',   icon: Image,     color: 'text-sky-700 dark:text-sky-400',    iconBg: 'bg-sky-50 dark:bg-sky-500/15' },
          { label: 'Total Broken Links',       value: totalBrokenAll,   sub: totalBrokenAll > 0 ? 'need fixing' : 'all healthy', icon: Link2Off, color: totalBrokenAll > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400', iconBg: totalBrokenAll > 0 ? 'bg-rose-50 dark:bg-rose-500/15' : 'bg-emerald-50 dark:bg-emerald-500/15' },
          { label: 'Active Alerts',            value: totalActiveAlerts, sub: `${criticalAlerts} critical`, icon: AlertTriangle, color: totalActiveAlerts > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-[#A8B5C7]', iconBg: 'bg-amber-50 dark:bg-amber-500/15' },
        ].map(kpi => (
          <div key={kpi.label} className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 flex flex-col justify-between shadow-3d-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">{kpi.label}</span>
              <div className={`${kpi.iconBg} p-1.5 rounded-lg`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <h2 className={`text-3xl font-medium tracking-tight ${kpi.color}`}>{kpi.value}</h2>
              <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity Panels ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent URLs scanned */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
            <Globe className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Recently Scanned URLs
          </h3>
          {recentUrls.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-[#A8B5C7] italic">No URLs scanned yet.</p>
          ) : (
            <div className="space-y-1.5">
              {recentUrls.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-lg">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${a.resolved ? 'bg-slate-400 dark:bg-slate-600' : 'bg-blue-600 dark:bg-blue-400 animate-pulse'}`} />
                  <span className="text-[11px] text-slate-800 dark:text-[#F1F5F9] font-mono truncate flex-1">{a.url?.replace(/^https?:\/\//, '') || '—'}</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7]">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Warnings */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 h-4 w-4" /> Recent Warnings
            {recentWarnings.length > 0 && <span className="ml-auto text-[11px] font-medium text-amber-700 dark:text-amber-400">{recentWarnings.length}</span>}
          </h3>
          {recentWarnings.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> No active warnings.
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentWarnings.map((a, i) => (
                <div key={i} className="p-2.5 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-[11px]">
                  <p className="text-amber-800 dark:text-amber-300 truncate">{a.message}</p>
                  <p className="text-slate-600 dark:text-[#A8B5C7] font-mono mt-0.5 truncate">{a.url?.replace(/^https?:\/\//, '')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent SEO Issues */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Recent SEO Issues
            {recentSeoIssues.length > 0 && <span className="ml-auto text-[11px] font-medium text-blue-700 dark:text-blue-400">{recentSeoIssues.length}</span>}
          </h3>
          {recentSeoIssues.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> No active SEO issues.
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentSeoIssues.map((a, i) => (
                <div key={i} className="p-2.5 bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-[11px]">
                  <p className="text-blue-800 dark:text-blue-300 truncate">{a.message}</p>
                  <p className="text-slate-600 dark:text-[#A8B5C7] font-mono mt-0.5 truncate">{a.url?.replace(/^https?:\/\//, '')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent SSL Alerts */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
            <Shield className="text-sky-600 dark:text-sky-400 h-4 w-4" /> Recent SSL Alerts
            {recentSslAlerts.length > 0 && <span className="ml-auto text-[11px] font-medium text-sky-700 dark:text-sky-400">{recentSslAlerts.length}</span>}
          </h3>
          {recentSslAlerts.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> No active SSL alerts.
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentSslAlerts.map((a, i) => (
                <div key={i} className={`p-2.5 border rounded-lg text-[11px] ${a.level === 'critical' ? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' : 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'}`}>
                  <p className={`truncate ${a.level === 'critical' ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>{a.message}</p>
                  <p className="text-slate-600 dark:text-[#A8B5C7] font-mono mt-0.5 truncate">{a.url?.replace(/^https?:\/\//, '')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      {(categoryTrend.length > 0 || pieData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Alert trend bar chart */}
          {categoryTrend.length > 0 && (
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 md:col-span-2 shadow-3d-sm">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Alert Distribution by Category
              </h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={categoryTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminActiveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="adminResolvedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? '#2B3B53' : '#E2E8F0'} strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke={isDarkTheme ? '#A8B5C7' : '#475569'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDarkTheme ? '#A8B5C7' : '#475569'} fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDarkTheme ? '#162238' : '#FFFFFF', borderColor: isDarkTheme ? '#2B3B53' : '#E2E8F0', borderRadius: '10px', color: isDarkTheme ? '#F1F5F9' : '#0F172A', fontSize: '12px' }}
                      itemStyle={{ color: isDarkTheme ? '#F1F5F9' : '#0F172A' }}
                    />
                    <Area type="monotone" dataKey="active"   stroke="#ef4444" strokeWidth={2} fill="url(#adminActiveGrad)"   name="Active" />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#adminResolvedGrad)" name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pie: up vs down */}
          {pieData.length > 0 && (
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 flex flex-col items-center justify-center shadow-3d-sm">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 w-full flex items-center gap-2">
                <Activity className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Site Status
              </h3>
              <PieChart width={140} height={140}>
                <Pie data={pieData} cx={70} cy={70} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} sites`, n]}
                  contentStyle={{ backgroundColor: isDarkTheme ? '#162238' : '#FFFFFF', borderColor: isDarkTheme ? '#2B3B53' : '#E2E8F0', borderRadius: '8px', color: isDarkTheme ? '#F1F5F9' : '#0F172A', fontSize: '12px' }}
                  itemStyle={{ color: isDarkTheme ? '#F1F5F9' : '#0F172A' }}
                />
              </PieChart>
              <div className="flex gap-4 text-[11px] mt-1">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 dark:text-[#A8B5C7]">{d.name}: <strong style={{ color: d.color }}>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Search + Filter Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex items-center flex-1 min-w-48">
          <Search className="absolute left-3 text-slate-500 dark:text-[#A8B5C7] h-4 w-4" />
          <input
            type="text"
            placeholder="Search websites..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-[42px] bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl pl-9 pr-8 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 text-slate-500 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-[#F1F5F9] cursor-pointer">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500 dark:text-[#A8B5C7]" />
          {[['all','All'],['up','Online'],['down','Down']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 h-[42px] rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                filterStatus === v ? 'bg-blue-600 dark:bg-blue-500 !text-white border-blue-600 dark:border-blue-500 shadow-xs' : 'bg-white dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border-slate-200 dark:border-[#2B3B53] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
              }`}>{l}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[['all','All Health'],['good','Good (80+)'],['warn','Fair (60–79)'],['poor','Poor (<60)']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterScore(v)}
              className={`px-3 h-[42px] rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                filterScore === v ? 'bg-blue-600 dark:bg-blue-500 !text-white border-blue-600 dark:border-blue-500 shadow-xs' : 'bg-white dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border-slate-200 dark:border-[#2B3B53] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
              }`}>{l}</button>
          ))}
        </div>

        <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium ml-auto">{filtered.length} of {sites.length} sites</span>
      </div>

      {/* ── Website Card Grid ─────────────────────────────────────────────── */}
      {sites.length === 0 ? (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-12 text-center shadow-3d-sm">
          <Globe className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h4 className="text-slate-900 dark:text-[#F1F5F9] font-medium">No Websites Monitored Yet</h4>
          <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2">Enter a URL in the top bar and click <strong className="text-blue-700 dark:text-blue-400">Run Scan</strong> to add a website.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-10 text-center shadow-3d-sm">
          <Search className="h-8 w-8 text-slate-400 dark:text-[#A8B5C7] mx-auto mb-3" />
          <p className="text-slate-700 dark:text-[#F1F5F9] font-medium text-sm">No websites match your filters.</p>
          <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterScore('all'); }}
            className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((site, idx) => (
            <div key={idx} className="cursor-pointer" onClick={() => setDetailUrl(site.url)}>
              <WebsiteCard site={site} onManage={(s) => { setManageSite(s); }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      {recentActivity.length > 0 && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-4 flex items-center gap-2">
            <Clock className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Recent Activity
            <span className="ml-auto text-[11px] text-slate-500 dark:text-[#A8B5C7] font-medium">Last 8 events</span>
          </h3>
          <div className="space-y-2">
            {recentActivity.map((alert, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                alert.level === 'critical' ? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300' :
                alert.level === 'warning'  ? 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300' :
                                             'bg-blue-50/70 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300'}`}>
                {alert.level === 'critical' ? <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" /> :
                 alert.level === 'warning'  ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" /> :
                                              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-medium uppercase text-[11px] tracking-wider">{alert.level}</span>
                    <span className="text-[11px] font-medium opacity-75">{CAT_LABEL[alert.category] || alert.category}</span>
                    <span className="text-[11px] opacity-75 ml-auto">{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="leading-relaxed truncate">{alert.message}</p>
                  <p className="text-[11px] opacity-75 mt-0.5 font-mono truncate">{alert.url}</p>
                </div>
                {alert.resolved && (
                  <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-full">RESOLVED</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Email Alert History ───────────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
            <Inbox className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Email Alert History
            <span className="ml-2 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-full text-[11px] font-medium">{emailHistory.length} records</span>
          </h3>
          <button onClick={fetchEmailHistory} className="flex items-center gap-1.5 px-3 h-[36px] bg-slate-100 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl text-[11px] font-medium text-slate-700 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-[#F1F5F9] cursor-pointer transition-all">
            <RefreshCw className={`h-3.5 w-3.5 ${emailHistoryLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {emailHistoryLoading ? (
          <div className="py-8 text-center">
            <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 rotate-infinite mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7]">Loading email history...</p>
          </div>
        ) : emailHistory.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-[#2B3B53] rounded-xl bg-slate-50 dark:bg-[#1D2B42]/40 flex flex-col items-center gap-2">
            <Inbox className="h-7 w-7 text-slate-400 dark:text-[#A8B5C7]" />
            <p className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium">No email alerts have been sent yet.</p>
            <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7]">Configure email alerts in the Email Alerts tab and run a scan to trigger notifications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#2B3B53]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0">
                <tr className="border-b border-slate-200 dark:border-[#2B3B53] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider text-[11px] bg-slate-50 dark:bg-[#111B2E]">
                  <th className="py-2.5 px-3">Sent At</th>
                  <th className="py-2.5 px-3">Website</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3 text-center">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {emailHistory.map((entry, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50/80 dark:hover:bg-[#1D2B42]/60 transition-all">
                    <td className="py-2.5 px-3 text-slate-600 dark:text-[#A8B5C7] font-mono text-[11px] whitespace-nowrap">
                      {new Date(entry.sentAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-blue-700 dark:text-blue-400 font-mono text-[11px] max-w-[140px] truncate" title={entry.url}>
                      {entry.url?.replace(/^https?:\/\//, '') || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-[#A8B5C7] font-mono text-[11px] max-w-[120px] truncate">{entry.alertEmail}</td>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-[#F1F5F9] text-[11px] max-w-[200px] truncate" title={entry.subject}>{entry.subject}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53] rounded text-[11px] font-medium uppercase">{entry.alertType}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        entry.level === 'critical' ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' :
                        entry.level === 'warning'  ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' :
                                                     'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                      }`}>
                        {entry.level?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {entry.delivered
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        : <AlertCircle  className="h-3.5 w-3.5 text-slate-500 dark:text-[#A8B5C7] mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Malware Detection Dashboard ──────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
        <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
          <Shield className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Malware Detection Overview
          <span className="ml-auto text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium">{sites.length} sites scanned</span>
        </h3>

        {/* Malware KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Clean Sites',     value: sites.filter(s => s.malwareStatus === 'clean').length,      color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
            { label: 'Suspicious',      value: sites.filter(s => s.malwareStatus === 'suspicious').length, color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'   },
            { label: 'Malware Found',   value: sites.filter(s => s.malwareStatus === 'malware').length,    color: 'text-rose-700 dark:text-rose-400',    bg: 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'     },
            { label: 'Not Scanned',     value: sites.filter(s => !s.malwareStatus || s.malwareStatus === 'unknown').length, color: 'text-slate-700 dark:text-[#A8B5C7]', bg: 'bg-slate-50 dark:bg-[#1D2B42] border-slate-200 dark:border-[#2B3B53]' },
          ].map(k => (
            <div key={k.label} className={`p-4 rounded-xl border text-center ${k.bg}`}>
              <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">{k.label}</p>
              <p className={`text-2xl font-medium ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Per-site malware status table */}
        {sites.filter(s => s.malwareStatus && s.malwareStatus !== 'clean').length > 0 ? (
          <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#2B3B53]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0">
                <tr className="border-b border-slate-200 dark:border-[#2B3B53] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider text-[11px] bg-slate-50 dark:bg-[#111B2E]">
                  <th className="py-2.5 px-3">Website</th>
                  <th className="py-2.5 px-3">Malware Status</th>
                  <th className="py-2.5 px-3 text-center">Findings</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sites.filter(s => s.malwareStatus && s.malwareStatus !== 'clean' && s.malwareStatus !== 'unknown').map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50/80 dark:hover:bg-[#1D2B42]/60 transition-all">
                    <td className="py-2.5 px-3 font-mono text-blue-700 dark:text-blue-400 text-[11px] max-w-[160px] truncate">
                      {s.url.replace(/^https?:\/\//, '')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        s.malwareStatus === 'malware' ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {s.malwareStatus === 'malware' ? '❌ Malware Detected' : '⚠ Suspicious'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-rose-700 dark:text-rose-400 font-medium">{s.malwareFindings}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-medium ${(s.malwareScore || 0) >= 60 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {s.malwareScore ?? '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => setDetailUrl(s.url)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 !text-white rounded-lg text-[11px] font-medium cursor-pointer transition-all">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {sites.length === 0 ? 'No sites scanned yet.' : 'All scanned websites are clean — no malware or suspicious code detected.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Distribution Charts ───────────────────────────────────────────── */}
      {sites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* SEO Health Distribution */}
          {seoHealthData.length > 0 && (
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="text-blue-600 dark:text-blue-400 h-4 w-4" /> SEO Health Distribution
              </h3>
              <PieChart width={160} height={140}>
                <Pie data={seoHealthData} cx={80} cy={70} innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {seoHealthData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} sites`, n]}
                  contentStyle={{ backgroundColor: isDarkTheme ? '#162238' : '#FFFFFF', borderColor: isDarkTheme ? '#2B3B53' : '#E2E8F0', borderRadius: '8px', color: isDarkTheme ? '#F1F5F9' : '#0F172A', fontSize: '12px' }}
                  itemStyle={{ color: isDarkTheme ? '#F1F5F9' : '#0F172A' }}
                />
              </PieChart>
              <div className="flex flex-wrap gap-2 mt-1">
                {seoHealthData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-[#A8B5C7]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name}: <strong style={{ color: d.color }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SSL Status Distribution */}
          {sslStatusData.length > 0 && (
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
                <Lock className="text-blue-600 dark:text-blue-400 h-4 w-4" /> SSL Status Distribution
              </h3>
              <PieChart width={160} height={140}>
                <Pie data={sslStatusData} cx={80} cy={70} innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {sslStatusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} sites`, n]}
                  contentStyle={{ backgroundColor: isDarkTheme ? '#162238' : '#FFFFFF', borderColor: isDarkTheme ? '#2B3B53' : '#E2E8F0', borderRadius: '8px', color: isDarkTheme ? '#F1F5F9' : '#0F172A', fontSize: '12px' }}
                  itemStyle={{ color: isDarkTheme ? '#F1F5F9' : '#0F172A' }}
                />
              </PieChart>
              <div className="flex flex-wrap gap-2 mt-1">
                {sslStatusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-[#A8B5C7]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name}: <strong style={{ color: d.color }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Malware Status Distribution */}
          {malwareStatusData.length > 0 && (
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
                <Shield className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Malware Status Distribution
              </h3>
              <PieChart width={160} height={140}>
                <Pie data={malwareStatusData} cx={80} cy={70} innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {malwareStatusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} sites`, n]}
                  contentStyle={{ backgroundColor: isDarkTheme ? '#162238' : '#FFFFFF', borderColor: isDarkTheme ? '#2B3B53' : '#E2E8F0', borderRadius: '8px', color: isDarkTheme ? '#F1F5F9' : '#0F172A', fontSize: '12px' }}
                  itemStyle={{ color: isDarkTheme ? '#F1F5F9' : '#0F172A' }}
                />
              </PieChart>
              <div className="flex flex-wrap gap-2 mt-1">
                {malwareStatusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-[#A8B5C7]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name}: <strong style={{ color: d.color }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Score Bar Chart */}
      {perfScoreData.length > 0 && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-4 flex items-center gap-2">
            <Zap className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Performance Scores — All Sites
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfScoreData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? '#2B3B53' : '#E2E8F0'} strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke={isDarkTheme ? '#A8B5C7' : '#475569'} fontSize={11} tickLine={false} angle={-20} textAnchor="end" />
                <YAxis stroke={isDarkTheme ? '#A8B5C7' : '#475569'} fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDarkTheme ? '#162238' : '#FFFFFF', borderColor: isDarkTheme ? '#2B3B53' : '#E2E8F0', borderRadius: '8px', color: isDarkTheme ? '#F1F5F9' : '#0F172A', fontSize: '12px' }}
                  itemStyle={{ color: isDarkTheme ? '#F1F5F9' : '#0F172A' }}
                />
                <Bar dataKey="score" name="Performance Score" radius={[4, 4, 0, 0]}>
                  {perfScoreData.map((d, i) => (
                    <Cell key={i} fill={d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Image Optimization Dashboard ─────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
        <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
          <Image className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Image Optimization Overview
        </h3>

        {/* Image KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Images',         value: totalImagesAll,  color: 'text-slate-900 dark:text-[#F1F5F9]',   sub: 'across all sites' },
            { label: 'With ALT Text',         value: sites.reduce((s, site) => s + (site.totalImages && site.totalImages > 0 ? Math.round((site.totalImages - (site.brokenLinks || 0)) * 0.7) : 0), 0), color: 'text-emerald-700 dark:text-emerald-400', sub: 'estimated' },
            { label: 'Total Pages Monitored', value: totalPagesAll,   color: 'text-blue-700 dark:text-blue-400',  sub: 'pages discovered' },
            { label: 'Broken Links',          value: totalBrokenAll,  color: totalBrokenAll > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400', sub: totalBrokenAll > 0 ? 'need fixing' : 'all healthy' },
          ].map(k => (
            <div key={k.label} className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200 dark:border-[#2B3B53] text-center">
              <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider mb-1">{k.label}</p>
              <p className={`text-2xl font-medium ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7] mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Optimization recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: '🔄', title: 'Convert to WebP / AVIF',       desc: 'Modern formats are 25–35% smaller. Use Squoosh or sharp to batch convert.' },
            { icon: '⏳', title: 'Enable Lazy Loading',            desc: 'Add loading="lazy" to below-fold images to improve initial page load.' },
            { icon: '📐', title: 'Add Width & Height Attributes',  desc: 'Set explicit dimensions on every image to prevent layout shift (CLS).' },
            { icon: '🗜',  title: 'Compress Before Upload',        desc: 'Run images through TinyPNG or ImageOptim. Target < 200KB per image.' },
          ].map((r, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl">
              <span className="text-lg shrink-0">{r.icon}</span>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9]">{r.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Extra KPI cards: malware warnings + SEO issues + SSL alerts + emails ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Malware Warnings',      value: totalMalwareWarnings, sub: 'sites with issues', color: totalMalwareWarnings > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400', iconBg: totalMalwareWarnings > 0 ? 'bg-rose-50 dark:bg-rose-500/15' : 'bg-emerald-50 dark:bg-emerald-500/15', icon: Shield },
          { label: 'SEO Issues',            value: totalSeoIssues,       sub: 'active alerts',     color: totalSeoIssues > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400',       iconBg: 'bg-amber-50 dark:bg-amber-500/15',   icon: TrendingUp },
          { label: 'SSL Alerts',            value: totalSslAlerts,       sub: 'expiry warnings',   color: totalSslAlerts > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400',        iconBg: 'bg-sky-50 dark:bg-sky-500/15',     icon: Lock },
          { label: 'Active Email Alerts',   value: totalActiveEmails,    sub: 'sites configured',  color: 'text-sky-700 dark:text-sky-400',                                                    iconBg: 'bg-sky-50 dark:bg-sky-500/15',     icon: Mail },
        ].map(kpi => (
          <div key={kpi.label} className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 flex flex-col justify-between shadow-3d-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider">{kpi.label}</span>
              <div className={`${kpi.iconBg} p-1.5 rounded-lg`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <h2 className={`text-3xl font-medium tracking-tight ${kpi.color}`}>{kpi.value}</h2>
              <p className="text-[11px] mt-1 font-medium text-slate-600 dark:text-[#A8B5C7]">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Modal */}
      {manageSite && <ManageModal site={manageSite} onClose={() => setManageSite(null)} />}

      {/* Website Detail Modal */}
      {detailUrl && <WebsiteDetail url={detailUrl} onClose={() => setDetailUrl(null)} />}

    </div>
  );
}
