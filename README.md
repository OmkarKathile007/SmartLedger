# SmartLedger (AI-Powered Expense & Budget DEMO APP 

SmartLedger is a full-stack expense tracker with AI-assisted categorization and financial insights. It features a clean-architecture ASP.NET Core backend, a responsive React + Vite frontend, and a portfolio-ready UI ok makn

## Features

- Secure JWT authentication with a one-click demo guest account
- Income and expense CRUD with filters (search, dates, category/source)
- AI auto-categorization for expenses
- AI financial insights (Gemini with OpenAI-compatible fallback; local rules when keys are missing)
- Analytics dashboard with category breakdowns, trends, and recent activity
- Glassmorphism UI with theme toggle and polished motion

## Tech Stack

**Backend**
- ASP.NET Core Web API (.NET 10 / 8)
- Entity Framework Core (SQLite by default, SQL Server-ready)
- Repository + service layers, DTOs, middleware
- Swagger/OpenAPI

**Frontend**
- React + Vite
- Tailwind CSS
- React Router
- Recharts
- Axios with JWT interceptors

## Project Structure

```
ai-expense-tracker/
├── backend/             # API, services, repositories, EF Core
├── frontend/            # React UI
├── database/            # SQL Server schema
└── RESUME.md            # Portfolio bullets and details
```

## Quick Start

### Prerequisites
- .NET SDK 8 or 10
- Node.js 18+

### Backend

```bash
cd backend
dotnet restore
dotnet run
```

Default API URL: `http://localhost:5270`
Swagger: `http://localhost:5270/swagger`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default UI URL: `http://localhost:5173` (or the next available port shown by Vite).

## Demo Login

The demo guest account is seeded automatically on startup.

- Email: `demo@example.com`
- Password: `DemoPassword123!`

## AI Configuration

Edit [backend/appsettings.json](backend/appsettings.json):

```json
"AI": {
    "GeminiApiKey": "YOUR_GEMINI_API_KEY",
    "OpenAiApiKey": "YOUR_OPENAI_API_KEY",
    "OpenAiBaseUrl": "https://api.openai.com",
    "OpenAiModel": "gpt-4o-mini"
}
```

If no API keys are provided, the app uses a local rule engine for insights.

## Database

- Default: SQLite (`expense_tracker.db` auto-created in backend folder)
- Optional: SQL Server (set `DatabaseProvider` to `SqlServer` and update connection string)

## Common Issues

- **CORS errors**: Ensure the backend CORS policy allows the active Vite port.
- **Port conflicts**: Update `backend/Properties/launchSettings.json` or stop the process using the port.

## License

MIT
