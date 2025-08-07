using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace groove_glass_api.Models.QuizRoomModels
{
    public class QuizRoomHub : Hub
    {
        private static ConcurrentDictionary<string, QuizRoom> _rooms = new();
        private static ConcurrentDictionary<string, (string roomCode, string userId)> _userConnections = new();

        public async Task CreateRoom(string hostUserId, int quizId)
        {
            try
            {
                Console.WriteLine($"Creating room for host user {hostUserId} with quiz ID {quizId}");
                var roomCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
                var room = new QuizRoom
                {
                    RoomCode = roomCode,
                    HostUserId = hostUserId,
                    QuizId = quizId,
                    Players = new List<PlayerInfo>(), 
                    State = new QuizRoomState() 
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
                var existingPlayer = room.Players.FirstOrDefault(p => p.UserId == userId);

                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
                _userConnections[Context.ConnectionId] = (roomCode, userId);

                if (existingPlayer != null)
                {
                    Console.WriteLine($"Player {existingPlayer.DisplayName} ({userId}) reconnected to room {roomCode}");
                    await Clients.Caller.SendAsync("RejoinSuccess", existingPlayer);
                }
                else
                {
                    var newPlayer = new PlayerInfo
                    {
                        UserId = userId,
                        DisplayName = displayName,
                    };

                    room.Players.Add(newPlayer);
                    Console.WriteLine($"User {displayName} ({userId}) joined room {roomCode} for the first time");
                    await Clients.Group(roomCode).SendAsync("PlayerJoined", newPlayer);
                }
            }
            else
            {
                await Clients.Caller.SendAsync("RoomNotFound");
            }
        }

        public async Task UpdateState(string roomCode, QuizRoomState newState)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                room.State = newState;
                await Clients.Group(roomCode).SendAsync("StateUpdated", newState);
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
                if (room.Players.Count == 0)
                {
                    _rooms.TryRemove(roomCode, out _);
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
                        // Option 1: Immediately remove the player.
                        room.Players.Remove(player);
                        await Clients.Group(info.roomCode).SendAsync("PlayerLeft", player);
                        Console.WriteLine($"Player {player.DisplayName} disconnected and was removed from room {info.roomCode}.");

                        // Option 2 (more advanced): Mark them as "disconnected" instead of removing,
                        // allowing them a grace period to rejoin. For now, removing is simpler.
                    }
                }
            }
            await base.OnDisconnectedAsync(exception);

        }

        public Task GetRoom(string roomCode)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                return Task.FromResult(room);
            }

            return Task.FromResult<QuizRoom>(null);

        }

    }
}
