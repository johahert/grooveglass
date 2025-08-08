import { SpotifyUserClientResponse } from "@/models/interfaces/SpotifyUserClientResponse";
import { createContext, useContext, useEffect, useState } from "react";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const SPOTIFY_SCOPES = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
].join(" ");

export const SpotifyAuthContext = createContext<any>(null);

export function SpotifyAuthProvider({ children }: { children: React.JSX.Element }) {
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUserClientResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('spotifyUser');
            if (storedUser) {
                console.log("Found stored Spotify user in localStorage.");
                setSpotifyUser(JSON.parse(storedUser));
                setLoading(false);
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get("code");
                if(code){
                    console.log("Spotify Auth Code: ", code);
                    await exchangeCodeForToken(code);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
                setLoading(false);
            }
            console.log("Spotify User State Initialized:", spotifyUser);
        };
        checkAuth();
    }, []);

    const handleLogin = () => {
        const authUrl = new URL("https://accounts.spotify.com/authorize");
        authUrl.search = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri: SPOTIFY_REDIRECT_URI,
            scope: SPOTIFY_SCOPES,
            show_dialog: 'true',
        }).toString();
        window.location.href = authUrl.toString();
    };

    const exchangeCodeForToken = async (code: string) => {
        console.log("Sending code to backend to be exchanged for a token.");
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/spotify/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });
            const data: SpotifyUserClientResponse = await response.json();
            if (!response.ok) {
                throw new Error((data as any).error || 'Failed to exchange code for token');
            }

            console.log("Received data from backend:", data);

            setSpotifyUser(data);
            localStorage.setItem('spotifyUser', JSON.stringify(data));

        } catch (error) {
            console.error("Error exchanging code for token:", error);
            alert("An error occurred during login. Please try again.");
        }
    };

    const getAccessToken = async (trackId: string): Promise<any> => {
        try {
            const token = spotifyUser?.jwtToken;
            if (!token) {
                console.error("No token available for playing track");
                return null;
            }

            const response = await fetch(`${BACKEND_BASE_URL}/spotify/access-token`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            })

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error playing track:", errorData);
            } 

            const data = await response.json();

            console.log("Access Token for track:", data);

            return data;

        } catch (error) {
            console.error("Error in playTrack:", error);
            return null;
        }
    }

    const value = {
        spotifyUser,
        isAuthenticated: !!spotifyUser,
        loading,
        login: handleLogin,
        logout: () => {
            setSpotifyUser(null);
            localStorage.removeItem('spotifyUser');
            window.location.href = SPOTIFY_REDIRECT_URI; 
        },
        getAccessToken: getAccessToken,
    };

    return <SpotifyAuthContext.Provider value={value}>{children}</SpotifyAuthContext.Provider>;
};

export const useSpotifyAuth = () => {
    const context = useContext(SpotifyAuthContext);
    if (!context) {
        throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
    }
    return context;
};
