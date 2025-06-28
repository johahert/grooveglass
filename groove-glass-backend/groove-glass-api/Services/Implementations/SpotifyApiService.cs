using groove_glass_api.Models;
using groove_glass_api.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace groove_glass_api.Services.Implementations
{
    public class SpotifyApiService : ISpotifyApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public SpotifyApiService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<SpotifyUserProfileResponse> ExchangeCodeAndGetProfileAsync(string code)
        {
            // Get access token
            var tokenResponse = await GetAccessTokenResponseAsync(code);

            var client = _httpClientFactory.CreateClient();

            // Get user profile
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenResponse.AccessToken);
            var profileResponse = await client.GetAsync("https://api.spotify.com/v1/me");
            if (!profileResponse.IsSuccessStatusCode)
            {
                var errorContent = await profileResponse.Content.ReadAsStringAsync();
                throw new Exception($"Spotify profile error: {errorContent}");
            }

            var profileString = await profileResponse.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(profileString);
            var root = doc.RootElement;
            var userId = root.GetProperty("id").GetString();
            var displayName = root.TryGetProperty("display_name", out var dn) ? dn.GetString() : null;

            return new SpotifyUserProfileResponse
            {
                Token = tokenResponse,
                SpotifyUserId = userId,
                DisplayName = displayName
            };
        }

        public async Task<SpotifyTokenResponse> GetAccessTokenResponseAsync(string code)
        {
            var clientId = _configuration["Spotify:ClientId"];
            var clientSecret = _configuration["Spotify:ClientSecret"];
            var redirectUri = _configuration["Spotify:RedirectUri"];
            var client = _httpClientFactory.CreateClient();
            var spotifyTokenUrl = "https://accounts.spotify.com/api/token";
            var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);
            var requestBody = new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", code },
                { "redirect_uri", redirectUri }
            };
            var content = new FormUrlEncodedContent(requestBody);
            var response = await client.PostAsync(spotifyTokenUrl, content);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Spotify token error: {errorContent}");
            }
            var responseString = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(responseString);

            if (tokenResponse == null)
            {
                throw new Exception("Failed to deserialize Spotify token response.");
            }

            return tokenResponse;
        }

        public Task<string> GetUserProfileAsync(string accessToken)
        {
            throw new NotImplementedException();
        }

        public Task<string> RefreshAccessTokenAsync(string refreshToken)
        {
            throw new NotImplementedException();
        }

        public async Task<List<string>> SearchTracksAsync(string query, string accessToken, int v)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var searchUrl = $"https://api.spotify.com/v1/search?q={Uri.EscapeDataString(query)}&type=track&limit={v}";
            var response = await client.GetAsync(searchUrl);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Spotify search error: {errorContent}");
            }
            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);
            var root = doc.RootElement;
            var tracks = root.GetProperty("tracks").GetProperty("items");
            var trackList = new List<string>();
            foreach (var track in tracks.EnumerateArray())
            {
                var trackstring = track.ToString();
                trackList.Add(trackstring);
            }
            return trackList;
        }
    }
}
