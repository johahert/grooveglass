import { HubConnection } from "@microsoft/signalr";
import { QuizRoom } from "./QuizRoom";
import { User } from "./User";

export interface SignalRContextType {
    connection: HubConnection | null;
    room: QuizRoom | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    createRoom(displayName: string, quizId: number): Promise<void>;
    joinRoom(displayName: string, roomCode: string): Promise<void>;
    leaveRoom(): Promise<void>;
    startGame(): Promise<void>;
    submitAnswer(answerIndex: number): Promise<void>;
    nextQuestion(): Promise<void>;
}