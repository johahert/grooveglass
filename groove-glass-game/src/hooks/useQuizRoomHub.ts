import { useCallback, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export const useQuizRoomHub = ({ onRoomCreated, onPlayerJoined, onPlayerLeft, onStateUpdated, onRoom }) => {

    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_BACKEND_QUIZ_URL}/quizRoomHub`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("RoomCreated", onRoomCreated);
        connection.on("PlayerJoined", onPlayerJoined);
        connection.on("PlayerLeft", onPlayerLeft);
        connection.on("StateUpdated", onStateUpdated);
        connection.on("Room", onRoom);

        connection.start()
            .then(() => {
                console.log("Connected to quiz room hub");
                connectionRef.current = connection;
            })
            .catch(err => console.error("Error connecting to quiz room hub:", err));

        return () => {
            connection.stop().catch(err => console.error("Error disconnecting from quiz room hub:", err));
        };

    }, [onRoomCreated, onPlayerJoined, onPlayerLeft, onStateUpdated, onRoom]);

    const createRoom = useCallback((hostUserId: string, quizId: number) => {
        connectionRef.current?.invoke("CreateRoom", hostUserId, quizId);
    }, []);

    const joinRoom = useCallback((roomCode, userId, displayName) => {
        connectionRef.current?.invoke("JoinRoom", roomCode, userId, displayName);
    }, []);

    const updateState = useCallback((roomCode, newState) => {
        connectionRef.current?.invoke("UpdateState", roomCode, newState);
    }, []);

    const leaveRoom = useCallback((roomCode, userId) => {
        connectionRef.current?.invoke("LeaveRoom", roomCode, userId);
    }, []);

    const getRoom = useCallback((roomCode) => {
        connectionRef.current?.invoke("GetRoom", roomCode);
    }, []);

    return {
        createRoom,
        joinRoom,
        updateState,
        leaveRoom,
        getRoom,
    }

}
