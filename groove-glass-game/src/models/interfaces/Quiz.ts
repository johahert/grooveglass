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