import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { PlaySpotifyTrack, PauseSpotifyTrack } from "@/components/services/api/SpotifyTrackApiService";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PlaybackControlProps {
  selectedDevice: string | null;
  currentTrack: string | null;
}

const PlaybackControl = ({ selectedDevice, currentTrack }: PlaybackControlProps) => {
  const { spotifyUser } = useSpotifyAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!spotifyUser || !selectedDevice || !currentTrack) return null;

  const handlePlay = async () => {
    setLoading(true);
    await PlaySpotifyTrack(currentTrack, selectedDevice, spotifyUser);
    setIsPlaying(true);
    setLoading(false);
  };

  const handlePause = async () => {
    setLoading(true);
    await PauseSpotifyTrack(selectedDevice, spotifyUser);
    setIsPlaying(false);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 my-4">
      <Button onClick={handlePlay} disabled={isPlaying || loading} className="bg-green-600 hover:bg-green-700 text-white">
        Play
      </Button>
      <Button onClick={handlePause} disabled={!isPlaying || loading} className="bg-red-600 hover:bg-red-700 text-white">
        Pause
      </Button>
    </div>
  );
};

export default PlaybackControl;
