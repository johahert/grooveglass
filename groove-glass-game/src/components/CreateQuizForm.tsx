
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Music } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  spotifyTrack: string;
}

export const CreateQuizForm = () => {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

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

    toast({
      title: "Quiz Saved!",
      description: "Your quiz has been created successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Quiz Title */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quiz-title" className="text-white font-medium">
                Quiz Title
              </Label>
              <Input
                id="quiz-title"
                type="text"
                placeholder="Enter your quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Question {index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
                className="text-white hover:bg-white/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white font-medium">Question</Label>
                <Input
                  type="text"
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
              </div>

              <div>
                <Label className="text-white font-medium">Spotify Track (optional)</Label>
                <Input
                  type="text"
                  placeholder="Spotify track ID or URL"
                  value={question.spotifyTrack}
                  onChange={(e) => updateQuestion(question.id, 'spotifyTrack', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
              </div>

              <div>
                <Label className="text-white font-medium">Answer Options</Label>
                <div className="grid grid-cols-2 gap-2">
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
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Question Button */}
      <Button
        onClick={addQuestion}
        className="w-full bg-white/20 border border-white/30 text-white hover:bg-white/30"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>

      {/* Save Quiz Button */}
      <Button
        onClick={saveQuiz}
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none text-lg py-6"
      >
        <Music className="w-5 h-5 mr-2" />
        Save Quiz
      </Button>
    </div>
  );
};
