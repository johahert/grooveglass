
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateQuizForm } from "@/components/CreateQuizForm";
import { AIPromptGenerator } from "@/components/AIPromptGenerator";

const CreateQuiz = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  return (
    <div className="bg-primary-element border border-subtle rounded-xl relative overflow-hidden">
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          
          <h1 className="text-3xl  text-white">Create a Quiz</h1>
          <Music size={32} className="text-white" />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Option selector */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`bg-white/5  border-subtle cursor-pointer transition-all duration-300 hover:bg-zinc-800 hover:scale-105 ${!showAIGenerator ? 'ring-2 ring-zinc-700' : ''}`}
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
              className={`bg-white/5  border-subtle cursor-pointer transition-all duration-300 hover:bg-zinc-800 hover:scale-105 ${showAIGenerator ? 'ring-2 ring-zinc-700' : ''}`}
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
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
