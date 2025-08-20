using DatabaseService.Models;
using DatabaseService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DatabaseService.Services.Implementations
{
    public class QuizStorageService : IEntityStorageService<Quiz, int>
    {
        private readonly SpotifyDatabaseContext _context;

        public QuizStorageService(SpotifyDatabaseContext context)
        {
            _context = context;
        }

        public async Task<Quiz?> GetAsync(int quizId)
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == quizId);
        }

        public async Task StoreOrUpdateAsync(Quiz quiz)
        {
            var existingQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quiz.Id);
            if (existingQuiz == null)
            {
                _context.Quizzes.Add(quiz);
            }
            else
            {
                existingQuiz.Title = quiz.Title;
                existingQuiz.Questions = quiz.Questions;
                existingQuiz.SpotifyUserId = quiz.SpotifyUserId;
            }
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Quiz>> GetUserQuizzesAsync(string userId)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == userId);
            if (existingUser == null)
            {
                return Enumerable.Empty<Quiz>();
            }
            return await _context.Quizzes
                .Where(q => q.SpotifyUserId == existingUser.SpotifyUserId)
                .Include(q => q.Questions)
                .ToListAsync();
        }
    }
}
