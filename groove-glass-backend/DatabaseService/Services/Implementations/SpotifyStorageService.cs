using DatabaseService.Models;
using DatabaseService.Models.Entities;
using DatabaseService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DatabaseService.Services.Implementations
{
    public class SpotifyStorageService : ISpotifyStorageService
    {
        private readonly SpotifyDatabaseContext _context;

        public SpotifyStorageService(SpotifyDatabaseContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserAsync(string userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == userId);
        }

        public async Task StoreOrUpdateUserAsync(User user)
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
            }
            await _context.SaveChangesAsync();
        }
    }
}
