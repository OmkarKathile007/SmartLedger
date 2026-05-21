-- ============================================================================
-- SQL Server Database Schema: SmartLedger AI Expense & Budget Tracker
-- Designed for enterprise-grade scalability, optimized with performance indices.
-- ============================================================================

-- Create Database (Optional, run if deploying a new database)
-- CREATE DATABASE SmartLedgerDb;
-- GO
-- USE SmartLedgerDb;
-- GO

-- 1. Users Table
CREATE TABLE [dbo].[Users] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Username] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(256) NOT NULL,
    [PasswordHash] NVARCHAR(MAX) NOT NULL,
    [CreatedAt] DATETIME2(7) DEFAULT SYSUTCDATETIME() NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Unique Index on Email for sub-second authentication queries
CREATE UNIQUE NONCLUSTERED INDEX [IX_Users_Email]
    ON [dbo].[Users]([Email] ASC);
GO

-- 2. Categories Table
CREATE TABLE [dbo].[Categories] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Icon] NVARCHAR(50) NOT NULL,
    [Color] NVARCHAR(20) NOT NULL,
    [UserId] INT NULL, -- NULL indicates system-wide categories
    CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Categories_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
);
GO

-- Index on UserId for category selection mapping
CREATE NONCLUSTERED INDEX [IX_Categories_UserId]
    ON [dbo].[Categories]([UserId] ASC);
GO

-- 3. Expenses Table
CREATE TABLE [dbo].[Expenses] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Description] NVARCHAR(200) NOT NULL,
    [Date] DATETIME2(7) NOT NULL,
    [CategoryId] INT NOT NULL,
    [UserId] INT NOT NULL,
    CONSTRAINT [PK_Expenses] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Expenses_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Expenses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
);
GO

-- Index for searching and loading expenses by user, category, and date range
CREATE NONCLUSTERED INDEX [IX_Expenses_UserId_Date]
    ON [dbo].[Expenses]([UserId] ASC, [Date] DESC)
    INCLUDE ([Amount], [Description], [CategoryId]);
GO

CREATE NONCLUSTERED INDEX [IX_Expenses_CategoryId]
    ON [dbo].[Expenses]([CategoryId] ASC);
GO

-- 4. Incomes Table
CREATE TABLE [dbo].[Incomes] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Description] NVARCHAR(200) NOT NULL,
    [Date] DATETIME2(7) NOT NULL,
    [Source] NVARCHAR(50) NOT NULL,
    [UserId] INT NOT NULL,
    CONSTRAINT [PK_Incomes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Incomes_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
);
GO

-- Index for fetching incomes by user and date ranges
CREATE NONCLUSTERED INDEX [IX_Incomes_UserId_Date]
    ON [dbo].[Incomes]([UserId] ASC, [Date] DESC)
    INCLUDE ([Amount], [Description], [Source]);
GO


-- ============================================================================
-- SEED DATA: Insert Default System Categories
-- ============================================================================

-- Disable Identity Insert to manually set the IDs (standard EF core migration match)
SET IDENTITY_INSERT [dbo].[Categories] ON;
GO

INSERT INTO [dbo].[Categories] ([Id], [Name], [Icon], [Color], [UserId])
VALUES 
(1, N'Food & Dining', N'utensils', N'#EF4444', NULL),
(2, N'Rent & Housing', N'home', N'#3B82F6', NULL),
(3, N'Transportation', N'car', N'#F59E0B', NULL),
(4, N'Entertainment', N'gamepad-2', N'#10B981', NULL),
(5, N'Utilities', N'zap', N'#8B5CF6', NULL),
(6, N'Medical & Health', N'activity', N'#EC4899', NULL),
(7, N'Shopping', N'shopping-bag', N'#06B6D4', NULL),
(8, N'Other', N'tag', N'#64748B', NULL);
GO

SET IDENTITY_INSERT [dbo].[Categories] OFF;
GO

PRINT 'SmartLedger schema DDL and Seed Data initialized successfully.';
GO
