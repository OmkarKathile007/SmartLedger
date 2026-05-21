using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public ExpensesController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetExpenses(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var userId = GetUserId();
            var expenses = await _transactionService.GetExpensesAsync(userId, search, categoryId, startDate, endDate);
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExpenseById(int id)
        {
            var userId = GetUserId();
            var expense = await _transactionService.GetExpenseByIdAsync(id, userId);
            
            if (expense == null)
            {
                return NotFound(new { message = "Expense not found." });
            }

            return Ok(expense);
        }

        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var expense = await _transactionService.CreateExpenseAsync(request, userId);
            return CreatedAtAction(nameof(GetExpenseById), new { id = expense.Id }, expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] UpdateExpenseRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var expense = await _transactionService.UpdateExpenseAsync(id, request, userId);

            if (expense == null)
            {
                return NotFound(new { message = "Expense not found." });
            }

            return Ok(expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var userId = GetUserId();
            var success = await _transactionService.DeleteExpenseAsync(id, userId);

            if (!success)
            {
                return NotFound(new { message = "Expense not found." });
            }

            return Ok(new { message = "Expense deleted successfully." });
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(claim) ? 0 : int.Parse(claim);
        }
    }
}
