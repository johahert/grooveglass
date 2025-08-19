import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { GetQuizzes } from "@/components/services/api/SpotifyTrackApiService";
import { QuizOption } from "@/models/interfaces/Quiz";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HostQuizSelect({ selectedQuiz, setSelectedQuiz }: { selectedQuiz: number | null, setSelectedQuiz: (quizId: number | null) => void }) {
  const auth = useSpotifyAuth();
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  
  useEffect(() => {
    if(!auth.spotifyUser) return;

    const fetchQuizzes = async () => {
      if (!auth?.spotifyUser?.jwtToken) {
        console.error("Spotify user not authenticated");
        return;
      }
      const quizzes: QuizOption[] = await GetQuizzes(auth);
      setQuizzes(quizzes);
      console.log("Fetched quizzes:", quizzes);
    };
    fetchQuizzes();
  }, [auth.spotifyUser]);


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
