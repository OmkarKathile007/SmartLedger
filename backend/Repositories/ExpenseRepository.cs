using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Repositories
{
    public class ExpenseRepository : Repository<Expense>, IExpenseRepository
    {
        public ExpenseRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Expense>> GetUserExpensesAsync(
            int userId, 
            string? search = null, 
            int? categoryId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null)
        {
            var query = _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(e => e.Description.ToLower().Contains(lowerSearch));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(e => e.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(e => e.Date <= endDate.Value);
            }

            return await query.OrderByDescending(e => e.Date).ToListAsync();
        }

        public async Task<IEnumerable<Expense>> GetUserExpensesWithCategoryAsync(int userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<Expense?> GetUserExpenseWithCategoryAsync(int id, int userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        }
    }
}
