import { Quiz } from "./Quiz";
import { PlayerInfo } from "./QuizPlayer";

export interface QuizRoomState {
    currentQuestionIndex: number;
    isActive: boolean;
    answers: Record<string, number>; // userId to answer mapping
    questionEndTime?: number; // timestamp when the question ended
}

export interface QuizRoom {
    roomCode: string;
    hostUserId: string;
    quizId: string;
    players: PlayerInfo[];
    state: QuizRoomState;
    quizData?: Quiz;
}