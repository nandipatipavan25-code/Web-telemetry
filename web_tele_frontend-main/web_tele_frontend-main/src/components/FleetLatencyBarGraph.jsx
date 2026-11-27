import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  BarChart3,
  Zap,
  Activity,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function FleetLatencyBarGraph({
  websites = [],
  isDark = true,
  onSelectWebsite
}) {
  const [metric, setMetric] = useState('speed'); // 'speed' | 'score'
  const [limit, setLimit] = useState(12); // 12 | 38
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (slowest first) | 'asc' (fastest first)

  // Clean hostname for labels
  const cleanHostname = (rawUrl) => {
    if (!rawUrl) return 'site';
    try {
      return new URL(rawUrl).hostname.replace(/^www\./, '');
    } catch {
      return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  };

  // Process and sort chart data from websites
  const chartData = useMemo(() => {
    if (!websites || websites.length === 0) return [];

    const mapped = websites.map((site) => {
      const host = cleanHostname(site.url);
      const loadSeconds = site.loadTimeMs ? parseFloat((site.loadTimeMs / 1000).toFixed(2)) : 0;
      const score = site.performanceScore || 0;

      return {
        url: site.url,
        domain: host,
        shortDomain: host.length > 14 ? host.substring(0, 12) + '…' : host,
        loadTimeMs: site.loadTimeMs || 0,
        loadSeconds,
        performanceScore: score,
        isUp: site.isUp !== false,
        serviceType: site.serviceType || 'maintenance',
        grade: site.grade || (score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D')
      };
    });

    // Sort by selected metric
    mapped.sort((a, b) => {
      if (metric === 'speed') {
        return sortOrder === 'desc'
          ? b.loadSeconds - a.loadSeconds
          : a.loadSeconds - b.loadSeconds;
      } else {
        return sortOrder === 'desc'
          ? b.performanceScore - a.performanceScore
          : a.performanceScore - b.performanceScore;
      }
    });

    return mapped.slice(0, limit);
  }, [websites, metric, limit, sortOrder]);

  // Summary statistics across entire fleet
  const stats = useMemo(() => {
    if (!websites || websites.length === 0) {
      return { avgSeconds: '0.00', fastCount: 0, normalCount: 0, heavyCount: 0, slowest: null, fastest: null };
    }

    let totalSec = 0;
    let fast = 0;
    let normal = 0;
    let heavy = 0;
    let slowest = websites[0];
    let fastest = websites[0];

    websites.forEach((site) => {
      const sec = (site.loadTimeMs || 0) / 1000;
      totalSec += sec;

      if (sec < 4.0) fast++;
      else if (sec <= 8.0) normal++;
      else heavy++;

      if ((site.loadTimeMs || 0) > (slowest?.loadTimeMs || 0)) slowest = site;
      if ((site.loadTimeMs || 999999) < (fastest?.loadTimeMs || 999999)) fastest = site;
    });

    return {
      avgSeconds: (totalSec / websites.length).toFixed(2),
      fastCount: fast,
      normalCount: normal,
      heavyCount: heavy,
      slowestHost: cleanHostname(slowest?.url),
      slowestSec: ((slowest?.loadTimeMs || 0) / 1000).toFixed(2),
      fastestHost: cleanHostname(fastest?.url),
      fastestSec: ((fastest?.loadTimeMs || 0) / 1000).toFixed(2)
    };
  }, [websites]);

  // Color mapper for individual bars
  const getBarColor = (item) => {
    if (metric === 'speed') {
      if (item.loadSeconds < 4.0) return '#10B981'; // Emerald (Fast)
      if (item.loadSeconds <= 8.0) return '#3B82F6'; // Royal Blue (Normal)
      return '#F59E0B'; // Amber (Heavy)
    } else {
      if (item.performanceScore >= 80) return '#10B981';
      if (item.performanceScore >= 60) return '#3B82F6';
      return '#F59E0B';
    }
  };

  // Custom high-contrast tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="elevated-card rounded-xl p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-2 min-w-[210px] z-50">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${data.isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="font-medium text-slate-900 dark:text-white truncate max-w-[130px]">
              {data.domain}
            </span>
          </div>
          <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {data.serviceType}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Response Speed</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white text-xs">
              {data.loadSeconds}s ({data.loadTimeMs}ms)
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Health Grade</span>
            <span className="font-mono font-medium text-blue-600 dark:text-blue-400 text-xs">
              {data.performanceScore}% (Grade {data.grade})
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
          <span className={data.loadSeconds < 4.0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
            {data.loadSeconds < 4.0 ? '✓ Within 4.0s SLA' : '⚠ Exceeds 4.0s SLA'}
          </span>
          <span className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5 font-medium cursor-pointer">
            Click to inspect →
          </span>
        </div>
      </div>
    );
  };

  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.07)';
  const tickFill = isDark ? '#94A3B8' : '#475569';

  return (
    <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm space-y-5">
      {/* ── CARD HEADER & CONTROLS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-medium text-slate-900 dark:text-white tracking-tight">
                Fleet Response Time &amp; Speed Benchmark
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                <Zap className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative benchmark of actual page load times across your monitored client websites.
            </p>
          </div>
        </div>

        {/* Interactive Bar Chart Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector Pill Group */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] text-xs">
            <button
              onClick={() => setMetric('speed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                metric === 'speed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Response Speed (s)
            </button>
            <button
              onClick={() => setMetric('score')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                metric === 'score'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Health Score (%)
            </button>
          </div>

          {/* Scope Filter */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="h-[42px] px-3 rounded-xl text-xs bg-white dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9] focus:outline-none font-medium cursor-pointer"
          >
            <option value={12}>Top 12 Sites</option>
            <option value={20}>Top 20 Sites</option>
            <option value={Math.max(websites.length, 50)}>All {websites.length || 0} Sites</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="h-[42px] px-3.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#1D2B42] text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#253653] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            title="Toggle sort order"
          >
            {sortOrder === 'desc' ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Slowest First</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Fastest First</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── FLEET KPI SUMMARY CHIPS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium tracking-wider block">Fleet Average</span>
          <span className="text-base font-medium text-slate-900 dark:text-white font-mono mt-0.5 block">
            {stats.avgSeconds}s
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Across {websites.length} domains</span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-medium tracking-wider block">Fast (&lt;4.0s SLA)</span>
          <span className="text-base font-medium text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 block">
            {stats.fastCount} sites
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Optimal Core Web Vitals</span>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
          <span className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-medium tracking-wider block">Fastest Target</span>
          <span className="text-base font-medium text-blue-700 dark:text-blue-400 font-mono mt-0.5 block truncate" title={stats.fastestHost}>
            {stats.fastestSec}s
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5 truncate">{stats.fastestHost}</span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40">
          <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-medium tracking-wider block">Needs Optimization</span>
          <span className="text-base font-medium text-amber-700 dark:text-amber-400 font-mono mt-0.5 block truncate" title={stats.slowestHost}>
            {stats.slowestSec}s
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5 truncate">{stats.slowestHost}</span>
        </div>
      </div>

      {/* ── THE INTERACTIVE RECHARTS BAR GRAPH ── */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 15, left: -10, bottom: 45 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length && onSelectWebsite) {
                onSelectWebsite(state.activePayload[0].payload.url);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="shortDomain"
              stroke={tickFill}
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-28}
              textAnchor="end"
              height={55}
            />
            <YAxis
              stroke={tickFill}
              fontSize={11}
              tickLine={false}
              unit={metric === 'speed' ? 's' : '%'}
              domain={[0, metric === 'speed' ? 'auto' : 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            {metric === 'speed' && (
              <ReferenceLine
                y={4.0}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Core Web Vitals SLA (4.0s)',
                  position: 'top',
                  fill: isDark ? '#34D399' : '#047857',
                  fontSize: 10,
                  fontWeight: 500
                }}
              />
            )}
            <Bar
              dataKey={metric === 'speed' ? 'loadSeconds' : 'performanceScore'}
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry)}
                  className="hover:opacity-85 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── CHART FOOTER LEGEND & INSIGHT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-4 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Legend:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Fast (&lt;4.0s)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Normal (4.0–8.0s)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Heavy (&gt;8.0s)
          </span>
        </div>

        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Tip: Click any bar to open that website's full telemetry &amp; audits
        </span>
      </div>
    </div>
  );
}
