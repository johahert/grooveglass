import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export const useQuizRoomHub = ({ onRoomCreated, onPlayerJoined, onPlayerLeft, onStateUpdated }) => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_BACKEND_BASE_URL}/quizRoomHub`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("RoomCreated", onRoomCreated);
        connection.on("PlayerJoined", onPlayerJoined);
        connection.on("PlayerLeft", onPlayerLeft);
        connection.on("StateUpdated", onStateUpdated);

        connection.start()
            .then(() => {
                console.log("Connected to quiz room hub");
                connectionRef.current = connection;
            })
            .catch(err => console.error("Error connecting to quiz room hub:", err));

        connectionRef.current = connection;

        return () => {
            connection.stop().catch(err => console.error("Error disconnecting from quiz room hub:", err));
        };

    }, [onRoomCreated, onPlayerJoined, onPlayerLeft, onStateUpdated]);

    const createRoom = (hostUserId, quizId) => 
        connectionRef.current?.invoke("CreateRoom", hostUserId, quizId);

    const joinRoom = (roomCode, userId, displayName) =>
        connectionRef.current.invoke("JoinRoom", roomCode, userId, displayName);

    const updateState = (roomCode, newState) =>
        connectionRef.current.invoke("UpdateState", roomCode, newState);

    const leaveRoom = (roomCode, userId) =>
        connectionRef.current.invoke("LeaveRoom", roomCode, userId);

    return {
        createRoom,
        joinRoom,
        updateState,
        leaveRoom,
    }

}
