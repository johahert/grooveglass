using groove_glass_api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace groove_glass_api.Controllers
{
    [Route("api/spotify")]
    [ApiController]
    public class SpotifyAuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public SpotifyAuthController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpPost("Token")]
        public async Task<IActionResult> GetToken([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request.Code))
            {
                return BadRequest("Spotify authorization code missing");
            }

            var clientId = _configuration["Spotify:ClientuId"];
            var clientSecret = _configuration["Spotify:ClientSecret"];
            var redirectUri = _configuration["Spotify:RedirectUri"];

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                return StatusCode(500, "Server configuration error: Spotify credentials not set.");
            }

            var client = _httpClientFactory.CreateClient();
            var spotifyTokenUrl = "https://accounts.spotify.com/api/token";

            var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

            var requestBody = new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", request.Code },
                { "redirect_uri", redirectUri }
            };

            var content = new FormUrlEncodedContent(requestBody);

            try
            {
                var response = await client.PostAsync(spotifyTokenUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    var tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(responseString);

                    return Ok(tokenResponse);
                } 
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Spotify API Error: {errorContent}"); // Log this properly
                    return StatusCode((int)response.StatusCode, "Failed to retrieve token from Spotify.");
                }

            }
            catch (Exception ex) 
            {
                Console.WriteLine($"Request exception: {ex.Message}"); // Log this properly
                return StatusCode(500, "An error occurred while communicating with Spotify.");
            }

        }


    }
}
