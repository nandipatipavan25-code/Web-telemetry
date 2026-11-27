import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Mock validation: Username: admin, Password: admin
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin') {
        onLoginSuccess(username.trim(), rememberMe);
      } else {
        setError('Invalid username or password. (Hint: use admin / admin)');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto my-12 elevated-card bg-white dark:bg-[#162238] rounded-3xl p-8 shadow-3d-sm animate-fade-in-up border border-slate-200/90 dark:border-[#2B3B53]">
      
      {/* Back button */}
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white transition-colors font-medium uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-medium text-slate-900 dark:text-[#F1F5F9] tracking-tight">Admin Authentication</h2>
        <p className="text-xs text-slate-600 dark:text-[#A8B5C7] mt-1 font-medium">Please sign in to access security and SRE tools</p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-2.5 text-xs font-medium animate-pulse">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block">Username</label>
          <div className="form-input-container relative bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xs">
            <User className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-600 dark:text-[#A8B5C7] font-medium uppercase tracking-wider block">Password</label>
          <div className="form-input-container relative bg-slate-50/70 dark:bg-[#1D2B42] border border-slate-200 dark:border-[#2B3B53] rounded-xl px-3.5 h-[42px] flex items-center gap-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xs">
            <Lock className="text-slate-400 dark:text-[#A8B5C7] h-4 w-4 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!bg-transparent !border-none !shadow-none !ring-0 !outline-none !h-auto !p-0 text-xs w-full text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#A8B5C7] font-normal"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 dark:text-[#A8B5C7] hover:text-slate-900 dark:hover:text-white transition-colors p-1 cursor-pointer"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-600 dark:text-[#A8B5C7] font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 dark:border-[#2B3B53] text-blue-600 focus:ring-blue-500/25 bg-slate-100 dark:bg-[#1D2B42] h-4 w-4"
              disabled={loading}
            />
            <span>Remember Me</span>
          </label>
          <button
            type="button"
            onClick={() => setError('Contact the database administrator to reset password. (Hint: use admin / admin)')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors cursor-pointer"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-4 bg-blue-600 hover:bg-blue-700 !text-white rounded-xl text-xs font-medium shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
        >
          <span className="!text-white">{loading ? 'Authenticating...' : 'Login to Admin Dashboard'}</span>
        </button>

      </form>
    </div>
  );
}
