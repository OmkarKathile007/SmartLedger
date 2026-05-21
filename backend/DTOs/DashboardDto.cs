using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class DashboardSummary
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal NetSavings { get; set; }
        public decimal SavingsRate { get; set; } // Percentage of income saved

        public List<CategorySummary> CategoryDistribution { get; set; } = new();
        public List<MonthlyTrend> MonthlyTrends { get; set; } = new();
        public List<RecentTransaction> RecentTransactions { get; set; } = new();
    }

    public class CategorySummary
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal Percentage { get; set; }
        public string Color { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }

    public class MonthlyTrend
    {
        public string Month { get; set; } = string.Empty; // E.g., "Jan", "Feb"
        public decimal IncomeAmount { get; set; }
        public decimal ExpenseAmount { get; set; }
    }

    public class RecentTransaction
    {
        public int Id { get; set; }
        public string Type { get; set; } = "Expense"; // "Expense" or "Income"
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string CategoryOrSource { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }
}
