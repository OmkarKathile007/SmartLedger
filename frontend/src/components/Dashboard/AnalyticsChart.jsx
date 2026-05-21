import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700 p-4 rounded-xl shadow-2xl text-white text-xs backdrop-blur-md">
        <p className="font-bold mb-2 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4 my-1">
            <span>{entry.name}:</span>
            <span className="font-semibold">${entry.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsChart = ({ trendData = [], categoryData = [] }) => {
  // Format trend data for display if empty
  const mockTrend = [
    { Month: 'No Data', IncomeAmount: 0, ExpenseAmount: 0 }
  ];
  
  const chartTrends = trendData.length > 0 ? trendData : mockTrend;

  // Format category data
  const chartCategories = categoryData.length > 0 
    ? categoryData.map(c => ({
        name: c.categoryName,
        value: Number(c.totalAmount),
        color: c.color
      }))
    : [{ name: 'No Expenses', value: 1, color: '#64748B' }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Area Trend Chart (2/3 width on wide screens) */}
      <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/50">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Cash Flow Trends (Past 6 Months)
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis 
                dataKey="Month" 
                stroke="#64748B" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                name="Income" 
                type="monotone" 
                dataKey="IncomeAmount" 
                stroke="#10B981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
              <Area 
                name="Expense" 
                type="monotone" 
                dataKey="ExpenseAmount" 
                stroke="#EF4444" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Donut Category Chart (1/3 width) */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/50 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Spending by Category
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Percentage allocation of current variable costs
          </p>
        </div>
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartCategories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Total display inside Donut holes */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              ${categoryData.reduce((acc, curr) => acc + Number(curr.totalAmount), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Total Spent
            </span>
          </div>
        </div>

        {/* Dynamic Legend scroll list */}
        <div className="mt-4 max-h-24 overflow-y-auto space-y-1.5 pr-2">
          {categoryData.length > 0 ? (
            categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                    {cat.categoryName}
                  </span>
                </div>
                <span className="text-slate-400 font-bold">
                  {cat.percentage.toFixed(0)}%
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-400">No active distributions</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
