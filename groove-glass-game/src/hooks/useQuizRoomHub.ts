import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { ConnectionStatus } from "@/models/constants/ConnectionStatus";

const useLatest = (callback) => {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  return ref;
};

export const useQuizRoomHub = ({ onRoomCreated, onPlayerJoined, onPlayerLeft, onStateUpdated, onRoom, enabled = true }) => {

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus.Connecting | ConnectionStatus.Connected | ConnectionStatus.Disconnected>(ConnectionStatus.Connecting);

    const onRoomCreatedRef = useLatest(onRoomCreated);
    const onPlayerJoinedRef = useLatest(onPlayerJoined);
    const onPlayerLeftRef = useLatest(onPlayerLeft);
    const onStateUpdatedRef = useLatest(onStateUpdated);
    const onRoomRef = useLatest(onRoom);

    useEffect(() => {
        if (!enabled) {
            setConnectionStatus(ConnectionStatus.Disconnected);
            return;
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_BACKEND_QUIZ_URL}/quizRoomHub`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("RoomCreated", (...args) => onRoomCreatedRef.current?.(...args));
        connection.on("PlayerJoined", (...args) => onPlayerJoinedRef.current?.(...args));
        connection.on("PlayerLeft", (...args) => onPlayerLeftRef.current?.(...args));
        connection.on("StateUpdated", (...args) => onStateUpdatedRef.current?.(...args));
        connection.on("Room", (...args) => onRoomRef.current?.(...args));

        connection.start()
            .then(() => {
                console.log("Connected to quiz room hub");
                connectionRef.current = connection;
                setConnectionStatus(ConnectionStatus.Connected);
            })
            .catch(err => {
                console.error("Error connecting to quiz room hub:", err);
                setConnectionStatus(ConnectionStatus.Disconnected);
            });

        return () => {
            connection.stop().catch(err => console.error("Error disconnecting from quiz room hub:", err));
        };

    }, [enabled]);

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

    const getRoom = useCallback((roomCode: string) => {
        connectionRef.current?.invoke("GetRoom", roomCode);
    }, []);

    return {
        createRoom,
        joinRoom,
        updateState,
        leaveRoom,
        getRoom,
        connectionStatus
    }

}
