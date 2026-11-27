import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import {
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function FleetPieCharts({
  websites = [],
  metrics = {},
  isDark = true,
  onOpenCatalogues
}) {
  const total = websites.length || metrics.total || 0;

  // 1. Availability Data
  const upCount = metrics.upCount ?? websites.filter(s => s.isUp !== false).length;
  const downCount = metrics.downCount ?? websites.filter(s => s.isUp === false).length;
  const uptimeData = [
    { name: 'Operational (200 OK)', value: Math.max(upCount, total === 0 ? 1 : 0), count: upCount, color: '#10B981' },
    { name: 'Needs Attention', value: downCount, count: downCount, color: '#F43F5E' }
  ].filter(d => d.count > 0 || (total === 0 && d.value > 0));

  // 2. Speed Tiers Data
  let fast = 0, normal = 0, heavy = 0;
  websites.forEach((site) => {
    const ms = site.loadTimeMs || 0;
    if (ms > 0 && ms < 4000) fast++;
    else if (ms <= 8000 && ms >= 4000) normal++;
    else if (ms > 8000) heavy++;
    else normal++;
  });
  if (websites.length === 0) {
    fast = metrics.fastCount ?? 0;
    normal = metrics.normalCount ?? 0;
    heavy = metrics.heavyCount ?? 0;
  }
  const speedData = [
    { name: 'Fast (<4.0s SLA)', value: fast, count: fast, color: '#10B981' },
    { name: 'Normal (4.0–8.0s)', value: normal, count: normal, color: '#3B82F6' },
    { name: 'Heavy (>8.0s)', value: heavy, count: heavy, color: '#F59E0B' }
  ].filter(d => d.value > 0);

  // 3. Service Coverage Data (Blue-led, zero purple)
  const maintenanceCount = metrics.maintenanceCount ?? websites.filter(s => s.serviceType === 'maintenance').length;
  const hostingCount = metrics.hostingCount ?? websites.filter(s => s.serviceType === 'hosting').length;
  const serviceData = [
    { name: 'Website Maintenance', value: maintenanceCount, count: maintenanceCount, color: '#2563EB' },
    { name: 'Cloud Hosting Service', value: hostingCount, count: hostingCount, color: '#0EA5E9' }
  ].filter(d => d.value > 0);

  // Custom Pie Tooltip
  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';

    return (
      <div className="rounded-xl p-3 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-xl text-xs space-y-1 min-w-[175px] z-50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {item.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-[#A8B5C7] pt-1 border-t border-slate-100 dark:border-[#2B3B53] text-xs">
          <span>Count: <strong className="text-slate-900 dark:text-white font-semibold">{item.count} sites</strong></span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{pct}%</span>
        </div>
      </div>
    );
  };

  const centerSubColor = isDark ? '#A8B5C7' : '#475569';
  const centerTitleColor = isDark ? '#F1F5F9' : '#0F172A';

  return (
    <div className="elevated-card rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] shadow-3d-sm space-y-5">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2B3B53] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl icon-pedestal flex items-center justify-center p-1 shrink-0 shadow-xs">
            <PieIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Fleet Distribution Overview
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                {total} Websites Monitored
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">
              Visual breakdown of website availability, speed tiers, and service packages across your client portfolio.
            </p>
          </div>
        </div>

        {onOpenCatalogues && (
          <button
            onClick={onOpenCatalogues}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#1D2B42] text-slate-700 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-[#253653] transition-all shadow-xs cursor-pointer"
          >
            <span>View Catalogues</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── 3 DONUT PIE CHARTS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">

        {/* 1. Availability Donut */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42]/60 border border-slate-200 dark:border-[#2B3B53] flex flex-col items-center justify-between space-y-3">
          <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-[#2B3B53]">
            <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Fleet Availability</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {metrics.availabilityPct ?? '100.0'}% OK
            </span>
          </div>

          {/* Donut Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={uptimeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke={isDark ? '#162238' : '#FFFFFF'}
                  strokeWidth={2}
                >
                  {uptimeData.map((entry, idx) => (
                    <Cell key={`cell-uptime-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-semibold tracking-tight font-mono" style={{ color: centerTitleColor }}>
                {metrics.availabilityPct ?? '100.0'}%
              </span>
              <span className="text-[11px] font-medium" style={{ color: centerSubColor }}>
                Uptime SLA
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-1.5 text-xs pt-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-[#F1F5F9]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#10B981' }} />
                <span>Operational</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{upCount} sites</span>
            </div>
            {downCount > 0 && (
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#F43F5E' }} />
                  <span>Action Needed</span>
                </span>
                <span className="font-semibold font-mono">{downCount} {downCount === 1 ? 'site' : 'sites'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Speed Tiers Donut */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42]/60 border border-slate-200 dark:border-[#2B3B53] flex flex-col items-center justify-between space-y-3">
          <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-[#2B3B53]">
            <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Speed Distribution</span>
            </span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              {metrics.avgLoadTimeMs ? `${(metrics.avgLoadTimeMs / 1000).toFixed(2)}s avg` : '0.00s avg'}
            </span>
          </div>

          {/* Donut Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={speedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke={isDark ? '#162238' : '#FFFFFF'}
                  strokeWidth={2}
                >
                  {speedData.map((entry, idx) => (
                    <Cell key={`cell-speed-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-semibold tracking-tight font-mono" style={{ color: centerTitleColor }}>
                {metrics.avgLoadTimeMs ? `${(metrics.avgLoadTimeMs / 1000).toFixed(1)}s` : '0.0s'}
              </span>
              <span className="text-[11px] font-medium" style={{ color: centerSubColor }}>
                Avg Speed
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-1.5 text-xs pt-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-[#F1F5F9]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#10B981' }} />
                <span>Fast (&lt;4.0s)</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{fast}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-[#F1F5F9]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#3B82F6' }} />
                <span>Normal (4–8s)</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{normal}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-[#F1F5F9]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#F59E0B' }} />
                <span>Heavy (&gt;8.0s)</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{heavy}</span>
            </div>
          </div>
        </div>

        {/* 3. Service Coverage Donut */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42]/60 border border-slate-200 dark:border-[#2B3B53] flex flex-col items-center justify-between space-y-3">
          <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-[#2B3B53]">
            <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Service Packages</span>
            </span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              100% Client Care
            </span>
          </div>

          {/* Donut Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke={isDark ? '#162238' : '#FFFFFF'}
                  strokeWidth={2}
                >
                  {serviceData.map((entry, idx) => (
                    <Cell key={`cell-service-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-semibold tracking-tight font-mono" style={{ color: centerTitleColor }}>
                {total}
              </span>
              <span className="text-[11px] font-medium" style={{ color: centerSubColor }}>
                Total Sites
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-1.5 text-xs pt-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-[#F1F5F9]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#2563EB' }} />
                <span>🛠️ Maintenance</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{maintenanceCount} sites</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-[#F1F5F9]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#0EA5E9' }} />
                <span>☁️ Cloud Hosting</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{hostingCount} sites</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] text-center pt-1.5 border-t border-slate-200 dark:border-[#2B3B53]">
              Continuous 24/7 Health Monitoring
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
