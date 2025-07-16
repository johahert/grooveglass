
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateQuizForm } from "@/components/CreateQuizForm";
import { AIPromptGenerator } from "@/components/AIPromptGenerator";
import SpotifyPlayerTest from "@/components/customui/SpotifyPlayerTest";

const CreateQuiz = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-32 w-36 h-36 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-2/3 left-1/4 w-28 h-28 bg-yellow-400/15 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 mr-4">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Create Your Music Quiz</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Option selector */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:scale-105 ${!showAIGenerator ? 'ring-2 ring-white/40' : ''}`}
              onClick={() => setShowAIGenerator(false)}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-white">Manual Creation</CardTitle>
                <CardDescription className="text-white/80">
                  Create questions and answers manually
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className={`bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:scale-105 ${showAIGenerator ? 'ring-2 ring-white/40' : ''}`}
              onClick={() => setShowAIGenerator(true)}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-white">AI Generated</CardTitle>
                <CardDescription className="text-white/80">
                  Let AI create questions based on your preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Content based on selection */}
          {showAIGenerator ? <AIPromptGenerator /> : <CreateQuizForm />}
          <SpotifyPlayerTest />
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
