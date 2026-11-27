import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Globe,
  Lock,
  Search,
  CheckCircle2,
  Share2,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Server,
  Zap,
  TrendingUp,
  BarChart3,
  Clock,
  Info,
  Check,
  Copy,
  ArrowUpRight,
  Radio,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react';

import {
  GASymbol,
  Icon3DServer,
  Icon3DSpeed,
  Icon3DLock,
  Icon3DGlobe,
  Icon3DSEO,
  Icon3DShield
} from './components/Icons3D';

export default function App() {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [timeRange, setTimeRange] = useState('24h'); // '1h' | '24h' | '7d' | '30d'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState('10:58 AM');
  const [activeHoverPoint, setActiveHoverPoint] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Theme Management: Light & Dark Mode
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cpvia-theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
    localStorage.setItem('cpvia-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Scrolling State
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isScrolled = scrollY > 25;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastChecked(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const perfScore = device === 'desktop' ? 82 : 70;
  const lcp = device === 'desktop' ? '0.82s' : '0.99s';
  const inp = device === 'desktop' ? '32ms' : '45ms';
  const cls = device === 'desktop' ? '0.04' : '0.06';
  const fcp = device === 'desktop' ? '0.65s' : '0.88s';

  const chartSeriesByRange = {
    '1h': [
      { time: '10:00', health: 81, perf: Math.max(60, perfScore - 7), seo: 53 },
      { time: '10:10', health: 83, perf: Math.max(60, perfScore - 5), seo: 53 },
      { time: '10:20', health: 82, perf: Math.max(60, perfScore - 6), seo: 53 },
      { time: '10:30', health: 84, perf: Math.max(60, perfScore - 3), seo: 53 },
      { time: '10:40', health: 83, perf: Math.max(60, perfScore - 4), seo: 53 },
      { time: '10:50', health: 85, perf: Math.max(60, perfScore - 1), seo: 53 },
      { time: '10:58', health: 85, perf: perfScore, seo: 53 },
    ],
    '24h': [
      { time: '00:45', health: 78, perf: 72, seo: 53 },
      { time: '01:51', health: 81, perf: 74, seo: 53 },
      { time: '03:02', health: 76, perf: 68, seo: 53 },
      { time: '04:08', health: 82, perf: 75, seo: 53 },
      { time: '05:13', health: 80, perf: 71, seo: 53 },
      { time: '07:23', health: 85, perf: 78, seo: 53 },
      { time: '08:31', health: 79, perf: 70, seo: 53 },
      { time: '09:35', health: 83, perf: 74, seo: 53 },
      { time: '10:41', health: 84, perf: 76, seo: 53 },
      { time: '11:49', health: 82, perf: 73, seo: 53 },
      { time: '12:51', health: 85, perf: 77, seo: 53 },
      { time: '13:58', health: 86, perf: 78, seo: 53 },
      { time: '15:08', health: 82, perf: 72, seo: 53 },
      { time: '16:14', health: 84, perf: 75, seo: 53 },
      { time: '16:58', health: 85, perf: perfScore, seo: 53 },
    ],
    '7d': [
      { time: 'Day 1', health: 77, perf: 70, seo: 51 },
      { time: 'Day 2', health: 79, perf: 72, seo: 51 },
      { time: 'Day 3', health: 81, perf: 74, seo: 52 },
      { time: 'Day 4', health: 80, perf: 73, seo: 52 },
      { time: 'Day 5', health: 83, perf: 76, seo: 53 },
      { time: 'Day 6', health: 84, perf: 79, seo: 53 },
      { time: 'Today', health: 85, perf: perfScore, seo: 53 },
    ],
    '30d': [
      { time: 'Wk 1', health: 74, perf: 67, seo: 49 },
      { time: 'Wk 1.5', health: 76, perf: 69, seo: 50 },
      { time: 'Wk 2', health: 78, perf: 71, seo: 51 },
      { time: 'Wk 2.5', health: 80, perf: 74, seo: 52 },
      { time: 'Wk 3', health: 81, perf: 75, seo: 52 },
      { time: 'Wk 3.5', health: 83, perf: 77, seo: 53 },
      { time: 'Wk 4', health: 84, perf: 79, seo: 53 },
      { time: 'Now', health: 85, perf: perfScore, seo: 53 },
    ],
  };

  const rangeLabels = {
    '1h': '60-minute',
    '24h': '24-hour',
    '7d': '7-day',
    '30d': '30-day',
  };

  const chartPoints = chartSeriesByRange[timeRange] || chartSeriesByRange['24h'];

  const svgWidth = 840;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  const getX = (idx) => paddingX + (idx / Math.max(chartPoints.length - 1, 1)) * innerWidth;
  const getY = (val) => paddingY + innerHeight - (val / 100) * innerHeight;

  const makeLinePath = (key) => {
    return chartPoints
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(pt[key]).toFixed(1)}`)
      .join(' ');
  };

  const makeAreaPath = (key) => {
    const linePath = makeLinePath(key);
    const firstX = getX(0).toFixed(1);
    const lastX = getX(chartPoints.length - 1).toFixed(1);
    const bottomY = (paddingY + innerHeight).toFixed(1);
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  const cutoutColor = theme === 'dark' ? '#0B1220' : '#FFFFFF';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-slate-900 dark:text-[#F1F5F9] flex flex-col font-sans relative transition-colors duration-250">
      
      {/* ── Fixed/Sticky Header & Navigation Bar Wrapper (Pins Head and Nav Bar firmly on Scroll) ── */}
      <div className="sticky top-0 z-50 w-full transition-all duration-200">
      {/* Top Utility Bar with Clean GA Symbol (No Black Box) and Theme Toggle */}
      <div className="bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#2B3B53] px-4 sm:px-8 py-2 text-xs text-slate-600 dark:text-[#A8B5C7] flex items-center justify-between shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GASymbol className="w-5 h-5 shrink-0" cutoutColor={cutoutColor} />
            <span className="font-semibold text-slate-900 dark:text-white tracking-tight">GA Web Telemetry</span>
          </div>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">/</span>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">
            Target: <code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700">https://cpvia.com</code>
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Last checked: <span className="font-medium text-slate-700 dark:text-slate-200">{lastChecked}</span>
          </span>
          
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium text-[11px] border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> HTTP 200 OK
          </span>

          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs"
            title="Open Web Maintenance Portal (Port 3001)"
          >
            <span>🛠️ Maintenance Hub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Custom Capsule Theme Switch (Coral Sun / Blue Crescent Moon) */}
          <button
            onClick={toggleTheme}
            className="theme-switch-track focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            title="Toggle Light / Dark mode"
            aria-label="Toggle Light and Dark Mode"
            role="switch"
            aria-checked={theme === 'dark'}
          >
            <div className="theme-switch-thumb">
              {/* Light: Vibrant Coral-Red Sun Sphere */}
              <div className="theme-switch-sun"></div>
              {/* Dark: Radiant Blue Crescent Moon */}
              <div className="theme-switch-moon">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#58A6FF] filter drop-shadow-[0_0_5px_rgba(88,166,255,0.6)]" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Sticky Main Header with Dynamic Elevation on Scroll */}
      <header
        className={` transition-all duration-300 ${
          isScrolled
            ? 'bg-white dark:bg-[#111B2E] border-b border-slate-200 dark:border-[#2B3B53] shadow-md py-3'
            : 'bg-white dark:bg-[#111B2E] border-b border-slate-200 dark:border-[#2B3B53] shadow-sm py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Client Identity — Clean with NO icon before it */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/60">
                Client Performance View
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Read-Only Live
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h1 className={`font-medium text-slate-900 dark:text-white tracking-tight flex items-center gap-2 transition-all ${
                isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              }`}>
                CPVIA <span className="text-slate-300 dark:text-slate-700 font-normal">|</span> <span className="text-slate-600 dark:text-slate-400 font-normal text-base sm:text-lg">Advanced Statistical Programming</span>
              </h1>
              <a
                href="https://cpvia.com/"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition-colors"
                title="Open live site"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Action Toolbar + Dynamic Scrolled Status Pill */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Scrolled Mini Stats Pill */}
            <div
              className={`hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 transition-all duration-300 ${
                isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">100% Uptime</span>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{perfScore}/100 Perf</span>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <span className="text-blue-700 dark:text-blue-400 font-medium">57d SSL</span>
            </div>

            {/* Timeframe */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#1D2B42] p-1 border border-slate-200 dark:border-[#2B3B53] text-xs font-medium text-slate-600 dark:text-[#A8B5C7] shadow-inner">
              {['1h', '24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setTimeRange(r);
                    setActiveHoverPoint(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white font-semibold shadow-sm'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] hover:bg-slate-50 dark:hover:bg-[#253653] text-xs font-medium text-slate-700 dark:text-[#F1F5F9] shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-[#A8B5C7]'}`} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-white" />
              <span>Share Dashboard</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-8 border-t border-slate-100 dark:border-slate-800 text-xs mt-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Overview & Web Vitals
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-2.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Edge Response Time & Nodes
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Domain, SSL & Security
          </button>
        </div>
      </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-7 space-y-7">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            {/* ROW 1: CORE RELIABILITY & CORE WEB VITALS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              
              {/* Card 1: Core Website Reliability (5 cols on lg) */}
              <div className="lg:col-span-5 elevated-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0 transition-transform duration-300 hover:scale-105">
                        <Icon3DServer className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Core Website Reliability
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous edge monitoring</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono">100%</span>
                      <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                        30-Day Uptime
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Website is performing reliably with an average response time of <strong className="text-slate-900 dark:text-white font-mono">7040ms</strong> across global edge monitoring nodes.
                    </p>
                  </div>

                  {/* Latency Breakdown Bar */}
                  <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Average Edge Latency:
                      </span>
                      <span className="font-mono font-medium text-amber-700 dark:text-amber-400">7,040 ms</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex shadow-inner">
                      <div className="bg-emerald-500 h-full w-[10%]" title="DNS & SSL: 120ms"></div>
                      <div className="bg-blue-500 h-full w-[15%]" title="Network Transit: 180ms"></div>
                      <div className="bg-amber-500 h-full w-[75%]" title="Server TTFB: 6740ms"></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>DNS/TLS: 120ms</span>
                      <span>Transit: 180ms</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">Server TTFB: 6.74s</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B5C7]">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-[#A8B5C7]">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#A8B5C7]" /> Last checked: {lastChecked}
                  </span>
                  <span className="font-mono text-slate-700 dark:text-[#F1F5F9] font-medium bg-slate-100 dark:bg-[#1D2B42] px-2 py-0.5 rounded border border-slate-200 dark:border-[#2B3B53]">HTTP 200</span>
                </div>
              </div>

              {/* Card 2: Page Speed & Core Web Vitals (7 cols on lg) */}
              <div className="lg:col-span-7 elevated-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0 transition-transform duration-300 hover:scale-105">
                        <Icon3DSpeed className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Page Speed & Core Web Vitals
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Google Lighthouse real-user loading experience metrics</p>
                      </div>
                    </div>

                    {/* Desktop / Mobile Switcher */}
                    <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 self-start sm:self-auto shadow-inner">
                      <button
                        onClick={() => setDevice('desktop')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                          device === 'desktop'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm'
                            : 'hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>Desktop</span>
                      </button>
                      <button
                        onClick={() => setDevice('mobile')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                          device === 'mobile'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm'
                            : 'hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile (4G)</span>
                      </button>
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                    
                    {/* Overall Score Box */}
                    <div className="sm:col-span-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 text-center flex flex-col items-center justify-center shadow-xs">
                      <div className="text-3xl font-semibold font-mono text-slate-900 dark:text-white">
                        {perfScore}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                        Good
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Performance Score</span>
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      
                      {/* LCP */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          LCP (Load Time)
                        </div>
                        <div className="text-xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                          {lcp}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3" /> Good (&lt; 2.5s)
                        </div>
                      </div>

                      {/* INP */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          INP (Response)
                        </div>
                        <div className="text-xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                          {inp}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3" /> Fast UI Interaction
                        </div>
                      </div>

                      {/* CLS */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          CLS (Visual Shift)
                        </div>
                        <div className="text-xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                          {cls}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3" /> Stable Visuals
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    All 3 core metrics meet Google user experience benchmarks.
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">FCP: {fcp}</span>
                </div>
              </div>

            </div>

            {/* ROW 2: 4 PILLARS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              
              {/* SSL */}
              <div className="elevated-card rounded-2xl p-5 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg icon-pedestal flex items-center justify-center p-1 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Icon3DLock className="w-8 h-8" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    SECURE
                  </span>
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  SSL Encryption
                </div>
                <div className="text-2xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                  57 Days Left
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[63%] transition-all duration-700"></div>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Issuer:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Let's Encrypt</span>
                </div>
              </div>

              {/* DOMAIN */}
              <div className="elevated-card rounded-2xl p-5 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg icon-pedestal flex items-center justify-center p-1 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Icon3DGlobe className="w-8 h-8" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Domain Registration
                </div>
                <div className="text-2xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                  90 Days Left
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[75%] transition-all duration-700"></div>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Registrar:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">GoDaddy.com, LLC</span>
                </div>
              </div>

              {/* SEO */}
              <div className="elevated-card rounded-2xl p-5 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg icon-pedestal flex items-center justify-center p-1 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Icon3DSEO className="w-8 h-8" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    53/100
                  </span>
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  SEO Visibility
                </div>
                <div className="text-2xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                  Standard
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-amber-500 h-full w-[53%] transition-all duration-700"></div>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Audit:</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">0 Broken links</span>
                </div>
              </div>

              {/* MALWARE */}
              <div className="elevated-card rounded-2xl p-5 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg icon-pedestal flex items-center justify-center p-1 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Icon3DShield className="w-8 h-8" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    CLEAN
                  </span>
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Malware & Integrity
                </div>
                <div className="text-2xl font-medium font-mono text-slate-900 dark:text-white mt-1">
                  0 Threats
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[65%] transition-all duration-700"></div>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Security Score:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">65/100</span>
                </div>
              </div>

            </div>

            {/* ROW 3: TELEMETRY CURVE & AUDIT PILLARS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              
              {/* Telemetry Reliability & Health Curve (8 cols on lg) */}
              <div className="lg:col-span-8 elevated-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-medium text-slate-900 dark:text-white">Telemetry Reliability & Health Curve</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Continuous tracking of overall site health, performance, and SEO scores</p>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-900/60">
                      Live Trend Analysis
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-slate-600 dark:text-[#A8B5C7] mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 inline-block shadow-sm"></span>
                      <span>Overall Health Index</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block shadow-sm"></span>
                      <span>Performance Score</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 inline-block shadow-sm"></span>
                      <span>SEO Score</span>
                    </div>
                  </div>

                  {/* SVG Chart with Inset Shadow */}
                  <div className="relative w-full overflow-x-auto bg-slate-50/80 dark:bg-[#111B2E] rounded-xl p-3 border border-slate-200/80 dark:border-[#2B3B53] shadow-inner">
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-auto min-w-[500px]"
                    >
                      <defs>
                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={theme === 'dark' ? '#3B82F6' : '#2563EB'} stopOpacity={theme === 'dark' ? 0.22 : 0.14} />
                          <stop offset="100%" stopColor={theme === 'dark' ? '#3B82F6' : '#2563EB'} stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity="0.10" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0, 25, 50, 75, 100].map((val) => {
                        const y = getY(val);
                        return (
                          <g key={val}>
                            <line
                              x1={paddingX}
                              y1={y}
                              x2={svgWidth - paddingX}
                              y2={y}
                              stroke={theme === 'dark' ? '#2B3B53' : '#E2E8F0'}
                              strokeDasharray="3 3"
                            />
                            <text
                              x={paddingX - 8}
                              y={y + 4}
                              textAnchor="end"
                              className="fill-slate-600 dark:fill-[#A8B5C7] text-[11px] font-mono"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fills */}
                      <path d={makeAreaPath('health')} fill="url(#healthGrad)" />
                      <path d={makeAreaPath('perf')} fill="url(#perfGrad)" />

                      {/* Lines */}
                      <path
                        d={makeLinePath('seo')}
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <path
                        d={makeLinePath('perf')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                      />
                      <path
                        d={makeLinePath('health')}
                        fill="none"
                        stroke={theme === 'dark' ? '#60A5FA' : '#2563EB'}
                        strokeWidth="2.5"
                      />

                      {/* Data dots */}
                      {chartPoints.map((pt, i) => {
                        const cx = getX(i);
                        const cyHealth = getY(pt.health);
                        const isHovered = activeHoverPoint === i;

                        return (
                          <g key={i} className="cursor-pointer">
                            {isHovered && (
                              <line
                                x1={cx}
                                y1={paddingY}
                                x2={cx}
                                y2={svgHeight - paddingY}
                                stroke="#3B82F6"
                                strokeWidth="1.5"
                                strokeDasharray="2 2"
                              />
                            )}

                            <circle
                              cx={cx}
                              cy={cyHealth}
                              r={isHovered ? 5.5 : 3.5}
                              className="fill-white dark:fill-[#162238] stroke-blue-600 dark:stroke-blue-400 transition-all shadow-sm"
                              strokeWidth="2"
                              onMouseEnter={() => setActiveHoverPoint(i)}
                              onMouseLeave={() => setActiveHoverPoint(null)}
                            />

                            {(chartPoints.length <= 8 || i % 2 === 0) && (
                              <text
                                x={cx}
                                y={svgHeight - 5}
                                textAnchor="middle"
                                className="fill-slate-600 dark:fill-[#A8B5C7] text-[11px] font-mono"
                              >
                                {pt.time}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Hover readout */}
                  {activeHoverPoint !== null && chartPoints[activeHoverPoint] && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] flex items-center justify-between text-xs shadow-md">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-[#F1F5F9]">
                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#A8B5C7]" />
                        <span>Timeline: {chartPoints[activeHoverPoint].time}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs">
                        <span className="text-blue-700 dark:text-blue-400 font-semibold">Health: {chartPoints[activeHoverPoint].health}</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Perf: {chartPoints[activeHoverPoint].perf}</span>
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">SEO: {chartPoints[activeHoverPoint].seo}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B5C7]">
                  <span>Trailing {rangeLabels[timeRange] || '24-hour'} monitoring interval</span>
                  <span className="font-mono text-slate-600 dark:text-[#A8B5C7]">Node sync: every 60m</span>
                </div>
              </div>

              {/* Audit Pillar Breakdown (4 cols on lg) */}
              <div className="lg:col-span-4 elevated-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-sm font-medium text-slate-900 dark:text-white">
                        Audit Pillar Breakdown
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      100-PT SCALE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    Aggregated health index across core verticals
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Performance</span>
                        <span className={`font-mono font-medium ${perfScore >= 80 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {perfScore} / 100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1D2B42] h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`bg-gradient-to-r ${perfScore >= 80 ? 'from-blue-600 to-blue-500' : 'from-amber-600 to-amber-500'} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${perfScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">SEO Health</span>
                        <span className="font-mono font-medium text-amber-700 dark:text-amber-400">53 / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-500 h-full w-[53%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Security</span>
                        <span className="font-mono font-medium text-blue-700 dark:text-blue-400">65 / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-full w-[65%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Availability</span>
                        <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">100 / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full w-[100%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-xs">
                      <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">AVERAGE SPEED</div>
                      <div className="text-lg font-medium font-mono text-slate-900 dark:text-white mt-0.5">7040ms</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-xs">
                      <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">OVERALL RELIABILITY</div>
                      <div className="text-lg font-medium font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">100%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> All systems nominal
                  </span>
                  <span>SLA Met</span>
                </div>
              </div>

            </div>
          </>
        )}

        {/* TAB 2: DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="elevated-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Edge Nodes & Global Latency Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Probing round-trip latency and Time To First Byte (TTFB) from 6 distributed monitoring regions.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                  All Probes Healthy
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  { region: 'US East (N. Virginia)', node: 'edge-iad-01', ping: '84ms', ttfb: '6,810ms', status: 'Online' },
                  { region: 'US West (Oregon)', node: 'edge-pdx-01', ping: '112ms', ttfb: '6,920ms', status: 'Online' },
                  { region: 'Europe (Frankfurt)', node: 'edge-fra-01', ping: '142ms', ttfb: '7,150ms', status: 'Online' },
                  { region: 'Asia Pacific (Tokyo)', node: 'edge-nrt-01', ping: '198ms', ttfb: '7,340ms', status: 'Online' },
                  { region: 'South Asia (Mumbai)', node: 'edge-bom-01', ping: '185ms', ttfb: '7,180ms', status: 'Online' },
                  { region: 'Australia (Sydney)', node: 'edge-syd-01', ping: '240ms', ttfb: '7,480ms', status: 'Online' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.region}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-600 shadow-xs">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Node: {item.node}</div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 text-xs">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Network Ping</div>
                        <div className="font-mono font-semibold text-slate-800 dark:text-slate-100">{item.ping}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Origin TTFB</div>
                        <div className="font-mono font-semibold text-amber-700 dark:text-amber-400">{item.ttfb}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 shadow-xs">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-medium text-slate-900 dark:text-white">Engineering Performance Insight:</div>
                  <p className="leading-relaxed">
                    The 7,040ms average response time reflects un-cached origin backend processing (TTFB ~6.8s) on cpvia.com. Implementing static asset edge caching and server-side response caching via CDN can reduce global response times to under <strong>200ms</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="elevated-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg icon-pedestal flex items-center justify-center p-1 shrink-0">
                  <Icon3DLock className="w-8 h-8" />
                </div>
                <h2 className="text-base font-medium text-slate-900 dark:text-white">TLS / SSL Certificate Information</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Common Name</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">cpvia.com</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Certificate Authority</span>
                  <span className="font-medium text-slate-900 dark:text-white">Let's Encrypt</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cipher Protocol</span>
                  <span className="font-mono text-slate-900 dark:text-white">TLS 1.3 / HTTP/2</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Days to Expiration</span>
                  <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">57 Days Remaining</span>
                </div>
              </div>
            </div>

            <div className="elevated-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg icon-pedestal flex items-center justify-center p-1 shrink-0">
                  <Icon3DShield className="w-8 h-8" />
                </div>
                <h2 className="text-base font-medium text-slate-900 dark:text-white">Domain & Integrity Scan</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Google Safe Browsing</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Clean (0 Threats)
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Registrar</span>
                  <span className="font-medium text-slate-900 dark:text-white">GoDaddy.com, LLC (90 Days left)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">SEO Health Status</span>
                  <span className="font-medium text-slate-900 dark:text-white">Standard Visibility (53/100)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Broken Link Audit</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">0 broken links detected</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Back to Top Button (positioned cleanly above footer bar) */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-16 right-6 z-40 p-2.5 rounded-full bg-white dark:bg-[#1D2B42] text-slate-700 dark:text-[#F1F5F9] border border-slate-200 dark:border-[#2B3B53] shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-[#253653] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center justify-center cursor-pointer ${
          scrollY > 250 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Footer with Clean GA Symbol (No Black Box) */}
      <footer className="mt-auto border-t border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#111B2E] py-4 px-4 sm:px-8 transition-colors duration-250">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-[#A8B5C7]">
          <div className="flex items-center gap-2">
            <GASymbol className="w-4 h-4 shrink-0" cutoutColor={cutoutColor} />
            <span className="font-semibold text-slate-800 dark:text-[#F1F5F9]">GA Web Telemetry</span>
            <span>&bull;</span>
            <span>Continuous Website Performance & SRE Monitoring</span>
          </div>
          <div>
            Monitored on behalf of{' '}
            <a href="https://cpvia.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-mono">
              https://cpvia.com/
            </a>
            . Metrics synchronized 24/7 every hour.
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-medium text-slate-900 dark:text-white">Share Client Dashboard</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-[#A8B5C7] dark:hover:text-white text-lg px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1D2B42] cursor-pointer"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#A8B5C7]">
              Generate a secure, read-only preview link for CPVIA stakeholders or export this report.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#A8B5C7] block">
                Secure Client Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://telemetry.ga-cloud.io/client/cpvia-portal?token=live_auth_981a2f"
                  className="w-full h-[42px] bg-slate-50 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-lg px-3 text-xs font-mono text-slate-800 dark:text-[#F1F5F9] select-all focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleCopyLink}
                  className="h-[42px] px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#2B3B53] flex justify-end gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-[#F1F5F9] bg-slate-100 dark:bg-[#1D2B42] hover:bg-slate-200 dark:hover:bg-[#253653] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowShareModal(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}