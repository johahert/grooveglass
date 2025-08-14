import React from "react";
import { soundwaveGif } from "@/assets";

interface SoundwaveBackgroundProps {
  isPlaying: boolean;
}

const SoundwaveBackground: React.FC<SoundwaveBackgroundProps> = ({ isPlaying }) => {
  return (
    <div className="overflow-hidden h-48 flex">
        <img
            src={soundwaveGif}
            alt="Soundwave background"
            className={`w-1/2 h-full transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-30"} scale-x-[-1]`}
        />
        <img
            src={soundwaveGif}
            alt="Soundwave background"
            className={`w-1/2 h-full transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-30"}`}
        />
    </div>
  );
};

export default SoundwaveBackground;
