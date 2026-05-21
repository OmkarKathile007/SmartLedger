using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Expense> Expenses { get; set; } = null!;
        public DbSet<Income> Incomes { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Relationship Configuration
            modelBuilder.Entity<User>()
                .HasMany(u => u.Expenses)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Incomes)
                .WithOne(i => i.User)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Categories)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Expense Category Configuration
            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Category)
                .WithMany(c => c.Expenses)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Precision for Currency fields
            modelBuilder.Entity<Expense>()
                .Property(e => e.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Income>()
                .Property(i => i.Amount)
                .HasPrecision(18, 2);

            // Seed System-Wide Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Food & Dining", Icon = "utensils", Color = "#EF4444", UserId = null },
                new Category { Id = 2, Name = "Rent & Housing", Icon = "home", Color = "#3B82F6", UserId = null },
                new Category { Id = 3, Name = "Transportation", Icon = "car", Color = "#F59E0B", UserId = null },
                new Category { Id = 4, Name = "Entertainment", Icon = "gamepad-2", Color = "#10B981", UserId = null },
                new Category { Id = 5, Name = "Utilities", Icon = "zap", Color = "#8B5CF6", UserId = null },
                new Category { Id = 6, Name = "Medical & Health", Icon = "activity", Color = "#EC4899", UserId = null },
                new Category { Id = 7, Name = "Shopping", Icon = "shopping-bag", Color = "#06B6D4", UserId = null },
                new Category { Id = 8, Name = "Other", Icon = "tag", Color = "#64748B", UserId = null }
            );
        }
    }
}
