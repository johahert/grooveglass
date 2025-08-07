import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

// Dummy host/player detection: use ?host=true in URL for host view
function useIsHost() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("host") === "true";
}

const HostedQuizRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const isHost = useIsHost();

  // Example state for demonstration
  const [players, setPlayers] = useState<string[]>(["Alice", "Bob"]);

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
