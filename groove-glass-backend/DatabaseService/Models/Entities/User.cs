using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DatabaseService.Models.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string SpotifyUserId { get; set; }
        public string DisplayName { get; set; }
        public string EncryptedAccessToken { get; set; }
        public string EncryptedRefreshToken { get; set; }
        public DateTime TokenExpiration { get; set; }
    }
}
