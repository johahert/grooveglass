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
].join(" ");

const SpotifyAuthContext = createContext(null);

export function SpotifyAuthProvider({ children }: { children: React.JSX.Element }) {
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUserClientResponse | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('spotifyUser');
        if (storedUser) {
            console.log("Found stored Spotify user in localStorage.");
            setSpotifyUser(JSON.parse(storedUser));
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");
            if(code){
                console.log("Spotify Auth Code: ", code);
                exchangeCodeForToken(code);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
       
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

    const value = {
        spotifyUser,
        login: handleLogin,
        logout: () => setSpotifyUser(null),
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
