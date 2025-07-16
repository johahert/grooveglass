import React, { useEffect } from 'react'
import { PlaySpotifyTrack, GetSpotifyDevices } from '../services/api/SpotifyTrackApiService';
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify?: {
            Player: any;
        };
    }
}

interface SpotifyTrackPlayerProps {
    trackIds: string[];
    token: string;
    changeTrack?: (trackId: string) => void;
    playTrack?: (trackId: string) => void;
    pauseTrack?: () => void;
    nextTrack?: () => void;
    previousTrack?: () => void;
}

interface AccessToken {
    accessToken: string;
}

const SpotifyTrackPlayer = ({trackIds, token}: SpotifyTrackPlayerProps) => {

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
    const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);

    const { spotifyUser } = useSpotifyAuth();

    const [player, setPlayer] = React.useState<any | undefined>(undefined);
    const [isPlayerReady, setPlayerReady] = React.useState(false);
    const [deviceId, setDeviceId] = React.useState<string | null>(null);

    // State for playback status
    const [is_paused, setPaused] = React.useState(true);
    const [is_active, setActive] = React.useState(false);
    const [current_track, setTrack] = React.useState<any>(null);

    // Inside your SpotifyTrackPlayer component

    React.useEffect(() => {

    if (!token) {
        console.error("No access token provided!");
        return;
    }

    const scriptAlreadyLoaded = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');

    if (scriptAlreadyLoaded) {
        console.warn("Spotify Player SDK script already loaded.");
        return;
    }

    // --- KEY CHANGE IS HERE ---
    // Define the callback function on the window object FIRST.
    window.onSpotifyWebPlaybackSDKReady = async () => {
        const spotifyPlayer = new window.Spotify.Player({
            name: 'Web Playback SDK Player',
            getOAuthToken: (cb: (token: string) => void) => {
                cb(token);
            },
            volume: 0.5
        });

        // Add listeners
        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
            console.log('Ready with Device ID', device_id);
            setDeviceId(device_id);
            setPlayerReady(true);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
            console.log('Device ID has gone offline', device_id);
            setPlayerReady(false);
        });

        spotifyPlayer.addListener('player_state_changed', (state: any) => {
            if (!state) {
                setActive(false);
                return;
            }
            setTrack(state.track_window.current_track);
            setPaused(state.paused);
            setActive(true);
        });

        // Connect the player
        spotifyPlayer.connect();
        
        setPlayer(spotifyPlayer);
    };

    // THEN, create and append the script tag to the document.
    // This triggers the script to load and execute.
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
        if (player) {
            player.disconnect();
        }
        // Optional: remove the script and the callback function
        // document.body.removeChild(script);
        // delete window.onSpotifyWebPlaybackSDKReady;
    };
    }, [token]); // The empty dependency array is correct here.

    const playTrack = () => {
        /* if(!player || !deviceId || trackIds.length === 0){
            console.error("Player not ready or no device ID or track IDs available.");
            return;
        }

        const trackId = trackIds[currentTrackIndex];

        PlaySpotifyTrack(trackId, deviceId, spotifyUser?.jwtToken || '')
        .then(data => console.log("Track played successfully:", data))
        .catch(error => console.error("Error playing track:", error)); */

        GetSpotifyDevices(spotifyUser?.jwtToken).then(data => console.log(data)).catch(err => console.error("Error fetching devices:", err));
    }

    return (
        <div>
            <button 
                className='bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600'
                onClick={playTrack}
                disabled={!isPlayerReady || !deviceId || trackIds.length === 0}
            >
                Play Track
            </button>
        </div>
    )
}

export default SpotifyTrackPlayer