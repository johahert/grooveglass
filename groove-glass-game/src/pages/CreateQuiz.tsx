
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Car, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateQuizForm } from "@/components/CreateQuizForm";
import { AIPromptGenerator } from "@/components/AIPromptGenerator";

const CreateQuiz = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  return (
    <>
          {/* Option selector */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`cursor-pointer ${!showAIGenerator &&'bg-accent'}`}
              onClick={() => setShowAIGenerator(false)}
              >
              <CardHeader className="text-center">
                <CardTitle className={`${!showAIGenerator &&'text-accent-foreground'}`}>Manual Creation</CardTitle>
                <CardDescription className={`${!showAIGenerator &&'text-accent-foreground'}`}>
                  Create questions and answers manually
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer ${showAIGenerator && ' bg-accent'}`}
              onClick={() => setShowAIGenerator(true)}
              >
              <CardHeader className="text-center">
                <CardTitle className={`${showAIGenerator &&'text-accent-foreground'}`}>AI Generated</CardTitle>
                <CardDescription className={`${showAIGenerator &&'text-accent-foreground'}`}>
                  Let AI create questions based on your preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Content based on selection */}
          {showAIGenerator ? <AIPromptGenerator /> : <CreateQuizForm />}
        </>
  );
};

export default CreateQuiz;
