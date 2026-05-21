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
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("insights")]
        public async Task<IActionResult> GetInsights()
        {
            var userId = GetUserId();
            var insights = await _aiService.GetSpendingInsightsAsync(userId);
            return Ok(insights);
        }

        [HttpGet("suggest-category")]
        public async Task<IActionResult> SuggestCategory([FromQuery] string description)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return BadRequest(new { message = "Transaction description is required." });
            }

            var category = await _aiService.SuggestCategoryAsync(description);
            return Ok(new { category });
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(claim) ? 0 : int.Parse(claim);
        }
    }
}
