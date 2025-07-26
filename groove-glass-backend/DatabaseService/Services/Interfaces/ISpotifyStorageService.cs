using DatabaseService.Models.Entities;

namespace DatabaseService.Services.Interfaces
{
    public interface ISpotifyStorageService
    {
        /// <summary>
        /// Saves the Spotify user data to the database.
        /// <paramref name="user">The spotify user</paramref>
        /// </summary>
        Task StoreOrUpdateUserAsync(SpotifyUser user);

        /// <summary>
        /// Retrieves the Spotify user data from the database.
        /// </summary>
        /// <param name="userId">The Spotify user ID.</param>
        Task<SpotifyUser> GetUserAsync(string UserId);

        /// <summary>
        /// Stores a quiz in the database.
        /// </summary>
        Task StoreQuizAsync(Quiz quiz);

    }
}
