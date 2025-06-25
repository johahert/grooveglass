
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Plus, Users, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-32 w-36 h-36 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-2/3 left-1/4 w-28 h-28 bg-yellow-400/15 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            MusicQuiz
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Create, join, and host interactive music quizzes with Spotify integration. 
            Test your music knowledge with friends!
          </p>
        </div>

        {/* Main action cards */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl">
          {/* Create Quiz Card */}
          <Link to="/create-quiz" className="group">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-br from-green-400 to-blue-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Create Quiz</CardTitle>
                <CardDescription className="text-white/80">
                  Design your own music quiz with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Join Quiz Card */}
          <Link to="/join-quiz" className="group">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-br from-pink-400 to-purple-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Join Quiz</CardTitle>
                <CardDescription className="text-white/80">
                  Enter a quiz code to join the fun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white border-none">
                  Join Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Host Quiz Card */}
          <Link to="/host-quiz" className="group">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Host Quiz</CardTitle>
                <CardDescription className="text-white/80">
                  Host and manage a live quiz session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-none">
                  Start Hosting
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features highlight */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-3">Powered by Spotify</h3>
            <p className="text-white/80">
              Real music playback, AI-generated questions, and real-time multiplayer experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
