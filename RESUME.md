# 📄 Software Engineer Resume Showcase: SmartLedger

Here are high-impact, recruiter-ready bullet points, architectural explanations, and technical highlights based on the **SmartLedger** project to copy directly into your Software Engineer Resume or portfolio.

---

## 🌟 Resume Bullet Points (Copy-Paste Ready)

### Option 1: Full-Stack Software Engineer
*   **Designed and built** a high-fidelity full-stack AI-powered budget advisor using **ASP.NET Core Web API (.NET 10/8)** and **React (Vite) + Tailwind CSS**, showcasing clean-architecture principles and repository patterns.
*   **Implemented a hybrid AI engine** integrating **Google Gemini API** (fallback to a dynamic local C# rule engine) to parse chronological transaction data, delivering real-time, personalized financial recommendations and automated category tags.
*   **Architected a secure JWT authentication flow** with custom cryptographically signed tokens, securing user workspaces and implementing a guest demo account one-click bypass.
*   **Constructed a responsive glassmorphic dashboard** with **Recharts**, visualizing 6-month aggregate savings curves and itemized category expense distributions in a real-time reactive layout.
*   **Optimized database access** by writing a performant **SQL Server / SQLite DDL schema** with cascading constraints, precise decimal limits, and **non-clustered indexes** on user-date ranges to reduce transaction query times.
*   **Engineered global error boundary middleware** in ASP.NET Core to intercept server exceptions, standardizing client-side API error structures and safeguarding sensitive operational diagnostics.

### Option 2: .NET Core / Backend Developer
*   **Developed a clean-architecture ASP.NET Core Web API** using the **Repository Pattern** and **Service-Oriented Architecture (SOA)**, achieving a strict decoupling of transaction rules, auth logic, and data access.
*   **Configured dual-mode DB provisioning** supporting out-of-the-box SQLite local instances and production-ready MS SQL Server configurations with seeding pipelines using **Entity Framework Core**.
*   **Integrated an AI-driven transaction categorization pipeline** returning category recommendations by parsing unstructured descriptions using semantic match routines on seeded categories.
*   **Leveraged Dependency Injection (DI)** container patterns and asynchronous **async-await** tasks throughout controllers and repositories, minimizing thread pool starvation and maximizing request concurrency.

---

## 🧠 Technical Q&A: Preparing for Recruiter & Technical Interviews

### 1. "Why did you use both the Repository Pattern and a Service Layer?"
> *"I used the **Repository Pattern** (`IRepository`, `IExpenseRepository`) to decouple the direct Entity Framework data access from the rest of the application. This ensures that if we ever want to switch from EF Core to Dapper, or even a NoSQL database, the business logic remains unaffected.
>
> The **Service Layer** (`AuthService`, `TransactionService`, `AiService`) contains all the actual business logic, calculations, and external API orchestrations. It consumes the repositories, runs business validations (e.g. checking savings thresholds or checking passwords via BCrypt), maps database entities to clean **DTOs**, and passes the DTOs to the Controllers. This keeps the Controllers incredibly lightweight and focused only on handling HTTP requests and returning status codes."*

### 2. "How does your database handle performance bottlenecks?"
> *"To ensure that database fetches stay sub-second even as a user's transaction records grow, I implemented specific **non-clustered indexes** on the `Expenses` and `Incomes` tables. 
> 
> Specifically, I created a composite index on `(UserId, Date DESC)` and used the `INCLUDE` clause to cover `Amount`, `Description`, and `CategoryId/Source`. Because the dashboard and transaction views constantly query records filtered by the logged-in user and sorted by date, this composite index allows the database to perform index seeks rather than full table scans, completely bypassing heavy sort operations."*

### 3. "How did you implement the AI service, and how does it handle failures?"
> *"I built a dual-mode **AiService** to ensure robustness. The controller calls the service, which checks for a valid Google Gemini API Key. If a key is present, it constructs a structured prompt including the user's monthly income totals and expense category aggregates, and sends it to the Gemini API, returning the structured advice.
> 
> If the API Key is missing or the external network call fails, the service gracefully degrades to a **local rule engine**. This engine computes the user's actual savings rate, checks which category holds the highest expenditure percentage, compares it to standard budgeting rules (like the 50/30/20 budget), and dynamically generates real-time, data-driven financial advice. This ensures a seamless user experience even when offline or during external service outages."*

---

## 📊 Project Specifications Showcase

| Technical Attribute | Standard Adopted |
| :--- | :--- |
| **Backend Framework** | ASP.NET Core Web API (C# .NET 10.0/8.0) |
| **Frontend Framework** | React (Vite, ES6 Javascript Modules) |
| **Authentication** | JSON Web Tokens (JWT) + BCrypt Password Salting |
| **Database ORM** | Entity Framework Core (EF Core) |
| **Database Providers** | Microsoft SQL Server / SQLite |
| **APIs Integrated** | Google Gemini API (OpenAI compatible fallback) |
| **Global Error Handling** | ASP.NET Core Middleware + Client Error Boundaries |
| **Analytics Rendering** | Recharts (Responsive Line & Pie Vector Charts) |
| **Design Language** | HSL Curated Glassmorphism (Tailwind v3 with Outfit Font) |
