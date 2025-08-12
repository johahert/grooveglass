
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Music, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuizRoomHub } from "@/hooks/useQuizRoomHub";
import { PlayerInfo } from "@/models/interfaces/QuizPlayer";
import { storeQuizPlayerInfo } from "@/components/services/StorageService";

const JoinQuiz = () => {
  const [quizCode, setQuizCode] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const navigate = useNavigate();

  const { joinRoom } = useQuizRoomHub({
      onRoomCreated: () => {},
      onPlayerJoined: () => {
        toast({
          title: "Joined Quiz",
          description: `You have joined the quiz with code ${quizCode} as ${playerName}`,
        });
      },
      onPlayerLeft: () => {},
      onStateUpdated: () => {},
      onRoom: () => {},
    });

  const handleJoinQuiz = () => {
    if (!quizCode || !playerName) {
      toast({
        title: "Missing Information",
        description: "Please enter both quiz code and your name",
        variant: "destructive",
      });
      return;
    }

    if (quizCode.length !== 6) {
      toast({
        title: "Invalid Quiz Code",
        description: "Quiz code must be exactly 6 characters long",
        variant: "destructive",
      });
      return;
    }

    storeQuizPlayerInfo(quizCode.trim().toUpperCase(), playerName.trim());

    navigate(`/quiz/${quizCode.trim().toUpperCase()}`);

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-32 w-36 h-36 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-2/3 left-1/4 w-28 h-28 bg-yellow-400/15 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 min-h-screen p-8 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="absolute top-8 left-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-pink-400 to-purple-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Join a Quiz</CardTitle>
              <CardDescription className="text-white/80">
                Enter the quiz code provided by your host
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quiz-code" className="text-white font-medium">
                  Quiz Code
                </Label>
                <Input
                  id="quiz-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 text-center text-xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player-name" className="text-white font-medium">
                  Your Name
                </Label>
                <Input
                  id="player-name"
                  type="text"
                  placeholder="Enter your display name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
              </div>

              <Button 
                onClick={handleJoinQuiz}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white border-none text-lg py-6"
              >
                Join Quiz
              </Button>
            </CardContent>
          </Card>

          {/* Additional info */}
          <div className="mt-8 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-white/80 text-sm">
                Don't have a quiz code? Ask your quiz host to share it with you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;
