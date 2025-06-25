
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Users, Copy, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";


const HostQuiz = () => {
  const { spotifyToken, login } = useSpotifyAuth();

  const [quizCode] = useState("ABC123"); // This would be generated
  const [connectedPlayers, setConnectedPlayers] = useState([
    "MusicLover42", "RockStar99", "PopQueen"
  ]);
  const [isStarted, setIsStarted] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState(null);

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
    // In a real app, this would redirect to Spotify OAuth
    // For demo purposes, we'll simulate the connection
    setIsSpotifyConnected(true);
    setSpotifyUser({ name: "John Doe", email: "john@example.com" });
    toast({
      title: "Connected to Spotify!",
      description: "You can now host music quizzes",
    });
  };

  const disconnectSpotify = () => {
    setIsSpotifyConnected(false);
    setSpotifyUser(null);
    toast({
      title: "Disconnected from Spotify",
      description: "You'll need to reconnect to host quizzes",
    });
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
        {!isSpotifyConnected && (
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
        {isSpotifyConnected && (
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
                      <p className="text-white/80 text-sm">{spotifyUser?.name}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={disconnectSpotify}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Quiz Code Section */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Quiz Code</CardTitle>
              <CardDescription className="text-white/80 text-center">
                Share this code with players to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="bg-white/20 rounded-xl p-6 border border-white/30 mb-4">
                  <div className="text-4xl font-bold text-white font-mono tracking-widest">
                    {quizCode}
                  </div>
                </div>
                <Button 
                  onClick={copyQuizCode}
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>

              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <h3 className="text-white font-semibold mb-2">How to join:</h3>
                <ol className="text-white/80 text-sm space-y-1">
                  <li>1. Visit the MusicQuiz app</li>
                  <li>2. Click "Join Quiz"</li>
                  <li>3. Enter code: <span className="font-mono">{quizCode}</span></li>
                  <li>4. Enter player name</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Connected Players */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Connected Players ({connectedPlayers.length})</CardTitle>
              <CardDescription className="text-white/80">
                Players waiting to start the quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {connectedPlayers.map((player, index) => (
                  <div 
                    key={index}
                    className="bg-white/20 rounded-lg p-3 border border-white/30 flex items-center"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {player.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white">{player}</span>
                  </div>
                ))}
                
                {connectedPlayers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/60 mx-auto mb-3" />
                    <p className="text-white/80">Waiting for players to join...</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={startQuiz}
                disabled={connectedPlayers.length === 0 || isStarted}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white border-none text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 mr-2" />
                {isStarted ? "Quiz Started" : "Start Quiz"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Settings Preview */}
        <div className="max-w-6xl mx-auto mt-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">10</div>
                  <div className="text-white/80 text-sm">Questions</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">30s</div>
                  <div className="text-white/80 text-sm">Per Question</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">Pop Rock</div>
                  <div className="text-white/80 text-sm">Genre</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HostQuiz;
