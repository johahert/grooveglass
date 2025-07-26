using DatabaseService.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DatabaseService.Models
{
    public class SpotifyDatabaseContext : DbContext
    {
        public SpotifyDatabaseContext(DbContextOptions<SpotifyDatabaseContext> options) : base(options)
        {
        }

        public DbSet<SpotifyUser> Users { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
    }
}
