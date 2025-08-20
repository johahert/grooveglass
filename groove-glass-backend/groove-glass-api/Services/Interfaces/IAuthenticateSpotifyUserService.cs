using DatabaseService.Models.Entities;

namespace groove_glass_api.Services.Interfaces
{
    public interface IAuthenticateSpotifyUserService
    {
        Task<(SpotifyUser user, string? accessToken)> GetUserWithAccessTokenAsync(string code);
    }
}
