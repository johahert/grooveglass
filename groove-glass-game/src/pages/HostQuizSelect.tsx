import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { GetQuizzes } from "@/components/services/api/SpotifyTrackApiService";
import { QuizOption } from "@/models/interfaces/Quiz";

export default function HostQuizSelect({selectedQuiz , setSelectedQuiz}: {selectedQuiz: number | null, setSelectedQuiz: (quizId: number | null) => void}) {
  const { spotifyUser } = useSpotifyAuth();
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      console.log("Fetching quizzes for user:", spotifyUser);
      if (!spotifyUser || !spotifyUser.jwtToken) {
        console.error("Spotify user not authenticated");
        return;
      }
      const quizzes: QuizOption[] = await GetQuizzes(spotifyUser.jwtToken);
      setQuizzes(quizzes);
      console.log("Fetched quizzes:", quizzes);
    };
    fetchQuizzes();
  }, [spotifyUser]);

  if (!spotifyUser) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Select a Quiz to Host</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {quizzes?.map((quiz) => (
              <Button
                key={quiz.id}
                variant={selectedQuiz === quiz.id ? "default" : "outline"}
                className={`w-full text-lg ${selectedQuiz === quiz.id ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white" : "bg-white/20 text-white"}`}
                onClick={() => setSelectedQuiz(quiz.id)}
              >
                {quiz.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
