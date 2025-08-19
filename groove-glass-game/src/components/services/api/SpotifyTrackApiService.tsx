import { toast } from "@/hooks/use-toast";
import { Quiz, QuizOption } from "@/models/interfaces/Quiz";
import { SpotifyUserClientResponse } from "@/models/interfaces/SpotifyUserClientResponse";
import { SpotifyAuthContextType, useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
interface PlayTrackRequest {
    trackId: string;
    deviceId: string;
}

// Helper to get and refresh JWT token if needed
let isRefreshing = false;
let refreshPromise: Promise<string |null> | null = null;

export async function fetchWithAuth(
    input: RequestInfo, 
    init: RequestInit = {}, 
    auth: SpotifyAuthContextType
) {
    let { spotifyUser, refreshTokens } = auth;

    if(!spotifyUser){
        throw new Error("Spotify user is not authenticated");
    }

    const nowUtc = Date.now();
    const expirationUtc = new Date(spotifyUser.jwtTokenExpiration).getTime();
    const isTokenExpired = expirationUtc - nowUtc < 60000;

    // If token is expired or about to expire (e.g., < 1 min left)
    if (isTokenExpired) {
        if (!isRefreshing) {
           console.log("Refreshing JWT token...");
           isRefreshing = true;
           refreshPromise = refreshTokens().finally(() => {
               isRefreshing = false;
               refreshPromise = null;
           });
        }

        console.log("Waiting for refresh to complete...");
        const newJwtToken = await refreshPromise;

        if (!newJwtToken) {
            console.error("Failed to refresh JWT token");
            throw new Error("Failed to refresh JWT token");
        }

        spotifyUser.jwtToken = newJwtToken;
    } 

    // Add Authorization header
    const headers = {
        ...init.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${spotifyUser.jwtToken}`,
    };

    return fetch(input, { ...init, headers });
}

export const PlaySpotifyTrack = async (trackId: string, deviceId: string, auth: SpotifyAuthContextType): Promise<any> => {
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
            auth
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

export const GetSpotifyDevices = async (auth: SpotifyAuthContextType): Promise<any> => {
    try {
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/devices`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            auth
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

export const GetQuizzes = async (auth: SpotifyAuthContextType): Promise<QuizOption[]> => {
    try {
        const response = await fetchWithAuth(
            `${BACKEND_BASE_URL}/spotify/quizzes`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            auth
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
export const PauseSpotifyTrack = async (deviceId: string, auth: SpotifyAuthContextType): Promise<any> => {
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
            auth
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