
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Users, Copy, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { log } from "console";
import TrackSearch from "@/components/customui/TrackSearch";
import HostQuizRoom from "@/components/customui/HostQuizRoom";


const HostQuiz = () => {
  const { spotifyUser, login, logout } = useSpotifyAuth();

  const [quizCode] = useState("ABC123"); // This would be generated
  const [connectedPlayers, setConnectedPlayers] = useState([
    "MusicLover42", "RockStar99", "PopQueen"
  ]);
  const [isStarted, setIsStarted] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  const copyQuizCode = () => {
    navigator.clipboard.writeText(quizCode);
    toast({
      title: "Code Copied!",
      description: "Quiz code has been copied to clipboard",
    });
  };

  const startQuiz = () => {
    if (!isSpotifyConnected) {
      toast({
        title: "Spotify Required",
        description: "Please connect to Spotify to start the quiz",
        variant: "destructive",
      });
      return;
    }
    setIsStarted(true);
    toast({
      title: "Quiz Started!",
      description: "Players can no longer join",
    });
  };

  const connectToSpotify = () => {
    
  };

  const disconnectSpotify = () => {
    logout(); // Ensure we start fresh
  };

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
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Host Quiz Session</h1>
          </div>
        </div>

        {/* Spotify Connection Section */}
        {!spotifyUser && (
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white flex items-center justify-center">
                  <Music className="w-6 h-6 mr-2 text-white" />
                  Connect to Spotify
                </CardTitle>
                <CardDescription className="text-white/80">
                  Connect your Spotify account to host music quizzes with real songs
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={login}
                  className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white border-none text-lg py-6 px-8"
                >
                  <Music className="w-5 h-5 mr-2" />
                  Connect Spotify Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Spotify Connected Status */}
        {spotifyUser && (
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Connected to Spotify</p>
                      <p className="text-white/80 text-sm">{spotifyUser?.displayName}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={disconnectSpotify}
                    variant="outline"
                    className="border-white/30 hover:bg-white/10"
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <HostQuizRoom />
          </div>
        )}

      </div>
    </div>
  );
};

export default HostQuiz;
