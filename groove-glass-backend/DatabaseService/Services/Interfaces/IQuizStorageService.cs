using DatabaseService.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DatabaseService.Services.Interfaces
{
    public interface IQuizStorageService : IEntityStorageService<Quiz, int>
    {
        Task<IEnumerable<Quiz>> GetUserQuizzesAsync(string userId);
    }
}