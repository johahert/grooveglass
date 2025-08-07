export interface Quiz {
    title: string;
    questions: Question[];
}
export interface Question {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
    spotifyTrack: string;
}   

export const SampleQuiz: Quiz = {
    title: "Sample Quiz",
    questions: [
        {
            id: "1",
            question: "What is the capital of France?",
            answers: ["Berlin", "Madrid", "Paris", "Rome"],
            correctAnswer: 2,
            spotifyTrack: "spotify:track:6rqhFgbbKwnb9MLmUQDhG6" // Example track ID
        },
        {
            id: "2",
            question: "What is the largest planet in our solar system?",
            answers: ["Earth", "Mars", "Jupiter", "Saturn"],
            correctAnswer: 2,
            spotifyTrack: "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp" // Example track ID
        }
    ]
}