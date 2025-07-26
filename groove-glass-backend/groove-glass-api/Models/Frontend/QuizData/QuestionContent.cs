namespace groove_glass_api.Models.Frontend.QuizData
{
    public class QuestionContent
    {
        public string Id { get; set; }
        public string Question { get; set; }
        public List<string> Answers { get; set; }
        public int CorrectAnswer { get; set; }
        public string SpotifyTrack { get; set; }
    }
}
