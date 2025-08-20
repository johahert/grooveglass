
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Music } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TrackSearch from "./customui/TrackSearch";
import { useSpotifyAuth } from "./providers/SpotifyAuthProvider";
import { Quiz, Question } from "@/models/interfaces/Quiz";
import { SaveQuiz } from "./services/api/SpotifyTrackApiService";
import { RadioGroup } from "./ui/radio-group";


export const CreateQuizForm = () => {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const auth = useSpotifyAuth();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      answers: ["", "", "", ""],
      correctAnswer: 0,
      spotifyTrack: ""
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateAnswer = (questionId: string, answerIndex: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, answers: q.answers.map((a, i) => i === answerIndex ? value : a) }
        : q
    ));
  };

  const saveQuiz = () => {
    if (!quizTitle || questions.length === 0) {
      toast({
        title: "Incomplete Quiz",
        description: "Please add a title and at least one question",
        variant: "destructive",
      });
      return;
    }

    const quiz: Quiz = {
      title: quizTitle,
      questions: questions
    };

    SaveQuiz(quiz, auth)
      .then(() => {
        setQuizTitle("");
        setQuestions([]);
        toast({
          title: "Quiz Saved!",
          description: "Your quiz has been created successfully",
        });
      })
      .catch((error) => {
        console.error("Error saving quiz:", error);
        toast({
          title: "Error",
          description: "Failed to save quiz. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-4">
      {/* Quiz Title */}
      <Card >
        <CardHeader>
          <CardTitle >Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
              <Label htmlFor="quiz-title" >
                Quiz Title
              </Label>
              <Input
                id="quiz-title"
                type="text"
                placeholder="Enter your quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
        </CardContent>
      </Card>

      {/* Questions */}
      {questions?.length > 0 && 
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle >Question {index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label >Question</Label>
                <Input
                  type="text"
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                />
              </div>

              <div>
                <Label >Spotify Track</Label>
                <TrackSearch token={auth?.spotifyUser?.jwtToken} onTrackSelected={(track) => updateQuestion(question.id, 'spotifyTrack', track.id)} />
              </div>

              <div>
                <Label className="text-white font-medium">Answer Options</Label>
                <RadioGroup className="grid grid-cols-2 gap-2">
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === answerIndex}
                        onChange={() => updateQuestion(question.id, 'correctAnswer', answerIndex)}
                        className="text-green-500"
                      />
                      <Input
                        type="text"
                        placeholder={`Answer ${answerIndex + 1}`}
                        value={answer}
                        onChange={(e) => updateAnswer(question.id, answerIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      }

      {/* Add Question Button */}
      <Button
        onClick={addQuestion}
        className="w-full border my-4"
        variant="secondary"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>

      {/* Save Quiz Button */}
      <Button
        onClick={saveQuiz}
        className="w-full"
      >
        <Music className="w-5 h-5 mr-2" />
        Save Quiz
      </Button>
    </div>
  );
};
