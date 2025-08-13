namespace groove_glass_api.Models.QuizRoomModels
{
    public class QuizRoomState
    {
        public int CurrentQuestionIndex { get; set; }
        public bool IsActive { get; set; }
        public Dictionary<string, int> Answers { get; set; } = new(); 
        public long? QuestionEndTime { get; set; }
    }
}
