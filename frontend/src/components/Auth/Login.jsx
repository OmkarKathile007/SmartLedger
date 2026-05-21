import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('DemoPassword123!');
    setError('');
    setLoading(true);

    const result = await login('demo@example.com', 'DemoPassword123!');
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative px-4 overflow-hidden">
      {/* Decorative Geometric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px] animate-pulse"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl shadow-2xl p-8 relative border border-white/10 text-white">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-float">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            PennyWise AI
          </h1>
          <p className="text-slate-400 mt-2 text-sm text-center">
            Log in to manage your budget and explore AI spending advice
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-700/50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-white text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-700/50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-white text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl shimmer-btn text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-slate-700 w-full"></div>
          <span className="absolute bg-[#161d30] px-3 text-xs text-slate-400 uppercase tracking-wider">
            Quick Sandbox Try
          </span>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-500/10 text-indigo-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          Explore as Demo Guest (Zero Setup)
        </button>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
