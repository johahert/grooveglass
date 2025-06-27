namespace groove_glass_api.Models
{
    public class SpotifyUserProfileResponse
    {
        public SpotifyTokenResponse Token { get; set; }
        public string SpotifyUserId { get; set; }
        public string DisplayName { get; set; }
    }
}