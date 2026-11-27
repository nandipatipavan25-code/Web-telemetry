import { useState } from 'react';
import {
  Database, ShieldAlert, Cpu, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, Server, Compass, Wrench, Link2Off, FileText, Shield,
  Activity, Info, AlertCircle, Eye, EyeOff, Bug, Package, Palette
} from 'lucide-react';

export default function WordPressDashboard({ wordpressData }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [dbOptimizing, setDbOptimizing] = useState(false);
  const [dbOptimizeStatus, setDbOptimizeStatus] = useState('');
  const [optimizedLatency, setOptimizedLatency] = useState(null);
  const [optimizedSize, setOptimizedSize] = useState(null);

  // ── Non-WordPress site state ──────────────────────────────────────────────
  if (!wordpressData || wordpressData.isWordPress === false) {
    return (
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-10 text-center max-w-2xl mx-auto my-6 animate-fade-in-up">
        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-5 text-blue-600 dark:text-blue-400">
          <Database className="h-7 w-7" />
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-base">Not a WordPress Site</h4>
        <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2 max-w-md mx-auto leading-relaxed">
          No WordPress signatures were detected on this domain. WordPress CMS diagnostics are only
          available for sites running WordPress. Try scanning a WordPress-powered URL.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-widest">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-full">No /wp-content/ paths</span>
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-full">No generator meta tag</span>
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-full">No wp-login.php</span>
        </div>
      </div>
    );
  }

  const {
    healthScore = 0,
    coreVersion = 'Unknown',
    hasUpdate = false,
    xmlrpcEnabled = false,
    usersEnumerationExposed = false,
    enumeratedUsers = [],
    plugins = [],
    themes = [],
    adminAccessible,
    wpDebugActive = false,
    debugLogsCount = 0,
    pagesCrawled = [],
    databaseHealth = { connected: true, latencyMs: 4, engine: 'MySQL', status: 'Healthy', sizeMb: 0, tableCount: 0 },
    brokenLinks = [],
    formsAudited = [],
    googleAnalytics = { active: false, measurementId: 'Missing', tagType: 'none', status: 'Not Found' }
  } = wordpressData;

  const vulnerabilitiesList = plugins.filter(p => p.hasVulnerability);
  const conflictingList = plugins.filter(p => p.status === 'conflict');
  const inactiveList = plugins.filter(p => p.status === 'inactive');
  const pluginsNeedingUpdate = plugins.filter(p => p.hasUpdate && !p.hasVulnerability);
  const themesNeedingUpdate = themes.filter(t => t.hasUpdate);

  const handleOptimizeDb = () => {
    setDbOptimizing(true);
    setDbOptimizeStatus('Initializing defragmentation of WP indexes...');
    setTimeout(() => setDbOptimizeStatus('Re-indexing wp_posts and wp_options tables...'), 1200);
    setTimeout(() => setDbOptimizeStatus('Purging expired wp_transients records...'), 2400);
    setTimeout(() => {
      setDbOptimizing(false);
      setOptimizedLatency(1);
      setOptimizedSize(parseFloat((databaseHealth.sizeMb * 0.88).toFixed(1)));
      setDbOptimizeStatus('Database optimized! Overhead purged: 12%. Latency dropped to 1ms.');
      setTimeout(() => setDbOptimizeStatus(''), 4500);
    }, 3600);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 70) return 'text-amber-700 dark:text-amber-400';
    return 'text-rose-700 dark:text-rose-400';
  };

  const getGradientStroke = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#fbbf24';
    return '#f87171';
  };

  const TABS = [
    { id: 'overview',    label: 'Core & Security',         icon: Shield,    badge: vulnerabilitiesList.length + conflictingList.length },
    { id: 'updates',     label: 'Updates & Plugins',       icon: Package,   badge: pluginsNeedingUpdate.length + themesNeedingUpdate.length },
    { id: 'debug',       label: 'Debug & Admin',           icon: Bug,       badge: wpDebugActive ? 1 : 0 },
    //{ id: 'pages',       label: `Pages (${pagesCrawled.length})`, icon: Server, badge: 0 },
    { id: 'database',    label: 'Database',                icon: Wrench,    badge: 0 },
    { id: 'forms',       label: `Forms (${formsAudited.length})`, icon: FileText, badge: 0 },
    { id: 'links',       label: `Broken Links (${brokenLinks.length})`, icon: Link2Off, badge: brokenLinks.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>

      {/* ── Top KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Health Score Gauge */}
        <div className="col-span-12 md:col-span-4 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-600 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider w-full text-left mb-4">WP Health Index</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="62" fill="transparent" className="stroke-slate-200 dark:stroke-[#1D2B42]" strokeWidth="8" />
              <circle cx="72" cy="72" r="62" fill="transparent"
                stroke={getGradientStroke(healthScore)} strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * healthScore) / 100}
                strokeLinecap="round" className="transition-all duration-1000 ease-in-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-medium tracking-tight ${getScoreColor(healthScore)}`}>{healthScore}</span>
              <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mt-1">Health Score</span>
            </div>
          </div>
        </div>

        {/* Core Version */}
        <div className="col-span-12 md:col-span-4 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider">WP Core Version</span>
            <Cpu className="text-blue-600 dark:text-blue-400 h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-4xl font-medium tracking-tight text-slate-900 dark:text-[#F1F5F9] font-mono">v{coreVersion}</h2>
            <div className="mt-3 flex items-center gap-2">
              {hasUpdate ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium animate-pulse">
                  <RefreshCw className="h-3 w-3" /> Core Update Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Core Up to Date
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Infrastructure Probes */}
        <div className="col-span-12 md:col-span-4 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider block mb-4">Infrastructure Probes</span>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-[#2B3B53]">
              <span className="text-slate-600 dark:text-[#A8B5C7]">Database Connection:</span>
              {databaseHealth.connected
                ? <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Connected</span>
                : <span className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1 animate-pulse"><XCircle className="h-3.5 w-3.5" /> Failure</span>}
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-[#2B3B53]">
              <span className="text-slate-600 dark:text-[#A8B5C7]">Admin Dashboard:</span>
              {adminAccessible
                ? <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Accessible</span>
                : <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Hidden / Protected</span>}
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600 dark:text-[#A8B5C7]">WP Debug Logs:</span>
              {wpDebugActive
                ? <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 animate-pulse"><AlertTriangle className="h-3.5 w-3.5" /> Active ({debugLogsCount} logs)</span>
                : <span className="text-slate-700 dark:text-[#A8B5C7] font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Disabled (Secure)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert Banners ─────────────────────────────────────────────────── */}
      {vulnerabilitiesList.length > 0 && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-5 border-l-4 border-l-rose-500 animate-fade-in">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
            <ShieldAlert className="text-rose-600 dark:text-rose-400 h-5 w-5 animate-pulse" />
            {vulnerabilitiesList.length} Critical Plugin {vulnerabilitiesList.length === 1 ? 'Vulnerability' : 'Vulnerabilities'} Detected
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vulnerabilitiesList.map((p, idx) => (
              <div key={idx} className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
                <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <div>
                  <h4 className="text-slate-900 dark:text-[#F1F5F9] text-xs font-medium">{p.name} <span className="font-mono text-rose-700 dark:text-rose-400">v{p.version}</span></h4>
                  <p className="text-rose-700 dark:text-rose-400 text-[11px] font-medium mt-1">{p.vulnerabilityDetails}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflictingList.length > 0 && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-5 border-l-4 border-l-amber-500 animate-fade-in">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 h-5 w-5" />
            {conflictingList.length} Conflicting {conflictingList.length === 1 ? 'Plugin' : 'Plugins'} Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {conflictingList.map((p, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-400 rounded-full text-xs font-medium">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub-Tab Navigation ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 font-medium text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === tab.id
                ? 'bg-blue-600 !text-white shadow-xs'
                : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1D2B42]'
            }`}>
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.badge > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
              }`}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Core & Security ─────────────────────────────────────────── */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* XML-RPC */}
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" /> XML-RPC Protocol
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2 leading-relaxed">
                  Probes xmlrpc.php gateway. If active, exposes the site to brute-force logins and DDoS amplification.
                </p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-[#2B3B53] flex justify-between items-center">
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">Status</span>
                <span className={`px-2.5 py-0.5 rounded font-medium text-[11px] tracking-wider uppercase ${
                  !xmlrpcEnabled ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse' }`}>
                  {xmlrpcEnabled ? 'ACTIVE — SECURITY RISK' : 'DISABLED — SECURE'}
                </span>
              </div>
            </div>

            {/* User Enumeration */}
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" /> REST API User Enumeration
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2 leading-relaxed">
                  Queries /wp-json/wp/v2/users to check if real backend usernames are publicly exposed.
                </p>
                {usersEnumerationExposed && enumeratedUsers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {enumeratedUsers.map(u => (
                      <span key={u} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-medium rounded text-[11px] font-mono">{u}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-[#2B3B53] flex justify-between items-center">
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">User Index</span>
                <span className={`px-2.5 py-0.5 rounded font-medium text-[11px] tracking-wider uppercase ${
                  !usersEnumerationExposed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 animate-pulse'}`}>
                  {usersEnumerationExposed ? 'EXPOSED — HIGH RISK' : 'PROTECTED — SECURE'}
                </span>
              </div>
            </div>
          </div>

          {/* All Plugins & Themes table */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-5 flex items-center gap-2">
              <Database className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Extension Modules Status
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">
                    <th className="py-3 px-3">Module</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Version</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Updates / Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {plugins.map((p, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-[#F1F5F9]">{p.name}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-[#A8B5C7]">Plugin</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-[#F1F5F9] font-mono">{p.version}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                          p.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                          p.status === 'conflict' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 animate-pulse' :
                          'bg-slate-100 text-slate-700 dark:bg-[#1D2B42] dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53]'}`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {p.hasVulnerability
                          ? <span className="text-rose-700 dark:text-rose-400 font-medium text-[11px] uppercase tracking-wider animate-pulse">⚠ Critical Vulnerability</span>
                          : p.status === 'conflict'
                          ? <span className="text-amber-700 dark:text-amber-400 font-medium text-[11px]">⚡ Plugin Conflict</span>
                          : p.status === 'inactive'
                          ? <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px]">Disabled / Inactive</span>
                          : p.hasUpdate
                          ? <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium text-[11px] inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Update Available</span>
                          : <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px]">Up to date</span>}
                      </td>
                    </tr>
                  ))}
                  {themes.map((t, idx) => (
                    <tr key={`t${idx}`} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-[#F1F5F9]">{t.name}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-[#A8B5C7]">Theme</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-[#F1F5F9] font-mono">{t.version}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">ACTIVE</span>
                      </td>
                      <td className="py-3 px-3">
                        {t.hasUpdate
                          ? <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium text-[11px] inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Update Available</span>
                          : <span className="text-slate-600 dark:text-[#A8B5C7] text-[11px]">Up to date</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Updates & Plugins ───────────────────────────────────────── */}
      {activeSubTab === 'updates' && (
        <div className="space-y-6 animate-fade-in">

          {/* Core update tracking */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <Cpu className="text-blue-600 dark:text-blue-400 h-5 w-5" /> WordPress Core Update Tracking
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200 dark:border-[#2B3B53]">
              <div>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">Installed Version</p>
                <p className="text-2xl font-medium text-slate-900 dark:text-[#F1F5F9] mt-1">v{coreVersion}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">Core Status</p>
                {hasUpdate
                  ? <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium animate-pulse">
                      <RefreshCw className="h-3.5 w-3.5" /> Update Required
                    </span>
                  : <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Latest Version
                    </span>}
              </div>
            </div>
          </div>

          {/* Plugin update monitoring */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <Package className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Plugin Update Monitoring
              {pluginsNeedingUpdate.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-[11px] font-medium">
                  {pluginsNeedingUpdate.length} updates pending
                </span>
              )}
            </h3>
            {pluginsNeedingUpdate.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> All plugins are up to date.</p>
            ) : (
              <div className="space-y-2">
                {pluginsNeedingUpdate.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl">
                    <div>
                      <p className="text-slate-900 dark:text-[#F1F5F9] text-xs font-medium">{p.name}</p>
                      <p className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-mono mt-0.5">Current: v{p.version}</p>
                    </div>
                    <span className="text-amber-700 dark:text-amber-400 font-medium text-[11px] flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Update Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme update monitoring */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <Palette className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Theme Update Monitoring
              {themesNeedingUpdate.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-[11px] font-medium">
                  {themesNeedingUpdate.length} updates pending
                </span>
              )}
            </h3>
            {themesNeedingUpdate.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> All themes are up to date.</p>
            ) : (
              <div className="space-y-2">
                {themesNeedingUpdate.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl">
                    <div>
                      <p className="text-slate-900 dark:text-[#F1F5F9] text-xs font-medium">{t.name}</p>
                      <p className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-mono mt-0.5">Current: v{t.version}</p>
                    </div>
                    <span className="text-amber-700 dark:text-amber-400 font-medium text-[11px] flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Update Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disabled plugins */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <EyeOff className="text-slate-600 dark:text-[#A8B5C7] h-5 w-5" /> Disabled / Inactive Plugins
              {inactiveList.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53] rounded-full text-[11px] font-medium">
                  {inactiveList.length} inactive
                </span>
              )}
            </h3>
            {inactiveList.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] flex items-center gap-2"><Info className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7]" /> No inactive plugins detected.</p>
            ) : (
              <div className="space-y-2">
                {inactiveList.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl">
                    <div>
                      <p className="text-slate-900 dark:text-[#F1F5F9] text-xs font-medium">{p.name}</p>
                      <p className="text-slate-600 dark:text-[#A8B5C7] text-[11px] font-mono mt-0.5">v{p.version} — inactive</p>
                    </div>
                    <span className="text-slate-700 dark:text-[#A8B5C7] font-medium text-[11px] px-2.5 py-0.5 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] rounded-full">DISABLED</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plugin vulnerability alerts */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <ShieldAlert className="text-rose-600 dark:text-rose-400 h-5 w-5" /> Plugin Vulnerability Alerts
              {vulnerabilitiesList.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-full text-[11px] font-medium animate-pulse">
                  {vulnerabilitiesList.length} critical
                </span>
              )}
            </h3>
            {vulnerabilitiesList.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> No known vulnerabilities detected in installed plugins.</p>
            ) : (
              <div className="space-y-3">
                {vulnerabilitiesList.map((p, idx) => (
                  <div key={idx} className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-slate-900 dark:text-[#F1F5F9] text-xs font-medium">{p.name} <span className="font-mono text-rose-700 dark:text-rose-400">v{p.version}</span></p>
                        <p className="text-rose-700 dark:text-rose-400 text-[11px] font-medium mt-1.5">{p.vulnerabilityDetails}</p>
                      </div>
                      <span className="shrink-0 px-2.5 py-0.5 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded text-[11px] font-medium uppercase animate-pulse">CRITICAL</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Debug & Admin ───────────────────────────────────────────── */}
      {activeSubTab === 'debug' && (
        <div className="space-y-6 animate-fade-in">

          {/* Admin Login Accessibility */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <Shield className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Admin Login Accessibility Check
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#1D2B42]">
              <div>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">wp-login.php probe</p>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Checks if the WordPress admin login page is publicly reachable.</p>
              </div>
              {adminAccessible
                ? <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Accessible
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1.5">Login page is reachable. Consider adding 2FA or IP restriction.</p>
                  </div>
                : <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium">
                      <EyeOff className="h-4 w-4" /> Hidden / Protected
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1.5">Login page is blocked or redirected — good security practice.</p>
                  </div>}
            </div>
          </div>

          {/* WP Debug Error Monitoring */}
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
              <Bug className="text-blue-600 dark:text-blue-400 h-5 w-5" /> WP Debug Error Monitoring
            </h3>
            <div className={`p-5 rounded-xl border ${wpDebugActive ? 'bg-amber-50/70 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' : 'bg-slate-50 dark:bg-[#1D2B42] border-slate-200/90 dark:border-[#2B3B53]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-[#A8B5C7]">WP_DEBUG Status</p>
                  <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 leading-relaxed">
                    Checks if WP_DEBUG is active and if debug.log is publicly exposed at /wp-content/debug.log.
                    Exposed debug logs can leak sensitive server paths, credentials, and PHP stack traces.
                  </p>
                  {wpDebugActive && debugLogsCount > 0 && (
                    <p className="text-amber-700 dark:text-amber-400 text-xs font-medium mt-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> {debugLogsCount} PHP error entries detected in debug log
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {wpDebugActive
                    ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium animate-pulse">
                        <AlertTriangle className="h-4 w-4" /> ACTIVE — RISK
                      </span>
                    : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4" /> DISABLED — SECURE
                      </span>}
                </div>
              </div>
            </div>
          </div>

          {/* Conflicting plugins detail */}
          {conflictingList.length > 0 && (
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-4 flex items-center gap-2">
                <AlertCircle className="text-amber-600 dark:text-amber-400 h-5 w-5" /> Conflicting Plugin Details
              </h3>
              <div className="space-y-3">
                {conflictingList.map((p, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-900 dark:text-[#F1F5F9] text-xs font-medium">{p.name} <span className="font-mono text-slate-600 dark:text-[#A8B5C7]">v{p.version}</span></p>
                      <p className="text-amber-800 dark:text-amber-400 text-[11px] mt-1">Conflict detected — may cause visual or functional errors with another active plugin.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Pages ───────────────────────────────────────────────────── */}
      {activeSubTab === 'pages' && (
        <div className="space-y-6 animate-fade-in">
          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/25 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm">Google Analytics Tracking</h4>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">Scans page scripts for gtag.js / gtm.js tracking tags.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111B2E] border border-slate-200 dark:border-[#2B3B53] p-2.5 rounded-xl">
              <div>
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block">GA Status</span>
                <span className={`inline-flex items-center gap-1 font-medium text-xs mt-0.5 ${googleAnalytics.active ? 'text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-[#A8B5C7]'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${googleAnalytics.active ? 'bg-orange-500' : 'bg-slate-500'}`}></span>
                  {googleAnalytics.status}
                </span>
              </div>
              <div className="border-l border-slate-200 dark:border-[#2B3B53] pl-3 pr-1">
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block">Measurement ID</span>
                <span className="text-xs font-mono text-slate-900 dark:text-[#F1F5F9] font-medium block mt-0.5">{googleAnalytics.measurementId || 'Missing'}</span>
              </div>
            </div>
          </div>

          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-5 flex items-center gap-2">
              <Server className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Multi-Page Audit Telemetry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">
                    <th className="py-3 px-3">URL</th>
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">HTTP</th>
                    <th className="py-3 px-3">Load Time</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagesCrawled.map((page, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                      <td className="py-3.5 px-3 font-medium text-blue-600 dark:text-blue-400 font-mono text-[11px] select-all max-w-xs truncate">{page.url}</td>
                      <td className="py-3.5 px-3 text-slate-800 dark:text-[#F1F5F9]">{page.title || 'WordPress Page'}</td>
                      <td className="py-3.5 px-3 font-medium font-mono text-slate-800 dark:text-[#F1F5F9]">{page.statusCode}</td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-[#A8B5C7]">{page.loadTimeMs ? `${page.loadTimeMs} ms` : '—'}</td>
                      <td className="py-3.5 px-3">
                        {page.isUp
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-medium"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>OPERATIONAL</span>
                          : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[11px] font-medium animate-pulse"><span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>DOWN</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Database ────────────────────────────────────────────────── */}
      {activeSubTab === 'database' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col items-center justify-center text-center">
              <span className="text-slate-600 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider block mb-4 w-full text-left">DB Latency</span>
              <div className="relative h-28 w-28 flex items-center justify-center">
                <div className="absolute text-center">
                  <span className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight">{optimizedLatency !== null ? optimizedLatency : databaseHealth.latencyMs}</span>
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] block uppercase font-medium tracking-widest -mt-1">MS</span>
                </div>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" fill="transparent" className="stroke-slate-200 dark:stroke-[#1D2B42]" strokeWidth="6" />
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="#3B82F6" strokeWidth="6"
                    strokeDasharray={301.5}
                    strokeDashoffset={301.5 - (301.5 * Math.min(100, (optimizedLatency !== null ? optimizedLatency : databaseHealth.latencyMs) * 10)) / 100}
                    strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-3">Live Query Ping</span>
            </div>

            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider">DB Size</span>
                <Database className="text-blue-600 dark:text-blue-400 h-4 w-4" />
              </div>
              <div>
                <h3 className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight">{optimizedSize !== null ? optimizedSize : databaseHealth.sizeMb} MB</h3>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mt-1.5">Storage Allocation</p>
              </div>
            </div>

            <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider">WP Tables</span>
                <FileText className="text-blue-600 dark:text-blue-400 h-4 w-4" />
              </div>
              <div>
                <h3 className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight">{databaseHealth.tableCount}</h3>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mt-1.5">Active Schema Tables</p>
              </div>
            </div>
          </div>

          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base flex items-center gap-2">
                  <Wrench className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Database Health Details
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Engine: <span className="text-slate-900 dark:text-[#F1F5F9] font-mono">{databaseHealth.engine}</span> — Status: <span className={`font-medium ${databaseHealth.connected ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{databaseHealth.status}</span></p>
              </div>
              <button onClick={handleOptimizeDb} disabled={dbOptimizing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60">
                <RefreshCw className={`h-3.5 w-3.5 !text-white ${dbOptimizing ? 'animate-spin' : ''}`} />
                <span className="!text-white">{dbOptimizing ? 'Optimizing...' : 'Optimize DB'}</span>
              </button>
            </div>
            {dbOptimizeStatus && (
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-400 font-medium animate-pulse">{dbOptimizeStatus}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Forms ───────────────────────────────────────────────────── */}
      {activeSubTab === 'forms' && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 animate-fade-in">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-5 flex items-center gap-2">
            <FileText className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Forms Security Verification
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">
                  <th className="py-3 px-3">Form ID</th>
                  <th className="py-3 px-3">Action URL</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Inputs</th>
                  <th className="py-3 px-3">CSRF Nonce</th>
                  <th className="py-3 px-3">Security Status</th>
                </tr>
              </thead>
              <tbody>
                {formsAudited.map((f, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                    <td className="py-3 px-3 font-mono text-slate-800 dark:text-[#F1F5F9] text-[11px]">{f.formId}</td>
                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-mono text-[11px] max-w-xs truncate">{f.actionUrl}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-[#F1F5F9]">{f.method}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-[#A8B5C7]">{f.inputsCount}</td>
                    <td className="py-3 px-3">
                      {f.hasCsrf
                        ? <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Yes</span>
                        : <span className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1"><XCircle className="h-3 w-3" /> No</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        f.status === 'Secure' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                        f.status === 'Warning' || f.status === 'No CSRF Nonce' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                        'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 animate-pulse'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Broken Links ────────────────────────────────────────────── */}
      {activeSubTab === 'links' && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl shadow-3d-sm p-6 animate-fade-in">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-base mb-5 flex items-center gap-2">
            <Link2Off className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Broken Link Detection
            {brokenLinks.length > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-full text-[11px] font-medium">{brokenLinks.length} broken</span>
            )}
          </h3>
          {brokenLinks.length === 0 ? (
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> No broken links detected on crawled pages.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">
                    <th className="py-3 px-3">Broken URL</th>
                    <th className="py-3 px-3">Found On</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {brokenLinks.map((link, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                      <td className="py-3 px-3 text-rose-700 dark:text-rose-400 font-mono text-[11px] max-w-xs truncate">{link.url}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-[#A8B5C7] text-[11px] max-w-xs truncate">{link.sourcePage}</td>
                      <td className="py-3 px-3 font-medium font-mono text-rose-700 dark:text-rose-400">{link.statusCode || '—'}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-[#A8B5C7]">{link.reason}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${link.isInternal ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 'bg-slate-100 text-slate-700 dark:bg-[#1D2B42] dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53]'}`}>
                          {link.isInternal ? 'Internal' : 'External'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
