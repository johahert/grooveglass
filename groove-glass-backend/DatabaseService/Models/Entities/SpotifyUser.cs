using System.ComponentModel.DataAnnotations;

namespace DatabaseService.Models.Entities
{
    public class SpotifyUser
    {
        [Key]
        public int Id { get; set; }
        public string SpotifyUserId { get; set; }
        public string DisplayName { get; set; }
        public string EncryptedAccessToken { get; set; }
        public string EncryptedRefreshToken { get; set; }
        public DateTime TokenExpiration { get; set; }
        public string JwtRefreshToken { get; set; }
        public DateTime JwtRefreshTokenExpiration { get; set; }
    }
}
