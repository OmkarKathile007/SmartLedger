using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly IIncomeRepository _incomeRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly AppDbContext _context; // Direct DB query access for complex dashboard aggregations

        public TransactionService(
            IExpenseRepository expenseRepository,
            IIncomeRepository incomeRepository,
            IRepository<Category> categoryRepository,
            AppDbContext context)
        {
            _expenseRepository = expenseRepository;
            _incomeRepository = incomeRepository;
            _categoryRepository = categoryRepository;
            _context = context;
        }

        #region Expenses CRUD
        public async Task<IEnumerable<ExpenseResponse>> GetExpensesAsync(
            int userId, 
            string? search = null, 
            int? categoryId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null)
        {
            var expenses = await _expenseRepository.GetUserExpensesAsync(userId, search, categoryId, startDate, endDate);
            return expenses.Select(MapToExpenseResponse);
        }

        public async Task<ExpenseResponse?> GetExpenseByIdAsync(int id, int userId)
        {
            var expense = await _expenseRepository.GetUserExpenseWithCategoryAsync(id, userId);
            return expense == null ? null : MapToExpenseResponse(expense);
        }

        public async Task<ExpenseResponse> CreateExpenseAsync(CreateExpenseRequest request, int userId)
        {
            var expense = new Expense
            {
                Amount = request.Amount,
                Description = request.Description,
                Date = request.Date,
                CategoryId = request.CategoryId,
                UserId = userId
            };

            await _expenseRepository.AddAsync(expense);
            await _expenseRepository.SaveChangesAsync();

            // Fetch again to load Category navigation property
            var savedExpense = await _expenseRepository.GetUserExpenseWithCategoryAsync(expense.Id, userId);
            return MapToExpenseResponse(savedExpense!);
        }

        public async Task<ExpenseResponse?> UpdateExpenseAsync(int id, UpdateExpenseRequest request, int userId)
        {
            var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
            if (expense == null) return null;

            expense.Amount = request.Amount;
            expense.Description = request.Description;
            expense.Date = request.Date;
            expense.CategoryId = request.CategoryId;

            _expenseRepository.Update(expense);
            await _expenseRepository.SaveChangesAsync();

            var updatedExpense = await _expenseRepository.GetUserExpenseWithCategoryAsync(expense.Id, userId);
            return MapToExpenseResponse(updatedExpense!);
        }

        public async Task<bool> DeleteExpenseAsync(int id, int userId)
        {
            var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
            if (expense == null) return false;

            _expenseRepository.Delete(expense);
            return await _expenseRepository.SaveChangesAsync();
        }
        #endregion

        #region Income CRUD
        public async Task<IEnumerable<IncomeResponse>> GetIncomesAsync(
            int userId, 
            string? search = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null)
        {
            var incomes = await _incomeRepository.GetUserIncomesAsync(userId, search, startDate, endDate);
            return incomes.Select(MapToIncomeResponse);
        }

        public async Task<IncomeResponse?> GetIncomeByIdAsync(int id, int userId)
        {
            var income = await _context.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
            return income == null ? null : MapToIncomeResponse(income);
        }

        public async Task<IncomeResponse> CreateIncomeAsync(CreateIncomeRequest request, int userId)
        {
            var income = new Income
            {
                Amount = request.Amount,
                Description = request.Description,
                Date = request.Date,
                Source = request.Source,
                UserId = userId
            };

            await _incomeRepository.AddAsync(income);
            await _incomeRepository.SaveChangesAsync();

            return MapToIncomeResponse(income);
        }

        public async Task<IncomeResponse?> UpdateIncomeAsync(int id, UpdateIncomeRequest request, int userId)
        {
            var income = await _context.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
            if (income == null) return null;

            income.Amount = request.Amount;
            income.Description = request.Description;
            income.Date = request.Date;
            income.Source = request.Source;

            _incomeRepository.Update(income);
            await _incomeRepository.SaveChangesAsync();

            return MapToIncomeResponse(income);
        }

        public async Task<bool> DeleteIncomeAsync(int id, int userId)
        {
            var income = await _context.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
            if (income == null) return false;

            _incomeRepository.Delete(income);
            return await _incomeRepository.SaveChangesAsync();
        }
        #endregion

        #region Dashboard Analytics
        public async Task<DashboardSummary> GetDashboardSummaryAsync(int userId)
        {
            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var incomes = await _context.Incomes
                .Where(i => i.UserId == userId)
                .ToListAsync();

            var totalIncome = incomes.Sum(i => i.Amount);
            var totalExpense = expenses.Sum(e => e.Amount);
            var netSavings = totalIncome - totalExpense;
            var savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

            // 1. Category Distribution (Expenses)
            var categoryDistribution = expenses
                .GroupBy(e => e.Category)
                .Select(g => new CategorySummary
                {
                    CategoryId = g.Key?.Id ?? 8, // Fallback to "Other"
                    CategoryName = g.Key?.Name ?? "Other",
                    TotalAmount = g.Sum(e => e.Amount),
                    Percentage = totalExpense > 0 ? (g.Sum(e => e.Amount) / totalExpense) * 100 : 0,
                    Color = g.Key?.Color ?? "#64748B",
                    Icon = g.Key?.Icon ?? "tag"
                })
                .OrderByDescending(c => c.TotalAmount)
                .ToList();

            // 2. Monthly Trends (Past 6 Months)
            var monthlyTrends = new List<MonthlyTrend>();
            var today = DateTime.UtcNow;
            for (int i = 5; i >= 0; i--)
            {
                var monthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1).AddSeconds(-1);

                var monthlyIncome = incomes
                    .Where(inc => inc.Date >= monthStart && inc.Date <= monthEnd)
                    .Sum(inc => inc.Amount);

                var monthlyExpense = expenses
                    .Where(exp => exp.Date >= monthStart && exp.Date <= monthEnd)
                    .Sum(exp => exp.Amount);

                monthlyTrends.Add(new MonthlyTrend
                {
                    Month = monthStart.ToString("MMM yyyy", CultureInfo.InvariantCulture),
                    IncomeAmount = monthlyIncome,
                    ExpenseAmount = monthlyExpense
                });
            }

            // 3. Recent Transactions (Unified list of latest 10 items)
            var recentExpenses = expenses
                .Select(e => new RecentTransaction
                {
                    Id = e.Id,
                    Type = "Expense",
                    Amount = e.Amount,
                    Description = e.Description,
                    Date = e.Date,
                    CategoryOrSource = e.Category?.Name ?? "Other",
                    Icon = e.Category?.Icon ?? "tag",
                    Color = e.Category?.Color ?? "#64748B"
                });

            var recentIncomes = incomes
                .Select(i => new RecentTransaction
                {
                    Id = i.Id,
                    Type = "Income",
                    Amount = i.Amount,
                    Description = i.Description,
                    Date = i.Date,
                    CategoryOrSource = i.Source,
                    Icon = "wallet", // Fixed icon for incomes
                    Color = "#10B981" // Emerald/Green theme color for income
                });

            var recentTransactions = recentExpenses
                .Concat(recentIncomes)
                .OrderByDescending(t => t.Date)
                .Take(10)
                .ToList();

            return new DashboardSummary
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                NetSavings = netSavings,
                SavingsRate = Math.Round(savingsRate, 2),
                CategoryDistribution = categoryDistribution,
                MonthlyTrends = monthlyTrends,
                RecentTransactions = recentTransactions
            };
        }
        #endregion

        #region Categories
        public async Task<IEnumerable<Category>> GetCategoriesAsync(int userId)
        {
            // System-wide categories (UserId == null) OR user-defined categories (UserId == userId)
            return await _context.Categories
                .Where(c => c.UserId == null || c.UserId == userId)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category> CreateCategoryAsync(string name, string icon, string color, int userId)
        {
            var category = new Category
            {
                Name = name,
                Icon = icon,
                Color = color,
                UserId = userId
            };

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.SaveChangesAsync();
            return category;
        }
        #endregion

        #region Mapping Helpers
        private ExpenseResponse MapToExpenseResponse(Expense expense)
        {
            return new ExpenseResponse
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Description = expense.Description,
                Date = expense.Date,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category?.Name ?? "Other",
                CategoryIcon = expense.Category?.Icon ?? "tag",
                CategoryColor = expense.Category?.Color ?? "#64748B"
            };
        }

        private IncomeResponse MapToIncomeResponse(Income income)
        {
            return new IncomeResponse
            {
                Id = income.Id,
                Amount = income.Amount,
                Description = income.Description,
                Date = income.Date,
                Source = income.Source
            };
        }
        #endregion
    }
}
