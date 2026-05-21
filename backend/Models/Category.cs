using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = "tag"; // Lucide icon name
        public string Color { get; set; } = "#64748B"; // Hex color code
        
        public int? UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }

        [JsonIgnore]
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
