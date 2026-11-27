import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Globe, AlertTriangle, CheckCircle2, XCircle, Clock,
  Calendar, RefreshCw, Bell, Shield, TrendingDown, Info, Loader2, Mail, Check, AlertCircle
} from 'lucide-react';
import { API_BASE } from '../apiConfig';

// ── Domain Expiry dashboard components ──────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────
const getDaysRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
};

const getStatus = (days) => {
  if (days < 0)  return { label: 'Expired',         color: 'red',    level: 'critical' };
  if (days < 30) return { label: 'Expiring Soon',   color: 'orange', level: 'high' };
  if (days < 60) return { label: 'Expiring Soon',   color: 'yellow', level: 'medium' };
  return           { label: 'Active',               color: 'green',  level: 'ok' };
};

const statusStyles = {
  green:  { badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', bar: 'bg-emerald-500', icon: CheckCircle2, label: 'Active' },
  yellow: { badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',       bar: 'bg-amber-500',   icon: Clock,         label: 'Expiring Soon' },
  orange: { badge: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800', bar: 'bg-orange-500',  icon: AlertTriangle, label: 'Action Needed' },
  red:    { badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800',             bar: 'bg-rose-500',    icon: AlertCircle,   label: 'Expired' },
};

const formatDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

// ── Alert History mock ────────────────────────────────────────────────────────
const ALERT_HISTORY = [
  { id: 1, domain: 'mysite.net',    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), threshold: 30,  status: 'sent' },
  { id: 2, domain: 'example.com',   sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), threshold: 60,  status: 'sent' },
  { id: 3, domain: 'oldproject.io', sentAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), threshold: 0, status: 'sent' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function DomainExpiryDashboard({ isDark, url }) {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showAlertHistory, setShowAlertHistory] = useState(false);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emailConfig, setEmailConfig] = useState(null);
  const [realAlertHistory, setRealAlertHistory] = useState([]);
  const [mailRecords, setMailRecords] = useState(null);
  const [mailLoading, setMailLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setMailLoading(true);
        let baseDomain = '';
        try {
          const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
          const parts = parsed.hostname.split('.');
          if (parts.length > 2) {
             baseDomain = parts.slice(-2).join('.');
          } else {
             baseDomain = parsed.hostname;
          }
        } catch(e) { baseDomain = url; }
        
        const [wRes, confRes, histRes, mailRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/whois?domain=${baseDomain}`),
          axios.get(`${API_BASE}/email-config?url=${encodeURIComponent(url)}`),
          axios.get(`${API_BASE}/email-history?url=${encodeURIComponent(url)}`),
          axios.get(`${API_BASE}/mail-records?domain=${baseDomain}`)
        ]);

        if (isMounted) {
          if (wRes.status === 'fulfilled' && wRes.value?.data) {
            const data = wRes.value.data;
            setDomains([{
              id: 1,
              domain: baseDomain,
              registrar: data.registrar || 'Unknown',
              registrationDate: data.createdDate || new Date().toISOString(),
              expiryDate: data.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString(),
              nameservers: data.nameservers || [],
              autoRenew: false,
              raw: data.raw || null
            }]);
          }

          if (confRes.status === 'fulfilled' && confRes.value?.data) {
            setEmailConfig(confRes.value.data);
          }

          if (histRes.status === 'fulfilled' && Array.isArray(histRes.value?.data)) {
            setRealAlertHistory(histRes.value.data);
          }

          if (mailRes.status === 'fulfilled' && mailRes.value?.data?.success) {
            setMailRecords(mailRes.value.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch domain data", err);
        if (isMounted) setDomains([]);
      } finally {
        if (isMounted) {
          setLoading(false);
          setMailLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [url]);

  const enriched = useMemo(() =>
    domains.map(d => {
      const days = getDaysRemaining(d.expiryDate);
      const status = getStatus(days);
      return { ...d, daysRemaining: days, status };
    }),
    [domains]
  );

  // Summary counts
  const summary = useMemo(() => ({
    total:         enriched.length,
    active:        enriched.filter(d => d.status.color === 'green').length,
    expiringSoon:  enriched.filter(d => d.status.color === 'yellow' || d.status.color === 'orange').length,
    expired:       enriched.filter(d => d.status.color === 'red').length,
  }), [enriched]);

  // Warning banners — domains expiring within 30 days or already expired
  const warnings = useMemo(() =>
    enriched.filter(d => d.daysRemaining <= 30).sort((a, b) => a.daysRemaining - b.daysRemaining),
    [enriched]
  );

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* ── PAGE TITLE ────────────────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] p-6 rounded-2xl relative overflow-hidden shadow-3d-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
          <Globe className="w-40 h-40 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest block mb-1">DOMAIN DETAILS</span>
        <h2 className="text-xl font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
          Domain Details
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
            {summary.total} {summary.total === 1 ? 'Domain' : 'Domains'}
          </span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Track registration and expiry dates for all monitored domains.</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#162238] rounded-2xl border border-blue-200 dark:border-[#2B3B53] shadow-3d-sm">
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium">Querying WHOIS records...</h3>
          <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Fetching domain registry details. This might take a few seconds.</p>
        </div>
      )}

      {!loading && domains.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm">
          <Globe className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium">No domains found</h3>
          <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Add websites to the catalog to start monitoring their domain expiry.</p>
        </div>
      )}

      {/* ── WARNING BANNERS ───────────────────────────────────────────── */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map(d => {
            const st = statusStyles[d.status.color];
            const Icon = st.icon;
            return (
              <div key={d.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${st.badge} animate-fade-in-up`}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>
                  {d.daysRemaining < 0
                    ? <><strong>{d.domain}</strong> has <strong>expired</strong> {Math.abs(d.daysRemaining)} days ago.</>
                    : <><strong>{d.domain}</strong> expires in <strong>{d.daysRemaining} days</strong> on {formatDate(d.expiryDate)}. Renew now to avoid downtime.</>
                  }
                </span>
                {!d.autoRenew && (
                  <span className="ml-auto shrink-0 text-[11px] font-medium uppercase tracking-widest opacity-80">Auto-renew OFF</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && domains.length > 0 && (
        <>
          {/* ── SUMMARY CARDS ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Domains',   value: summary.total,        color: 'text-slate-900 dark:text-[#F1F5F9]',     bg: 'bg-white dark:bg-[#162238] border-slate-200/90 dark:border-[#2B3B53]' },
          { label: 'Active',          value: summary.active,       color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40' },
          { label: 'Expiring Soon',   value: summary.expiringSoon, color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40' },
          { label: 'Expired',         value: summary.expired,      color: 'text-rose-700 dark:text-rose-400',       bg: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40' },
        ].map(card => (
          <div key={card.label} className={`border p-4 rounded-xl flex flex-col justify-between shadow-2xs ${card.bg}`}>
            <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">{card.label}</span>
            <span className={`text-3xl font-medium mt-2 ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* ── DOMAIN TABLE ──────────────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl overflow-hidden shadow-3d-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#2B3B53] flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Domain Registry
          </h3>
          <button
            onClick={() => setShowAlertHistory(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5" />
            {showAlertHistory ? 'Hide Mail Records' : 'Mail Records & Alerts'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E]">
                {['Domain', 'Registrar', 'Registered', 'Expires', 'Days Left', 'Status', 'Auto-Renew'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-600 dark:text-[#A8B5C7] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map(d => {
                const st = statusStyles[d.status.color];
                const Icon = st.icon;
                // Progress bar: 0–365 days maps to 0–100%
                const pct = Math.max(0, Math.min(100, (d.daysRemaining / 365) * 100));
                return (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 cursor-pointer transition-colors"
                    onClick={() => setSelectedDomain(selectedDomain?.id === d.id ? null : d)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-medium text-slate-900 dark:text-[#F1F5F9] font-mono text-xs">{d.domain}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-[#A8B5C7]">{d.registrar}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-[#A8B5C7] font-mono">{formatDate(d.registrationDate)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-900 dark:text-[#F1F5F9] font-mono font-semibold">{formatDate(d.expiryDate)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 progress-track bg-slate-200 dark:bg-[#111B2E] rounded-full overflow-hidden border border-slate-300/60 dark:border-[#2B3B53]">
                          <div className={`h-full rounded-full ${st.bar} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${d.daysRemaining < 0 ? 'text-rose-700 dark:text-rose-400' : d.daysRemaining < 30 ? 'text-orange-700 dark:text-orange-400' : d.daysRemaining < 60 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {d.daysRemaining < 0 ? `${Math.abs(d.daysRemaining)}d ago` : `${d.daysRemaining}d`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${st.badge}`}>
                        <Icon className="h-3 w-3" />
                        {d.status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${d.autoRenew ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53]'}`}>
                        {d.autoRenew ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded detail panel */}
        {selectedDomain && (
          <div className="border-t border-slate-200 dark:border-[#2B3B53] px-6 py-5 bg-slate-50/70 dark:bg-[#111B2E]/70 animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest">Domain Detail</span>
                <h4 className="text-base font-medium text-slate-900 dark:text-[#F1F5F9] font-mono mt-0.5">{selectedDomain.domain}</h4>
              </div>
              <button onClick={() => setSelectedDomain(null)} className="text-slate-500 hover:text-slate-900 dark:text-[#A8B5C7] dark:hover:text-white transition-colors cursor-pointer">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Registrar',        value: selectedDomain.registrar },
                { label: 'Registered',       value: formatDate(selectedDomain.registrationDate) },
                { label: 'Expires',          value: formatDate(selectedDomain.expiryDate) },
                { label: 'Days Remaining',   value: selectedDomain.daysRemaining < 0 ? `Expired ${Math.abs(selectedDomain.daysRemaining)}d ago` : `${selectedDomain.daysRemaining} days` },
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl p-3 shadow-2xs">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block mb-1">{item.label}</span>
                  <span className="font-medium text-slate-900 dark:text-[#F1F5F9]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block mb-1.5">Nameservers</span>
              <div className="flex flex-wrap gap-2">
                {selectedDomain.nameservers.map(ns => (
                  <span key={ns} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 rounded text-blue-700 dark:text-blue-400 text-[11px] font-mono">{ns}</span>
                ))}
              </div>
            </div>
            
            {/* Raw WHOIS Data Block */}
            {selectedDomain.raw && (
              <div className="mt-5 border-t border-slate-200 dark:border-[#2B3B53] pt-4">
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block mb-2">Raw WHOIS Record</span>
                <div className="bg-white dark:bg-[#0B1220] rounded-xl p-4 overflow-x-auto max-h-64 overflow-y-auto border border-slate-200 dark:border-[#2B3B53] custom-scrollbar">
                  <pre className="text-[11px] text-slate-700 dark:text-[#A8B5C7] font-mono leading-relaxed whitespace-pre-wrap break-words">
                    {typeof selectedDomain.raw === 'string' ? selectedDomain.raw : JSON.stringify(selectedDomain.raw, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DNS MAIL VALIDATION RECORDS AUDIT (MX, SPF, DKIM, DMARC) ────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl overflow-hidden shadow-3d-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#2B3B53] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm">
                DNS Mail Validation Records
              </h3>
              {mailRecords && (
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                  mailRecords.healthScore >= 80 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                    : mailRecords.healthScore >= 50 
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' 
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                }`}>
                  Health: {mailRecords.healthScore}/100
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">
              Email deliverability & anti-spoofing security audit (MX, SPF, DKIM & DMARC authentication).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAlertHistory(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5" />
              {showAlertHistory ? 'Hide Notification Logs' : 'Notification Endpoints & Logs'}
            </button>
          </div>
        </div>

        {mailLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin mb-2" />
            <p className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium">Auditing DNS Mail Authentication Records...</p>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5">Querying MX, SPF, DKIM selectors and DMARC policies.</p>
          </div>
        ) : mailRecords ? (
          <div className="p-6 space-y-6">
            {/* Quick Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* MX Record */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                mailRecords.mx.status === 'valid'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">MX (Mail Exchange)</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase shrink-0 ${
                      mailRecords.mx.status === 'valid'
                        ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                        : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50'
                    }`}>
                      {mailRecords.mx.status === 'valid' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {mailRecords.mx.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9]">
                    {mailRecords.mx.count > 0 ? `${mailRecords.mx.count} Server${mailRecords.mx.count > 1 ? 's' : ''}` : 'No MX Records'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 leading-relaxed">
                    {mailRecords.mx.details}
                  </p>
                </div>
              </div>

              {/* SPF Record */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                mailRecords.spf.status === 'valid'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : mailRecords.spf.status === 'warning'
                  ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">SPF (Sender Policy)</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase shrink-0 ${
                      mailRecords.spf.status === 'valid'
                        ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                        : mailRecords.spf.status === 'warning'
                        ? 'bg-amber-100/80 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50'
                        : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50'
                    }`}>
                      {mailRecords.spf.status === 'valid' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {mailRecords.spf.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9]">
                    {mailRecords.spf.status === 'valid' ? 'SPF Configured' : 'Missing SPF'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 leading-relaxed">
                    {mailRecords.spf.details}
                  </p>
                </div>
              </div>

              {/* DKIM Record */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                mailRecords.dkim.status === 'valid'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">DKIM (DomainKeys)</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase shrink-0 ${
                      mailRecords.dkim.status === 'valid'
                        ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                        : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50'
                    }`}>
                      {mailRecords.dkim.status === 'valid' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {mailRecords.dkim.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9]">
                    {mailRecords.dkim.status === 'valid' ? `Selector: ${mailRecords.dkim.selector}` : 'Missing DKIM'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 leading-relaxed">
                    {mailRecords.dkim.details}
                  </p>
                </div>
              </div>

              {/* DMARC Record */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                mailRecords.dmarc.status === 'valid'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">DMARC (Policy)</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase shrink-0 ${
                      mailRecords.dmarc.status === 'valid'
                        ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                        : 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50'
                    }`}>
                      {mailRecords.dmarc.status === 'valid' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {mailRecords.dmarc.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9]">
                    {mailRecords.dmarc.status === 'valid' ? 'DMARC Active' : 'Missing DMARC'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 leading-relaxed">
                    {mailRecords.dmarc.details}
                  </p>
                </div>
              </div>
            </div>

            {/* Mail Record Issues Detected banner */}
            {mailRecords.issues && mailRecords.issues.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Mail Record Issues Detected ({mailRecords.issues.length})</span>
                </div>
                <ul className="list-disc list-inside text-xs text-amber-900 dark:text-amber-200/90 space-y-1 pl-1">
                  {mailRecords.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw DNS Mail Records Detail view */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block">Discovered DNS Authentication Records</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* SPF Details */}
                <div className="bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono font-medium block mb-1.5">TXT Record (SPF)</span>
                  {mailRecords.spf.record ? (
                    <code className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 break-all bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg block border border-emerald-200 dark:border-emerald-800/50">
                      {mailRecords.spf.record}
                    </code>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> No SPF TXT record published
                    </span>
                  )}
                </div>

                {/* DMARC Details */}
                <div className="bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono font-medium block mb-1.5">TXT Record (_dmarc.{mailRecords.domain})</span>
                  {mailRecords.dmarc.record ? (
                    <code className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 break-all bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg block border border-emerald-200 dark:border-emerald-800/50">
                      {mailRecords.dmarc.record}
                    </code>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> No DMARC TXT record published
                    </span>
                  )}
                </div>

                {/* MX Details */}
                <div className="bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono font-medium block mb-1.5">MX Records ({mailRecords.domain})</span>
                  {mailRecords.mx.records && mailRecords.mx.records.length > 0 ? (
                    <div className="space-y-1.5">
                      {mailRecords.mx.records.map((mx, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-900 dark:text-[#F1F5F9] bg-white dark:bg-[#162238] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2B3B53] shadow-2xs">
                          <span>{mx.host}</span>
                          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Pri: {mx.priority}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> No MX records published
                    </span>
                  )}
                </div>

                {/* DKIM Details */}
                <div className="bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono font-medium block mb-1.5">DKIM Key ({mailRecords.dkim.selector ? `${mailRecords.dkim.selector}._domainkey.${mailRecords.domain}` : 'DomainKey'})</span>
                  {mailRecords.dkim.record ? (
                    <code className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 break-all bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg block border border-emerald-200 dark:border-emerald-800/50 max-h-24 overflow-y-auto custom-scrollbar">
                      {mailRecords.dkim.record}
                    </code>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> No DKIM signature key found on standard selectors
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── NOTIFICATION LOGS & RECIPIENTS DRAWER ──────────────────────────────── */}
      {showAlertHistory && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl overflow-hidden animate-fade-in-up shadow-3d-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-[#2B3B53] flex items-center justify-between">
            <div>
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Notification Endpoints & Incident Log Records
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">Configured email recipients and automated dispatch log.</p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              {realAlertHistory.length} Record{realAlertHistory.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Mail Recipient Validation Status Card */}
          <div className="p-6 border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50/70 dark:bg-[#111B2E]/60">
            <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest block mb-3">Configured Mail Recipients & Validation</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] rounded-xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Incident Alert Email
                  </span>
                  {emailConfig?.alertEmail ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <Check className="h-3 w-3" /> Valid Format
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53]">
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-[#F1F5F9] truncate">
                  {emailConfig?.alertEmail || 'No recipient configured'}
                </p>
                {emailConfig?.alertCc && (
                  <p className="text-[11px] font-mono text-slate-600 dark:text-[#A8B5C7] mt-1 truncate">
                    CC: {emailConfig.alertCc}
                  </p>
                )}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-[#A8B5C7]">Alerts Mode:</span>
                  <span className={`font-medium ${emailConfig?.alertsEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-[#A8B5C7]'}`}>
                    {emailConfig?.alertsEnabled ? 'Active (Enabled)' : 'Muted (Disabled)'}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] rounded-xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Scheduled Report Recipient
                  </span>
                  {emailConfig?.reportEmail ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <Check className="h-3 w-3" /> Valid Format
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53]">
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-[#F1F5F9] truncate">
                  {emailConfig?.reportEmail || 'No recipient configured'}
                </p>
                {emailConfig?.reportCc && (
                  <p className="text-[11px] font-mono text-slate-600 dark:text-[#A8B5C7] mt-1 truncate">
                    CC: {emailConfig.reportCc}
                  </p>
                )}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-[#A8B5C7]">Reports Mode:</span>
                  <span className={`font-medium ${emailConfig?.reportsEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-[#A8B5C7]'}`}>
                    {emailConfig?.reportsEnabled ? 'Active (Scheduled)' : 'Muted (Disabled)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Delivery / Alert History Feed */}
          <div className="divide-y divide-slate-200 dark:divide-[#2B3B53] max-h-72 overflow-y-auto custom-scrollbar">
            {realAlertHistory.length > 0 ? (
              realAlertHistory.map(alert => (
                <div key={alert._id || alert.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/50 transition-colors">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${alert.status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400' : alert.status === 'failed' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-400'}`}>
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9] truncate">
                      {alert.subject}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono mt-0.5">
                      <span>To: <strong className="text-slate-800 dark:text-[#F1F5F9]">{alert.alertEmail || alert.recipient}</strong></span>
                      <span>•</span>
                      <span>{new Date(alert.sentAt || alert.deliveredAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 border ${alert.status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : alert.status === 'failed' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                    {alert.status || 'delivered'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Mail className="h-8 w-8 text-slate-400 dark:text-[#A8B5C7] mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-800 dark:text-[#F1F5F9]">No email delivery history for this domain yet.</p>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1">Alerts will log here once dispatched to verified recipients.</p>
              </div>
            )}
          </div>

          {/* Alert schedule info */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-[#2B3B53] bg-slate-50/70 dark:bg-[#111B2E]/60">
            <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest block mb-2">Alert Schedule</span>
            <div className="flex flex-wrap gap-2">
              {[90, 60, 30, 15, 7].map(days => (
                <span key={days} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-medium">
                  {days} days before
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
                On expiry
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS LEGEND ─────────────────────────────────────────────── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] p-5 rounded-2xl shadow-3d-sm">
        <h3 className="text-slate-600 dark:text-[#A8B5C7] font-medium text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '> 60 days remaining', badge: statusStyles.green.badge,  dot: 'bg-emerald-500' },
            { label: '30–60 days remaining', badge: statusStyles.yellow.badge, dot: 'bg-amber-500' },
            { label: '< 30 days remaining', badge: statusStyles.orange.badge, dot: 'bg-orange-500' },
            { label: 'Expired',             badge: statusStyles.red.badge,    dot: 'bg-rose-500' },
          ].map(item => (
            <span key={item.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ${item.badge}`}>
              <span className={`h-2 w-2 rounded-full ${item.dot}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      </>
      )}

    </div>
  );
}
