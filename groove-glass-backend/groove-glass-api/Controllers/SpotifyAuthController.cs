using DatabaseService.Models.Entities;
using DatabaseService.Services.Interfaces;
using groove_glass_api.Models;
using groove_glass_api.Models.Frontend;
using groove_glass_api.Models.Frontend.QuizData;
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

        /// <summary>
        /// Searches tracks on Spotify using the provided query.
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
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
                return Unauthorized(new { ErrorMessage = $"No user id found in jwt token" });
            }

            // 2. Get user's Spotify access token from DB
            var user = await _spotifyStorageService.GetUserAsync(userId);
            if (user == null)
                return NotFound(new { ErrorMessage = "No user found in database" });

            var accessToken = await GetValidAccessTokenAsync(user);

            // 3. Call Spotify Search API
            var results = await _spotifyApiService.SearchTracksAsync(query, accessToken, 10);

            // 4. Return results
            return Ok(results); // results should be a list of song info (id, name, artist, etc.)
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
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

            var accessToken = await GetValidAccessTokenAsync(user);

            // Return the decrypted access token
            return Ok(new { AccessToken = accessToken });
        }

        /// <summary>
        /// Toggle play/pause for the current track on the user's Spotify device.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
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

            var accessToken = await GetValidAccessTokenAsync(user);

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
        [HttpPost("quiz")]
        public async Task<IActionResult> CreateQuiz([FromBody] QuizContent quizContent)
        {
            if (quizContent == null || quizContent.Questions == null || !quizContent.Questions.Any())
                return BadRequest("Quiz data is invalid.");

            // Get user ID from JWT
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var quiz = new Quiz
            {
                Title = quizContent.Title,
                SpotifyUserId = userId,
                Questions = quizContent.Questions.Select(q => new QuizQuestion
                {
                    Question = q.Question,
                    Answers = q.Answers,
                    CorrectAnswer = q.CorrectAnswer,
                    SpotifyTrack = q.SpotifyTrack, 
                }).ToList()
            };

            // Store the quiz in the database
            await _spotifyStorageService.StoreQuizAsync(quiz);
            return Ok(new { Message = "Quiz created successfully." });
        }

        /// <summary>
        /// Retrieves the list of available devices for the authenticated user.
        /// </summary>
        /// <returns></returns>
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

            var accessToken = await GetValidAccessTokenAsync(user);

            var devices = await _spotifyApiService.GetAvailableDevicesAsync(accessToken);

            return Ok(devices);
        }

        [Authorize]
        [HttpGet("quizzes")]
        public async Task<IActionResult> GetUserQuizzesAsync()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var quizzes = await _spotifyStorageService.GetUserQuizzesAsync(userId);

            if (quizzes == null || !quizzes.Any())
            {
                return NotFound($"No quizzes were found for this user: {userId}");
            }

            return Ok(quizzes.Select(quiz => new
            {
                quiz.Id, 
                quiz.Title
            })
            .ToList());
        }

        /// <summary>
        /// Retrieves a valid access token for the user, refreshing it if necessary.
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        private async Task<string> GetValidAccessTokenAsync(SpotifyUser user)
        {
            var now = DateTime.UtcNow;

            if (user.TokenExpiration <= now.AddMinutes(2))
            {
                var refreshToken = _encryptionHelper.DecryptString(user.EncryptedRefreshToken);
                var newToken = await _spotifyApiService.RefreshAccessTokenAsync(refreshToken);
                if (newToken == null)
                {
                    throw new Exception("Failed to refresh Spotify access token.");

                }

                user.EncryptedAccessToken = _encryptionHelper.EncryptString(newToken.AccessToken);
                user.TokenExpiration = now.AddSeconds(newToken.ExpiresIn);

                await _spotifyStorageService.StoreOrUpdateUserAsync(user);

                return newToken.AccessToken;
            } 

            return _encryptionHelper.DecryptString(user.EncryptedAccessToken);
        }

    }
}
