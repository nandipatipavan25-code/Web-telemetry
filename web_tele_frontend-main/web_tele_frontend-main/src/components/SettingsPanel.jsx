import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  ShieldCheck, Globe, AlertTriangle, AlertCircle, Mail, Key, Bell, 
  ToggleLeft, ToggleRight, Sparkles, RefreshCw, Send, CheckCircle2
} from 'lucide-react';

import { API_BASE } from '../apiConfig';

export default function SettingsPanel({ showToast }) {
  const [settings, setSettings] = useState({
    slack_webhook: '',
    telegram_chat_id: '',
    email_host: '',
    email_port: '587',
    email_use_ssl: false,
    email_host_user: '',
    email_host_password: '',
    email_from: '',
    alert_email_recipients: '',
    alerts_enabled: true,
    resend_api_key: '',
    resend_from_email: ''
  });
  const [emailLogs, setEmailLogs] = useState([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch settings from server
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/settings`);
      if (response.data) {
        setSettings(response.data.settings);
        setEmailLogs(response.data.emailLogs || []);
        setTotalLogsCount(response.data.totalLogsCount || 0);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch SRE settings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE}/settings`, settings);
      if (response.data.success) {
        showToast('SRE settings and alerts configuration saved.', 'success');
        await fetchSettings();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update alert settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAlerts = async () => {
    const updatedStatus = !settings.alerts_enabled;
    setSettings(prev => ({ ...prev, alerts_enabled: updatedStatus }));
    
    // Save instantly
    try {
      const response = await axios.post(`${API_BASE}/settings`, { 
        ...settings, 
        alerts_enabled: updatedStatus 
      });
      if (response.data.success) {
        showToast(
          updatedStatus ? 'Email notifications enabled!' : 'Email notifications deactivated.',
          updatedStatus ? 'success' : 'info'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle alerts.', 'error');
      setSettings(prev => ({ ...prev, alerts_enabled: !updatedStatus }));
    }
  };

  // Compile statistics for visual charts
  const categoryDataMap = {};
  const levelDataMap = {};

  emailLogs.forEach(log => {
    categoryDataMap[log.category] = (categoryDataMap[log.category] || 0) + 1;
    levelDataMap[log.level] = (levelDataMap[log.level] || 0) + 1;
  });

  const categoryChartData = Object.keys(categoryDataMap).map(key => ({
    name: key.toUpperCase(),
    value: categoryDataMap[key]
  }));

  const levelChartData = Object.keys(levelDataMap).map(key => ({
    name: key.toUpperCase(),
    value: levelDataMap[key]
  }));

  const COLORS_CATEGORY = ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B'];
  const COLORS_LEVEL = {
    CRITICAL: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6'
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* 1. Gmail Access & Global Email Alert configurations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Credentials Form */}
        <form onSubmit={handleSave} className="col-span-12 md:col-span-7 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-[#2B3B53] pb-4 mb-5">
              <div>
                <h3 className="text-slate-900 dark:text-[#F1F5F9] font-semibold text-base flex items-center gap-2">
                  <Mail className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  SRE Gmail Alert Gateways
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Configure Gmail SMTP credentials to dispatch automatic non-blocking alert emails.</p>
              </div>

              {/* Toggle Alerts switch */}
              <button
                type="button"
                onClick={handleToggleAlerts}
                className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
                title={settings.alerts_enabled ? "Disable all email alerts" : "Enable email alerts"}
              >
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">
                  {settings.alerts_enabled ? 'Alerts Active' : 'Alerts Disabled'}
                </span>
                {settings.alerts_enabled ? (
                  <ToggleRight className="h-7 w-7 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-400 dark:text-[#A8B5C7]" />
                )}
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SMTP Server / Host */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">
                    SMTP Server / Host <span className="text-slate-500 dark:text-[#A8B5C7] font-normal lowercase">(leave blank if Gmail)</span>
                  </label>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Globe className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="text"
                      placeholder="e.g. mail.yourdomain.com or smtp.zoho.com"
                      value={settings.email_host || ''}
                      onChange={e => setSettings(prev => ({ ...prev, email_host: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

                {/* SMTP Port & SSL */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">Port & Security</label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-600 dark:text-[#A8B5C7] hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input 
                        type="checkbox"
                        checked={settings.email_use_ssl === true || settings.email_use_ssl === 'true'}
                        onChange={e => setSettings(prev => ({ ...prev, email_use_ssl: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#2B3B53] text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      SSL / TLS (Port 465)
                    </label>
                  </div>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Key className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="text"
                      placeholder="587 (or 465 for SSL)"
                      value={settings.email_port || '587'}
                      onChange={e => setSettings(prev => ({ ...prev, email_port: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

                {/* Email User / Login */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">Email Address / Username</label>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Mail className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="text"
                      placeholder="alerts@yourdomain.com"
                      value={settings.email_host_user || ''}
                      onChange={e => setSettings(prev => ({ ...prev, email_host_user: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

                {/* Email Password */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">Email Password / App Password</label>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Key className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="password"
                      placeholder="••••••••••••••••"
                      value={settings.email_host_password || ''}
                      onChange={e => setSettings(prev => ({ ...prev, email_host_password: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

                {/* From Email / Display */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">Sender "From" Email (Optional)</label>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Mail className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="email"
                      placeholder="alerts@yourdomain.com (defaults to your email username)"
                      value={settings.email_from || ''}
                      onChange={e => setSettings(prev => ({ ...prev, email_from: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

                {/* Resend API Key */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">Resend API Key</label>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Key className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="password"
                      placeholder="re_xxxxxxxxxxxxxxxxx"
                      value={settings.resend_api_key || ''}
                      onChange={e => setSettings(prev => ({ ...prev, resend_api_key: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

                {/* Resend From Email */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider block text-[11px]">Resend From Email</label>
                  <div className="form-input-container bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#111B2E] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-xs">
                    <Mail className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
                    <input 
                      type="email"
                      placeholder="onboarding@resend.dev"
                      value={settings.resend_from_email || ''}
                      onChange={e => setSettings(prev => ({ ...prev, resend_from_email: e.target.value }))}
                      className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-[#2B3B53] pt-5 mt-6 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1D2B42] dark:hover:bg-[#2B3B53] border border-slate-200 dark:border-[#2B3B53] text-slate-800 dark:text-[#F1F5F9] rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Form
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 !text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="!text-white">{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>

        {/* Dynamic Visual Email Alert Charts */}
        <div className="col-span-12 md:col-span-5 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 dark:border-[#2B3B53] pb-4 mb-4">
              <h3 className="text-slate-900 dark:text-[#F1F5F9] font-semibold text-base flex items-center gap-2.5">
                <Sparkles className="text-blue-600 dark:text-blue-400 h-4 w-4" />
                SRE Dispatched Alerts Visual Charts
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Real-time charts of system alerts triggered during crawler passes.</p>
            </div>

            {emailLogs.length >= 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-52 w-full items-center">
                
                {/* Category distribution */}
                <div className="h-full flex flex-col items-center justify-center relative">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider absolute top-0 text-center w-full">Alerts by Category</span>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-700 dark:text-[#A8B5C7] font-medium mt-1">
                    {categoryChartData.map((c, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS_CATEGORY[i % COLORS_CATEGORY.length] }}></span>
                        {c.name} ({c.value})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Level Severity Distribution */}
                <div className="h-full flex flex-col items-center justify-center relative">
                  <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider absolute top-0 text-center w-full">Alerts by Severity</span>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={levelChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {levelChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_LEVEL[entry.name] || '#3b82f6'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-700 dark:text-[#A8B5C7] font-medium mt-1">
                    {levelChartData.map((l, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS_LEVEL[l.name] || '#3b82f6' }}></span>
                        {l.name} ({l.value})
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-xs text-slate-600 dark:text-[#A8B5C7] border border-dashed border-slate-200 dark:border-[#2B3B53] rounded-xl bg-slate-50/70 dark:bg-[#111B2E]/50 p-6 text-center">
                <Bell className="h-8 w-8 text-blue-600/60 dark:text-blue-400/60 mb-2" />
                <span>Awaiting SMTP alerts dispatches to populate metrics...</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium border-t border-slate-200 dark:border-[#2B3B53] pt-3 mt-4 flex justify-between items-center">
            <span>Total alerts logged:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{totalLogsCount} alerts</span>
          </div>
        </div>

      </div>

      {/* 2. Dispatch logs audit streams */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm">
        <div className="border-b border-slate-200 dark:border-[#2B3B53] pb-4 mb-4 flex justify-between items-center">
          <h3 className="text-slate-900 dark:text-[#F1F5F9] font-semibold text-base flex items-center gap-2.5">
            <Bell className="text-blue-600 dark:text-blue-400 h-5 w-5" />
            Gmail SMTP Alert Dispatch Logs
          </h3>
          <span className="text-xs text-slate-700 dark:text-[#A8B5C7] font-medium bg-slate-100 dark:bg-[#1D2B42] px-3 py-1 rounded-full border border-slate-200 dark:border-[#2B3B53]">Audit Log Stream</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          {emailLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-600 dark:text-[#A8B5C7] text-xs italic flex flex-col items-center justify-center gap-2 bg-slate-50/70 dark:bg-[#111B2E]/50 border border-dashed border-slate-200 dark:border-[#2B3B53] rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              No emails successfully logged in email_delivery.log yet. Make sure SMTP is configured.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#111B2E] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Date/Time</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((log, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-[#2B3B53]/70 hover:bg-slate-50 dark:hover:bg-[#1D2B42]/70 transition-all">
                    <td className="py-3 px-3 text-slate-600 dark:text-[#A8B5C7] font-mono">
                      {new Date(log.checkedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-[#F1F5F9] font-semibold">{log.subject}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-[#F1F5F9] font-mono">{log.recipient}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wide border border-slate-200 dark:border-[#2B3B53]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-medium text-[11px] ${
                        log.level === 'critical' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50' :
                        log.level === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50' :
                        'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
