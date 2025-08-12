import { PlayerInfo } from "./QuizPlayer";

export interface QuizRoom {
    roomCode: string;
    hostUserId: string;
    quizId: string;
    players: PlayerInfo[];
}