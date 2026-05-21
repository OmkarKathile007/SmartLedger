import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import TransactionModal from './TransactionModal';
import { DynamicIcon } from '../Dashboard/Dashboard';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Build query string params
      let query = '?';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory) query += `categoryId=${selectedCategory}&`;
      if (startDate) query += `startDate=${startDate}&`;
      if (endDate) query += `endDate=${endDate}&`;

      const response = await api.get(`/expenses${query}`);
      setExpenses(response.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [search, selectedCategory, startDate, endDate]);

  const handleSaveExpense = (savedExpense) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === savedExpense.id ? savedExpense : e));
    } else {
      setExpenses([savedExpense, ...expenses]);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Manage Expenses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Browse expense history, apply detailed filters, and update daily outlays.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> Add Expense
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-indigo-500 transition-all outline-none text-sm dark:text-white"
            placeholder="Search descriptions..."
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-indigo-500 transition-all outline-none text-sm dark:text-white appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Calendar className="w-4 h-4" />
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-indigo-500 transition-all outline-none text-sm dark:text-white"
            placeholder="Start Date"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Calendar className="w-4 h-4" />
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-indigo-500 transition-all outline-none text-sm dark:text-white"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Main Expense Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/50">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-semibold">Retrieving your expenses list...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold">No expense transactions found matching current filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="pb-3 pl-3">Details</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                  {currentExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-500/5 dark:hover:bg-slate-800/20 transition-all">
                      {/* Description + Icon */}
                      <td className="py-3.5 pl-3 flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${expense.categoryColor}15`, color: expense.categoryColor }}
                        >
                          <DynamicIcon name={expense.categoryIcon} className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px] md:max-w-xs block">
                          {expense.description}
                        </span>
                      </td>
                      {/* Category Label */}
                      <td className="py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-700/30">
                          {expense.categoryName}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="py-3.5 text-slate-400 dark:text-slate-500 text-xs">
                        {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      {/* Amount */}
                      <td className="py-3.5 text-right font-black text-slate-800 dark:text-white">
                        -${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {/* Actions */}
                      <td className="py-3.5 text-center pr-3">
                        {deleteConfirmId === expense.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEditClick(expense)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
                              title="Edit Expense"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(expense.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <span className="text-xs text-slate-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, expenses.length)} of {expenses.length} records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Add/Edit Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveExpense}
        transaction={editingExpense}
        type="Expense"
      />
    </div>
  );
};

export default ExpenseManager;
