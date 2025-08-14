namespace groove_glass_api.Models.Frontend
{
    public class RefreshTokenRequest
    {
        public string SpotifyUserId { get; set; }
        public string JwtRefreshToken { get; set; }
    }
}
