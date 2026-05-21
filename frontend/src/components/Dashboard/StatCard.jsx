import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, trendType, color = 'indigo' }) => {
  const gradients = {
    indigo: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    rose: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400',
  };

  const bgIcons = {
    indigo: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300',
    emerald: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
    rose: 'bg-rose-500/20 text-rose-600 dark:text-rose-300',
    amber: 'bg-amber-500/20 text-amber-600 dark:text-amber-300',
  };

  return (
    <div className={`glass-panel rounded-2xl p-6 border bg-gradient-to-br ${gradients[color] || gradients.indigo} glass-card-hover`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold mt-2 text-slate-800 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-4 rounded-2xl ${bgIcons[color] || bgIcons.indigo} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trendType === 'up' 
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
