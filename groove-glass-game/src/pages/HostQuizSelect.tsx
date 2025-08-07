import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Dummy quiz list for demonstration
const quizzes = [
  { id: "quiz1", name: "Pop Hits" },
  { id: "quiz2", name: "Classic Rock" },
  { id: "quiz3", name: "Indie Gems" },
];

export default function HostQuizSelect() {
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const navigate = useNavigate();

  const handleHost = () => {
    if (!selectedQuiz) return;
    // Generate a random 6-char room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/hostedquiz/${roomCode}?host=true&quizId=${selectedQuiz}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Select a Quiz to Host</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <Button
                key={quiz.id}
                variant={selectedQuiz === quiz.id ? "default" : "outline"}
                className={`w-full text-lg ${selectedQuiz === quiz.id ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white" : "bg-white/20 text-white"}`}
                onClick={() => setSelectedQuiz(quiz.id)}
              >
                {quiz.name}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleHost}
            disabled={!selectedQuiz}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white text-lg py-6 mt-4"
          >
            Host Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
