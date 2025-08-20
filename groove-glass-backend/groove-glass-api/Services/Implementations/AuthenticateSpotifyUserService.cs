using DatabaseService.Models.Entities;
using DatabaseService.Services.Implementations;
using DatabaseService.Services.Interfaces;
using groove_glass_api.Services.Interfaces;
using groove_glass_api.Util;
using Microsoft.Extensions.Caching.Memory;

namespace groove_glass_api.Services.Implementations
{
    public class AuthenticateSpotifyUserService : IAuthenticateSpotifyUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserStorageService _userStorageService;
        private readonly EncryptionHelper _encryptionHelper;
        private readonly IMemoryCache _cache;
        private readonly SpotifyAccessTokenService _spotifyAccessTokenService;

        public AuthenticateSpotifyUserService(IHttpContextAccessor httpContextAccessor, EncryptionHelper encryptionHelper, IMemoryCache cache, SpotifyAccessTokenService spotifyAccessTokenService, UserStorageService userStorageService)
        {
            _httpContextAccessor = httpContextAccessor;
            _encryptionHelper = encryptionHelper;
            _cache = cache;
            _spotifyAccessTokenService = spotifyAccessTokenService;
            _userStorageService = userStorageService;
        }

        public async Task<(SpotifyUser? user, string? accessToken)> GetCurrentUserWithValidTokenAsync()
        {
            var userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId))
            {
                return (null, null);
            }

            var user = await GetUserAsync(userId);
            if (user == null)
            {
                return (null, null);
            }

            bool isExpiring = user.TokenExpiration <= DateTime.UtcNow.AddMinutes(5);
            if (isExpiring)
            {
                var decryptedRefreshToken = _encryptionHelper.DecryptString(user.EncryptedRefreshToken);
                var newTokens = await _spotifyAccessTokenService.RefreshAccessTokensAsync(decryptedRefreshToken);

                if(newTokens == null)
                {
                    return (null, null);
                }

                user.EncryptedAccessToken = _encryptionHelper.EncryptString(newTokens.AccessToken);
                user.TokenExpiration = DateTime.UtcNow.AddSeconds(newTokens.ExpiresIn);

                await _userStorageService.StoreOrUpdateAsync(user);
                _cache.Set(userId, user, TimeSpan.FromMinutes(60));
            }

            var accessToken = _encryptionHelper.DecryptString(user.EncryptedAccessToken);
            return (user, accessToken);

        }

        public async Task<SpotifyUser? > GetUserAsync(string userId)
        {
            if (_cache.TryGetValue(userId, out SpotifyUser? cachedUser))
            {
                return cachedUser;
            }
            var user = await _userStorageService.GetAsync(userId);
            if (user != null)
            {
                _cache.Set(userId, user, TimeSpan.FromMinutes(60));
            }
            return user;
        }

        private string? GetUserIdFromClaims()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
               ?? _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value;
        }
    }
}
