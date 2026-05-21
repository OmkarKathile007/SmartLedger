import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseManager from './components/Transactions/ExpenseManager';
import IncomeManager from './components/Transactions/IncomeManager';
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Wallet,
  Sparkles,
  User
} from 'lucide-react';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Sidebar Layout Wrapper
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Income', path: '/income', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex transition-colors duration-300 font-sans">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/40 p-6 fixed h-full z-40">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              SmartLedger
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" /> AI Powered
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Settings */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 mt-6 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-bold">
              {user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <div className="truncate max-w-[150px]">
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">
                {user?.username || 'Premium User'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Theme & Logout Buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold">Dark</span>
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200/50 dark:border-rose-950/30 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-all font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Nav Drawer Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-all"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-850 transform transition-transform duration-300 lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                SmartLedger
              </h2>
            </div>
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              <span className="text-xs font-bold">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200/50 dark:border-rose-950/30 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen">
        
        {/* Sticky Mobile Nav Header */}
        <header className="lg:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 p-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <Wallet className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-black tracking-tight text-slate-800 dark:text-white">SmartLedger</h2>
            </div>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Secured Workspace */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ExpenseManager />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/income" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IncomeManager />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Root Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
