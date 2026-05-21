using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories
{
    public interface IExpenseRepository : IRepository<Expense>
    {
        Task<IEnumerable<Expense>> GetUserExpensesAsync(
            int userId, 
            string? search = null, 
            int? categoryId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null);
        
        Task<IEnumerable<Expense>> GetUserExpensesWithCategoryAsync(int userId);
        Task<Expense?> GetUserExpenseWithCategoryAsync(int id, int userId);
    }
}
