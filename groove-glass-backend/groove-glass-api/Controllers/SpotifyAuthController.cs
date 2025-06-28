using DatabaseService.Models.Entities;
using DatabaseService.Services.Interfaces;
using groove_glass_api.Models;
using groove_glass_api.Models.Frontend;
using groove_glass_api.Services.Interfaces;
using groove_glass_api.Util;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace groove_glass_api.Controllers
{
    [Route("api/spotify")]
    [ApiController]
    public class SpotifyAuthController : ControllerBase
    {
        private readonly ISpotifyApiService _spotifyApiService;
        private readonly ISpotifyStorageService _spotifyStorageService;
        private readonly EncryptionHelper _encryptionHelper;

        public SpotifyAuthController(ISpotifyApiService spotifyApiService, EncryptionHelper encryptionHelper, ISpotifyStorageService spotifyStorageService)
        {
            _spotifyApiService = spotifyApiService;
            _encryptionHelper = encryptionHelper;
            _spotifyStorageService = spotifyStorageService;
        }

        /// <summary>
        /// Stores the Spotify user profile and returns a JWT token.
        /// </summary>
        /// <param name="request">Access code</param>
        /// <returns>Spotify display name and jwt token</returns>
        [HttpPost("token")]
        public async Task<IActionResult> LoginSpotifyUser([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request.Code))
            {
                return BadRequest("Spotify authorization code missing");
            }
            try
            {
                var result = await _spotifyApiService.ExchangeCodeAndGetProfileAsync(request.Code);

                if (result == null)
                {
                    return NotFound("Spotify user not found");
                }

                var userToStore = new SpotifyUser
                {
                    SpotifyUserId = result.SpotifyUserId,
                    DisplayName = result.DisplayName,
                    EncryptedAccessToken = _encryptionHelper.EncryptString(result.Token.AccessToken),
                    EncryptedRefreshToken = _encryptionHelper.EncryptString(result.Token.RefreshToken),
                    TokenExpiration = DateTime.UtcNow.AddSeconds(result.Token.ExpiresIn)
                };

                await _spotifyStorageService.StoreOrUpdateUserAsync(userToStore);

                var user = await _spotifyStorageService.GetUserAsync(result.SpotifyUserId);

                if(user == null)
                {
                    return NotFound("Spotify user not found in database");
                }

                var jwtToken = _encryptionHelper.GenerateJwtToken(user.SpotifyUserId, user.DisplayName);

                return Ok(new SpotifyUserClientResponse
                {
                    DisplayName = user.DisplayName,
                    SpotifyUserId = user.SpotifyUserId,
                    JwtToken = jwtToken
                });
            }
            catch (Exception ex)
            {
                // Log ex.Message properly in production
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}
