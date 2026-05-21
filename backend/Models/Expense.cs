using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public int UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }
    }
}
