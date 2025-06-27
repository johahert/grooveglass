using DatabaseService.Models;
using DatabaseService.Models.Entities;
using DatabaseService.Services.Implementations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

public class SpotifyStorageServiceTests
{
    private SpotifyDatabaseContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<SpotifyDatabaseContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new SpotifyDatabaseContext(options);
    }

    [Fact]
    public async Task StoreOrUpdateUserAsync_AddsNewUser()
    {
        var context = GetInMemoryDbContext();
        var service = new SpotifyStorageService(context);
        var user = new SpotifyUser
        {
            SpotifyUserId = "user1",
            DisplayName = "Test User",
            EncryptedAccessToken = "token1",
            EncryptedRefreshToken = "refresh1",
            TokenExpiration = DateTime.UtcNow.AddHours(1)
        };

        await service.StoreOrUpdateUserAsync(user);
        var stored = await context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == "user1");
        Assert.NotNull(stored);
        Assert.Equal("Test User", stored.DisplayName);
    }

    [Fact]
    public async Task StoreOrUpdateUserAsync_UpdatesExistingUser()
    {
        var context = GetInMemoryDbContext();
        var service = new SpotifyStorageService(context);
        var user = new SpotifyUser
        {
            SpotifyUserId = "user2",
            DisplayName = "Original",
            EncryptedAccessToken = "token2",
            EncryptedRefreshToken = "refresh2",
            TokenExpiration = DateTime.UtcNow.AddHours(1)
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        user.DisplayName = "Updated";
        user.EncryptedAccessToken = "token2-updated";
        await service.StoreOrUpdateUserAsync(user);

        var updated = await context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == "user2");
        Assert.NotNull(updated);
        Assert.Equal("Updated", updated.DisplayName);
        Assert.Equal("token2-updated", updated.EncryptedAccessToken);
    }

    [Fact]
    public async Task GetUserAsync_ReturnsUserIfExists()
    {
        var context = GetInMemoryDbContext();
        var user = new SpotifyUser
        {
            SpotifyUserId = "user3",
            DisplayName = "User 3",
            EncryptedAccessToken = "token3",
            EncryptedRefreshToken = "refresh3",
            TokenExpiration = DateTime.UtcNow.AddHours(1)
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var service = new SpotifyStorageService(context);

        var result = await service.GetUserAsync("user3");
        Assert.NotNull(result);
        Assert.Equal("User 3", result.DisplayName);
    }

    [Fact]
    public async Task GetUserAsync_ReturnsNullIfNotExists()
    {
        var context = GetInMemoryDbContext();
        var service = new SpotifyStorageService(context);
        var result = await service.GetUserAsync("nonexistent");
        Assert.Null(result);
    }
}
