using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Repositories
{
    public class IncomeRepository : Repository<Income>, IIncomeRepository
    {
        public IncomeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Income>> GetUserIncomesAsync(
            int userId, 
            string? search = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null)
        {
            var query = _context.Incomes.Where(i => i.UserId == userId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(i => i.Description.ToLower().Contains(lowerSearch) || i.Source.ToLower().Contains(lowerSearch));
            }

            if (startDate.HasValue)
            {
                query = query.Where(i => i.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(i => i.Date <= endDate.Value);
            }

            return await query.OrderByDescending(i => i.Date).ToListAsync();
        }
    }
}
