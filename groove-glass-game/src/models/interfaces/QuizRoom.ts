import { PlayerInfo } from "./QuizPlayer";

export interface QuizRoomState {
    currentQuestionIndex: number;
    isActive: boolean;
}

export interface QuizRoom {
    roomCode: string;
    hostUserId: string;
    quizId: string;
    players: PlayerInfo[];
    state: QuizRoomState;
}