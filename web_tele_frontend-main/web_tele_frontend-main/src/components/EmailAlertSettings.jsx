import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Mail, Bell, BellOff, Send, CheckCircle2, AlertCircle,
  RefreshCw, Clock, Shield, Globe, Activity, ToggleLeft, ToggleRight,
  AlertTriangle, Info, Inbox, Code, Layout, Edit3, Users
} from 'lucide-react';

import { API_BASE, SOCKET_URL } from '../apiConfig';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const areValidEmails = (emailsStr) => {
  if (!emailsStr || !emailsStr.trim()) return true;
  const list = emailsStr.split(',').map(e => e.trim()).filter(Boolean);
  return list.length > 0 && list.every(isValidEmail);
};

const LEVEL_COLORS = {
  critical: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  warning:  'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  info:     'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
};

const ALERT_TRIGGERS = [
  { icon: Globe,         color: 'text-rose-600 dark:text-rose-400',   label: 'Website Down',                desc: 'Fires when HTTP status ≠ 200 or connection fails' },
  { icon: Shield,        color: 'text-amber-600 dark:text-amber-400', label: 'SSL Expiring (≤7 days)',       desc: 'Warning sent when SSL expires within a week' },
  { icon: Shield,        color: 'text-rose-600 dark:text-rose-400',   label: 'SSL Critical (≤1 day)',        desc: 'Critical alert when SSL expires within 24 hours' },
  { icon: Activity,      color: 'text-rose-600 dark:text-rose-400',   label: 'Core Web Vitals Exceeded',    desc: 'Fires when LCP > 2.5s, CLS > 0.10, FCP > 1.8s, or INP > 200ms' },
  { icon: Activity,      color: 'text-amber-600 dark:text-amber-400', label: 'Low Performance Score',        desc: 'Performance score drops below 60' },
  { icon: Activity,      color: 'text-amber-600 dark:text-amber-400', label: 'Low SEO Score',                desc: 'SEO score drops below 60' },
  { icon: Shield,        color: 'text-amber-600 dark:text-amber-400', label: 'Low Security Score',           desc: 'Security score drops below 60' },
  { icon: Bell,          color: 'text-rose-600 dark:text-rose-400',   label: 'Broken Links Found',           desc: 'One or more broken links detected' },
  { icon: Bell,          color: 'text-amber-600 dark:text-amber-400', label: 'Missing Meta Description',     desc: 'Homepage missing meta description tag' },
  { icon: Bell,          color: 'text-amber-600 dark:text-amber-400', label: 'Missing Image ALT Tags',       desc: 'Images found without ALT text' },
  { icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400',   label: 'Scan Failure',                 desc: 'Monitoring scan fails to complete' },
];

export default function EmailAlertSettings({ siteUrl, showToast }) {
  const [config, setConfig] = useState({
    alertEmail:     '',
    alertCc:        '',
    devEmail:       '',
    uiEmail:        '',
    contentEmail:   '',
    alertsEnabled:  false,
    alertFrequency: 'instant',
    reportEmail:    '',
    reportCc:       '',
    reportsEnabled: false,
    reportFrequency:'48h',
    reportDay:       1,
    reportHour:      9,
    reportTimezone:  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    totalEmailsSent: 0,
    lastEmailSent:   null,
    lastAlertType:   '',
    lastReportSent:  null,
  });
  const [emailInput, setEmailInput]               = useState('');
  const [alertCcInput, setAlertCcInput]           = useState('');
  const [devEmailInput, setDevEmailInput]         = useState('');
  const [uiEmailInput, setUiEmailInput]           = useState('');
  const [contentEmailInput, setContentEmailInput] = useState('');
  const [reportEmailInput, setReportEmailInput]   = useState('');
  const [reportCcInput, setReportCcInput]         = useState('');
  const [emailError, setEmailError]   = useState('');
  const [saving, setSaving]           = useState(false);
  const [testing, setTesting]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchConfig = async () => {
    if (!siteUrl) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/email-config?url=${encodeURIComponent(siteUrl)}`);
      const data = resp.data || {};
      setConfig(data);
      setEmailInput(data.alertEmail || '');
      setAlertCcInput(data.alertCc || '');
      setDevEmailInput(data.devEmail || '');
      setUiEmailInput(data.uiEmail || '');
      setContentEmailInput(data.contentEmail || '');
      setReportEmailInput(data.reportEmail || '');
      setReportCcInput(data.reportCc || '');
    } catch (err) {
      console.error('Failed to load email config:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!siteUrl) return;
    setHistoryLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/email-history?url=${encodeURIComponent(siteUrl)}`);
      setEmailHistory(resp.data || []);
    } catch (err) {
      console.error('Failed to load email history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchHistory();
  }, [siteUrl]);

  useEffect(() => {
    if (!siteUrl) return;
    
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('emailStatusChanged', (updatedEmail) => {
      // Normalize URLs
      const normSite = siteUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
      const normEmailSite = updatedEmail.url.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
      if (normSite !== normEmailSite) return;

      setEmailHistory(prev => {
        const exists = prev.some(item => item._id === updatedEmail._id);
        if (exists) {
          return prev.map(item => item._id === updatedEmail._id ? updatedEmail : item);
        } else {
          return [updatedEmail, ...prev];
        }
      });
      
      if (updatedEmail.status === 'delivered') {
        setConfig(prev => ({
          ...prev,
          totalEmailsSent: (prev.totalEmailsSent || 0) + 1,
          lastEmailSent: updatedEmail.deliveredAt || new Date(),
          lastAlertType: updatedEmail.alertType
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [siteUrl]);

  const handleSave = async () => {
    // Validate emails
    if (emailInput && !areValidEmails(emailInput)) {
      setEmailError('Please enter a valid alert email address (or comma-separated emails).');
      return;
    }
    if (alertCcInput && !areValidEmails(alertCcInput)) {
      setEmailError('Please enter valid CC email addresses separated by commas.');
      return;
    }
    if (devEmailInput && !areValidEmails(devEmailInput)) {
      setEmailError('Please enter valid Development team email addresses.');
      return;
    }
    if (uiEmailInput && !areValidEmails(uiEmailInput)) {
      setEmailError('Please enter valid UI/UX team email addresses.');
      return;
    }
    if (contentEmailInput && !areValidEmails(contentEmailInput)) {
      setEmailError('Please enter valid Content Creator email addresses.');
      return;
    }
    if (reportEmailInput && !areValidEmails(reportEmailInput)) {
      setEmailError('Please enter a valid report email address (or comma-separated emails).');
      return;
    }
    if (reportCcInput && !areValidEmails(reportCcInput)) {
      setEmailError('Please enter valid report CC email addresses separated by commas.');
      return;
    }
    setEmailError('');
    setSaving(true);
    try {
      const resp = await axios.post(`${API_BASE}/email-config`, {
        url:            siteUrl,
        alertEmail:     emailInput,
        alertCc:        alertCcInput,
        devEmail:       devEmailInput,
        uiEmail:        uiEmailInput,
        contentEmail:   contentEmailInput,
        alertsEnabled:  config.alertsEnabled,
        alertFrequency: config.alertFrequency,
        reportEmail:    reportEmailInput,
        reportCc:       reportCcInput,
        reportsEnabled: config.reportsEnabled,
        reportFrequency:config.reportFrequency,
        reportDay:      config.reportDay,
        reportHour:     config.reportHour,
        reportTimezone: config.reportTimezone,
      });
      if (resp.data.success) {
        setConfig(prev => ({
          ...prev,
          alertEmail: emailInput,
          alertCc: alertCcInput,
          devEmail: devEmailInput,
          uiEmail: uiEmailInput,
          contentEmail: contentEmailInput,
          reportEmail: reportEmailInput,
          reportCc: reportCcInput
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        showToast('Settings saved successfully!', 'success');
        fetchConfig();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save settings.';
      setEmailError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!config.alertEmail && !emailInput && !devEmailInput && !uiEmailInput && !contentEmailInput) {
      setEmailError('Enter an alert email address before enabling alerts.');
      return;
    }
    const newEnabled = !config.alertsEnabled;
    setConfig(prev => ({ ...prev, alertsEnabled: newEnabled }));
    try {
      await axios.post(`${API_BASE}/email-config`, {
        url:            siteUrl,
        alertEmail:     emailInput || config.alertEmail,
        alertCc:        alertCcInput !== undefined ? alertCcInput : config.alertCc,
        devEmail:       devEmailInput !== undefined ? devEmailInput : config.devEmail,
        uiEmail:        uiEmailInput !== undefined ? uiEmailInput : config.uiEmail,
        contentEmail:   contentEmailInput !== undefined ? contentEmailInput : config.contentEmail,
        alertsEnabled:  newEnabled,
        alertFrequency: config.alertFrequency,
        reportEmail:    reportEmailInput || config.reportEmail,
        reportCc:       reportCcInput !== undefined ? reportCcInput : config.reportCc,
        reportsEnabled: config.reportsEnabled,
        reportFrequency:config.reportFrequency,
        reportDay:      config.reportDay,
        reportHour:     config.reportHour,
        reportTimezone: config.reportTimezone,
      });
      showToast(newEnabled ? 'Email alerts enabled for this website.' : 'Email alerts disabled.', newEnabled ? 'success' : 'info');
    } catch (err) {
      setConfig(prev => ({ ...prev, alertsEnabled: !newEnabled }));
      showToast('Failed to toggle alerts.', 'error');
    }
  };

  const handleToggleReports = async () => {
    if (!config.reportEmail && !reportEmailInput) {
      setEmailError('Enter an email address before enabling reports.');
      return;
    }
    const newEnabled = !config.reportsEnabled;
    setConfig(prev => ({ ...prev, reportsEnabled: newEnabled }));
    try {
      await axios.post(`${API_BASE}/email-config`, {
        url:            siteUrl,
        alertEmail:     emailInput || config.alertEmail,
        alertCc:        alertCcInput !== undefined ? alertCcInput : config.alertCc,
        devEmail:       devEmailInput !== undefined ? devEmailInput : config.devEmail,
        uiEmail:        uiEmailInput !== undefined ? uiEmailInput : config.uiEmail,
        contentEmail:   contentEmailInput !== undefined ? contentEmailInput : config.contentEmail,
        alertsEnabled:  config.alertsEnabled,
        alertFrequency: config.alertFrequency,
        reportEmail:    reportEmailInput || config.reportEmail,
        reportCc:       reportCcInput !== undefined ? reportCcInput : config.reportCc,
        reportsEnabled: newEnabled,
        reportFrequency:config.reportFrequency,
        reportDay:      config.reportDay,
        reportHour:     config.reportHour,
        reportTimezone: config.reportTimezone,
      });
      showToast(newEnabled ? 'Periodic reports enabled.' : 'Periodic reports disabled.', newEnabled ? 'success' : 'info');
    } catch (err) {
      setConfig(prev => ({ ...prev, reportsEnabled: !newEnabled }));
      showToast('Failed to toggle reports.', 'error');
    }
  };

  const [testingReport, setTestingReport] = useState(false);

  const handleTestEmail = async () => {
    if (!config.alertEmail) {
      showToast('Save an email address first before sending a test.', 'error');
      return;
    }
    setTesting(true);
    try {
      const resp = await axios.post(`${API_BASE}/test-site-email`, { url: siteUrl });
      if (resp.data.success) {
        showToast(resp.data.message, 'success');
        fetchHistory();
      } else {
        showToast(resp.data.error || 'Test email failed.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Test email failed.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleTestReport = async () => {
    if (!config.reportEmail) {
      showToast('Save a report email address first before sending a test report.', 'error');
      return;
    }
    setTestingReport(true);
    try {
      const resp = await axios.post(`${API_BASE}/test-site-report`, { url: siteUrl });
      if (resp.data.success) {
        showToast(resp.data.message, 'success');
        fetchHistory();
      } else {
        showToast(resp.data.error || 'Test report failed.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Test report failed.', 'error');
    } finally {
      setTestingReport(false);
    }
  };

  if (!siteUrl) {
    return (
      <div className="glass-card p-10 text-center max-w-2xl mx-auto my-6 animate-fade-in-up">
        <Mail className="h-10 w-10 text-slate-600 mx-auto mb-4 animate-bounce" />
        <h4 className="font-medium text-slate-400">No Website Selected</h4>
        <p className="text-xs text-slate-500 mt-2">Enter a URL and run a scan first, then configure email alerts for that website.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-slate-900 dark:text-white font-medium text-lg flex items-center gap-2">
            <Mail className="text-blue-600 dark:text-blue-400 h-5 w-5" /> Email Alert &amp; Notification Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configuring automated alerts &amp; digest reporting for: <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">{siteUrl}</span>
          </p>
        </div>
      </div>

      {/* ── Main Alert Configuration Card ── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 sm:p-7 space-y-6 shadow-3d-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-slate-900 dark:text-white font-medium text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Alert Configuration &amp; Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time incident dispatches triggered when health or security anomalies arise.</p>
          </div>
          {/* Enable toggle */}
          <button onClick={handleToggle} className="flex items-center gap-2 cursor-pointer focus:outline-none" title="Toggle email alerts">
            <span className={`text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              config.alertsEnabled 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {config.alertsEnabled ? 'Active' : 'Muted'}
            </span>
            {config.alertsEnabled
              ? <ToggleRight className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              : <ToggleLeft className="h-7 w-7 text-slate-400 dark:text-slate-600" />}
          </button>
        </div>

        {/* Primary Emails 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* General / SRE Fallback Email */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium flex items-center justify-between">
              <span>General / SRE Fallback Email</span>
              <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-normal">Primary default recipient</span>
            </label>
            <div className={`form-input-container bg-slate-50/80 dark:bg-[#1D2B42] border rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2.5 ${emailError && !devEmailInput && !uiEmailInput && !contentEmailInput && !emailInput ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'}`}>
              <Mail className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7] shrink-0" />
              <input
                type="text"
                placeholder="primary-sre@company.com"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setEmailError(''); }}
                className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
              />
              {emailInput && areValidEmails(emailInput) && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7]">
              Notified if a specific vertical team email below is unassigned.
            </p>
          </div>

          {/* Global Alert CC Recipients */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium flex items-center justify-between">
              <span>Global Alert CC Recipients</span>
              <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-normal">Comma-separated</span>
            </label>
            <div className="form-input-container bg-slate-50/80 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7] shrink-0" />
              <input
                type="text"
                placeholder="lead@company.com, tech-director@company.com"
                value={alertCcInput}
                onChange={e => { setAlertCcInput(e.target.value); setEmailError(''); }}
                className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
              />
              {alertCcInput && areValidEmails(alertCcInput) && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              CC supervisory stakeholders on every incident alert automatically.
            </p>
          </div>
        </div>

        {/* Dedicated Team Verticals Routing */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Vertical Team Alert Routing
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Routes incident domains to assigned specialists
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Development Team */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Code className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9]">Development &amp; Systems</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-500/30">
                    SRE / DB
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-tight">
                  Downtime, SSL Expiry, Database lag, Malware detection.
                </p>
              </div>

              <div className="form-input-container bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  type="text"
                  placeholder="dev-team@company.com"
                  value={devEmailInput}
                  onChange={e => { setDevEmailInput(e.target.value); setEmailError(''); }}
                  className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
                />
                {devEmailInput && areValidEmails(devEmailInput) && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </div>
            </div>

            {/* UI/UX Squad */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Layout className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9]">UI / UX Squad</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-500/30">
                    Design &amp; Vitals
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-tight">
                  Broken links, layout shift (CLS), latency spikes, forms.
                </p>
              </div>

              <div className="form-input-container bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  type="text"
                  placeholder="uiux-team@company.com"
                  value={uiEmailInput}
                  onChange={e => { setUiEmailInput(e.target.value); setEmailError(''); }}
                  className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
                />
                {uiEmailInput && areValidEmails(uiEmailInput) && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </div>
            </div>

            {/* Content & SEO Team */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                      <Edit3 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9]">Content &amp; SEO</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-500/30">
                    Marketing
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-tight">
                  Missing meta descriptions, empty ALT tags, SEO drops.
                </p>
              </div>

              <div className="form-input-container bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  type="text"
                  placeholder="content-seo@company.com"
                  value={contentEmailInput}
                  onChange={e => { setContentEmailInput(e.target.value); setEmailError(''); }}
                  className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
                />
                {contentEmailInput && areValidEmails(contentEmailInput) && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alert frequency */}
        <div className="space-y-2.5 pt-1">
          <label className="text-xs text-slate-700 dark:text-slate-300 font-medium uppercase tracking-wider block">
            Critical Alert Frequency
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'instant', label: 'Instant Dispatch', desc: 'Trigger on incident immediately' },
              { value: 'daily',   label: 'Daily Summary',    desc: 'Rollup digest every 24 hours' },
              { value: 'weekly',  label: 'Weekly Digest',     desc: 'Weekly report on Mondays' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, alertFrequency: opt.value }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                  config.alertFrequency === opt.value
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[11px] mt-0.5 opacity-80">{opt.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-300">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span><strong>Policy Active:</strong> Critical outages &amp; database errors dispatch immediately. Low-severity warnings (SEO/Alt tags) rollup every 72h to avoid inbox clutter.</span>
          </div>
        </div>

        {/* Status row (last sent / total) */}
        {(config.totalEmailsSent > 0 || config.lastEmailSent) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Total Sent</p>
              <p className="text-lg font-medium text-blue-600 dark:text-blue-400">{config.totalEmailsSent || 0}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Last Sent</p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {config.lastEmailSent ? new Date(config.lastEmailSent).toLocaleString() : '—'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Last Type</p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 uppercase">{config.lastAlertType || '—'}</p>
            </div>
          </div>
        )}

      </div>

      {/* ── Scheduled Performance & Health Reports ── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 sm:p-7 space-y-6 shadow-3d-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-slate-900 dark:text-white font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Scheduled Performance &amp; Health Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated PDF/HTML executive digest dispatched to client or executive management.</p>
          </div>
          {/* Enable Reports toggle */}
          <button onClick={handleToggleReports} className="flex items-center gap-2 cursor-pointer focus:outline-none" title="Toggle scheduled reports">
            <span className={`text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              config.reportsEnabled 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {config.reportsEnabled ? 'Active' : 'Disabled'}
            </span>
            {config.reportsEnabled
              ? <ToggleRight className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              : <ToggleLeft className="h-7 w-7 text-slate-400 dark:text-slate-600" />}
          </button>
        </div>

        {/* 2-Column Grid for Report Emails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Report email input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium flex items-center justify-between">
              <span>Report Recipient Email</span>
              <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-normal">Primary stakeholder</span>
            </label>
            <div className={`form-input-container bg-slate-50/80 dark:bg-[#1D2B42] border rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2.5 ${emailError && emailError.includes('report') ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'}`}>
              <Mail className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7] shrink-0" />
              <input
                type="text"
                placeholder="reports@yourdomain.com"
                value={reportEmailInput}
                onChange={e => { setReportEmailInput(e.target.value); setEmailError(''); }}
                className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
              />
              {reportEmailInput && areValidEmails(reportEmailInput) && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7]">
              Primary recipient for periodic performance and infrastructure digest reports.
            </p>
          </div>

          {/* Report CC input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium flex items-center justify-between">
              <span>Report CC Recipients (Optional)</span>
              <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-normal">Comma-separated</span>
            </label>
            <div className="form-input-container bg-slate-50/80 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 h-[42px] transition-all shadow-xs flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-500 dark:text-[#A8B5C7] shrink-0" />
              <input
                type="text"
                placeholder="client@clientdomain.com, manager@yourdomain.com"
                value={reportCcInput}
                onChange={e => { setReportCcInput(e.target.value); setEmailError(''); }}
                className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500 w-full font-normal"
              />
              {reportCcInput && areValidEmails(reportCcInput) && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Additional stakeholders to CC on recurring health summaries.
            </p>
          </div>
        </div>

        {/* Report frequency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-700 dark:text-slate-300 font-medium uppercase tracking-wider block">
              Report Frequency &amp; Schedule
            </label>
            {config.reportFrequency === 'custom' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Runs every {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][config.reportDay ?? 1]} at {((config.reportHour ?? 9) % 12 || 12)}:00 {(config.reportHour ?? 9) >= 12 ? 'PM' : 'AM'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { value: '12h',    label: '12h',    desc: 'Twice daily' },
              { value: '24h',    label: '24h',    desc: 'Daily' },
              { value: '48h',    label: '48h',    desc: 'Every 2 days' },
              { value: '72h',    label: '72h',    desc: 'Every 3 days' },
              { value: '7d',     label: '7d',     desc: 'Weekly (Sun)' },
              { value: 'custom', label: 'Custom', desc: 'Custom Day & Time' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, reportFrequency: opt.value }))}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer shadow-xs ${
                  config.reportFrequency === opt.value
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <p className="text-xs font-semibold uppercase">{opt.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Custom Day and Hour picker */}
          {(config.reportFrequency === 'custom' || config.reportFrequency === '7d') && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-emerald-500/30 rounded-xl space-y-3 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Custom Schedule Delivery Settings
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Day of Week */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    Day of the Week
                  </label>
                  <select
                    value={config.reportDay ?? 1}
                    onChange={e => setConfig(prev => ({ ...prev, reportDay: parseInt(e.target.value, 10), reportFrequency: 'custom' }))}
                    className="w-full h-[42px] bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3 text-xs text-slate-900 dark:text-[#F1F5F9] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={1}>Monday (Morning / Standard)</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>

                {/* Time of Day */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    Send Hour
                  </label>
                  <select
                    value={config.reportHour ?? 9}
                    onChange={e => setConfig(prev => ({ ...prev, reportHour: parseInt(e.target.value, 10), reportFrequency: 'custom' }))}
                    className="w-full h-[42px] bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3 text-xs text-slate-900 dark:text-[#F1F5F9] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={6}>6:00 AM (Early Morning)</option>
                    <option value={8}>8:00 AM</option>
                    <option value={9}>9:00 AM (Morning Standard)</option>
                    <option value={10}>10:00 AM</option>
                    <option value={12}>12:00 PM (Noon)</option>
                    <option value={14}>2:00 PM</option>
                    <option value={16}>4:00 PM (Afternoon)</option>
                    <option value={18}>6:00 PM (Evening)</option>
                    <option value={20}>8:00 PM (Night)</option>
                    <option value={0}>12:00 AM (Midnight)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    Timezone
                  </label>
                  <select
                    value={config.reportTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                    onChange={e => setConfig(prev => ({ ...prev, reportTimezone: e.target.value, reportFrequency: 'custom' }))}
                    className="w-full h-[42px] bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3 text-xs text-slate-900 dark:text-[#F1F5F9] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Asia/Kolkata">IST (India - Asia/Kolkata)</option>
                    <option value="Australia/Sydney">AEST (Sydney / Melbourne)</option>
                    <option value="Australia/Perth">AWST (Perth)</option>
                    <option value="America/New_York">EST (New York / US Eastern)</option>
                    <option value="America/Chicago">CST (Chicago / US Central)</option>
                    <option value="America/Los_Angeles">PST (Los Angeles / US Pacific)</option>
                    <option value="Europe/London">GMT / BST (London)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled digest will be generated and dispatched every <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][config.reportDay ?? 1]}</span> at <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{((config.reportHour ?? 9) % 12 || 12)}:00 {(config.reportHour ?? 9) >= 12 ? 'PM' : 'AM'}</span> ({config.reportTimezone || 'your local timezone'}).
              </p>
            </div>
          )}
        </div>
        
        {config.lastReportSent && (
          <div className="pt-2">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Last Report Sent: <span className="text-slate-800 dark:text-slate-300 font-semibold">{new Date(config.lastReportSent).toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 h-[40px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 !text-white rounded-xl text-xs font-medium cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-60"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Alert Settings'}</span>
        </button>

        <button
          onClick={handleTestEmail}
          disabled={testing || (!config.alertEmail && !config.devEmail && !config.uiEmail && !config.contentEmail)}
          className="flex items-center gap-2 px-4 h-[40px] bg-slate-100 hover:bg-slate-200 dark:bg-[#1D2B42] dark:hover:bg-[#2B3B53] border border-slate-200 dark:border-[#2B3B53] text-slate-800 dark:text-[#F1F5F9] rounded-xl text-xs font-medium cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-50"
        >
          {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" /> : <Send className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          <span>{testing ? 'Sending...' : 'Test Alert'}</span>
        </button>

        <button
          onClick={handleTestReport}
          disabled={testingReport || !config.reportEmail}
          className="flex items-center gap-2 px-4 h-[40px] bg-slate-100 hover:bg-slate-200 dark:bg-[#1D2B42] dark:hover:bg-[#2B3B53] border border-slate-200 dark:border-[#2B3B53] text-slate-800 dark:text-[#F1F5F9] rounded-xl text-xs font-medium cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-50"
        >
          {testingReport ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" /> : <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          <span>{testingReport ? 'Sending...' : 'Test Report'}</span>
        </button>

        <button
          onClick={() => { fetchConfig(); fetchHistory(); }}
          className="flex items-center gap-2 px-4 h-[40px] bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#A8B5C7] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-[#1D2B42] rounded-xl text-xs font-medium cursor-pointer transition-all shadow-xs active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" /> 
          <span>Refresh</span>
        </button>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-fade-in-up">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          Settings saved successfully! Alerts for <strong>{siteUrl}</strong> will route to configured recipients.
        </div>
      )}

      {/* ── Alert Triggers Reference Card ── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 sm:p-7 shadow-3d-sm">
        <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-sm mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
          <AlertTriangle className="text-amber-500 h-4 w-4" /> Automated Monitoring Trigger Matrix
          <span className="ml-auto text-[11px] text-slate-500 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">Automated Sentinel Triggers</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALERT_TRIGGERS.map((t, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
              <t.icon className={`h-4 w-4 shrink-0 mt-0.5 ${t.color}`} />
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-slate-200">{t.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Email Alert History Card ── */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 sm:p-7 shadow-3d-sm">
        <h3 className="text-slate-900 dark:text-white font-medium text-sm mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Inbox className="text-blue-600 dark:text-blue-400 h-4 w-4" /> Incident Dispatch Audit Trail
          <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 font-medium">{emailHistory.length} events logged</span>
        </h3>

        {historyLoading ? (
          <div className="py-8 text-center">
            <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading dispatch history...</p>
          </div>
        ) : emailHistory.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-[#2B3B53] rounded-xl bg-slate-50 dark:bg-[#1D2B42]/50 flex flex-col items-center gap-2">
            <Inbox className="h-6 w-6 text-slate-400 dark:text-[#A8B5C7]" />
            <p className="text-xs text-slate-700 dark:text-[#F1F5F9] font-medium">No email alerts sent yet for this website.</p>
            <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7]">Events will appear here as incidents trigger automated notifications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-[#111B2E]">
                <tr className="border-b border-slate-200 dark:border-[#2B3B53] text-slate-600 dark:text-[#A8B5C7] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Sent At</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2B3B53]/70">
                {emailHistory.map((entry, idx) => {
                  let effectiveStatus = entry.status;
                  if (!effectiveStatus) {
                    effectiveStatus = entry.delivered ? 'delivered' : 'failed';
                  }

                  const getStatusBadge = (status) => {
                    switch (status) {
                      case 'delivered':
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-medium uppercase tracking-wider">
                            ✓ Delivered
                          </span>
                        );
                      case 'sending':
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-[11px] font-medium uppercase tracking-wider animate-pulse">
                            ⏳ Sending
                          </span>
                        );
                      case 'failed':
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-[11px] font-medium uppercase tracking-wider" title={entry.errorReason || 'Failed to send email'}>
                            ✕ Failed
                          </span>
                        );
                      case 'bounced':
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 text-[11px] font-medium uppercase tracking-wider">
                            ⚠️ Bounced
                          </span>
                        );
                      default:
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1D2B42] text-slate-600 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53] text-[11px] font-medium uppercase tracking-wider">
                            — Unknown
                          </span>
                        );
                    }
                  };

                  const getStatusColorText = (status) => {
                    switch (status) {
                      case 'delivered': return 'text-emerald-600 dark:text-emerald-400';
                      case 'sending': return 'text-amber-600 dark:text-amber-400';
                      case 'failed': return 'text-rose-600 dark:text-rose-400';
                      case 'bounced': return 'text-orange-600 dark:text-orange-400';
                      default: return 'text-slate-600 dark:text-[#A8B5C7]';
                    }
                  };

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-[#1D2B42]/60 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600 dark:text-[#A8B5C7] font-mono text-[11px]">
                        {new Date(entry.sentAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-[#F1F5F9] max-w-[200px] truncate font-medium" title={entry.subject}>
                        {entry.subject}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-[#A8B5C7] font-mono text-[11px]">{entry.alertEmail}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#1D2B42] text-slate-700 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53] rounded text-[11px] font-medium uppercase">{entry.alertType}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${LEVEL_COLORS[entry.level] || LEVEL_COLORS.info}`}>
                          {entry.level?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center relative group select-none">
                        <div className="cursor-help inline-block">
                          {getStatusBadge(effectiveStatus)}
                        </div>
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] text-slate-800 dark:text-[#F1F5F9] text-xs rounded-xl p-3 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 text-left leading-normal">
                          <div className="font-medium text-[11px] uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7] border-b border-slate-200 dark:border-[#2B3B53] pb-1.5 mb-2 flex justify-between">
                            <span>Delivery Details</span>
                            <span className={getStatusColorText(effectiveStatus)}>{effectiveStatus?.toUpperCase()}</span>
                          </div>
                          <div className="space-y-1.5">
                            <div><span className="font-medium text-slate-500 dark:text-[#A8B5C7]">Sent:</span> {new Date(entry.sentAt).toLocaleString()}</div>
                            <div><span className="font-medium text-slate-500 dark:text-[#A8B5C7]">Delivered:</span> {entry.deliveredAt ? new Date(entry.deliveredAt).toLocaleString() : '—'}</div>
                            {entry.messageId && (
                              <div className="truncate"><span className="font-medium text-slate-500 dark:text-[#A8B5C7]">Msg ID:</span> <span className="font-mono text-[11px] text-slate-700 dark:text-[#F1F5F9]">{entry.messageId}</span></div>
                            )}
                            {entry.errorReason && (
                              <div className="text-rose-700 dark:text-rose-400 mt-1.5 border-t border-slate-200 dark:border-[#2B3B53] pt-1.5 leading-relaxed">
                                <span className="font-medium">Reason:</span> {entry.errorReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
