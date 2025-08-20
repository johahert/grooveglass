namespace groove_glass_api.Services.Interfaces
{
    public abstract class AccessTokenService<T> where T : class // access token response type
    {
        protected readonly IConfiguration _configuration;
        protected readonly IHttpClientFactory _httpClientFactory;

        public AccessTokenService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        /// <summary>
        /// Retrieves the access token response.
        /// </summary>
        /// <param name="code">The authorization code received from Spotify.</param>
        /// <returns>A task that represents the asynchronous operation, containing the access token response.</returns>
        protected abstract Task<T> GetAccessTokensAsync(string code);

        /// <summary>
        /// Refreshes the access token using the refresh token.
        /// </summary>
        /// <param name="refreshToken">The refresh token to use for obtaining a new access token.</param>
        /// <returns>A task that represents the asynchronous operation, containing the new access token response.</returns>
        public abstract Task<T> RefreshAccessTokensAsync(string refreshToken);
    }
    
}
