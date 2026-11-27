// Centralized API and Socket configuration for both local dev and production
// Connects directly to live data from https://gawebtelemetry.com

const getBackendHost = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl && envUrl.trim()) {
    // Strip trailing /api and trailing slashes if present
    return envUrl.trim().replace(/\/api\/?$/i, '').replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // On the production VPS itself, relative path is forwarded by Nginx
    if (hostname === 'gawebtelemetry.com' || hostname === 'www.gawebtelemetry.com') {
      return '';
    }
  }

  // On local dev (localhost, 127.0.0.1) and all other environments,
  // connect directly to actual website data on https://gawebtelemetry.com
  return 'https://gawebtelemetry.com';
};

export const BACKEND_URL = getBackendHost();
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';
export const SOCKET_URL = BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://gawebtelemetry.com');
