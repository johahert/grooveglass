using DatabaseService.Models;
using DatabaseService.Models.Entities;
using DatabaseService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DatabaseService.Services.Implementations
{
    public class UserStorageService : IEntityStorageService<SpotifyUser, string>
    {
        private readonly SpotifyDatabaseContext _context;

        public UserStorageService(SpotifyDatabaseContext context)
        {
            _context = context;
        }

        public async Task<SpotifyUser?> GetAsync(string userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == userId);
        }

        public async Task StoreOrUpdateAsync(SpotifyUser user)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == user.SpotifyUserId);
            if (existingUser == null)
            {
                _context.Users.Add(user);
            }
            else
            {
                existingUser.DisplayName = user.DisplayName;
                existingUser.EncryptedAccessToken = user.EncryptedAccessToken;
                existingUser.EncryptedRefreshToken = user.EncryptedRefreshToken;
                existingUser.TokenExpiration = user.TokenExpiration;
                existingUser.JwtRefreshToken = user.JwtRefreshToken;
                existingUser.JwtRefreshTokenExpiration = user.JwtRefreshTokenExpiration;
            }
            await _context.SaveChangesAsync();
        }
    }
}
