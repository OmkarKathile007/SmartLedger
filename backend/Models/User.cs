using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();

        [JsonIgnore]
        public ICollection<Income> Incomes { get; set; } = new List<Income>();

        [JsonIgnore]
        public ICollection<Category> Categories { get; set; } = new List<Category>();
    }
}
