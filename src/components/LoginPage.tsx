import { useState } from 'react';
import { Lock, User, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const VALID_CREDENTIALS = [
  {
    user: (import.meta.env.VITE_AUTH_USER || 'admin').toLowerCase(),
    pass: import.meta.env.VITE_AUTH_PASS || 'admin',
  },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const valid = VALID_CREDENTIALS.some(
        (c) => c.user === username.toLowerCase() && c.pass === password
      );

      if (valid) {
        localStorage.setItem('breach-auth', JSON.stringify({ user: username, ts: Date.now() }));
        onLogin();
      } else {
        setError('ACCESS DENIED — Invalid credentials');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-[#0a0e14] flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none scanlines" />

      {/* Login card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-red-500/10 to-amber-500/20 rounded-xl blur-xl" />

        <div className="relative bg-[#0d1117] border border-amber-500/30 rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-[#21262d]">
            {/* Logo */}
            <div className="mx-auto -mb-8 flex items-center justify-center relative">
              <img src="/breach-logo.svg" alt="BRE4CH" className="w-[28rem] h-auto" />
            </div>

          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[9px] font-mono text-[#6e7681] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Callsign / Username"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 border border-[#21262d] text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 font-mono transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] font-mono text-[#6e7681] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-black/50 border border-[#21262d] text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-[10px] font-mono text-red-400">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-sm uppercase tracking-wider hover:from-amber-500 hover:to-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                'SECURE ACCESS'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
