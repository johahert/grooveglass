using DatabaseService.Models.Entities;

namespace groove_glass_api.Services.Interfaces
{
    public interface IAuthenticateSpotifyUserService
    {
        Task<(SpotifyUser? user, string? accessToken)> GetCurrentUserWithValidTokenAsync();
        Task<SpotifyUser> GetUserAsync(string spotifyUserId);
    }
}
