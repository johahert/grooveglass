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

    }
}
