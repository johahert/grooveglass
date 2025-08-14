import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { GetQuizzes } from "@/components/services/api/SpotifyTrackApiService";
import { QuizOption } from "@/models/interfaces/Quiz";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
      
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full p-2 px-4 rounded bg-white/5 text-lg focus:bg-white/10 border border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between">
          {selectedQuiz
            ? quizzes.find(q => q.id === selectedQuiz)?.title || "Select a quiz..."
            : "Select a quiz..."}
            <span className="ml-2 inline-block align-middle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full bg-black border border-white/30">
          {quizzes.map(quiz => (
            <DropdownMenuItem
              key={quiz.id}
              onSelect={() => setSelectedQuiz(quiz.id)}
              className="bg-black text-white hover:cursor-pointer hover:bg-white/10"
            >
              {quiz.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

  );
}
