using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace groove_glass_api.Models.QuizRoomModels
{
    public class QuizRoomHub : Hub
    {
        private static ConcurrentDictionary<string, QuizRoom> _rooms = new();

        public async Task CreateRoom(string hostUserId, int quizId)
        {
            var roomCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
            var room = new QuizRoom
            {
                RoomCode = roomCode,
                HostUserId = hostUserId,
                QuizId = quizId,
            };

            _rooms[roomCode] = room;

            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Caller.SendAsync("RoomCreated", room);
        }

        public async Task JoinRoom(string roomCode, string userId, string displayName)
        {
            if (_rooms.TryGetValue(roomCode, out var room))
            {
                var player = new PlayerInfo
                {
                    UserId = userId,
                    DisplayName = displayName,
                };

                room.Players.Add(player);
                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
                await Clients.Group(roomCode).SendAsync("PlayerJoined", player);

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
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Handle disconnection logic if needed
            foreach (var room in _rooms.Values)
            {
                var player = room.Players.FirstOrDefault(p => p.UserId == Context.ConnectionId);
                if (player != null)
                {
                    await LeaveRoom(room.RoomCode, player.UserId);
                }
            }
            await base.OnDisconnectedAsync(exception);

        }

    }
}
