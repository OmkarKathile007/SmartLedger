using System.Collections.Generic;

namespace backend.DTOs
{
    public class AiInsightsResponse
    {
        public string Summary { get; set; } = string.Empty;
        public int FinancialHealthScore { get; set; } // Scale 0-100
        public List<string> Suggestions { get; set; } = new();
        public List<string> WarningFlags { get; set; } = new();
    }
}
