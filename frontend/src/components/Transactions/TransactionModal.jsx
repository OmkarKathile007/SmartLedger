import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Sparkles, Loader2, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null, type = 'Expense' }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [source, setSource] = useState('Salary');
  const [categories, setCategories] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available categories for expenses
  useEffect(() => {
    if (isOpen && type === 'Expense') {
      const fetchCategories = async () => {
        try {
          const response = await api.get('/categories');
          setCategories(response.data);
          // Set default category if editing or new
          if (transaction) {
            setCategoryId(transaction.categoryId);
          } else if (response.data.length > 0) {
            setCategoryId(response.data[0].id);
          }
        } catch (err) {
          console.error("Failed to load categories:", err);
        }
      };
      fetchCategories();
    }
  }, [isOpen, type, transaction]);

  // Load transaction details if editing
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (transaction) {
        setAmount(transaction.amount.toString());
        setDescription(transaction.description);
        setDate(new Date(transaction.date).toISOString().split('T')[0]);
        if (type === 'Expense') {
          setCategoryId(transaction.categoryId);
        } else {
          setSource(transaction.source || 'Salary');
        }
      } else {
        // Reset fields for new transaction
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        if (type === 'Income') {
          setSource('Salary');
        }
      }
    }
  }, [isOpen, transaction, type]);

  // AI Category Suggestion Trigger
  const handleAiSuggest = async () => {
    if (!description.trim()) {
      setError('Enter a description first for AI categorization.');
      return;
    }
    setSuggesting(true);
    setError('');
    try {
      const response = await api.get(`/ai/suggest-category?description=${encodeURIComponent(description)}`);
      const suggestedName = response.data.category;
      
      // Match suggested name with loaded categories list
      const matched = categories.find(c => c.name.toLowerCase().includes(suggestedName.toLowerCase()) || suggestedName.toLowerCase().includes(c.name.toLowerCase()));
      
      if (matched) {
        setCategoryId(matched.id);
      } else {
        // Fallback to "Other" category (usually ID 8 or last item)
        const otherCat = categories.find(c => c.name.toLowerCase().includes('other')) || categories[categories.length - 1];
        if (otherCat) setCategoryId(otherCat.id);
      }
    } catch (err) {
      console.error("AI Category Suggest failed:", err);
      setError("AI was unable to categorize this. Please select manually.");
    } finally {
      setSuggesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setSaveLoading(true);

    const payload = {
      amount: parsedAmount,
      description,
      date: new Date(date).toISOString(),
    };

    if (type === 'Expense') {
      payload.categoryId = parseInt(categoryId);
    } else {
      payload.source = source;
    }

    try {
      let response;
      if (transaction) {
        // Edit Mode
        response = await api.put(`/${type === 'Expense' ? 'expenses' : 'income'}/${transaction.id}`, payload);
      } else {
        // Create Mode
        response = await api.post(`/${type === 'Expense' ? 'expenses' : 'income'}`, payload);
      }
      onSave(response.data);
      onClose();
    } catch (err) {
      console.error("Failed to save transaction:", err);
      setError(err.response?.data?.message || 'Failed to save transaction. Try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative text-slate-800 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold">
            {transaction ? 'Edit' : 'Add New'} {type}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <DollarSign className="w-5 h-5" />
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description input + AI Suggestion */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description
              </label>
              {type === 'Expense' && (
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={suggesting}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-400 transition-all"
                >
                  {suggesting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> AI Auto-Categorize
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FileText className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm dark:text-white"
                placeholder="E.g. Uber Ride, Walmart Groceries"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Date
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Calendar className="w-5 h-5" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm dark:text-white"
              />
            </div>
          </div>

          {/* Category Dropdown (Expenses Only) */}
          {type === 'Expense' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Tag className="w-5 h-5" />
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm dark:text-white appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Source Input (Income Only) */
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Income Source
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm dark:text-white appearance-none"
                >
                  <option value="Salary" className="dark:bg-slate-900">Salary</option>
                  <option value="Freelance" className="dark:bg-slate-900">Freelance / Contract</option>
                  <option value="Investments" className="dark:bg-slate-900">Investments / Dividends</option>
                  <option value="Gifts" className="dark:bg-slate-900">Gifts / Grants</option>
                  <option value="Other" className="dark:bg-slate-900">Other Inflow</option>
                </select>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="flex-1 py-3 shimmer-btn text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              {saveLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save Transaction'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default TransactionModal;
