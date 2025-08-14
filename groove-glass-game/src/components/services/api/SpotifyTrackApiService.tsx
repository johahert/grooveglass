import { toast } from "@/hooks/use-toast";
import { Quiz, QuizOption } from "@/models/interfaces/Quiz";
import { SpotifyUserClientResponse } from "@/models/interfaces/SpotifyUserClientResponse";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
interface PlayTrackRequest {
    trackId: string;
    deviceId: string;
}

// Helper to get and refresh JWT token if needed
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, spotifyUser: SpotifyUserClientResponse) {
    let jwtToken = spotifyUser.jwtToken;
    let jwtTokenExpiration = spotifyUser.jwtTokenExpiration;
    let jwtRefreshToken = spotifyUser.jwtRefreshToken;
    let spotifyUserId = spotifyUser.spotifyUserId;

    const nowUtc = Date.now();
    const expirationUtc = new Date(jwtTokenExpiration).getTime();
    const jwtTokenTimeLeft = expirationUtc - nowUtc;

    console.log("JWT token time left (ms):", jwtTokenTimeLeft);

    // If token is expired or about to expire (e.g., < 1 min left)
    if (jwtTokenTimeLeft < 60000) {
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = (async () => {
                try {
                    console.log("Refreshing JWT with:", { spotifyUserId, jwtRefreshToken });
                    
                    const resp = await fetch(`${BACKEND_BASE_URL}/spotify/refresh-jwt`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            spotifyUserId,
                            jwtRefreshToken
                        })
                    });
                    
                    if (resp.ok) {
                        const data = await resp.json();
                        console.log("JWT refreshed successfully:", data);
                        jwtToken = data.jwtToken;
                        jwtRefreshToken = data.jwtRefreshToken;
                        // Update localStorage
                        const updatedUser = { ...spotifyUser, jwtToken, jwtRefreshToken };
                        console.log("Updated Spotify user:", updatedUser);
                        localStorage.setItem('spotifyUser', JSON.stringify(updatedUser));
                    } else {
                        throw new Error('Failed to refresh JWT token');
                    }
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            })();
        }
        
        // Wait for refresh to complete
        if (refreshPromise) {
            await refreshPromise;
            // Get the updated token from localStorage
            const updatedUserStr = localStorage.getItem('spotifyUser');
            if (updatedUserStr) {
                const updatedUser = JSON.parse(updatedUserStr);
                jwtToken = updatedUser.jwtToken;
            }
        }
    } 

    // Add Authorization header
    const headers = {
        ...(init.headers || {}),
        Authorization: `Bearer ${jwtToken}`,
    };
    return fetch(input, { ...init, headers });
}

export const PlaySpotifyTrack = async (trackId: string, deviceId: string, spotifyUser: any): Promise<any> => {
    try{
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/play`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackId, deviceId } as PlayTrackRequest),
            },
            spotifyUser
        );
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error playing track:", errorData);
            throw new Error(errorData.error || 'Failed to play track');
        }
        const data = await response.json();
        console.log("Track played successfully:", data);
    }
    catch (error) {
        handleError(error);
    }
}

export const GetSpotifyDevices = async (spotifyUser: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/devices`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            spotifyUser
        );
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching devices:", errorData);
            throw new Error(errorData.error || 'Failed to fetch devices');
        }
        const data = await response.json();
        console.log("Devices fetched successfully:", data);
        return data;
    } catch (error) {
        handleError(error);
    }
}

export const SaveQuiz = async (quiz: Quiz, spotifyUser: any): Promise<any> => {
    try {
        if (!quiz.title || quiz.questions.length === 0) {
            throw new Error("Quiz title and questions are required");
        }
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/quiz`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quiz),
            },
            spotifyUser
        );
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error saving quiz:", errorData);
            throw new Error(errorData.error || 'Failed to save quiz');
        }
        const data = await response.json();
        console.log("Quiz saved successfully:", data);
    } catch (error) {
        handleError(error);
    }
}

export const GetQuizzes = async (spotifyUser: SpotifyUserClientResponse): Promise<QuizOption[]> => {
    try {
        if(!spotifyUser || !spotifyUser.jwtToken) throw new Error("No user or token provided");
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/quizzes`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            spotifyUser
        );
        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData || "Could not fetch quizzes");
        }
        const data: QuizOption[] = await response.json();
        return data;
    } catch (err){
        handleError(err);        
    }
}

const handleError = (error: any) => {
    console.error("API Error:", error);
    toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: 'destructive'
    });
    throw new Error(error.message || "An error occurred while processing your request.");
}

// Pause Spotify track API
export const PauseSpotifyTrack = async (deviceId: string, spotifyUser: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/pause`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deviceId }),
            },
            spotifyUser
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to pause track');
        }
        return await response.json();
    } catch (error) {
        handleError(error);
    }
}