
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowRightLeft, Database, ShieldCheck, ShieldAlert, Activity, Cpu, Search, RefreshCw, AlertTriangle, AlertCircle, BellRing, Sun, Moon, X, Clock, Star, Menu, BarChart2, BarChart3, Globe, Shield, Image as ImageIcon, Eye, Layers, Mail, Settings, CalendarClock, ExternalLink, LayoutDashboard } from 'lucide-react';
import UptimeDashboard from './components/UptimeDashboard';
import WordPressDashboard from './components/WordPressDashboard';
import SSLMonitor from './components/SSLMonitor';
import SeoDashboard from './components/SeoDashboard';
import AccessibilityAudit from './components/AccessibilityAudit';
import SettingsPanel from './components/SettingsPanel';
import SiteAnalysisDashboard from './components/SiteAnalysisDashboard';
import AdminDashboard from './components/AdminDashboard';
import EmailAlertSettings from './components/EmailAlertSettings';
import MalwareReport from './components/MalwareReport';
import ImageOptimization from './components/ImageOptimization';
import ImageOptimizationAnalyzer from './components/ImageOptimizationAnalyzer';
import AdminLogin from './components/AdminLogin';
import DomainExpiryDashboard from './components/DomainExpiryDashboard';
import WebsitesCatalog from './components/WebsitesCatalog';
import DatabaseDashboard from './components/DatabaseDashboard';
import ClientViewDashboard from './components/ClientViewDashboard';
import VisualIntegrityDashboard from './components/VisualIntegrityDashboard';
import SingleViewMetricDashboard from './components/SingleViewMetricDashboard';
import CentralDashboard from './components/CentralDashboard';
import { GASymbol, Icon3DGlobe, Icon3DServer, Icon3DLock } from './components/Icons3D';

// ── Error Boundary — catches render errors in dropdown/child components
// without blanking the entire page ──────────────────────────────────────────
class SearchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('[SEARCH ERROR BOUNDARY]', error, info);
  }
  render() {
    if (this.state.hasError) {
      this.state.hasError = false;
      return null;
    }
    return this.props.children;
  }
}

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[GLOBAL ERROR BOUNDARY]', error, info);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-20 text-center glass-card border border-amber-500/30 rounded-3xl max-w-xl mx-auto my-8 p-8 animate-fade-in-up">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400 mx-auto mb-4 animate-bounce" />
          <h4 className="font-semibold text-slate-900 dark:text-white text-base">Auditer Telemetry Notice</h4>
          <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2 max-w-md mx-auto">
            Unable to render complete metrics for this target domain. Click below to reset or run a fresh audit scan.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Reset Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


import { API_BASE, SOCKET_URL } from './apiConfig';

// Helper to normalize URLs for WebSocket event comparisons
const normalizeUrlString = (u) => {
  if (!u) return '';
  return u.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
};

export default function App() {
  const [url, setUrl] = useState('https://wordpress.org');
  const [stats, setStats] = useState(null);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [crawlData, setCrawlData] = useState(null);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Check URL params for client portal link on page load
  const isDirectClient = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('client') === '1';

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('client') === '1' && params.get('site')) {
        return 'client';
      }
      if (params.get('view') === 'catalog' || params.get('view') === 'catalogues') {
        return 'grid';
      }
    }
    return 'dashboard';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const clientSite = params.get('site');
      if (params.get('client') === '1' && clientSite) {
        setUrl(clientSite);
        setViewMode('client');
      }
    }
  }, []);

  const handleSelectWebsite = (siteUrl) => {
    setUrl(siteUrl);
    fetchStats(siteUrl);
    setCrawlData(null);
    setCrawlLoading(true);
    let formattedUrl = siteUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    axios.post(`${API_BASE}/crawl`, { url: formattedUrl })
      .then(crawlResp => {
        if (crawlResp.data.success) setCrawlData(crawlResp.data);
      })
      .catch(() => { })
      .finally(() => setCrawlLoading(false));
    setViewMode('detail');
    setActiveTab('single_view');
  };

  const handleAddWebsite = async (newUrl, analysisFrequency = '1h', serviceType = 'maintenance') => {
    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    setUrl(formattedUrl);
    await handleRunAudit(formattedUrl, analysisFrequency, serviceType);
    setViewMode('detail');
    setActiveTab('single_view');
  };

  const handleDeleteWebsite = async (siteUrl) => {
    try {
      await axios.post(`${API_BASE}/targets/delete`, { url: siteUrl });
      showToast(`Removed ${siteUrl} from catalog.`, 'info');
      fetchTargets();
      if (normalizeUrlString(url) === normalizeUrlString(siteUrl)) {
        setViewMode('grid');
      }
    } catch (err) {
      showToast('Failed to delete website from catalog.', 'error');
    }
  };

  // ── NEW: Search autocomplete state ──────────────────────────────────────────
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [dropdownSelectedIndex, setDropdownSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Authentication State for Admin Dashboard protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [loginTime, setLoginTime] = useState('');

  // ΓöÇΓöÇ NEW: Navigate-to-SiteAnalysis-ALT callback (passed to SeoDashboard) ΓöÇΓöÇ
  const [siteAnalysisAltHighlight, setSiteAnalysisAltHighlight] = useState(false);

  const handleNavigateToAlt = useCallback(() => {
    setActiveTab('site_analysis');
    setSiteAnalysisAltHighlight(true);
    // auto-clear highlight after 3s
    setTimeout(() => setSiteAnalysisAltHighlight(false), 3000);
    // Scroll to top so SiteAnalysis is visible
    setTimeout(() => {
      const el = document.getElementById('alt-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, []);

  const [targetsLoading, setTargetsLoading] = useState(true);
  const [catalogPagination, setCatalogPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 3
  });
  const targetsRef = useRef([]);
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  // Fetch unique audited SRE target list with optional backend pagination
  const fetchTargets = async (isSilent = false, params = null) => {
    // Only show full skeleton loader if this is the initial load with no targets in memory
    if (!isSilent && targetsRef.current.length === 0) {
      setTargetsLoading(true);
    }
    try {
      // Default to page 1 and limit 3 if params is not provided or empty
      const defaultParams = { page: 1, limit: 3 };
      const queryParams = (params && typeof params === 'object') ? { ...params } : defaultParams;

      const response = await axios.get(`${API_BASE}/targets`, { params: queryParams });
      if (response.data && response.data.targets && response.data.pagination) {
        setTargets(response.data.targets);
        setCatalogPagination(response.data.pagination);
      } else if (Array.isArray(response.data)) {
        setTargets(response.data);
        setCatalogPagination({
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / (queryParams?.limit || 3)) || 1,
          currentPage: queryParams?.page || 1,
          limit: queryParams?.limit || 3
        });
      } else {
        setTargets([]);
      }
    } catch (err) {
      console.error("Failed to fetch SRE audited targets:", err);
      if (targetsRef.current.length === 0) {
        setTargets([]);
      }
    } finally {
      setTargetsLoading(false);
    }
  };
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('uptime');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isDark, setIsDark] = useState(true);
  // Sidebar open/close for mobile drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load auth from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('sre_auth_valid');
    const savedUser = localStorage.getItem('sre_auth_user');
    const savedTime = localStorage.getItem('sre_auth_time');
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setAdminUser(savedUser);
      setLoginTime(savedTime || new Date().toLocaleString());
    }
  }, []);

  const handleLoginSuccess = (username, remember) => {
    const timeStr = new Date().toLocaleString();
    setIsAuthenticated(true);
    setAdminUser(username);
    setLoginTime(timeStr);
    if (remember) {
      localStorage.setItem('sre_auth_valid', 'true');
      localStorage.setItem('sre_auth_user', username);
      localStorage.setItem('sre_auth_time', timeStr);
    }
    showToast(`Welcome back, ${username}!`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser('');
    setLoginTime('');
    localStorage.removeItem('sre_auth_valid');
    localStorage.removeItem('sre_auth_user');
    localStorage.removeItem('sre_auth_time');
    setActiveTab('uptime');
    showToast('Logged out of Admin Portal.', 'info');
  };

  // Fetch search history on mount
  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/search-history`);
      setSearchHistory(response.data || []);
    } catch (err) {
      console.error("Failed to fetch search history:", err);
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const dropdownGroups = React.useMemo(() => {
    try {
      console.log('[SEARCH DEBUG] Search value:', url);
      console.log('[SEARCH DEBUG] Targets count:', targets?.length);
      console.log('[SEARCH DEBUG] Search history count:', searchHistory?.length);

      const safeTargets = Array.isArray(targets) ? targets : [];
      const safeHistory = Array.isArray(searchHistory) ? searchHistory : [];
      const query = (url || '').toLowerCase().trim().replace(/^https?:\/\//i, '');

      console.log('[SEARCH DEBUG] Query after normalize:', query);

      // Safe URL match helper — guards against null/undefined url/name fields
      const urlMatches = (t) => {
        try {
          return (
            (t.url && t.url.toLowerCase().includes(query)) ||
            (t.name && t.name.toLowerCase().includes(query))
          );
        } catch (e) {
          return false;
        }
      };

      // Safe history match helper — guards against null/undefined query fields
      const historyMatches = (h) => {
        try {
          return h.query && h.query.toLowerCase().includes(query);
        } catch (e) {
          return false;
        }
      };

      // 1. Favorites/Pinned
      const favs = safeTargets.filter(t => t && t.isFavorite);
      const filteredFavs = query
        ? favs.filter(urlMatches)
        : favs;

      // 2. Most Monitored (sorted by scanCount desc, showing top 5)
      const monitoredList = [...safeTargets]
        .sort((a, b) => (b.scanCount || 0) - (a.scanCount || 0))
        .filter(t => t && !t.isFavorite)
        .slice(0, 5);
      const filteredMonitored = query
        ? [...safeTargets]
          .sort((a, b) => (b.scanCount || 0) - (a.scanCount || 0))
          .filter(t => t && urlMatches(t))
          .slice(0, 5)
        : monitoredList;

      // 3. Recent Searches (from searchHistory, showing top 5)
      const filteredRecent = query
        ? safeHistory.filter(h => h && historyMatches(h)).slice(0, 5)
        : safeHistory.slice(0, 5);

      // Flatten for keyboard navigation
      const flat = [];
      filteredFavs.forEach(t => flat.push({ type: 'website', data: t }));
      filteredMonitored.forEach(t => flat.push({ type: 'website', data: t }));
      filteredRecent.forEach(h => flat.push({ type: 'history', data: h }));

      console.log('[SEARCH DEBUG] Dropdown flat count:', flat.length);

      return {
        favorites: filteredFavs,
        monitored: filteredMonitored,
        recent: filteredRecent,
        flat
      };
    } catch (err) {
      console.error('[SEARCH DEBUG] dropdownGroups crash:', err);
      return { favorites: [], monitored: [], recent: [], flat: [] };
    }
  }, [url, targets, searchHistory]);

  const toggleFavorite = async (website) => {
    try {
      const response = await axios.post(`${API_BASE}/scanned-websites/favorite`, {
        url: website.url,
        isFavorite: !website.isFavorite
      });
      if (response.data.success) {
        showToast(
          !website.isFavorite ? `Pinned ${website.url} to favorites` : `Removed ${website.url} from favorites`,
          'success'
        );
        fetchTargets(true);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update favorite status.', 'error');
    }
  };

  const renderDropdownWebsiteRow = (t, isSelected, flatIndex) => {
    // Guard: skip rendering if target data is invalid
    if (!t || !t.url) return null;

    let hostname = t.url;
    try { hostname = new URL(t.url).hostname; } catch (e) { hostname = t.url; }

    return (
      <div
        key={`web-${t.url}-${t.isFavorite}`}
        role="button"
        tabIndex={0}
        className={`w-full flex items-center gap-3 px-3.5 py-2 transition-colors text-left group relative cursor-pointer ${isSelected ? 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500' : 'hover:bg-slate-100 dark:hover:bg-[#1D2B42]'}`}
        onMouseDown={(e) => {
          if (e.target.closest('.star-btn')) return;
          e.preventDefault();
          setUrl(t.url);
          setShowDropdown(false);
          fetchStats(t.url);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setUrl(t.url);
            setShowDropdown(false);
            fetchStats(t.url);
          }
        }}
        onMouseEnter={() => setDropdownSelectedIndex(flatIndex)}
      >
        <span className={`h-2 w-2 rounded-full shrink-0 ${t.isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate transition-colors ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
            {typeof t.name === 'string' ? t.name : (t.name?.text || hostname)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-mono truncate">{t.url}</p>
        </div>

        {t.scanCount > 1 && (
          <span className="shrink-0 text-[11px] font-medium text-slate-600 dark:text-[#A8B5C7] bg-slate-100 dark:bg-[#1D2B42] px-2 py-0.5 rounded-full">
            {t.scanCount} scans
          </span>
        )}

        <button
          type="button"
          className="star-btn p-1.5 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-200/70 dark:hover:bg-[#1D2B42] transition-all cursor-pointer relative z-10"
          title={t.isFavorite ? "Unpin site" : "Pin site"}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(t);
          }}
        >
          <Star className={`h-3.5 w-3.5 ${t.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-amber-400'}`} />
        </button>
      </div>
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Effect to toggle light/dark theme class on document.body dynamically
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  // Resilient client-side 15-second SRE auto-polling loop
  useEffect(() => {
    if (!autoRefresh || !url) return;

    const interval = setInterval(() => {
      fetchStats(urlRef.current);
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Ref to hold the latest url so the socket closures can access it without reconnects
  const urlRef = useRef(url);
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  // Custom Toast notification states
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch telemetry details from Express backend with TLD normalizations
  const fetchStats = async (targetUrl = url) => {
    setLoading(true);
    setError(null);

    const rawTarget = typeof targetUrl === 'string' ? targetUrl : url;
    let formattedUrl = (typeof rawTarget === 'string' ? rawTarget : '').trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      const response = await axios.get(`${API_BASE}/stats?url=${encodeURIComponent(formattedUrl)}`);
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        setStats(response.data);
      } else {
        setStats(null);
      }
      if (formattedUrl !== url) {
        setUrl(formattedUrl);
      }
      if (formattedUrl.trim()) {
        axios.post(`${API_BASE}/search-history`, { query: formattedUrl.trim() })
          .then(() => fetchSearchHistory())
          .catch(() => { });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard SRE metrics. Please check network connectivity or Vercel serverless function logs.');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  // Trigger an immediate, concurrent SRE audit run
  const handleRunAudit = async (overrideUrl, analysisFrequency, serviceType) => {
    const rawTarget = typeof overrideUrl === 'string' ? overrideUrl : url;
    if (!rawTarget || typeof rawTarget !== 'string' || !rawTarget.trim()) {
      showToast('Please specify a valid website URL', 'error');
      return;
    }

    let formattedUrl = rawTarget.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setAuditLoading(true);

    // ── Scan performance logging ──────────────────────────────────────────
    const scanStart = performance.now();
    console.group(`🔍 SRE Scan Performance — ${formattedUrl}`);
    console.log(`▶ Scan Started: ${new Date().toISOString()}`);
    console.log(`  Target: ${formattedUrl}`);

    // Animated scan progress steps
    const STEPS = [
      { label: 'Scanning Website', pct: 8 },
      { label: 'Checking Pages', pct: 18 },
      { label: 'Checking SEO', pct: 32 },
      { label: 'Checking SSL', pct: 45 },
      { label: 'Checking Performance', pct: 58 },
      { label: 'Checking Images', pct: 68 },
      { label: 'Checking Links', pct: 78 },
      { label: 'Running Security Scan', pct: 88 },
      { label: 'Generating Report', pct: 96 },
    ];
    let stepIdx = 0;
    setScanProgress({ label: STEPS[0].label, pct: STEPS[0].pct });
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
      setScanProgress({ label: STEPS[stepIdx].label, pct: STEPS[stepIdx].pct });
      const elapsed = ((performance.now() - scanStart) / 1000).toFixed(2);
      console.log(`  ⏱ [${elapsed}s] ${STEPS[stepIdx].label}...`);
    }, 900);

    try {
      const response = await axios.post(`${API_BASE}/audit`, { url: formattedUrl, analysisFrequency, serviceType });
      clearInterval(stepTimer);
      setScanProgress({ label: 'Scan Complete!', pct: 100 });

      // ΓöÇΓöÇ Log scan completion ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      const scanEnd = performance.now();
      const totalDuration = ((scanEnd - scanStart) / 1000).toFixed(2);
      console.log(`Γ£à Scan Finished: ${new Date().toISOString()}`);
      console.log(`ΓÅ│ Total Scan Duration: ${totalDuration}s`);
      console.groupEnd();

      if (response.data.success) {
        setTimeout(() => setScanProgress(null), 1200);
        showToast(`Scan completed in ${totalDuration}s`, 'success');
        if (response.data.stats) {
          setStats(response.data.stats);
        }
        fetchTargets();
        axios.post(`${API_BASE}/search-history`, { query: formattedUrl.trim() })
          .then(() => fetchSearchHistory())
          .catch(() => { });

        setCrawlData(null);
        setCrawlLoading(true);
        const crawlStart = performance.now();
        console.log(`≡ƒò╖ Crawl started for ${formattedUrl}`);
        axios.post(`${API_BASE}/crawl`, { url: formattedUrl })
          .then(crawlResp => {
            if (crawlResp.data.success) setCrawlData(crawlResp.data);
            console.log(`≡ƒò╖ Crawl finished in ${((performance.now() - crawlStart) / 1000).toFixed(2)}s`);
          })
          .catch(() => { })
          .finally(() => setCrawlLoading(false));
      }
    } catch (err) {
      clearInterval(stepTimer);
      setScanProgress(null);
      const scanEnd = performance.now();
      console.error(`Γ¥î Scan failed after ${((scanEnd - scanStart) / 1000).toFixed(2)}s`, err);
      console.groupEnd();
      showToast(err.response?.data?.error || 'Scan execution failed.', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
    setInitializing(false);

    // Establish Socket.io connection to backend SRE Gateway
    const socket = io(SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : ''), {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('≡ƒôí Connected to SRE WebSocket Broadcast Portal');
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Γ¥î Disconnected from SRE WebSocket Broadcast Portal');
      setIsSocketConnected(false);
    });

    // Handle live micro-telemetry ping ticks
    socket.on('liveTelemetry', (beat) => {
      const normalizedCurrent = normalizeUrlString(urlRef.current);
      const normalizedBeat = normalizeUrlString(beat.url);

      if (normalizedCurrent === normalizedBeat) {
        setStats((prev) => {
          if (!prev) return prev;

          // Prepend new beat to history and keep last 30 entries
          const updatedHistory = [beat, ...(prev.historyLog || [])].slice(0, 30);

          return {
            ...prev,
            latestStatus: {
              ...prev.latestStatus,
              isUp: beat.isUp,
              statusCode: beat.statusCode,
              loadTimeMs: beat.loadTimeMs,
              ttfbMs: beat.ttfbMs,
              dnsResolutionTimeMs: beat.dnsResolutionTimeMs,
              checkedAt: beat.checkedAt
            },
            historyLog: updatedHistory
          };
        });
      }
    });

    // Handle full deep-audit completes (cron or manual run on another terminal)
    socket.on('auditCompleted', (freshStats) => {
      fetchTargets(true);
      const normalizedCurrent = normalizeUrlString(urlRef.current);
      const normalizedAudit = normalizeUrlString(freshStats.url);

      if (normalizedCurrent === normalizedAudit) {
        setStats(freshStats);
        showToast('Real-time SRE audit synchronized!', 'success');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Map/align backend schema variables to the custom props structure requested by user
  let safeStats = (stats && typeof stats === 'object' && !Array.isArray(stats)) ? stats : null;
  if (safeStats) {
    if (!safeStats.sslData) safeStats.sslData = safeStats.latestStatus?.ssl;
    if (!safeStats.securityData) safeStats.securityData = safeStats.latestStatus?.security;
    if (!safeStats.seoData) safeStats.seoData = safeStats.latestStatus?.seo;
    if (!safeStats.uiUxData) safeStats.uiUxData = safeStats.latestStatus?.uiUx;
    if (!safeStats.pageAnalysisData) safeStats.pageAnalysisData = safeStats.latestStatus?.pageAnalysis;
    if (!safeStats.malwareData) safeStats.malwareData = safeStats.latestStatus?.malware;
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-[#F1F5F9] font-sans relative overflow-x-clip">

      {/* Subtle Ambient Background Glows (Blue-based, non-intrusive) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[55%] rounded-full bg-blue-600/5 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[50%] rounded-full bg-sky-500/5 blur-[130px] pointer-events-none"></div>

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      {viewMode !== 'client' && (
      <header className="bg-white dark:bg-[#111B2E] border-b border-slate-200 dark:border-[#2B3B53] fixed top-0 left-0 right-0 z-50 h-16 w-full shadow-sm transition-colors duration-200">
        <div className="px-3 lg:px-5 h-16 flex items-center justify-between gap-2 lg:gap-4">

          {/* Left: Official GA Vector Symbol & Portal Title + Hamburger for Mobile */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger — only visible when in detail view */}
            {viewMode === 'detail' && (
              <button
                className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#162238] hover:bg-slate-50 dark:hover:bg-[#1D2B42] transition-all text-slate-600 dark:text-[#A8B5C7] cursor-pointer shadow-xs shrink-0"
                onClick={() => setSidebarOpen(v => !v)}
                aria-label="Toggle navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Standalone Official GA Vector Symbol */}
              <div className="w-8 h-8 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0 shadow-xs">
                <GASymbol className="w-6 h-6" cutoutColor={isDark ? "#111B2E" : "#FFFFFF"} />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 leading-tight whitespace-nowrap">
                  <span>GA Web Telemetry</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                    Client Hub
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-[#A8B5C7] font-normal tracking-wide block leading-tight whitespace-nowrap">
                  Website Health &amp; Client Care
                </span>
              </div>
            </div>

            {/* Target breadcrumb (shown in detail view on xl+ screens to prevent 1024-1280px wrapping) */}
            {viewMode === 'detail' && (
              <div className="hidden xl:flex items-center gap-2 pl-3 ml-2 border-l border-slate-200 dark:border-[#2B3B53] text-xs min-w-0">
                <span className="text-slate-500 dark:text-[#A8B5C7] text-[11px] font-medium uppercase tracking-wider shrink-0">Target:</span>
                <code className="font-mono text-slate-800 dark:text-[#F1F5F9] bg-slate-100 dark:bg-[#1D2B42] px-2 py-0.5 rounded-md text-xs border border-slate-200 dark:border-[#2B3B53] font-normal truncate max-w-[200px]">
                  {url}
                </code>
              </div>
            )}
          </div>

          {/* Right Controls: Dashboard, Catalogues, Single View Metric, Client Portal Link, Live Socket Status, & Theme Toggle */}
          <div className="flex items-center gap-1.5 lg:gap-2 text-xs shrink-0">
            {/* Primary Navigation 1: Dashboard Navigation Button */}
            <button
              onClick={() => setViewMode('dashboard')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap ${
                viewMode === 'dashboard'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#162238] text-slate-700 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-[#1D2B42]'
              }`}
              title="Central Website Overview Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Primary Navigation 2: Catalogues Button */}
            <button
              onClick={() => { setViewMode('grid'); fetchTargets(); }}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#162238] text-slate-700 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-[#1D2B42]'
              }`}
              title="Websites Catalogues"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Catalogues</span>
            </button>

            {/* Single View Metric Button in Top Navbar (when a site is selected in detail view) */}
            {viewMode === 'detail' && (
              <button
                onClick={() => setActiveTab('single_view')}
                className={`hidden md:inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap ${
                  activeTab === 'single_view'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#162238] text-slate-700 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-[#1D2B42]'
                }`}
                title="Single View Metric Dashboard"
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Single View Metric</span>
                <span className="xl:hidden">Single View</span>
              </button>
            )}

            {/* Client Portal Link (Port 3002) */}
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#162238] text-slate-700 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
              title="Open Client Portal on port 3002"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden xl:inline">Client Portal (3002)</span>
              <span className="xl:hidden">Portal</span>
            </a>

            {/* Live Socket Status Pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-xs whitespace-nowrap shrink-0 ${
              isSocketConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-[#1D2B42] text-slate-600 dark:text-[#A8B5C7] border-slate-200 dark:border-[#2B3B53]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSocketConnected ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span className="hidden lg:inline">{isSocketConnected ? 'Live Sync' : 'Checking'}</span>
            </span>

            {/* Custom Capsule Theme Switch */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="theme-switch-track focus:outline-none focus:ring-2 focus:ring-blue-500/40 shrink-0" 
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Light and Dark Mode"
              role="switch"
              aria-checked={isDark ? "true" : "false"}
            >
              <div className="theme-switch-thumb">
                <div className="theme-switch-sun"></div>
                <div className="theme-switch-moon">
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#58A6FF] filter drop-shadow-[0_0_5px_rgba(88,166,255,0.6)]" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

        </div>
      </header>
      )}

      {/* ── BODY: sidebar + main content ─────────────────────────────────── */}
      <div className={`flex relative z-10 ${viewMode !== 'client' ? 'pt-16' : 'pt-0'}`} style={{ minHeight: '100vh' }}>

        {/* ── MOBILE OVERLAY ── */}
        {viewMode === 'detail' && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LEFT SIDEBAR (Only visible when viewing site detail telemetry) ── */}
        {viewMode === 'detail' && (
          <aside className={`
            fixed top-16 left-0 z-30
            h-[calc(100vh-64px)]
            w-60 shrink-0
            bg-white dark:bg-[#111B2E] border-r border-slate-200 dark:border-[#2B3B53]
            flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            overflow-y-auto
          `}>

            {/* Mobile close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#2B3B53] md:hidden">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-[#A8B5C7] uppercase tracking-wider">Navigation Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col p-2.5 space-y-2.5 flex-1">
              {/* Primary Nav 1: Central Dashboard Button in Sidebar */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A8B5C7] px-3 block mb-1">
                  Main Navigation
                </span>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setViewMode('dashboard'); setSidebarOpen(false); }}
                    className={`resend-nav-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left cursor-pointer group w-full ${
                      viewMode === 'dashboard'
                        ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 font-medium'
                        : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#1D2B42] border border-transparent font-medium'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <LayoutDashboard className={`h-4 w-4 nav-icon-base nav-anim-bounce ${
                        viewMode === 'dashboard'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-[#A8B5C7] group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`} />
                    </div>
                    <span className="text-xs tracking-tight truncate">Dashboard</span>
                    {viewMode === 'dashboard' && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() => { setViewMode('grid'); setSidebarOpen(false); fetchTargets(); }}
                    className={`resend-nav-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left cursor-pointer group w-full ${
                      viewMode === 'grid'
                        ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 font-medium'
                        : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#1D2B42] border border-transparent font-medium'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Globe className={`h-4 w-4 nav-icon-base nav-anim-tilt ${
                        viewMode === 'grid'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-[#A8B5C7] group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`} />
                    </div>
                    <span className="text-xs tracking-tight truncate">Catalogues</span>
                    {viewMode === 'grid' && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {(() => {
                const currentTarget = targets.find(t => normalizeUrlString(t.url) === normalizeUrlString(url));
                const currentServiceType = safeStats?.serviceType || currentTarget?.serviceType || 'maintenance';
                const isHosting = currentServiceType === 'hosting';

                const navGroups = [
                  {
                    title: 'Executive View',
                    tabs: [
                      { id: 'single_view', label: 'Single View Metric', icon: BarChart3, anim: 'nav-anim-bounce', hosting: true },
                    ]
                  },
                  {
                    title: 'Core Reliability',
                    tabs: [
                      { id: 'uptime', label: 'Uptime & Logs', icon: Activity, anim: 'nav-anim-pulse', hosting: true },
                      { id: 'ssl', label: 'SSL & Security', icon: ShieldCheck, anim: 'nav-anim-pulse', hosting: true },
                      { id: 'malware', label: 'Malware Scan', icon: ShieldAlert, anim: 'nav-anim-bounce', hosting: true },
                    ]
                  },
                  {
                    title: 'Deep Diagnostics',
                    tabs: [
                      { id: 'site_analysis', label: 'Site Analysis', icon: BarChart2, anim: 'nav-anim-bounce', hosting: false },
                      { id: 'seo', label: 'SEO Optimization', icon: Globe, anim: 'nav-anim-tilt', hosting: false },
                      { id: 'database', label: 'Database Health', icon: Database, anim: 'nav-anim-bounce', hosting: false },
                      { id: 'image_analyzer', label: 'Image Optimization', icon: ImageIcon, anim: 'nav-anim-tilt', hosting: false },
                      { id: 'accessibility', label: 'Accessibility Audit', icon: Eye, anim: 'nav-anim-pulse', hosting: false },
                      { id: 'visual_integrity', label: 'UI Visual Integrity', icon: ArrowRightLeft, anim: 'nav-anim-flip', hosting: false },
                    ]
                  },
                  {
                    title: 'Platform & Alerts',
                    tabs: [
                      { id: 'wordpress', label: 'WordPress CMS', icon: Layers, anim: 'nav-anim-bounce', hosting: false },
                      { id: 'domain_expiry', label: 'Domain Details', icon: CalendarClock, anim: 'nav-anim-tilt', hosting: false },
                      { id: 'email_alerts', label: 'Email Alerts', icon: Mail, anim: 'nav-anim-bounce', hosting: true },
                      { id: 'settings', label: 'Gmail & Settings', icon: Settings, anim: 'nav-anim-spin', hosting: true },
                    ]
                  }
                ];

                return navGroups.map((group) => {
                  const visibleTabs = isHosting
                    ? group.tabs.filter(t => t.hosting)
                    : group.tabs;

                  if (visibleTabs.length === 0) return null;

                  return (
                    <div key={group.title} className="space-y-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A8B5C7] px-3 block mb-0.5">
                        {group.title}
                      </span>
                      <div className="space-y-0.5">
                        {visibleTabs.map(({ id, label, icon: Icon, anim }) => {
                          const isActive = viewMode === 'detail' && activeTab === id;
                          return (
                            <button
                              key={id}
                              onClick={() => { setViewMode('detail'); setActiveTab(id); setSidebarOpen(false); }}
                              className={`resend-nav-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left cursor-pointer group w-full ${
                                isActive
                                  ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 font-medium'
                                  : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#1D2B42] border border-transparent font-medium'
                              }`}
                            >
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <Icon className={`h-4 w-4 nav-icon-base ${anim || 'nav-anim-bounce'} ${
                                  isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 dark:text-[#A8B5C7] group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                }`} />
                              </div>
                              <span className="text-xs tracking-tight truncate">{label}</span>
                              {isActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}

              {/* System Access Section */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block">
                  System Access
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('detail');
                    setActiveTab(activeTab === 'admin' ? 'uptime' : 'admin');
                    setSidebarOpen(false);
                  }}
                  className={`resend-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-left cursor-pointer group w-full ${
                    activeTab === 'admin'
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 font-medium shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent font-medium'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Shield className={`h-4 w-4 nav-icon-base ${
                      activeTab === 'admin'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                  </div>
                  <span className="text-xs tracking-tight truncate">
                    {activeTab === 'admin' ? '← Exit Admin' : 'Admin Security'}
                  </span>
                  {activeTab === 'admin' && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  )}
                </button>
              </div>

            </nav>

            {/* Socket status indicator at bottom of sidebar */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider">
                  {isSocketConnected ? 'Live SRE Stream' : 'Offline / Polling'}
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <main className={`flex-1 min-w-0 ${viewMode === 'client' ? 'p-0' : 'px-4 md:px-6 py-8 pb-12'} ${viewMode === 'detail' ? 'md:ml-60' : ''}`}>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm animate-fade-in-up">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div><strong>System Error:</strong> {error}</div>
            </div>
          )}

          {/* 1. CENTRAL DASHBOARD OVERVIEW */}
          {viewMode === 'dashboard' ? (
            <CentralDashboard
              isDark={isDark}
              onSelectWebsite={handleSelectWebsite}
              onOpenCatalogues={() => {
                setViewMode('grid');
                fetchTargets();
              }}
              onOpenClientView={(siteUrl) => {
                setUrl(siteUrl);
                setViewMode('client');
              }}
            />
          ) : viewMode === 'grid' ? (
            /* 2. WEBSITES GRID CATALOG VIEW */
            <WebsitesCatalog
              targets={targets}
              pagination={catalogPagination}
              isLoading={targetsLoading}
              onSelectWebsite={handleSelectWebsite}
              onAddWebsite={handleAddWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              onToggleFavorite={toggleFavorite}
              onRefreshTargets={fetchTargets}
              onOpenClientView={(siteUrl) => {
                setUrl(siteUrl);
                setViewMode('client');
              }}
              isScanning={auditLoading}
            />
          ) : viewMode === 'client' ? (
            /* 2. CLIENT PERFORMANCE PORTAL VIEW */
            <GlobalErrorBoundary resetKey={url} onReset={() => fetchStats(url)}>
              <ClientViewDashboard
                initialUrl={url}
                onBack={!isDirectClient ? () => setViewMode('detail') : null}
                isDirectClient={isDirectClient}
                isDark={isDark}
              />
            </GlobalErrorBoundary>
          ) : (
            /* 3. FULL TRACKING DETAIL DASHBOARD VIEW */
            <div className="space-y-6">
              {/* Back to Catalog & Target Status Header */}
              {safeStats && (
                <div className="elevated-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex md:hidden items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setViewMode('dashboard')}
                        className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#1D2B42] text-slate-600 dark:text-[#A8B5C7] hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-xs active:scale-95 text-xs font-medium flex items-center gap-1"
                        title="Back to Overview Dashboard"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setViewMode('grid'); fetchTargets(); }}
                        className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-[#2B3B53] bg-slate-50 dark:bg-[#1D2B42] text-slate-600 dark:text-[#A8B5C7] hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-xs active:scale-95 text-xs font-medium flex items-center gap-1"
                        title="Back to Websites Catalog"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-12 h-12 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0">
                      <Icon3DServer className="w-9 h-9" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Audit Target</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          safeStats.serviceType === 'hosting'
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                        }`}>
                          {safeStats.serviceType === 'hosting' ? '☁️ HOSTING SERVICE' : '🛠️ WEBSITE MAINTENANCE'}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate mt-0.5">
                        <span className="truncate">{safeStats.url}</span>
                        <a
                          href={safeStats.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5 transition-colors"
                          title="Open external website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </h2>
                    </div>
                  </div>

                  {/* Right Header Status Indicators & Actions */}
                  <div className="flex items-center gap-3 flex-wrap self-end md:self-auto">
                    {/* Status Badge */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider block">Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-[10px] mt-1 border ${
                        safeStats.latestStatus?.isUp
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${safeStats.latestStatus?.isUp ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-rose-600 dark:bg-rose-400'}`} />
                        <span>{safeStats.latestStatus?.isUp ? 'ACTIVE ONLINE' : 'INCIDENT / DOWN'}</span>
                      </span>
                    </div>

                    {/* WordPress Badge */}
                    {safeStats.serviceType !== 'hosting' && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider block">CMS Core</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[10px] mt-1 border ${
                          safeStats.wordpress?.isWordPress
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {safeStats.wordpress?.isWordPress ? 'WORDPRESS' : 'CUSTOM / STATIC'}
                        </span>
                      </div>
                    )}

                    {/* Preview Client View Button */}
                    <button
                      onClick={() => setViewMode('client')}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Preview client-facing performance dashboard"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Client View</span>
                    </button>
                  </div>
                </div>
              )}

              <GlobalErrorBoundary resetKey={url} onReset={() => fetchStats(url)}>
                {/* Dynamic tab content panel — protected by GlobalErrorBoundary */}
                {activeTab === 'admin' ? (
                  isAuthenticated ? (
                    <AdminDashboard adminName={adminUser} loginTime={loginTime} onLogout={handleLogout} />
                  ) : (
                    <AdminLogin onLoginSuccess={handleLoginSuccess} onCancel={() => setActiveTab('uptime')} />
                  )
                ) : activeTab === 'settings' ? (
                  <SettingsPanel showToast={showToast} />
                ) : activeTab === 'email_alerts' ? (
                  <EmailAlertSettings siteUrl={safeStats?.url || url} showToast={showToast} />
                ) : activeTab === 'domain_expiry' ? (
                  <DomainExpiryDashboard isDark={isDark} url={safeStats?.url || url} />
                ) : (loading && !safeStats) || initializing ? (
                  <div className="py-24 text-center animate-fade-in-up">
                    <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 rotate-infinite mx-auto mb-4" />
                    <h4 className="font-medium text-slate-800 dark:text-[#F1F5F9]">Synchronizing SRE monitoring telemetry...</h4>
                    <p className="text-xs text-slate-500 dark:text-[#A8B5C7] mt-1">Fetching local histories and alert logs from MongoDB</p>
                  </div>
                ) : safeStats ? (
                  <div className="space-y-8">
                    {activeTab === 'single_view' && (
                      <SingleViewMetricDashboard stats={safeStats} onRefresh={() => fetchStats(url)} isDark={isDark} />
                    )}
                    {activeTab === 'uptime' && (
                      <UptimeDashboard stats={safeStats} isSocketConnected={isSocketConnected} onNavigateToAlt={handleNavigateToAlt} />
                    )}
                    {activeTab === 'wordpress' && (
                      <WordPressDashboard wordpressData={safeStats.wordpress} />
                    )}
                    {activeTab === 'database' && (
                      <DatabaseDashboard historyLog={safeStats.historyLog} currentStatus={safeStats.latestStatus} />
                    )}
                    {activeTab === 'ssl' && (
                      <SSLMonitor sslData={safeStats?.sslData} securityData={safeStats?.securityData} />
                    )}
                    {activeTab === 'seo' && (
                      <SeoDashboard seoData={safeStats?.seoData} crawlData={crawlData} currentUrl={safeStats?.url || url} onNavigateToAlt={handleNavigateToAlt} />
                    )}
                    {activeTab === 'accessibility' && (
                      <AccessibilityAudit
                        uiUxData={safeStats?.uiUxData}
                        mobileFriendliness={safeStats?.seoData?.mobileFriendliness}
                      />
                    )}
                    {activeTab === 'visual_integrity' && (
                      <VisualIntegrityDashboard stats={safeStats} />
                    )}
                    {activeTab === 'site_analysis' && (
                      <SiteAnalysisDashboard
                        pageAnalysisData={safeStats?.pageAnalysisData}
                        seoData={safeStats?.seoData}
                        activeAlerts={safeStats?.activeAlerts}
                        crawlData={crawlData}
                        crawlLoading={crawlLoading}
                        altHighlight={siteAnalysisAltHighlight}
                      />
                    )}
                    {activeTab === 'image_analyzer' && (
                      <ImageOptimizationAnalyzer
                        stats={safeStats}
                        crawlData={crawlData}
                        url={safeStats?.url || safeStats?.latestStatus?.url || url}
                        isDark={isDark}
                      />
                    )}
                    {activeTab === 'malware' && (
                      <MalwareReport
                        malwareData={safeStats?.malwareData}
                        targetUrl={url || safeStats?.url || safeStats?.latestStatus?.url}
                        onRescan={(newData) => setStats(prev => prev ? { ...prev, malwareData: newData } : { malwareData: newData })}
                      />
                    )}
                    {activeTab === 'images' && (
                      <ImageOptimization seoData={safeStats?.seoData} crawlData={crawlData} />
                    )}
                  </div>
                ) : (
                  <div className="py-16 px-6 text-center glass-card border-dashed border-slate-300 dark:border-[#2B3B53] rounded-3xl max-w-2xl mx-auto my-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <Activity className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">No Website Selected</h4>
                    <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2 max-w-md mx-auto">
                      Enter a website URL below to launch an instant SRE audit scan, or select a site from the catalog.
                    </p>

                    <form
                      onSubmit={(e) => { e.preventDefault(); handleRunAudit(); }}
                      className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
                    >
                      <div className="form-input-container w-full">
                        <Search className="text-slate-500 h-4 w-4 shrink-0" />
                        <input
                          type="text"
                          placeholder="Enter domain URL (e.g. wordpress.org)"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-slate-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || auditLoading}
                        className="w-full sm:w-auto h-[42px] px-5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${auditLoading ? 'rotate-infinite' : ''}`} />
                        <span>{auditLoading ? 'Scanning...' : 'Run Scan'}</span>
                      </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-[#2B3B53]">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
                      >
                        ← Browse Websites Catalog
                      </button>
                    </div>
                  </div>
                )}
              </GlobalErrorBoundary>
            </div>
          )}

          {/* Targets Switcher Pill Bar (Shown only in single target detail view) */}
          {viewMode === 'detail' && (
            <div className="mt-12 pt-6 border-t border-slate-800/80 animate-fade-in-up">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest block mb-2.5">Audited Targets (Previous Links Scan History)</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {targets.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No targets audited yet. Enter a website URL above to begin scanning.</span>
                ) : (
                  targets.map((tgt) => {
                    const isActive = normalizeUrlString(url) === normalizeUrlString(tgt.url);
                    return (
                      <button
                        key={tgt.url}
                        onClick={() => { setUrl(tgt.url); fetchStats(tgt.url); }}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 ${isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tgt.isUp ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                        <span>{tgt.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── SCAN PROGRESS OVERLAY ────────────────────────────────────────── */}
      {scanProgress && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 w-full max-w-sm mx-4 text-center shadow-2xl">
            <div className="mb-5">
              <div className="h-14 w-14 rounded-full bg-blue-600/15 border-2 border-blue-500 flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="h-7 w-7 text-blue-600 dark:text-blue-400 rotate-infinite" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-base">Scanning Website</h3>
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 truncate">{url}</p>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{scanProgress.label}...</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-[#1D2B42] rounded-full h-3 overflow-hidden border border-slate-300 dark:border-[#2B3B53] mb-2 progress-track">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-700 ease-out"
                style={{ width: `${scanProgress.pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-[#A8B5C7] font-medium">
              <span>0%</span>
              <span className={`font-semibold ${scanProgress.pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>{scanProgress.pct}%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#A8B5C7] mt-4 italic">Please wait — this usually takes 5–15 seconds</p>
          </div>
        </div>
      )}

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] animate-fade">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-medium bg-white dark:bg-[#162238] ${toast.type === 'success' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40' :
            toast.type === 'error' ? 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/40' :
              'text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/40'
            }`}>
            {toast.type === 'success' && <ShieldCheck className="h-4 w-4" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {toast.type === 'info' && <BellRing className="h-4 w-4 animate-bounce" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
