public class QuizQuestion
{
    public int Id { get; set; }
    public string Question { get; set; }
    public List<string> Answers { get; set; }
    public int CorrectAnswer { get; set; }
    public string SpotifyTrack { get; set; }
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; }
}