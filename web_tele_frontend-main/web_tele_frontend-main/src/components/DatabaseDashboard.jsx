import React from 'react';
import { Database, AlertTriangle, CheckCircle2, Clock, Server } from 'lucide-react';

export default function DatabaseDashboard({ historyLog = [], currentStatus = {} }) {
  const safeHistory = Array.isArray(historyLog) ? historyLog : [];
  
  // Find database errors in history
  const dbOutages = safeHistory.filter(log => 
    log?.errors && log.errors.some(e => e?.toLowerCase().includes('database'))
  );
  
  const hasCurrentDbError = currentStatus?.errors?.some(e => e?.toLowerCase().includes('database'));
  
  const isHealthy = currentStatus?.isUp && !hasCurrentDbError;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-blue-600 shadow-3d-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-[#1D2B42] flex items-center justify-center border border-blue-200 dark:border-[#2B3B53]">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight">Database Availability</h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-0.5">Real-time database connection monitoring and outage history.</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mb-1.5 block">Current Status</span>
          {isHealthy ? (
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> ONLINE
            </span>
          ) : (
             <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> DB CONNECTION ERROR
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Outages List */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] p-6 rounded-2xl shadow-3d-sm flex flex-col justify-between">
          <h4 className="text-xs font-medium text-slate-700 dark:text-[#A8B5C7] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Recent Database Outages
          </h4>
          
          {dbOutages.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53]">
               <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
               <p className="text-sm font-medium text-slate-900 dark:text-[#F1F5F9]">No database outages detected</p>
               <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Your database connection has been stable.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dbOutages.slice(0, 10).map((outage, idx) => (
                <div key={idx} className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-rose-800 dark:text-rose-300">
                      {outage.errors?.find(e => e.toLowerCase().includes('database')) || 'Database connection error'}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(outage.checkedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] p-6 rounded-2xl shadow-3d-sm flex flex-col justify-center items-center text-center">
             <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-[#1D2B42] flex items-center justify-center border-4 border-blue-500/30 mb-4 shadow-sm">
                <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
             </div>
             <h4 className="text-3xl font-medium text-slate-900 dark:text-[#F1F5F9] font-mono">
               {safeHistory.length - dbOutages.length} <span className="text-sm text-slate-500 dark:text-[#A8B5C7]">/ {safeHistory.length}</span>
             </h4>
             <p className="text-xs text-slate-600 dark:text-[#A8B5C7] font-medium mt-2">Successful Database Checks</p>
        </div>
      </div>
    </div>
  );
}
