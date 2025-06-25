import { createContext, useContext, useEffect, useState } from "react";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

const SpotifyAuthContext = createContext(null);

export function SpotifyAuthProvider({ children }: { children: React.JSX.Element }) {
    const [spotifyToken, setSpotifyToken] = useState(null);

    useEffect(() => {
        console.log(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if(code){
            console.log("Spotify Auth Code: ", code);
            exchangeCodeForToken(code);
            window.history.replaceState({}, document.title, window.location.pathname);
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

    const exchangeCodeForToken = async (code) => {
        console.log("Sending code to backend to be exchanged for a token.");
        // In a real app, this is where you would make a POST request to your C# backend.
        // The backend would then securely exchange the code for an access token.
        try {
            // !! PSEUDO-CODE for backend call !!
            // const response = await fetch('https://your-backend.com/api/spotify/token', { ... });
            // const data = await response.json();
            // setSpotifyToken(data.access_token);
            
            alert("Login successful! Check the console. You would now be logged in.");
            setSpotifyToken("DUMMY_TOKEN_REPRESENTING_SUCCESSFUL_LOGIN");
        } catch (error) {
            console.error("Error exchanging code for token:", error);
            alert("An error occurred during login. Please try again.");
        }
        
    };

    const value = {
        spotifyToken,
        login: handleLogin,
        logout: () => setSpotifyToken(null),
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
