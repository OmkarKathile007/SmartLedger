using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories
{
    public interface IIncomeRepository : IRepository<Income>
    {
        Task<IEnumerable<Income>> GetUserIncomesAsync(
            int userId, 
            string? search = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null);
    }
}
