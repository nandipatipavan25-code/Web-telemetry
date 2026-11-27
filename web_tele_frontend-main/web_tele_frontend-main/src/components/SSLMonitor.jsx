import React from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  XCircle, Clock, Globe, Lock, Shield 
} from 'lucide-react';

export default function SSLMonitor({ sslData, securityData }) {
  if (!sslData && !securityData) {
    return (
      <div className="bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-10 text-center text-slate-600 dark:text-[#A8B5C7] max-w-2xl mx-auto my-6 animate-fade-in-up shadow-3d-sm">
        <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-bounce" />
        <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-base">No Security Telemetry Audited</h4>
        <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-2">Run a scan above to see real-time SSL certificate validity and secure HTTP response headers.</p>
      </div>
    );
  }

  const {
    valid = false,
    daysRemaining = 0,
    issuer = 'unknown',
    expiryDate = null,
    message = 'No certificate returned from host socket.'
  } = sslData || {};

  const {
    securityScore = 100,
    headers = { missing: [], csp: 'disabled', hsts: 'disabled', xfo: 'disabled' },
    alerts = []
  } = securityData || {};

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-blue-700 dark:text-blue-400';
    if (score >= 70) return 'text-amber-700 dark:text-amber-400';
    return 'text-rose-700 dark:text-rose-400';
  };

  const getGradientId = (score) => {
    if (score >= 90) return 'url(#sslSkyGrad)';
    if (score >= 70) return 'url(#sslAmberGrad)';
    return 'url(#sslRoseGrad)';
  };

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      
      {/* SSL expiry urgent alerts */}
      {valid && daysRemaining <= 7 && (
        <div className={`elevated-card p-4 sm:p-5 rounded-2xl border-l-4 flex items-center gap-3 shadow-3d-sm bg-white dark:bg-[#162238] border ${
          daysRemaining <= 1 ? 'border-l-rose-600 border-rose-200 dark:border-rose-900/60' : 'border-l-amber-500 border-amber-200 dark:border-amber-900/60'
        }`}>
          <ShieldAlert className={`h-5 w-5 shrink-0 ${daysRemaining <= 1 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`} />
          <div>
            <p className={`text-xs font-medium ${daysRemaining <= 1 ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {daysRemaining <= 1
                ? `CRITICAL: SSL Certificate expires in ${daysRemaining} day${daysRemaining === 0 ? 's (TODAY)' : ''}! Renew immediately.`
                : `WARNING: SSL Certificate expires in ${daysRemaining} days. Schedule renewal now.`}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] mt-0.5">Issuer: {issuer} · Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      )}

      {/* SSL Active status banner */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-3d-sm">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${valid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9]">
            SSL {valid ? 'Active & Encrypted' : 'Inactive / Invalid'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">Expires In</p>
            <p className={`font-medium font-mono mt-0.5 ${daysRemaining > 30 ? 'text-emerald-700 dark:text-emerald-400' : daysRemaining > 7 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {valid ? `${daysRemaining} Days` : 'Expired'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider">Valid Until</p>
            <p className="text-slate-900 dark:text-[#F1F5F9] font-medium font-mono mt-0.5">{expiryDate ? new Date(expiryDate).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Security circular rating gauge */}
        <div className="col-span-12 md:col-span-4 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-3d-sm">
          <h3 className="text-slate-700 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider w-full text-left mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Security Shield Rating
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="sslSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="sslAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="sslRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <circle cx="72" cy="72" r="62" fill="transparent" className="stroke-slate-100 dark:stroke-[#1D2B42]" strokeWidth="8"></circle>
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="transparent"
                stroke={getGradientId(securityScore)}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * securityScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-medium tracking-tight font-mono ${getScoreColor(securityScore)}`}>{securityScore}%</span>
              <span className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-widest mt-1">Shield Score</span>
            </div>
          </div>
        </div>

        {/* SSL Certificate Details card */}
        <div className="col-span-12 md:col-span-8 elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-6 flex flex-col justify-between shadow-3d-sm">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-700 dark:text-[#A8B5C7] text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Active SSL Certificate
              </span>
              {valid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Secure
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-medium animate-pulse">
                  <XCircle className="h-3 w-3" /> Insecure
                </span>
              )}
            </div>

            <div className="space-y-3.5 mt-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2B3B53]">
                <span className="text-slate-600 dark:text-[#A8B5C7] font-medium">Certificate Issuer:</span>
                <span className="font-semibold text-slate-900 dark:text-[#F1F5F9]">{issuer}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2B3B53]">
                <span className="text-slate-600 dark:text-[#A8B5C7] font-medium">Expiration countdown:</span>
                <span className={`font-medium font-mono ${valid && daysRemaining > 30 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400 font-medium animate-pulse'}`}>
                  {valid ? `${daysRemaining} Days remaining` : '0 Days (Expired)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-[#A8B5C7] font-medium">Expiry Date:</span>
                <span className="font-mono text-slate-900 dark:text-[#F1F5F9]">
                  {expiryDate ? new Date(expiryDate).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B5C7] leading-relaxed italic border-t border-slate-100 dark:border-[#2B3B53] pt-3 mt-4">
            {message}
          </p>
        </div>

      </div>

      {/* HTTP Secure Response Headers Status */}
      <div className="elevated-card bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-[#2B3B53] rounded-2xl p-5 sm:p-6 space-y-6 shadow-3d-sm">
        
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#2B3B53] pb-4">
          <div>
            <h3 className="text-slate-900 dark:text-[#F1F5F9] font-medium text-lg flex items-center gap-2">
              <ShieldCheck className="text-blue-600 dark:text-blue-400 h-5 w-5" />
              Security Protocol & Headers Shield
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1">Analyzing web server response headers and Content Security Policy directives.</p>
          </div>
        </div>

        {/* Secure Headers status checks list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] flex justify-between items-center shadow-xs">
            <span className="text-slate-800 dark:text-[#F1F5F9] font-medium">HSTS Enforced:</span>
            <span className={`font-semibold text-xs px-2.5 py-1 rounded-lg border uppercase tracking-wider shadow-xs ${
              headers?.hsts === 'enabled' 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
            }`}>
              {headers?.hsts?.toUpperCase() || 'DISABLED'}
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] flex justify-between items-center shadow-xs">
            <span className="text-slate-800 dark:text-[#F1F5F9] font-medium">CSP Directives:</span>
            <span className={`font-semibold text-xs px-2.5 py-1 rounded-lg border uppercase tracking-wider shadow-xs ${
              headers?.csp === 'enabled' 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
            }`}>
              {headers?.csp?.toUpperCase() || 'DISABLED'}
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1D2B42] rounded-xl border border-slate-200/90 dark:border-[#2B3B53] flex justify-between items-center shadow-xs">
            <span className="text-slate-800 dark:text-[#F1F5F9] font-medium">X-Frame-Options:</span>
            <span className={`font-semibold text-xs px-2.5 py-1 rounded-lg border uppercase tracking-wider shadow-xs ${
              headers?.xfo === 'enabled' 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
            }`}>
              {headers?.xfo?.toUpperCase() || 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Missing security headers alert lists */}
        <div className="space-y-3 pt-2">
          <span className="text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block text-[11px]">Security Header Integrity Warnings</span>
          {headers?.missing?.length === 0 ? (
            <div className="p-5 border border-dashed border-emerald-300 dark:border-emerald-800/60 text-center text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex flex-col items-center justify-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Website has enabled all modern secure response headers! Complete vulnerability shielding.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.missing.map((header, index) => (
                <div key={index} className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-l-4 border-l-rose-500 border border-rose-200/80 dark:border-rose-900/50 rounded-xl flex gap-3.5 items-start text-xs shadow-xs">
                  <ShieldAlert className="text-rose-600 dark:text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 dark:text-[#F1F5F9] font-mono tracking-wide">{header}</span>
                    <p className="text-slate-600 dark:text-[#A8B5C7] text-xs leading-relaxed">
                      Missing header exposes users to clickjacking, MITM spoofing, or cross-site scripting risks. Enable in server configuration.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
