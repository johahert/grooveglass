import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import { PlaySpotifyTrack, PauseSpotifyTrack } from "@/components/services/api/SpotifyTrackApiService";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PlaybackControlProps {
  selectedDevice: string | null;
  currentTrack: string | null;
}

const PlaybackControl = ({ selectedDevice, currentTrack }: PlaybackControlProps) => {
  const auth = useSpotifyAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!auth.spotifyUser || !selectedDevice || !currentTrack) return null;

  const handlePlay = async () => {
    setLoading(true);
    await PlaySpotifyTrack(currentTrack, selectedDevice, auth);
    setIsPlaying(true);
    setLoading(false);
  };

  const handlePause = async () => {
    setLoading(true);
    await PauseSpotifyTrack(selectedDevice, auth);
    setIsPlaying(false);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 my-4">
      <Button onClick={handlePlay} disabled={isPlaying || loading} variant="default">
        Play
      </Button>
      <Button onClick={handlePause} disabled={!isPlaying || loading} variant="destructive">
        Pause
      </Button>
    </div>
  );
};

export default PlaybackControl;
