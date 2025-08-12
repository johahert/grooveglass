import { PlayerInfo } from "@/models/interfaces/QuizPlayer"

//store localstorage quiz player info
export const storeQuizPlayerInfo = (roomCode: string, displayName: string) => {
    const playerInfo: PlayerInfo = {
        userId: crypto.randomUUID(),
        displayName,
    };
    localStorage.setItem(`player_info_${roomCode}`, JSON.stringify(playerInfo));
}

export const getQuizPlayerInfo = (roomCode: string): PlayerInfo | null => {
    const playerInfo = localStorage.getItem(`player_info_${roomCode}`);
    if (playerInfo) {
        return JSON.parse(playerInfo);
    }
    return null;
}