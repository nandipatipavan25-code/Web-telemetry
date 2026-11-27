import React from 'react';

// Official GADS "GA" Vector Symbol (from GADS Symbol-01.svg)
export function GASymbol({ className = "w-8 h-8", cutoutColor = "#FFFFFF" }) {
  return (
    <svg viewBox="0 0 1800 1800" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gadsSymbolGradient" x1="1152.72" y1="1615.65" x2="485.86" y2="285.63" gradientUnits="userSpaceOnUse">
          <stop offset="0.01" stopColor="#2296D3" />
          <stop offset="1" stopColor="#1A4895" />
        </linearGradient>
      </defs>
      {/* Blue gradient triangle and inner G counter */}
      <path
        fill="url(#gadsSymbolGradient)"
        d="M983.74,36,916,164,796.68,389.45c-83.85-29.24-176-28.56-259.15,5.2C432,437.47,353.93,528.31,322.59,637.27q-4.41,17.49-7.2,35.59a365.41,365.41,0,0,0-7.4,73.35c0,119.12,57.26,224.85,145.75,291.21L317.57,1294.71l-19,36H1721.11Z"
      />
      {/* Cutout G contour */}
      <path
        fill={cutoutColor}
        d="M609.41,657V871.47l392.42,0c-8.62,31.62-32.93,103.69-100.48,163-102.12,89.73-225.52,82.24-254,79.62C495.56,1100.18,338,977.53,313.67,795.61,292.6,638.12,377,478.39,524.91,412.13c127.17-57,278.6-34.68,388.9,57.41l167-170.68c-40.3-38.64-104.91-90.09-195.19-121.8C635.68,89.26,297,190.75,150.1,450c-115.57,204-60.65,414.31-49.83,452.81,55.59,197.95,194.44,303.47,234,331.49C465,1327,598.8,1343.54,670.07,1345.92c53.95,1.79,184.55,4.42,317.4-75.83,202.68-122.43,248-339.55,256.74-381.32,20.25-96.95,12.38-179.63,3.25-231.82Z"
      />
    </svg>
  );
}

// 3D Isometric Server Rack (Reliability & Uptime)
export function Icon3DServer({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topBevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="shelfEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <filter id="serverShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.18" />
        </filter>
      </defs>
      
      <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="#0F172A" fillOpacity="0.12" />

      <g filter="url(#serverShadow)">
        <polygon points="32,6 52,16 32,26 12,16" fill="url(#topBevel)" stroke="#94A3B8" strokeWidth="0.75" />
        <polygon points="32,7 50,16 32,25 14,16" fill="#F8FAFC" />

        <polygon points="12,16 32,26 32,54 12,44" fill="#1E293B" />
        <polygon points="32,26 52,16 52,44 32,54" fill="#0F172A" />

        <polygon points="16,23 30,30 30,35 16,28" fill="url(#shelfEdge)" />
        <circle cx="20" cy="27" r="1.5" fill="#10B981" />
        <circle cx="24" cy="29" r="1" fill="#38BDF8" />
        <line x1="26" y1="30.5" x2="28" y2="31.5" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />

        <polygon points="16,31 30,38 30,43 16,36" fill="url(#shelfEdge)" />
        <circle cx="20" cy="35" r="1.5" fill="#10B981" />
        <circle cx="24" cy="37" r="1" fill="#10B981" />
        <line x1="26" y1="38.5" x2="28" y2="39.5" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />

        <polygon points="16,39 30,46 30,51 16,44" fill="url(#shelfEdge)" />
        <circle cx="20" cy="43" r="1.5" fill="#10B981" />
        <circle cx="24" cy="45" r="1" fill="#34D399" />
        <line x1="26" y1="46.5" x2="28" y2="47.5" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />

        <line x1="32" y1="26" x2="32" y2="54" stroke="#475569" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

// 3D Realistic Speed / Lightning Orb (Core Web Vitals)
export function Icon3DSpeed({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sphereGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="25%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
        <radialGradient id="ringGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
        <filter id="speedShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#B45309" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="32" cy="56" rx="18" ry="4" fill="#0F172A" fillOpacity="0.12" />

      <g filter="url(#speedShadow)">
        <circle cx="32" cy="30" r="22" fill="url(#ringGrad)" stroke="#CBD5E1" strokeWidth="1" />
        <circle cx="32" cy="30" r="19" fill="url(#sphereGrad)" />

        <path
          d="M 18,22 A 16,16 0 0,1 46,22 A 18,18 0 0,0 18,22 Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />

        <polygon points="34,14 22,31 31,31 28,44 42,27 33,27" fill="#FFFFFF" />
        <polygon points="34,14 22,31 31,31 33,27" fill="#FEF9C3" fillOpacity="0.9" />
        <polygon points="31,31 28,44 42,27 33,27" fill="#FDE047" />
      </g>
    </svg>
  );
}

// 3D Realistic Brass & Steel Padlock (SSL Encryption)
export function Icon3DLock({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shackleMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="35%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <radialGradient id="lockBody" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="45%" stopColor="#059669" />
          <stop offset="85%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
        <filter id="lockShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#064E3B" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="32" cy="56" rx="17" ry="4" fill="#0F172A" fillOpacity="0.12" />

      <path
        d="M 22,26 V 17 C 22,11.5 26.5,7 32,7 C 37.5,7 42,11.5 42,17 V 26"
        fill="none"
        stroke="url(#shackleMetal)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <g filter="url(#lockShadow)">
        <rect x="15" y="24" width="34" height="26" rx="6" fill="url(#lockBody)" stroke="#10B981" strokeWidth="0.75" />
        <line x1="21" y1="26" x2="43" y2="26" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
        <circle cx="32" cy="34" r="3" fill="#064E3B" />
        <polygon points="30.5,34 33.5,34 34,42 30,42" fill="#064E3B" />
        <circle cx="32" cy="34" r="1.5" fill="#022C22" />
      </g>
    </svg>
  );
}

// 3D Realistic Globe with Equatorial Orbit Ring (Domain Registration)
export function Icon3DGlobe({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="globeSphere" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="30%" stopColor="#3B82F6" />
          <stop offset="70%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#172554" />
        </radialGradient>
        <linearGradient id="ring3D" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <filter id="globeShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#1D4ED8" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="32" cy="56" rx="18" ry="4" fill="#0F172A" fillOpacity="0.12" />

      <ellipse cx="32" cy="32" rx="26" ry="9" stroke="url(#ring3D)" strokeWidth="2.5" strokeDasharray="38 42" strokeDashoffset="20" strokeOpacity="0.5" transform="rotate(-20 32 32)" />

      <g filter="url(#globeShadow)">
        <circle cx="32" cy="31" r="19" fill="url(#globeSphere)" />
        <path d="M 20,24 C 24,20 32,21 38,18 C 42,21 44,28 41,33 C 38,36 30,35 25,31 Z" fill="#60A5FA" fillOpacity="0.4" />
        <path d="M 17,34 C 21,32 25,36 29,40 C 27,45 22,46 18,41 Z" fill="#60A5FA" fillOpacity="0.4" />
        <circle cx="25" cy="22" r="5" fill="#FFFFFF" fillOpacity="0.25" />
      </g>

      <ellipse cx="32" cy="32" rx="26" ry="9" stroke="url(#ring3D)" strokeWidth="2.5" strokeDasharray="40 40" transform="rotate(-20 32 32)" />
      <circle cx="53" cy="24" r="2.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1" />
    </svg>
  );
}

// 3D Realistic Magnifier over Document (SEO Visibility)
export function Icon3DSEO({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lensReflect" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#FEF3C7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="rimMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <filter id="seoShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#B45309" floodOpacity="0.22" />
        </filter>
      </defs>

      <ellipse cx="32" cy="56" rx="17" ry="4" fill="#0F172A" fillOpacity="0.12" />

      <rect x="12" y="10" width="28" height="34" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="17" y1="17" x2="31" y2="17" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="22" x2="27" y2="22" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="27" x2="33" y2="27" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="32" x2="25" y2="32" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

      <g filter="url(#seoShadow)">
        <circle cx="37" cy="27" r="14" fill="none" stroke="url(#rimMetal)" strokeWidth="3" />
        <circle cx="37" cy="27" r="12.5" fill="url(#lensReflect)" />
        <path d="M 29,20 A 11,11 0 0,1 45,20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 46,36 L 55,47 C 56,48.5 54.5,50 53,49 L 43,39 Z" fill="#78350F" stroke="#B45309" strokeWidth="0.75" />
      </g>
    </svg>
  );
}

// 3D Realistic Faceted Heraldic Shield (Malware & Security)
export function Icon3DShield({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="shieldRight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="shieldBevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
        <filter id="shieldShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#064E3B" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="32" cy="56" rx="17" ry="4" fill="#0F172A" fillOpacity="0.12" />

      <g filter="url(#shieldShadow)">
        <path
          d="M 32,8 L 16,14 C 16,30 23,43 32,49 Z"
          fill="url(#shieldLeft)"
        />
        <path
          d="M 32,8 L 48,14 C 48,30 41,43 32,49 Z"
          fill="url(#shieldRight)"
        />
        
        <path
          d="M 32,8 L 16,14 C 16,30 23,43 32,49 C 41,43 48,30 48,14 Z"
          fill="none"
          stroke="url(#shieldBevel)"
          strokeWidth="1.2"
        />

        <line x1="32" y1="8" x2="32" y2="49" stroke="#A7F3D0" strokeWidth="1.2" />

        <path
          d="M 24,28 L 29,33 L 40,21"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
