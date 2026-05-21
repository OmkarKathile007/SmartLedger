using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateExpenseRequest
    {
        [Range(0.01, 10000000, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        public int CategoryId { get; set; }
    }

    public class UpdateExpenseRequest
    {
        [Range(0.01, 10000000, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        public int CategoryId { get; set; }
    }

    public class ExpenseResponse
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryIcon { get; set; } = string.Empty;
        public string CategoryColor { get; set; } = string.Empty;
    }
}
