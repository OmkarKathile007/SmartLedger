using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface IAiService
    {
        Task<AiInsightsResponse> GetSpendingInsightsAsync(int userId);
        Task<string> SuggestCategoryAsync(string description);
    }
}
