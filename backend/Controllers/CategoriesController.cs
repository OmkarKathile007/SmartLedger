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
    public class CategoriesController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public CategoriesController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var userId = GetUserId();
            var categories = await _transactionService.GetCategoriesAsync(userId);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Category name is required." });
            }

            var userId = GetUserId();
            var category = await _transactionService.CreateCategoryAsync(
                request.Name, 
                request.Icon ?? "tag", 
                request.Color ?? "#64748B", 
                userId);

            return Ok(category);
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(claim) ? 0 : int.Parse(claim);
        }
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}
