using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public DashboardController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = GetUserId();
            var summary = await _transactionService.GetDashboardSummaryAsync(userId);
            return Ok(summary);
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(claim) ? 0 : int.Parse(claim);
        }
    }
}
