namespace groove_glass_api.Models.QuizRoomModels
{
    public class PlayerInfo
    {
        public string UserId { get; set; }
        public string DisplayName { get; set; }
        public bool IsConnected { get; set; } = true;
        public int Score { get; set; } = 0;
    }
}