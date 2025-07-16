using groove_glass_api.Models;
using groove_glass_api.Models.Frontend;

namespace groove_glass_api.Services.Interfaces
{
    public interface ISpotifyApiService
    {
        /// <summary>
        /// Retrieves the Spotify access token using the provided authorization code.
        /// </summary>
        /// <param name="code">The authorization code received from Spotify.</param>
        /// <returns>A task that represents the asynchronous operation, containing the access token.</returns>
        Task<SpotifyTokenResponse> GetAccessTokenResponseAsync(string code);

        /// <summary>
        /// Refreshes the Spotify access token using the refresh token.
        /// </summary>
        /// <param name="refreshToken">The refresh token to use for obtaining a new access token.</param>
        /// <returns>A task that represents the asynchronous operation, containing the new access token.</returns>
        Task<string> RefreshAccessTokenAsync(string refreshToken);

        /// <summary>
        /// Retrieves the user's Spotify profile using the provided access token.
        /// </summary>
        /// <param name="accessToken">The access token to use for retrieving the user profile.</param>
        /// <returns>A task that represents the asynchronous operation, containing the user profile.</returns>
        Task<string> GetUserProfileAsync(string accessToken);

        /// <summary>
        /// Exchanges the authorization code for an access token and retrieves the user's Spotify profile.
        /// </summary>
        /// <param name="code">The authorization code received from Spotify.</param>
        /// <returns>A task that represents the asynchronous operation, containing the user's Spotify profile response.</returns>
        Task<Models.SpotifyUserProfileResponse> ExchangeCodeAndGetProfileAsync(string code);
        Task<List<SpotifyTrackResult>> SearchTracksAsync(string query, string accessToken, int v);
        Task<bool> PlayTrackAsync(string trackId, string deviceId, string accessToken);
        public Task<List<SpotifyDeviceResult>> GetAvailableDevicesAsync(string accessToken);
    }
}
