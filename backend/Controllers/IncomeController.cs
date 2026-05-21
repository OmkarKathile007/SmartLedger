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
    public class IncomeController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public IncomeController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetIncomes(
            [FromQuery] string? search,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var userId = GetUserId();
            var incomes = await _transactionService.GetIncomesAsync(userId, search, startDate, endDate);
            return Ok(incomes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetIncomeById(int id)
        {
            var userId = GetUserId();
            var income = await _transactionService.GetIncomeByIdAsync(id, userId);

            if (income == null)
            {
                return NotFound(new { message = "Income not found." });
            }

            return Ok(income);
        }

        [HttpPost]
        public async Task<IActionResult> CreateIncome([FromBody] CreateIncomeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var income = await _transactionService.CreateIncomeAsync(request, userId);
            return CreatedAtAction(nameof(GetIncomeById), new { id = income.Id }, income);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIncome(int id, [FromBody] UpdateIncomeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var income = await _transactionService.UpdateIncomeAsync(id, request, userId);

            if (income == null)
            {
                return NotFound(new { message = "Income not found." });
            }

            return Ok(income);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncome(int id)
        {
            var userId = GetUserId();
            var success = await _transactionService.DeleteIncomeAsync(id, userId);

            if (!success)
            {
                return NotFound(new { message = "Income not found." });
            }

            return Ok(new { message = "Income deleted successfully." });
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(claim) ? 0 : int.Parse(claim);
        }
    }
}
