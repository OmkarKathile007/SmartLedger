using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BCrypt.Net;
using backend.Data;
using backend.Middleware;
using backend.Models;
using backend.Repositories;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "SQLite";
if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
{
    var connString = builder.Configuration.GetConnectionString("SqlServer");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connString));
}
else
{
    var connString = builder.Configuration.GetConnectionString("SQLite");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(connString));
}

// 2. Register Repositories (Generic + Custom)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IExpenseRepository, ExpenseRepository>();
builder.Services.AddScoped<IIncomeRepository, IncomeRepository>();

// 3. Register Core Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IAiService, AiService>();

builder.Services.AddHttpClient(); // Add HttpClient for external AI requests
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Swagger / OpenAPI Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AI Expense Tracker API", Version = "v1" });
    
    // Configure JWT Swagger authorization
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 5. JWT Authentication Setup
var secretKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForDevelopmentPurposesOnly12345678!";
if (secretKey.Length < 32)
{
    secretKey = secretKey.PadRight(32, 'x');
}
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AiExpenseTracker",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AiExpenseTrackerClient",
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

// 6. CORS Configuration for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000") // Vite and standard react-create-app
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 7. Auto-Create and Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();

        const string demoEmail = "demo@example.com";
        const string demoPassword = "DemoPassword123!";
        const string demoUsername = "Demo User";

        if (!context.Users.Any(u => u.Email == demoEmail))
        {
            var demoUser = new User
            {
                Username = demoUsername,
                Email = demoEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword),
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(demoUser);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating or seeding the database.");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment() || true) // Enable swagger everywhere for portfolio showcase convenience
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AI Expense Tracker API v1");
        c.RoutePrefix = "swagger";
    });
}

// Custom Global Exception Handling Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
