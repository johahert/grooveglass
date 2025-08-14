
namespace groove_glass_api.Models.Frontend
{
    public class SpotifyUserClientResponse
    {
        public string DisplayName { get; set; }
        public string SpotifyUserId { get; set; }
        public string JwtToken { get; set; }
        public string JwtRefreshToken { get; set; }
        public DateTime JwtTokenExpiration { get; internal set; }
    }
}
