import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { useQuizRoomHub } from "@/hooks/useQuizRoomHub";
import type { QuizRoom } from "@/models/interfaces/QuizRoom";
import { ConnectionStatus } from "@/models/constants/ConnectionStatus";


const HostedQuizRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { spotifyUser } = useSpotifyAuth();
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const onPlayerJoined = (playerList: string[]) => {
    setPlayers(playerList);
  };

  const onPlayerLeft = (playerList: string[]) => {
    setPlayers(playerList);
  };
  
  const onRoom = (roomData: QuizRoom) => {
    console.log("Room data:", roomData);
    if (spotifyUser && roomData.hostUserId === spotifyUser.spotifyUserId) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  };

  // Setup SignalR and fetch room info
  const { getRoom, joinRoom, connectionStatus } = useQuizRoomHub({
    onRoomCreated: () => {},
    onPlayerJoined,
    onPlayerLeft,
    onStateUpdated: () => {},
    onRoom,
  });

  // Fetch room info on mount
  useEffect(() => {
    console.log(connectionStatus)
    if (roomCode && connectionStatus === ConnectionStatus.Connected && spotifyUser) {
      setPlayerId(spotifyUser.spotifyUserId);
      getRoom(roomCode);
      console.log("Fetching room with code:", roomCode);
    }
  }, [roomCode, getRoom, connectionStatus, spotifyUser]);

  // Determine host/player and set playerId
  /* useEffect(() => {
    if (!room || !spotifyUser) {
      console.error("Room or Spotify user not available");
      return;
    };

    console.log("Room data:", room);

    if (room.hostUserId === spotifyUser.userId) {
      setIsHost(true);
    } else {
      setIsHost(false);
      // For players, generate or get playerId from localStorage
      let pid = localStorage.getItem(`quiz_player_id_${roomCode}`);
      if (!pid) {
        pid = Math.random().toString(36).substring(2, 15);
        localStorage.setItem(`quiz_player_id_${roomCode}`, pid);
      }
      setPlayerId(pid);
      // Optionally join the room as a player
      joinRoom(roomCode, pid, spotifyUser.displayName || "Player");
    }
  }, [room, spotifyUser, roomCode, joinRoom]); */

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            Quiz Room: <span className="font-mono tracking-widest">{roomCode}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHost ? (
            <div className="space-y-4">
              <h2 className="text-xl text-white font-semibold">Host View</h2>
              <p className="text-white/80">Share this code with your players:</p>
              <div className="text-3xl font-mono text-yellow-300 mb-4">{roomCode}</div>
              <div className="mb-2 text-white/80">Players joined:</div>
              <ul className="mb-4">
                {players.map((p) => (
                  <li key={p} className="text-white">{p}</li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">Start Quiz</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl text-white font-semibold">Player View</h2>
              <p className="text-white/80">Waiting for host to start the quiz...</p>
              <div className="mb-2 text-white/80">Other players:</div>
              <ul className="mb-4">
                {players.map((p) => (
                  <li key={p} className="text-white">{p}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostedQuizRoom;
