using DatabaseService.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace groove_glass_api.Models.QuizRoomModels
{
    public class QuizRoomHub : Hub
    {
        private static ConcurrentDictionary<string, QuizRoom> _rooms = new();
        private static ConcurrentDictionary<string, (string roomCode, string userId)> _userConnections = new();

        private readonly ISpotifyStorageService _spotifyStorageService;

        public QuizRoomHub(ISpotifyStorageService spotifyStorageService)
        {
            _spotifyStorageService = spotifyStorageService;
        }

        public async Task CreateRoom(string hostUserId, string displayName, int quizId)
        {
            try
            {
                Console.WriteLine($"Creating room for host user {hostUserId} with quiz ID {quizId}");
                var roomCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();

                var hostPlayer = new PlayerInfo
                {
                    UserId = hostUserId,
                    DisplayName = displayName,
                };

                _userConnections[Context.ConnectionId] = (roomCode, hostUserId);

                var quiz = await _spotifyStorageService.GetQuizAsync(quizId);

                if(quiz == null)
                {
                    throw new Exception($"Quiz with ID {quizId} not found.");
                }

                // Avoid circular reference in JSON
                quiz.Questions = quiz.Questions.Select(x => new QuizQuestion
                {
                    Question = x.Question,
                    Answers = x.Answers,
                    CorrectAnswer = x.CorrectAnswer
                }).ToList();

                var room = new QuizRoom
                {
                    RoomCode = roomCode,
                    HostUserId = hostUserId,
                    QuizId = quizId,
                    Players = new List<PlayerInfo>()
                    {
                        hostPlayer
                    },
                    State = new QuizRoomState(),
                    QuizData = quiz
                };

                _rooms[roomCode] = room;

                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
                await Clients.Caller.SendAsync("RoomCreated", room);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateRoom: {ex.Message}");
                throw;
            }
        }

        public async Task JoinRoom(string roomCode, string userId, string displayName)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
                _userConnections[Context.ConnectionId] = (roomCode, userId);

                var existingPlayer = room.Players.FirstOrDefault(p => p.UserId == userId);

                if (existingPlayer != null)
                {
                    existingPlayer.IsConnected = true;
                    Console.WriteLine($"Player {existingPlayer.DisplayName} ({userId}) reconnected to room {roomCode}");
                    await Clients.Caller.SendAsync("PlayerReconnected", existingPlayer);
                }
                else
                {
                    if (room.State.IsActive)
                    {
                        Console.WriteLine($"User {displayName} ({userId}) attempted to join active room {roomCode}");
                        await Clients.Caller.SendAsync("Error", room);
                        return;
                    }

                    var newPlayer = new PlayerInfo
                    {
                        UserId = userId,
                        DisplayName = displayName,
                    };

                    room.Players.Add(newPlayer);
                    Console.WriteLine($"User {displayName} ({userId}) joined room {roomCode} for the first time");
                    await Clients.Group(roomCode).SendAsync("PlayerJoined", newPlayer);
                }

                await Clients.Caller.SendAsync("Room", room);
            }
            else
            {
                await Clients.Caller.SendAsync("RoomNotFound");
            }
        }

        public async Task UpdateState(string roomCode, QuizRoomState newState)
        {
            try
            {
                if (_rooms.TryGetValue(roomCode, out var room))
                {
                    room.State = newState;
                    await Clients.Group(roomCode).SendAsync("StateUpdated", newState);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateState: {ex.Message}");
            }
        }

        public async Task StartQuiz(string roomCode)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                room.State.IsActive = true;
                room.State.CurrentQuestionIndex = 0;
                room.State.Answers.Clear();
                room.State.QuestionEndTime = null;
                await Clients.Group(roomCode).SendAsync("QuizStarted", room);
            }
        }

        public async Task LeaveRoom(string roomCode, string userId)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                var player = room.Players.FirstOrDefault(p => p.UserId == userId);
                if (player != null)
                {
                    room.Players.Remove(player);
                    await Clients.Group(roomCode).SendAsync("PlayerLeft", player);
                }
                if (room.Players.Count == 0 || player?.UserId == room.HostUserId)
                {
                    if(_rooms.TryRemove(roomCode, out _))
                    {
                        Console.WriteLine($"Closing room {roomCode}");
                        await Clients.Group(roomCode).SendAsync("RoomClosed");
                    }
                }
            }
            _userConnections.TryRemove(Context.ConnectionId, out _);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_userConnections.TryRemove(Context.ConnectionId, out var info))
            {
                if (_rooms.TryGetValue(info.roomCode, out var room))
                {
                    var player = room.Players.FirstOrDefault(p => p.UserId == info.userId);
                    if (player != null)
                    {
                        player.IsConnected = false;
                        Console.WriteLine($"Player {player.DisplayName} disconnected. Starting grace period.");
                        // Notify clients that the player is attempting to reconnect
                        await Clients.Group(info.roomCode).SendAsync("PlayerDisconnected", player);

                        // Start a 30-second timer. If the player is still disconnected after, remove them.
                        await Task.Delay(30000).ContinueWith(async t =>
                        {
                            if (room.Players.Any(p => p.UserId == player.UserId && !p.IsConnected))
                            {
                                room.Players.Remove(player);
                                await Clients.Group(info.roomCode).SendAsync("PlayerLeft", player);
                                Console.WriteLine($"Player {player.DisplayName}'s grace period expired. Removed from room.");

                                if(player.UserId == room.HostUserId)
                                {
                                    if (_rooms.TryRemove(info.roomCode, out _))
                                    {
                                        Console.WriteLine($"Closing room {info.roomCode}");
                                        await Clients.Group(info.roomCode).SendAsync("RoomClosed");
                                    }
                                }
                            }
                        });
                    }
                }
            }
            await base.OnDisconnectedAsync(exception);

        }

        public async Task GetRoom(string roomCode)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                await Clients.Caller.SendAsync("Room", room);
            }

            await Task.CompletedTask;

        }

        public async Task SubmitAnswer(string roomCode, int answerIndex)
        {
            if(_rooms.TryGetValue(roomCode, out var room))
            {
                Console.WriteLine($"{roomCode} {answerIndex} - In Submitanswer");

                foreach(var answer in room.State.Answers)
                {
                    Console.WriteLine($"Answer: {answer.Key} - {answer.Value}");
                }

                var connectioninfo = _userConnections.GetValueOrDefault(Context.ConnectionId);
                var player = room.Players.FirstOrDefault(p => p.UserId == connectioninfo.userId);

                var currentQuestionIndex = room.State.CurrentQuestionIndex;
                var currentQuestion = room.QuizData?.Questions[currentQuestionIndex];

                if (player != null && !room.State.Answers.ContainsKey(player.UserId) && currentQuestion != null)
                {
                    room.State.Answers[player.UserId] = answerIndex;
                    
                    if(answerIndex == currentQuestion.CorrectAnswer)
                    {
                        Console.WriteLine($"Player {player.DisplayName} answered correctly in room {roomCode}");
                        long timeNow = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds();
                        long timeLeft = ((room.State.QuestionEndTime ?? timeNow) - timeNow) / 1000;
                        var addedScore = (int)Math.Max(0, timeLeft);
                        player.Score += (30 + addedScore);
                        Console.WriteLine($"Player {player.DisplayName} scored {addedScore} points in room {roomCode}");
                    }

                    await Clients.Group(roomCode).SendAsync("RoomUpdated", room);

                }
            }
        }

        public async Task RestartQuiz(string roomCode)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                foreach (var player in room.Players)
                {
                    player.Score = 0;
                }

                room.State.IsActive = true;
                room.State.CurrentQuestionIndex = 0;
                room.State.Answers = new Dictionary<string, int>();
                room.State.QuestionEndTime = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds() + 30000;

                await Clients.Group(roomCode).SendAsync("RoomUpdated", room);
            }
        }

    }
}
