import { toast } from "@/hooks/use-toast";
import { Quiz, QuizOption } from "@/models/interfaces/Quiz";
import { SpotifyUserClientResponse } from "@/models/interfaces/SpotifyUserClientResponse";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
interface PlayTrackRequest {
    trackId: string;
    deviceId: string;
}

// Helper to get and refresh JWT token if needed
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, spotifyUser: any) {
    let jwtToken = spotifyUser.jwtToken;
    let jwtTokenExpiration = spotifyUser.jwtTokenExpiration;
    let jwtRefreshToken = spotifyUser.jwtRefreshToken;
    let spotifyUserId = spotifyUser.userId;

    const nowUtc = Date.now();
    const expirationUtc = new Date(jwtTokenExpiration).getTime();
    const jwtTokenTimeLeft = expirationUtc - nowUtc;

    // If token is expired or about to expire (e.g., < 1 min left)
    if (jwtTokenTimeLeft < 60000) {
        // Call refresh endpoint
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/spotify/refresh-jwt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                SpotifyUserId: spotifyUserId,
                JwtRefreshToken: jwtRefreshToken
            })
        });
        if (resp.ok) {
            const data = await resp.json();
            jwtToken = data.JwtToken;
            jwtRefreshToken = data.JwtRefreshToken;
            // Update localStorage/context
            const updatedUser = { ...spotifyUser, jwtToken, jwtRefreshToken };
            localStorage.setItem('spotifyUser', JSON.stringify(updatedUser));
        } else {
            throw new Error('Failed to refresh JWT token');
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