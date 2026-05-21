import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Sparkles, BrainCircuit, ShieldAlert, CheckCircle, RotateCw, Lightbulb } from 'lucide-react';

const AiInsightsPanel = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);

  const fetchInsights = async (isRegen = false) => {
    setLoading(true);
    setError('');
    if (isRegen) setAnimating(true);
    
    try {
      const response = await api.get('/ai/insights');
      setInsights(response.data);
    } catch (err) {
      console.error("Failed to load AI Insights:", err);
      setError("Unable to synthesize AI advice. Please add more transactions or verify your network connection.");
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 1000);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-500 stroke-amber-500 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-500 stroke-rose-500 border-rose-500/20 bg-rose-500/10';
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-indigo-500/15 dark:border-indigo-500/10 relative overflow-hidden bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              PennyWise AI Advisor
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-300 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">Tailored personal wealth recommendations</p>
          </div>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-500 dark:text-slate-400 hover:text-indigo-500"
          title="Regenerate Analysis"
        >
          <RotateCw className={`w-4 h-4 ${loading || animating ? 'animate-spin text-indigo-500' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <BrainCircuit className="w-12 h-12 text-indigo-500/60 animate-bounce mb-4" />
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
            Analyzing spending patterns, calculating risk indices, and drafting financial advice...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Score Block */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Visual Dial */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-slate-200 dark:border-slate-800 ${getScoreColor(insights.financialHealthScore)}`}>
                <div className="text-center">
                  <span className="text-3xl font-black tracking-tight">{insights.financialHealthScore}</span>
                  <p className="text-[8px] uppercase font-bold tracking-wider opacity-85">Health Index</p>
                </div>
              </div>
            </div>

            {/* AI Summary Text */}
            <div className="md:col-span-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              <p className="font-medium bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 italic">
                "{insights.summary}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warnings Box */}
            <div className="bg-rose-500/5 dark:bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4" /> Critical Warning Flags
              </h4>
              <ul className="space-y-2.5">
                {insights.warningFlags && insights.warningFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions Box */}
            <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-emerald-500" /> Actionable Recommendations
              </h4>
              <ul className="space-y-2.5">
                {insights.suggestions && insights.suggestions.map((sug, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInsightsPanel;
