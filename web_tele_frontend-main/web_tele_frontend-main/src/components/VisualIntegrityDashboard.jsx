import React, { useState } from 'react';
import {
  Layers,
  ArrowRightLeft,
  Image as ImageIcon,
  MousePointerClick,
  Heading,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  FileDiff,
  ShieldCheck,
  Eye,
  Info,
  Check,
  AlertCircle,
  Layout,
  Monitor,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export default function VisualIntegrityDashboard({ stats }) {
  const [activeSubTab, setActiveSubTab] = useState('diff'); // 'diff' | 'images' | 'elements' | 'raw'
  const [elementFilter, setElementFilter] = useState('all'); // 'all' | 'buttons' | 'headings' | 'navLinks'
  const [activeViewMode, setActiveViewMode] = useState('pictorial'); // 'pictorial' | 'details'

  const viData = stats?.latestStatus?.visualIntegrity || stats?.visualIntegrity || null;
  const lastSnapshot = viData?.lastSnapshot;
  const currentSnapshot = viData?.currentSnapshot;
  const stabilityScore = viData?.stabilityScore ?? 100;
  const status = viData?.status ?? 'stable';
  const hasBaseline = viData?.hasBaseline ?? false;
  const isSyntheticBaseline = viData?.isSyntheticBaseline ?? false;

  const imageChanges = viData?.imageChanges || { replaced: [], added: [], removed: [], unchangedCount: 0 };
  const elementChanges = viData?.elementChanges || { buttons: [], headings: [], navLinks: [] };
  const domDiff = viData?.domDiff || { imageDelta: 0, buttonDelta: 0, headingDelta: 0, bodyLengthDelta: 0 };

  const totalModifications = viData?.totalModifications ?? 
    (imageChanges.replaced.length + imageChanges.added.length + imageChanges.removed.length + 
     elementChanges.buttons.length + elementChanges.headings.length + elementChanges.navLinks.length);

  // Helper to render a visual wireframe browser mockup of a snapshot
  const renderPictorialMockup = (snap, isLive = false) => {
    const images = snap?.images || [];
    const headings = snap?.headings || [];
    const buttons = snap?.buttons || [];
    const navLinks = snap?.navLinks || [];

    const heroHeading = headings[0]?.text || 'Main Page Title';
    const subHeading = headings[1]?.text || headings[2]?.text || 'Sub-headline or key service introduction.';
    const ctaButton = buttons[0]?.text || 'Primary Call to Action';
    const secondaryBtn = buttons[1]?.text;
    const heroImage = images[0]?.src;

    return (
      <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2B3B53] bg-white dark:bg-[#111B2E] shadow-3d-sm transition-all">
        {/* Browser Top Chrome / Title Bar */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-[#1D2B42] border-b border-slate-200 dark:border-[#2B3B53] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <div className="px-4 py-0.5 rounded-md bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-[#2B3B53] text-[11px] text-slate-700 dark:text-[#F1F5F9] font-mono flex items-center gap-1.5 truncate max-w-[260px] shadow-2xs">
            <span className="text-emerald-700 dark:text-emerald-400">https://</span>
            <span className="truncate">{stats?.url?.replace(/^https?:\/\//, '') || 'your-site.com'}</span>
          </div>
          <span className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
            isLive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-[#A8B5C7] border border-slate-200 dark:border-[#2B3B53]'
          }`}>
            {isLive ? 'LIVE STATE' : 'PAST STATE'}
          </span>
        </div>

        {/* Browser Viewport Simulation Canvas */}
        <div className="p-4 space-y-4 bg-white dark:bg-[#111B2E] min-h-[380px] flex flex-col justify-between">
          
          {/* 1. Header Navigation Bar Mockup */}
          <div className="pb-3 border-b border-slate-100 dark:border-[#2B3B53] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-medium text-[11px] text-white shadow-xs">
                GA
              </div>
              <span className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight truncate max-w-[120px]">
                {stats?.siteName || 'Brand Logo'}
              </span>
            </div>

            {/* Nav Menu Links */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-[#A8B5C7] overflow-x-hidden">
              {(navLinks.slice(0, 3)).map((n, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9] truncate max-w-[80px]">
                  {n.text}
                </span>
              ))}
              {navLinks.length === 0 && (
                <>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9]">Home</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9]">About</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] text-slate-700 dark:text-[#F1F5F9]">Contact</span>
                </>
              )}
            </div>
          </div>

          {/* 2. Hero Section Mockup (Title, Subhead, CTA Button, Hero Photo) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
            
            {/* Text & Action Column */}
            <div className="md:col-span-7 space-y-2.5">
              <div className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Hero Landmark
              </div>
              <h4 className="text-base font-medium text-slate-900 dark:text-[#F1F5F9] leading-tight line-clamp-2">
                {heroHeading}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-snug line-clamp-2">
                {subHeading}
              </p>

              {/* Primary Call to Action Button */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs">
                  <MousePointerClick className="w-3 h-3" />
                  <span className="truncate max-w-[130px]">{ctaButton}</span>
                </div>
                {secondaryBtn && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1D2B42] text-slate-800 dark:text-[#F1F5F9] border border-slate-200 dark:border-[#2B3B53] font-medium text-xs truncate max-w-[120px]">
                    {secondaryBtn}
                  </div>
                )}
              </div>
            </div>

            {/* Photo Preview Column */}
            <div className="md:col-span-5">
              <div className="aspect-video w-full rounded-xl bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-[#2B3B53] relative overflow-hidden flex items-center justify-center group">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt="Hero Asset"
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-center p-3 text-slate-600 dark:text-[#A8B5C7] space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto opacity-70 text-blue-600 dark:text-blue-400" />
                    <div className="text-[11px] font-medium uppercase tracking-wider">Image Asset</div>
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-white/95 dark:bg-[#111B2E]/95 border border-slate-200 dark:border-[#2B3B53] text-[11px] font-mono text-slate-700 dark:text-[#F1F5F9] shadow-2xs">
                  {snap?.domStats?.totalImages || 0} Assets
                </div>
              </div>
            </div>

          </div>

          {/* 3. Section Grid Cards (Sub-features / content cards) */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#2B3B53]">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7] mb-2">
              Body Content Structure ({headings.length} Sections)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(headings.slice(1, 4)).map((h, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] space-y-1.5 shadow-2xs">
                  <div className="h-1.5 w-6 rounded bg-blue-500/50"></div>
                  <div className="text-[11px] font-medium text-slate-900 dark:text-[#F1F5F9] truncate">{h.text}</div>
                  <div className="h-1 w-full rounded bg-slate-200 dark:bg-[#2B3B53]"></div>
                  <div className="h-1 w-3/4 rounded bg-slate-200 dark:bg-[#2B3B53]"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#2B3B53] flex items-center justify-between text-[11px] text-slate-600 dark:text-[#A8B5C7]">
            <span>Snapshot: {snap?.timestamp ? new Date(snap.timestamp).toLocaleTimeString() : 'Baseline'}</span>
            <span className="font-mono">{snap?.domStats?.totalHeadings || 0} Titles · {snap?.domStats?.totalButtons || 0} Buttons</span>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-[#F1F5F9]">
      
      {/* 1. Header Banner */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] p-5 rounded-2xl shadow-3d-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Visual SRE Auditor
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wider uppercase border flex items-center gap-1.5 ${
                totalModifications === 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
              }`}>
                {totalModifications === 0 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {totalModifications === 0 ? 'Everything Matched & Healthy' : `${totalModifications} UI Differences Spotted`}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight flex items-center gap-2.5">
              <Layers className="text-blue-600 dark:text-blue-400 h-6 w-6" /> Pictorial UI Snapshot Comparison
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-[#A8B5C7] max-w-3xl leading-relaxed">
              Side-by-side pictorial mockup comparing your <strong>Past Snapshot</strong> against your <strong>Live Snapshot</strong> to see what moved, what was reworded, or which photos changed.
            </p>
          </div>

          {/* Quick Result Stat Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] text-center min-w-[120px] shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Layout Match</div>
              <div className={`text-2xl font-medium ${
                stabilityScore >= 95 ? 'text-emerald-700 dark:text-emerald-400' : stabilityScore >= 75 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {stabilityScore}%
              </div>
              <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-semibold mt-0.5">
                {stabilityScore === 100 ? '100% Identical' : 'Changes Spotted'}
              </div>
            </div>

            <div className="px-5 py-3 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] text-center min-w-[120px] shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Total Changes</div>
              <div className={`text-2xl font-medium ${totalModifications > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {totalModifications}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-semibold mt-0.5">
                {totalModifications === 0 ? 'Zero Disturbances' : 'Review Differences'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Mode Selector (Pictorial View vs. Detailed Breakdown) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#2B3B53] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'diff', label: '1. Visual Comparison', icon: Layout },
            { id: 'images', label: `2. Image Check (${imageChanges.replaced.length} replaced)`, icon: ImageIcon },
            { id: 'elements', label: `3. Buttons & Headings (${elementChanges.buttons.length + elementChanges.headings.length} changed)`, icon: MousePointerClick },
            { id: 'raw', label: '4. Summary Totals', icon: FileDiff }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSubTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === id
                  ? 'bg-blue-600 !text-white shadow-sm ring-2 ring-blue-500/20'
                  : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1D2B42]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Toggle between Graphical Pictorial Mode vs Numbers List */}
        {activeSubTab === 'diff' && (
          <div className="flex items-center bg-slate-100 dark:bg-[#111B2E] p-1 rounded-xl border border-slate-200 dark:border-[#2B3B53] text-xs shadow-xs">
            <button
              onClick={() => setActiveViewMode('pictorial')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeViewMode === 'pictorial' ? 'bg-blue-600 !text-white shadow-xs' : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Pictorial Mockup
            </button>
            <button
              onClick={() => setActiveViewMode('details')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeViewMode === 'details' ? 'bg-blue-600 !text-white shadow-xs' : 'text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" /> Item Breakdown
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: SIDE BY SIDE COMPARISON */}
      {activeSubTab === 'diff' && (
        <div className="space-y-6">

          {/* PICTORIAL REPRESENTATION (Graphic Browser Mockups) */}
          {activeViewMode === 'pictorial' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-[#162238] border border-blue-200 dark:border-[#2B3B53] flex items-center justify-between text-xs gap-2">
                <span className="text-slate-700 dark:text-[#F1F5F9] font-medium">
                  <strong>Pictorial Preview:</strong> Compare the visual layout, hero banner, titles, and CTA buttons from the previous scan side-by-side with the current live scan.
                </span>
                <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-mono hidden md:inline shrink-0">
                  Interactive UI Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Previous Snapshot Wireframe */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      Previous State (Baseline)
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-[#A8B5C7]">
                      {lastSnapshot?.timestamp ? new Date(lastSnapshot.timestamp).toLocaleTimeString() : 'Earlier'}
                    </span>
                  </div>
                  {renderPictorialMockup(lastSnapshot, false)}
                </div>

                {/* Latest Snapshot Wireframe */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Current State (Now)
                    </span>
                    <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400">
                      {currentSnapshot?.timestamp ? new Date(currentSnapshot.timestamp).toLocaleTimeString() : 'Now'}
                    </span>
                  </div>
                  {renderPictorialMockup(currentSnapshot, true)}
                </div>

              </div>
            </div>
          )}

          {/* DETAIL LIST MODE (Numbered Breakdown Cards) */}
          {activeViewMode === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Card: PREVIOUS SNAPSHOT */}
              <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2B3B53] mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-[#F1F5F9]">
                        Previous Snapshot (Baseline)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">
                      How your website was configured in the previous scan
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] text-[11px] font-mono text-slate-700 dark:text-[#A8B5C7]">
                    {lastSnapshot?.timestamp ? new Date(lastSnapshot.timestamp).toLocaleTimeString() : 'Earlier'}
                  </span>
                </div>

                {/* Counts Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-50 dark:bg-[#1D2B42] p-3 rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
                    <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase">Total Photos</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9] mt-0.5">{lastSnapshot?.domStats?.totalImages ?? 0}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] p-3 rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
                    <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase">Clickable Buttons</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9] mt-0.5">{lastSnapshot?.domStats?.totalButtons ?? 0}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] p-3 rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
                    <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase">Titles &amp; Headings</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9] mt-0.5">{lastSnapshot?.domStats?.totalHeadings ?? 0}</div>
                  </div>
                </div>

                {/* Headings */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-700 dark:text-[#A8B5C7] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Heading className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Page Titles / Headings:</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] rounded-xl p-3 border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono">
                    {(lastSnapshot?.headings || []).slice(0, 8).map((h, i) => (
                      <div key={i} className="text-slate-700 dark:text-[#F1F5F9] truncate py-0.5 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#111B2E] text-[11px] text-slate-700 dark:text-[#A8B5C7] font-medium uppercase shrink-0">
                          {h.level}
                        </span>
                        <span className="truncate">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-[#A8B5C7] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Buttons &amp; Clickable Links:</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] rounded-xl p-3 border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs max-h-40 overflow-y-auto space-y-1.5 text-xs font-mono">
                    {(lastSnapshot?.buttons || []).slice(0, 8).map((b, i) => (
                      <div key={i} className="text-slate-700 dark:text-[#F1F5F9] truncate py-0.5 flex items-center gap-1.5">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">&rarr;</span>
                        <span className="truncate">{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Card: LATEST SNAPSHOT */}
              <div className="elevated-card bg-white dark:bg-[#162238] border border-blue-500/40 rounded-2xl p-6 shadow-3d-sm relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2B3B53] mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F1F5F9]">
                        Latest Snapshot (Current State)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">
                      Live scan taken right now
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-mono text-blue-700 dark:text-blue-300">
                    {currentSnapshot?.timestamp ? new Date(currentSnapshot.timestamp).toLocaleTimeString() : 'Live'}
                  </span>
                </div>

                {/* Counts Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-50 dark:bg-[#1D2B42] p-3 rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
                    <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase">Total Photos</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9] mt-0.5 flex items-center justify-center gap-1">
                      {currentSnapshot?.domStats?.totalImages ?? 0}
                      {domDiff.imageDelta !== 0 && (
                        <span className={`text-[11px] ${domDiff.imageDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          ({domDiff.imageDelta > 0 ? `+${domDiff.imageDelta}` : domDiff.imageDelta})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] p-3 rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
                    <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase">Clickable Buttons</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9] mt-0.5 flex items-center justify-center gap-1">
                      {currentSnapshot?.domStats?.totalButtons ?? 0}
                      {domDiff.buttonDelta !== 0 && (
                        <span className={`text-[11px] ${domDiff.buttonDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          ({domDiff.buttonDelta > 0 ? `+${domDiff.buttonDelta}` : domDiff.buttonDelta})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] p-3 rounded-xl border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs text-center">
                    <div className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase">Titles &amp; Headings</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9] mt-0.5 flex items-center justify-center gap-1">
                      {currentSnapshot?.domStats?.totalHeadings ?? 0}
                      {domDiff.headingDelta !== 0 && (
                        <span className={`text-[11px] ${domDiff.headingDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          ({domDiff.headingDelta > 0 ? `+${domDiff.headingDelta}` : domDiff.headingDelta})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Headings */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-700 dark:text-[#A8B5C7] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Heading className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Page Titles / Headings:</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] rounded-xl p-3 border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono">
                    {(currentSnapshot?.headings || []).slice(0, 8).map((h, i) => (
                      <div key={i} className="text-slate-700 dark:text-[#F1F5F9] truncate py-0.5 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[11px] text-blue-700 dark:text-blue-300 font-medium uppercase shrink-0 border border-blue-200 dark:border-blue-800">
                          {h.level}
                        </span>
                        <span className="truncate">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-[#A8B5C7] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Buttons &amp; Clickable Links:</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1D2B42] rounded-xl p-3 border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs max-h-40 overflow-y-auto space-y-1.5 text-xs font-mono">
                    {(currentSnapshot?.buttons || []).slice(0, 8).map((b, i) => (
                      <div key={i} className="text-slate-700 dark:text-[#F1F5F9] truncate py-0.5 flex items-center gap-1.5">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">&rarr;</span>
                        <span className="truncate">{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: IMAGE REPLACEMENT TRACKER */}
      {activeSubTab === 'images' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] text-xs text-slate-700 dark:text-[#F1F5F9]">
            <strong>What this checks:</strong> Checks whether any photo, logo, or banner on your website was swapped, deleted, or replaced with a new file.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Replaced Images</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{imageChanges.replaced.length}</div>
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Photo changed to a different image file</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">New Images Added</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{imageChanges.added.length}</div>
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">New photos published since last scan</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Removed / Deleted</div>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">{imageChanges.removed.length}</div>
              <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Photos deleted or missing</p>
            </div>
          </div>

          {imageChanges.replaced.length > 0 ? (
            <div className="elevated-card p-5 border border-amber-500/30 rounded-2xl bg-amber-50/70 dark:bg-amber-500/5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Detected Image Replacements
              </h4>
              {imageChanges.replaced.map((rep, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] space-y-2 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] uppercase font-semibold">REPLACED</span>
                    {rep.alt || 'Website Image'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 truncate">
                      <span className="text-slate-600 dark:text-[#A8B5C7] font-sans font-semibold block uppercase text-[11px] mb-1">Old Image:</span>
                      {rep.oldSrc}
                    </div>
                    <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 truncate">
                      <span className="text-slate-600 dark:text-[#A8B5C7] font-sans font-semibold block uppercase text-[11px] mb-1">New Image:</span>
                      {rep.newSrc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] text-center text-xs text-slate-600 dark:text-[#A8B5C7] space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="font-semibold text-slate-900 dark:text-[#F1F5F9]">No Image Replacements</div>
              <div>All image assets and photos match the baseline snapshot without any unauthorized changes.</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISTURBED UI ELEMENTS */}
      {activeSubTab === 'elements' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] text-xs text-slate-700 dark:text-[#F1F5F9]">
            <strong>What this checks:</strong> Detects if any heading title was reworded, or if a "Buy Now", "Contact Us", or "Sign Up" button was altered or deleted.
          </div>

          <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 shadow-3d-sm">
            {elementChanges.buttons.length === 0 && elementChanges.headings.length === 0 && elementChanges.navLinks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-600 dark:text-[#A8B5C7] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div className="font-semibold text-slate-900 dark:text-[#F1F5F9]">All Buttons &amp; Headings are Stable</div>
                <div>No deleted or disturbed buttons, reworded titles, or missing menu links between scans.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {elementChanges.buttons.map((b, i) => (
                  <div key={`btn_${i}`} className="p-3 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <MousePointerClick className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7] block">Button</span>
                        <span className="font-mono text-slate-900 dark:text-[#F1F5F9]">{b.item}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      b.type === 'added' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {b.type}
                    </span>
                  </div>
                ))}
                {elementChanges.headings.map((h, i) => (
                  <div key={`h_${i}`} className="p-3 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Heading className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7] block">Heading</span>
                        <span className="font-mono text-slate-900 dark:text-[#F1F5F9]">{h.item}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      h.type === 'added' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {h.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SUMMARY TOTALS */}
      {activeSubTab === 'raw' && (
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 shadow-3d-sm space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F1F5F9]">
            Total Elements Comparison
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Photos Difference</div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">
                {domDiff.imageDelta === 0 ? '0 (Unchanged)' : (domDiff.imageDelta > 0 ? `+${domDiff.imageDelta}` : domDiff.imageDelta)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Buttons Difference</div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">
                {domDiff.buttonDelta === 0 ? '0 (Unchanged)' : (domDiff.buttonDelta > 0 ? `+${domDiff.buttonDelta}` : domDiff.buttonDelta)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Titles Difference</div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">
                {domDiff.headingDelta === 0 ? '0 (Unchanged)' : (domDiff.headingDelta > 0 ? `+${domDiff.headingDelta}` : domDiff.headingDelta)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1D2B42] border border-slate-200/90 dark:border-[#2B3B53] shadow-2xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-[#A8B5C7]">Page Text Shift</div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">
                {domDiff.bodyLengthDelta === 0 ? '0 chars' : `${domDiff.bodyLengthDelta > 0 ? `+${domDiff.bodyLengthDelta}` : domDiff.bodyLengthDelta} chars`}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
