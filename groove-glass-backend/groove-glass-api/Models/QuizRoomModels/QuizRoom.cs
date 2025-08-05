using groove_glass_api.Models.QuizRoomModels;

public class QuizRoom
{
    public string RoomCode { get; set; }
    public string HostUserId { get; set; }
    public int QuizId { get; set; }
    public List<PlayerInfo> Players { get; set; } = new();
    public QuizRoomState State { get; set; }
}
