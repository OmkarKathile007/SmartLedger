import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import StatCard from './StatCard';
import AnalyticsChart from './AnalyticsChart';
import AiInsightsPanel from './AiInsightsPanel';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Activity, 
  PlusCircle, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';

// Dynamic Icon Helper
export const DynamicIcon = ({ name, className }) => {
  // Convert standard kebab-case or pascal-case names to actual Lucide imports
  // E.g. "gamepad-2" -> "Gamepad2", "shopping-bag" -> "ShoppingBag", "utensils" -> "Utensils"
  const formattedName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
    
  const IconComponent = LucideIcons[formattedName] || LucideIcons.Tag;
  return <IconComponent className={className} />;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load financial records. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Assembling your wealth dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-panel rounded-3xl border border-rose-500/25 text-center">
        <h3 className="text-xl font-bold text-rose-500 mb-2">Connection Interrupted</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{error}</p>
        <button 
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { totalIncome, totalExpense, netSavings, savingsRate, categoryDistribution, monthlyTrends, recentTransactions } = summary;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Welcoming Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time cash flow oversight and automated budgeting assistance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/expenses"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Log Expense
          </Link>
          <Link
            to="/income"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-500" /> Log Income
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          description="Total funds deposited this cycle"
          trend="Inflow active"
          trendType="up"
          color="emerald"
        />
        <StatCard
          title="Total Expenses"
          value={`$${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingDown}
          description="Total cash withdrawn / billed"
          trend="Outflow active"
          trendType="down"
          color="rose"
        />
        <StatCard
          title="Net Savings"
          value={`$${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={PiggyBank}
          description="Accumulated assets"
          trend={netSavings >= 0 ? "Surplus" : "Deficit"}
          trendType={netSavings >= 0 ? "up" : "down"}
          color={netSavings >= 0 ? "indigo" : "rose"}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          icon={Wallet}
          description="Cash retained for assets building"
          trend={savingsRate >= 20 ? "Target Met" : "Below Ideal"}
          trendType={savingsRate >= 20 ? "up" : "down"}
          color={savingsRate >= 20 ? "indigo" : "amber"}
        />
      </div>

      {/* 3. AI Insights advisor */}
      <AiInsightsPanel />

      {/* 4. Charting Visualizations */}
      <AnalyticsChart trendData={monthlyTrends} categoryData={categoryDistribution} />

      {/* 5. Unified Recent Transactions */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest incomes and expenses across accounts</p>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/expenses" 
              className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-all"
            >
              All Expenses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              to="/income" 
              className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-all"
            >
              All Income <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="pb-3 pl-3">Details</th>
                <th className="pb-3">Category / Source</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right pr-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-500/5 dark:hover:bg-slate-800/20 transition-all">
                    {/* Description + Icon */}
                    <td className="py-3.5 pl-3 flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${tx.color}15`, color: tx.color }}
                      >
                        <DynamicIcon name={tx.icon} className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px] md:max-w-xs">
                        {tx.description}
                      </span>
                    </td>
                    {/* Category or Source */}
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        tx.type === 'Income'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30'
                      }`}>
                        {tx.categoryOrSource}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="py-3.5 text-slate-400 dark:text-slate-500 text-xs">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {/* Amount */}
                    <td className={`py-3.5 text-right font-black pr-3 ${
                      tx.type === 'Income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'
                    }`}>
                      {tx.type === 'Income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400 text-xs font-medium">
                    No transactions registered yet. Start adding records to populate your logs!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
