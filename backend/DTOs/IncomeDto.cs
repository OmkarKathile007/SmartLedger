using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateIncomeRequest
    {
        [Range(0.01, 10000000, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Source { get; set; } = "Salary";
    }

    public class UpdateIncomeRequest
    {
        [Range(0.01, 10000000, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Source { get; set; } = "Salary";
    }

    public class IncomeResponse
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Source { get; set; } = string.Empty;
    }
}
