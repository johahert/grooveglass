using DatabaseService.Models;
using DatabaseService.Models.Entities;
using DatabaseService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseService.Services.Implementations
{
    public class QuizStorageService : IQuizStorageService
    {
        private readonly SpotifyDatabaseContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<QuizStorageService> _logger;
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(30);

        public QuizStorageService(SpotifyDatabaseContext context, IMemoryCache cache, ILogger<QuizStorageService> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        public async Task<Quiz?> GetAsync(int quizId)
        {
            var cacheKey = $"Quiz_{quizId}";

            if (_cache.TryGetValue(cacheKey, out Quiz? cachedQuiz))
            {
                _logger.LogInformation($"Cache hit for quiz {quizId}");
                return cachedQuiz;
            }

            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz != null)
            {
                _cache.Set(cacheKey, quiz, _cacheExpiration);
                _logger.LogInformation($"Cache miss for quiz {quizId}, caching result");
            }
            
            return quiz;
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

            var cacheKey = $"Quiz_{quiz.Id}";
            _cache.Remove(cacheKey);

            var userCacheKey = $"UserQuizzes_{quiz.SpotifyUserId}";
            _cache.Remove(userCacheKey);

            _logger.LogInformation("Quiz {quizId} stored or updated, cache cleared", quiz.Id);
        }

        public async Task<IEnumerable<Quiz>> GetUserQuizzesAsync(string userId)
        {
            var cacheKey = $"UserQuizzes_{userId}";

            if (_cache.TryGetValue(cacheKey, out IEnumerable<Quiz>? CachedQuizzes))
            {
                _logger.LogInformation("User quizzes for {UserId} retrieved from cache", userId);
                return CachedQuizzes ?? [];
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.SpotifyUserId == userId);
            if (existingUser == null)
            {
                return Enumerable.Empty<Quiz>();
            }
            var quizzes = await _context.Quizzes
                .Where(q => q.SpotifyUserId == existingUser.SpotifyUserId)
                .Include(q => q.Questions)
                .ToListAsync();

            _cache.Set(cacheKey, quizzes, _cacheExpiration);
            _logger.LogInformation("User quizzes for {UserId} cached for {Expiration} minutes", userId, _cacheExpiration.TotalMinutes);

            return quizzes;
        }
    }
}
