using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface ITransactionService
    {
        // Expenses CRUD
        Task<IEnumerable<ExpenseResponse>> GetExpensesAsync(
            int userId, 
            string? search = null, 
            int? categoryId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null);
        
        Task<ExpenseResponse?> GetExpenseByIdAsync(int id, int userId);
        Task<ExpenseResponse> CreateExpenseAsync(CreateExpenseRequest request, int userId);
        Task<ExpenseResponse?> UpdateExpenseAsync(int id, UpdateExpenseRequest request, int userId);
        Task<bool> DeleteExpenseAsync(int id, int userId);

        // Income CRUD
        Task<IEnumerable<IncomeResponse>> GetIncomesAsync(
            int userId, 
            string? search = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null);
        
        Task<IncomeResponse?> GetIncomeByIdAsync(int id, int userId);
        Task<IncomeResponse> CreateIncomeAsync(CreateIncomeRequest request, int userId);
        Task<IncomeResponse?> UpdateIncomeAsync(int id, UpdateIncomeRequest request, int userId);
        Task<bool> DeleteIncomeAsync(int id, int userId);

        // Dashboard Analytics
        Task<DashboardSummary> GetDashboardSummaryAsync(int userId);

        // Categories
        Task<IEnumerable<Category>> GetCategoriesAsync(int userId);
        Task<Category> CreateCategoryAsync(string name, string icon, string color, int userId);
    }
}
