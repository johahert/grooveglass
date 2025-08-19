import { SpotifyUserClientResponse } from "@/models/interfaces/SpotifyUserClientResponse";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export interface SpotifyAuthContextType {
    spotifyUser: SpotifyUserClientResponse | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    refreshTokens: () => Promise<string |null>;
    updateSpotifyUser: (info: Partial<SpotifyUserClientResponse>) => void;
}

export const SpotifyAuthContext = createContext<SpotifyAuthContextType | null>(null);

export function SpotifyAuthProvider({ children }: { children: React.JSX.Element }) {
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUserClientResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshTokens = useCallback(async (): Promise<string | null> => {
        const currentUser = spotifyUser;
        if(!currentUser?.jwtRefreshToken || !currentUser?.spotifyUserId){
            console.error("No refresh token or user ID available for refreshing token.");
            setSpotifyUser(null);
            localStorage.removeItem('spotifyUser');
            return null;
        }

        try{
            console.log("Attempting to refresh JWT...");
            const response = await fetch(`${BACKEND_BASE_URL}/spotify/refresh-jwt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spotifyUserId: currentUser.spotifyUserId,
                    jwtRefreshToken: currentUser.jwtRefreshToken
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to refresh JWT token: ${response?.statusText}`);
            }

            const data = await response.json();
            
            const updatedUser: SpotifyUserClientResponse = {
                ...currentUser,
                jwtToken: data.jwtToken,
                jwtTokenExpiration: data.jwtTokenExpiration, 
                jwtRefreshToken: data.jwtRefreshToken, 
            };

            setSpotifyUser(updatedUser);
            localStorage.setItem('spotifyUser', JSON.stringify(updatedUser));
            console.log("JWT refreshed and state updated successfully.");

            return updatedUser.jwtToken;

        } catch (error) {
            console.error("Error refreshing token:", error);
            setSpotifyUser(null);
            localStorage.removeItem('spotifyUser');
            return null;
        }

        return null;
    }, [spotifyUser])

    useEffect(() => {
        const initializeAuth  = async () => {
            const storedUser = localStorage.getItem('spotifyUser');
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");

            if(code){
                try {
                    const response = await fetch(`${BACKEND_BASE_URL}/spotify/token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    const data: SpotifyUserClientResponse = await response.json();
                    if (!response.ok) throw new Error('Failed to exchange code');
                    
                    setSpotifyUser(data);
                    localStorage.setItem('spotifyUser', JSON.stringify(data));
                } catch (error) {
                    console.error("Error exchanging code for token:", error);
                } finally {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } else if (storedUser) {
                setSpotifyUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };

        initializeAuth ();

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

    // Method to add/update info to spotifyUser
    const updateSpotifyUser = (info: Partial<SpotifyUserClientResponse>) => {
        setSpotifyUser(prev => {
            const updated = { ...prev, ...info };
            localStorage.setItem('spotifyUser', JSON.stringify(updated));
            return updated;
        });
        console.log("Spotify user updated:", spotifyUser);
    };

    const updateSpotifyUserInfo = useCallback((info: Partial<SpotifyUserClientResponse>) => {
        setSpotifyUser(prev => {
            const updated = { ...prev, ...info };
            localStorage.setItem('spotifyUser', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const value = {
        spotifyUser,
        isAuthenticated: !!spotifyUser,
        loading,
        login: handleLogin,
        logout: () => {
            setSpotifyUser(null);
            localStorage.removeItem('spotifyUser');
        },
        updateSpotifyUser: updateSpotifyUserInfo,
        refreshTokens
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
