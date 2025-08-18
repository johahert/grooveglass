import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { GetQuizzes } from "@/components/services/api/SpotifyTrackApiService";
import { QuizOption } from "@/models/interfaces/Quiz";
import { Button } from "@/components/ui/button";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HostQuizSelect({ selectedQuiz, setSelectedQuiz }: { selectedQuiz: number | null, setSelectedQuiz: (quizId: number | null) => void }) {
  const { spotifyUser } = useSpotifyAuth();
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  
  useEffect(() => {
    if(!spotifyUser) return;

    const fetchQuizzes = async () => {
      console.log("Fetching quizzes for user:", spotifyUser.displayName);
      if (!spotifyUser || !spotifyUser.jwtToken) {
        console.error("Spotify user not authenticated");
        return;
      }
      const quizzes: QuizOption[] = await GetQuizzes(spotifyUser);
      setQuizzes(quizzes);
      console.log("Fetched quizzes:", quizzes);
    };
    fetchQuizzes();
  }, [spotifyUser]);
  
  if (!spotifyUser) return null;
  
  return (
      <Select onValueChange={(value) => {
        const selected = quizzes.find(q => q.title === value);
        setSelectedQuiz(selected ? selected.id : null);
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Select a quiz..." />
        </SelectTrigger>

        <SelectContent>
          {quizzes.map(quiz => (
        <SelectItem
          key={quiz.id}
          value={quiz.title}
        >
          {quiz.title}
        </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
}
