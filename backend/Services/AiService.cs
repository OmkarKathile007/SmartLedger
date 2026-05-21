using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public class AiService : IAiService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AiService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public AiService(
            AppDbContext context, 
            IConfiguration configuration, 
            ILogger<AiService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<AiInsightsResponse> GetSpendingInsightsAsync(int userId)
        {
            // 1. Fetch user data for context
            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            var incomes = await _context.Incomes
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.Date)
                .ToListAsync();

            if (!expenses.Any() && !incomes.Any())
            {
                return new AiInsightsResponse
                {
                    Summary = "Welcome to your AI Financial Assistant! Once you add your income and expenses, I will analyze your data and provide personalized financial suggestions, warning flags, and an interactive health score.",
                    FinancialHealthScore = 100,
                    Suggestions = new List<string> { "Add your first income record (e.g. Salary).", "Log some daily expenses to start tracking." },
                    WarningFlags = new List<string> { "No financial history logged yet." }
                };
            }

            var totalIncome = incomes.Sum(i => i.Amount);
            var totalExpense = expenses.Sum(e => e.Amount);
            var netSavings = totalIncome - totalExpense;
            var savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

            var topCategories = expenses
                .GroupBy(e => e.Category?.Name ?? "Other")
                .Select(g => new { Name = g.Key, Amount = g.Sum(e => e.Amount) })
                .OrderByDescending(c => c.Amount)
                .ToList();

            // 2. Try using the Gemini API if a key is provided
            var apiKey = _configuration["AI:GeminiApiKey"];
            if (!string.IsNullOrWhiteSpace(apiKey) && apiKey != "YOUR_GEMINI_API_KEY")
            {
                try
                {
                    return await GetGeminiInsightsAsync(apiKey, totalIncome, totalExpense, savingsRate, topCategories, expenses.Take(10).ToList());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Gemini API call failed. Falling back to intelligent mock generator.");
                }
            }

            // 3. Fallback to highly intelligent, dynamic local rules engine
            if (TryGetOpenAiConfig(out var openAiKey, out var openAiBaseUrl, out var openAiModel))
            {
                try
                {
                    return await GetOpenAiInsightsAsync(openAiKey, openAiBaseUrl, openAiModel, totalIncome, totalExpense, savingsRate, topCategories, expenses.Take(10).ToList());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "OpenAI-compatible API call failed. Falling back to local insights.");
                }
            }

            return GenerateLocalInsights(totalIncome, totalExpense, savingsRate, topCategories);
        }

        public async Task<string> SuggestCategoryAsync(string description)
        {
            var desc = description.ToLower();

            // Simple fast local matching
            if (desc.Contains("uber") || desc.Contains("lyft") || desc.Contains("cab") || desc.Contains("taxi") || desc.Contains("gas") || desc.Contains("fuel") || desc.Contains("train") || desc.Contains("bus") || desc.Contains("metro"))
                return "Transportation";
            if (desc.Contains("restaurant") || desc.Contains("mcdonald") || desc.Contains("starbucks") || desc.Contains("food") || desc.Contains("dinner") || desc.Contains("lunch") || desc.Contains("grocery") || desc.Contains("cafe") || desc.Contains("pizza"))
                return "Food & Dining";
            if (desc.Contains("rent") || desc.Contains("mortgage") || desc.Contains("apartment") || desc.Contains("housing"))
                return "Rent & Housing";
            if (desc.Contains("netflix") || desc.Contains("spotify") || desc.Contains("movie") || desc.Contains("game") || desc.Contains("steam") || desc.Contains("hulu") || desc.Contains("cinema") || desc.Contains("concert"))
                return "Entertainment";
            if (desc.Contains("electricity") || desc.Contains("water") || desc.Contains("internet") || desc.Contains("gas bill") || desc.Contains("wifi") || desc.Contains("phone bill"))
                return "Utilities";
            if (desc.Contains("hospital") || desc.Contains("doctor") || desc.Contains("dentist") || desc.Contains("pharmacy") || desc.Contains("medicine") || desc.Contains("pill") || desc.Contains("health"))
                return "Medical & Health";
            if (desc.Contains("amazon") || desc.Contains("target") || desc.Contains("walmart") || desc.Contains("clothing") || desc.Contains("shoes") || desc.Contains("mall") || desc.Contains("store"))
                return "Shopping";

            // API categorization if key available
            var apiKey = _configuration["AI:GeminiApiKey"];
            if (!string.IsNullOrWhiteSpace(apiKey) && apiKey != "YOUR_GEMINI_API_KEY")
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
                    
                    var prompt = $"Categorize this transaction description: '{description}'. " +
                                 "Choose EXACTLY one of these categories: 'Food & Dining', 'Rent & Housing', 'Transportation', 'Entertainment', 'Utilities', 'Medical & Health', 'Shopping', 'Other'. " +
                                 "Respond with ONLY the category name and nothing else.";

                    var body = new
                    {
                        contents = new[] { new { parts = new[] { new { text = prompt } } } }
                    };

                    var response = await client.PostAsJsonAsync(url, body);
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadFromJsonAsync<JsonNode>();
                        var text = json?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString()?.Trim();
                        if (!string.IsNullOrWhiteSpace(text) && text.Length < 30)
                        {
                            return text;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Gemini auto-categorization failed.");
                }
            }

            if (TryGetOpenAiConfig(out var openAiKey, out var openAiBaseUrl, out var openAiModel))
            {
                try
                {
                    var category = await GetOpenAiCategoryAsync(openAiKey, openAiBaseUrl, openAiModel, description);
                    if (!string.IsNullOrWhiteSpace(category))
                    {
                        return category;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "OpenAI-compatible auto-categorization failed.");
                }
            }

            return "Other";
        }

        private bool TryGetOpenAiConfig(out string apiKey, out string baseUrl, out string model)
        {
            apiKey = _configuration["AI:OpenAiApiKey"] ?? string.Empty;
            baseUrl = _configuration["AI:OpenAiBaseUrl"] ?? "https://api.openai.com";
            model = _configuration["AI:OpenAiModel"] ?? "gpt-4o-mini";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_OPENAI_API_KEY")
            {
                return false;
            }

            return true;
        }

        private async Task<AiInsightsResponse> GetGeminiInsightsAsync(
            string apiKey, 
            decimal totalIncome, 
            decimal totalExpense, 
            decimal savingsRate,
            object topCategories, 
            List<Expense> recentExpenses)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

            var categoriesJson = JsonSerializer.Serialize(topCategories);
            var expensesJson = JsonSerializer.Serialize(recentExpenses.Select(e => new { e.Amount, e.Description, Category = e.Category?.Name, e.Date }));

            var prompt = "You are an expert personal financial advisor AI. Analyze the user's spending data and generate a structured JSON analysis. " +
                         "Use the following input data:\n" +
                         $"- Monthly Income: ${totalIncome}\n" +
                         $"- Monthly Expenses: ${totalExpense}\n" +
                         $"- Net Savings: ${totalIncome - totalExpense}\n" +
                         $"- Savings Rate: {savingsRate}%\n" +
                         $"- Category Spending: {categoriesJson}\n" +
                         $"- Recent Expenses: {expensesJson}\n\n" +
                         "You MUST return a JSON object matching this schema exactly:\n" +
                         "{\n" +
                         "  \"Summary\": \"A short professional summary paragraph evaluating their overall financial health, spending habits, and main areas of concern.\",\n" +
                         "  \"FinancialHealthScore\": 85, // Integer 0 to 100 based on savings, debt levels, and categories\n" +
                         "  \"Suggestions\": [\"Suggestion 1\", \"Suggestion 2\", ...], // List of 3-5 specific, highly actionable tips\n" +
                         "  \"WarningFlags\": [\"Flag 1\", \"Flag 2\", ...] // List of 1-3 critical items requiring immediate attention\n" +
                         "}\n" +
                         "Do not include any markdown styling like ```json or trailing text. Return ONLY pure JSON.";

            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new
                {
                    responseMimeType = "application/json"
                }
            };

            var response = await client.PostAsJsonAsync(url, body);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var jsonNode = JsonNode.Parse(content);
                var textResponse = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString();
                
                if (!string.IsNullOrWhiteSpace(textResponse))
                {
                    var result = JsonSerializer.Deserialize<AiInsightsResponse>(textResponse, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (result != null) return result;
                }
            }

            throw new HttpRequestException($"Gemini API returned status code {response.StatusCode}");
        }

        private async Task<AiInsightsResponse> GetOpenAiInsightsAsync(
            string apiKey,
            string baseUrl,
            string model,
            decimal totalIncome,
            decimal totalExpense,
            decimal savingsRate,
            object topCategories,
            List<Expense> recentExpenses)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"{baseUrl.TrimEnd('/')}/v1/chat/completions";

            var categoriesJson = JsonSerializer.Serialize(topCategories);
            var expensesJson = JsonSerializer.Serialize(recentExpenses.Select(e => new { e.Amount, e.Description, Category = e.Category?.Name, e.Date }));

            var prompt = "You are an expert personal financial advisor AI. Analyze the user's spending data and return ONLY valid JSON matching the schema. " +
                         "Input data:\n" +
                         $"- Monthly Income: ${totalIncome}\n" +
                         $"- Monthly Expenses: ${totalExpense}\n" +
                         $"- Net Savings: ${totalIncome - totalExpense}\n" +
                         $"- Savings Rate: {savingsRate}%\n" +
                         $"- Category Spending: {categoriesJson}\n" +
                         $"- Recent Expenses: {expensesJson}\n\n" +
                         "Return JSON with: Summary (string), FinancialHealthScore (int 0-100), Suggestions (array), WarningFlags (array).";

            var body = new
            {
                model,
                temperature = 0.2,
                messages = new object[]
                {
                    new { role = "system", content = "Return only JSON. No markdown." },
                    new { role = "user", content = prompt }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(body)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var jsonNode = JsonNode.Parse(content);
                var textResponse = jsonNode?["choices"]?[0]?["message"]?["content"]?.ToString();

                if (!string.IsNullOrWhiteSpace(textResponse))
                {
                    var result = JsonSerializer.Deserialize<AiInsightsResponse>(textResponse, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (result != null) return result;
                }
            }

            throw new HttpRequestException($"OpenAI-compatible API returned status code {response.StatusCode}");
        }

        private async Task<string?> GetOpenAiCategoryAsync(
            string apiKey,
            string baseUrl,
            string model,
            string description)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"{baseUrl.TrimEnd('/')}/v1/chat/completions";

            var prompt = "Categorize this transaction description. " +
                         "Choose EXACTLY one category: 'Food & Dining', 'Rent & Housing', 'Transportation', 'Entertainment', 'Utilities', 'Medical & Health', 'Shopping', 'Other'. " +
                         "Respond with ONLY the category name. " +
                         $"Description: {description}";

            var body = new
            {
                model,
                temperature = 0.0,
                messages = new object[]
                {
                    new { role = "system", content = "Return only the category name. No extra text." },
                    new { role = "user", content = prompt }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(body)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var jsonNode = JsonNode.Parse(content);
                var textResponse = jsonNode?["choices"]?[0]?["message"]?["content"]?.ToString()?.Trim();

                if (!string.IsNullOrWhiteSpace(textResponse) && textResponse.Length < 30)
                {
                    return textResponse;
                }
            }

            return null;
        }

        private AiInsightsResponse GenerateLocalInsights(
            decimal totalIncome, 
            decimal totalExpense, 
            decimal savingsRate,
            dynamic topCategories)
        {
            var summary = "";
            var score = 70;
            var suggestions = new List<string>();
            var warnings = new List<string>();

            // Calculate health score based on savings rate
            if (savingsRate < 0)
            {
                score = Math.Max(10, (int)(50 + (savingsRate * 0.5m)));
                summary = $"Alert: Your spending exceeds your income this month. You've spent a total of ${totalExpense:F2} while only earning ${totalIncome:F2}, resulting in a net deficit of ${Math.Abs(totalIncome - totalExpense):F2}. Immediate adjustments are recommended to prevent debt accumulation.";
                warnings.Add("Deficit Spending: Budget is currently operating in the negative.");
                suggestions.Add("Perform an immediate audit of variable expenses (e.g. Dining Out, Shopping) and freeze non-essential purchases.");
                suggestions.Add("Establish a strict '50/30/20' rule, aiming to allocate 50% to needs, 30% to wants, and 20% to savings once stabilized.");
            }
            else if (savingsRate == 0 && totalIncome == 0)
            {
                score = 50;
                summary = "You have logged expenses but haven't added any income records yet. Log your monthly income to generate accurate savings rates and long-term asset-growth models.";
                warnings.Add("Incomplete Profile: Zero income transactions recorded.");
                suggestions.Add("Register your recurring income streams (e.g., Salary, Freelance work) under the 'Income' tab.");
            }
            else if (savingsRate < 10)
            {
                score = 55;
                summary = $"Your current savings rate is {savingsRate:F1}%, which is below the recommended 15-20% standard. You saved ${totalIncome - totalExpense:F2} this month. Trimming small, recurring expenses can quickly boost your savings cushion.";
                warnings.Add("Low Savings Buffer: Savings rate is in the single digits.");
                suggestions.Add("Identify subscription services you haven't used in the past 30 days and cancel them.");
                suggestions.Add("Set up automated transfers to move $50-$100 directly into a separate savings account on payday.");
            }
            else if (savingsRate < 30)
            {
                score = 75;
                summary = $"Healthy spending! You are saving a solid {savingsRate:F1}% of your income (${totalIncome - totalExpense:F2} saved). You are maintaining a stable financial balance, but there's room to optimize cash flow and compound returns.";
                suggestions.Add("Maximize your cash utility by moving excess savings to a High-Yield Savings Account (HYSA) earning >4% APY.");
                suggestions.Add("Look into dollar-cost averaging (DCA) into broad index funds to build long-term wealth.");
            }
            else
            {
                score = 90;
                summary = $"Exceptional financial management! You have successfully saved {savingsRate:F1}% of your income, amounting to a net savings of ${totalIncome - totalExpense:F2}. You are well on your way to achieving financial independence.";
                suggestions.Add("Consider talking to a financial planner to discuss tax-advantaged accounts or real estate investments.");
                suggestions.Add("Review your emergency fund; ensure it covers 6 months of necessary living expenses, then invest the surplus.");
            }

            // Custom category rules
            if (topCategories.Count > 0)
            {
                var worstCategory = topCategories[0];
                if (worstCategory.Amount > totalExpense * 0.35m && totalExpense > 100)
                {
                    var percent = (worstCategory.Amount / totalExpense) * 100;
                    warnings.Add($"Concentrated Spending: '{worstCategory.Name}' consumes {percent:F1}% of your total budget.");
                    
                    if (worstCategory.Name == "Food & Dining")
                    {
                        suggestions.Add("Food costs are your largest outflow. Plan weekly grocery lists, meal prep on weekends, and set a hard cap on restaurant dining.");
                    }
                    else if (worstCategory.Name == "Shopping")
                    {
                        suggestions.Add("Shopping is heavily dominating your variable spend. Adopt the '24-Hour Rule'—wait 24 hours before completing any non-essential online orders.");
                    }
                    else
                    {
                        suggestions.Add($"Review your transactions under '{worstCategory.Name}' and see if any purchases can be postponed or negotiated.");
                    }
                }
            }

            if (!warnings.Any())
            {
                warnings.Add("No high-risk warning flags detected for this billing cycle.");
            }

            return new AiInsightsResponse
            {
                Summary = summary,
                FinancialHealthScore = score,
                Suggestions = suggestions,
                WarningFlags = warnings
            };
        }
    }
}
