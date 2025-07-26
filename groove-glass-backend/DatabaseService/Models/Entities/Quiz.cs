public class Quiz
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string SpotifyUserId { get; set; } // Foreign key to user
    public List<QuizQuestion> Questions { get; set; }
}