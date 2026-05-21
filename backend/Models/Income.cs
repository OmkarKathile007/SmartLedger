using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Income
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Source { get; set; } = "Salary"; // E.g., Salary, Freelance, Investment

        public int UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }
    }
}
