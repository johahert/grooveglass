import { Quiz, QuizOption } from "@/models/interfaces/Quiz";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
interface PlayTrackRequest {
    trackId: string;
    deviceId: string;
}

export const PlaySpotifyTrack = async (trackId: string, deviceId: string, token:string): Promise<any> => {
    try{
        const response = await fetch(`${BACKEND_BASE_URL}/spotify/play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ trackId, deviceId } as PlayTrackRequest),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error playing track:", errorData);
            throw new Error(errorData.error || 'Failed to play track');
        }
        const data = await response.json();
        console.log("Track played successfully:", data);

    }
    catch (error) {
        console.error("Error in PlaySpotifyTrack:", error);
        throw error;
    }
}

export const GetSpotifyDevices = async (token: string): Promise<any> => {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/spotify/devices`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching devices:", errorData);
            throw new Error(errorData.error || 'Failed to fetch devices');
        }

        const data = await response.json();
        console.log("Devices fetched successfully:", data);
        return data;

    } catch (error) {
        console.error("Error in GetSpotifyDevices:", error);
        throw error;
    }
}

export const SaveQuiz = async (quiz: Quiz, token: string): Promise<any> => {
    try {
        if (!quiz.title || quiz.questions.length === 0) {
            throw new Error("Quiz title and questions are required");
        }

        const response = await fetch(`${BACKEND_BASE_URL}/spotify/quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(quiz),
        })

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error saving quiz:", errorData);
            throw new Error(errorData.error || 'Failed to save quiz');
        }

        const data = await response.json();
        console.log("Quiz saved successfully:", data);

    } catch (error) {
        console.error("Error saving quiz:", error);
        throw error;
    }
}

export const GetQuizzes = async (token: string): Promise<QuizOption[]> => {
    try {
        if(!token) throw new Error("No token provided");

        const response = await fetch(`${BACKEND_BASE_URL}/spotify/quizzes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData || "Could not fetch quizzes");
        }

        const data: QuizOption[] = await response.json();
        return data;

    } catch (err){
        console.error(err);        
    }
}

//TODO - dedicated error handler