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

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchTracks([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query is required.");

            // 1. Get user ID from JWT
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value; 
            
            foreach (var claim in User.Claims)
                Console.WriteLine($"{claim.Type}: {claim.Value}");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User ID not found in JWT");
                return Unauthorized();
            }

            // 2. Get user's Spotify access token from DB
            var user = await _spotifyStorageService.GetUserAsync(userId);
            if (user == null)
                return Unauthorized();

            var accessToken = _encryptionHelper.DecryptString(user.EncryptedAccessToken);

            // 3. Call Spotify Search API
            var results = await _spotifyApiService.SearchTracksAsync(query, accessToken, 10);

            // 4. Return results
            return Ok(results); // results should be a list of song info (id, name, artist, etc.)
        }

        [Authorize]
        [HttpGet("access-token")]
        public async Task<IActionResult> GetAccessToken()
        {
            // Get user ID from JWT
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User ID not found in JWT");
                return Unauthorized();
            }

            // Get user's Spotify access token from DB
            var user = await _spotifyStorageService.GetUserAsync(userId);
            if (user == null)
                return Unauthorized();

            var accessToken = _encryptionHelper.DecryptString(user.EncryptedAccessToken);

            // Return the decrypted access token
            return Ok(new { AccessToken = accessToken });
        }

        [Authorize]
        [HttpPost("play")]
        public async Task<IActionResult> PlayTrack([FromBody] PlayTrackRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TrackId))
                return BadRequest("TrackId is required.");

            // 1. Get user ID from JWT
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // 2. Get user's Spotify access token from DB
            var user = await _spotifyStorageService.GetUserAsync(userId);
            if (user == null)
                return Unauthorized();

            var accessToken = _encryptionHelper.DecryptString(user.EncryptedAccessToken);

            // 3. Get device ID from request
            if (string.IsNullOrWhiteSpace(request.DeviceId))
                return BadRequest("DeviceId is required.");

            // 4. Call Spotify API to play the track
            var success = await _spotifyApiService.PlayTrackAsync(request.TrackId, request.DeviceId, accessToken);

            if (!success)
                return StatusCode(500, "Failed to start playback on Spotify.");

            return Ok(new { Message = "Playback started." });
        }

        [Authorize]
        [HttpGet("devices")]
        public async Task<IActionResult> GetAvailableDevices()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _spotifyStorageService.GetUserAsync(userId);
            if (user == null)
                return Unauthorized();

            var accessToken = _encryptionHelper.DecryptString(user.EncryptedAccessToken);

            var devices = await _spotifyApiService.GetAvailableDevicesAsync(accessToken);

            return Ok(devices);
        }
    }
}
