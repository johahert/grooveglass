
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Music, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AIPromptGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    genre: "",
    difficulty: "medium",
    questionCount: "10",
    customPrompt: ""
  });

  const generateQuiz = async () => {
    if (!formData.topic) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic for your quiz",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Quiz Generated!",
        description: "Your AI-generated quiz is ready for review",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Quiz Generator
          </CardTitle>
          <CardDescription className="text-white/80">
            Tell our AI what kind of music quiz you want to create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic" className="text-white font-medium">
                Quiz Topic
              </Label>
              <Input
                id="topic"
                type="text"
                placeholder="e.g., 90s Rock Bands, Taylor Swift, Classical Music"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
              />
            </div>

            <div>
              <Label htmlFor="genre" className="text-white font-medium">
                Music Genre (optional)
              </Label>
              <Input
                id="genre"
                type="text"
                placeholder="e.g., Pop, Rock, Hip-Hop, Jazz"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty" className="text-white font-medium">
                Difficulty Level
              </Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full h-10 bg-white/20 border border-white/30 text-white rounded-md px-3 focus:bg-white/30"
              >
                <option value="easy" className="bg-gray-800">Easy</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="hard" className="bg-gray-800">Hard</option>
              </select>
            </div>

            <div>
              <Label htmlFor="question-count" className="text-white font-medium">
                Number of Questions
              </Label>
              <select
                id="question-count"
                value={formData.questionCount}
                onChange={(e) => setFormData({...formData, questionCount: e.target.value})}
                className="w-full h-10 bg-white/20 border border-white/30 text-white rounded-md px-3 focus:bg-white/30"
              >
                <option value="5" className="bg-gray-800">5 Questions</option>
                <option value="10" className="bg-gray-800">10 Questions</option>
                <option value="15" className="bg-gray-800">15 Questions</option>
                <option value="20" className="bg-gray-800">20 Questions</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-prompt" className="text-white font-medium">
              Additional Instructions (optional)
            </Label>
            <Textarea
              id="custom-prompt"
              placeholder="Any specific requirements or preferences for your quiz..."
              value={formData.customPrompt}
              onChange={(e) => setFormData({...formData, customPrompt: e.target.value})}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 min-h-[100px]"
            />
          </div>

          <Button
            onClick={generateQuiz}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white border-none text-lg py-6"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Quiz with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Example prompts */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Example Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Create a quiz about Beatles songs from the 1960s",
              "Make a hard quiz about female pop artists from 2010-2020",
              "Generate questions about guitar solos in classic rock",
              "Create a quiz about movie soundtracks and their composers"
            ].map((example, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/30 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => setFormData({...formData, topic: example})}
              >
                <p className="text-white/90 text-sm">{example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
