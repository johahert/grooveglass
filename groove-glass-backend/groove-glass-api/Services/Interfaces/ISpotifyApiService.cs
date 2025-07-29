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
        Task<SpotifyTokenResponse> RefreshAccessTokenAsync(string refreshToken);

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
        Task<SpotifyUserProfileResponse> ExchangeCodeAndGetProfileAsync(string code);

        /// <summary>
        /// Return a list of tracks based on the search query.
        /// </summary>
        Task<List<SpotifyTrackResult>> SearchTracksAsync(string query, string accessToken, int v);

        /// <summary>
        /// Toggle playback for the specified device.
        /// </summary>
        Task<bool> PlayTrackAsync(string trackId, string deviceId, string accessToken);

        /// <summary>
        /// Retrieves a list of available devices for playback.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public Task<List<SpotifyDeviceResult>> GetAvailableDevicesAsync(string accessToken);

    }
}
