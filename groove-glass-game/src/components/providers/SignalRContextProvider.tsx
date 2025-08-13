import { SampleQuiz } from "@/models/interfaces/Quiz";
import { PlayerInfo } from "@/models/interfaces/QuizPlayer";
import { QuizRoom, QuizRoomState } from "@/models/interfaces/QuizRoom";
import { SignalRContextType } from "@/models/interfaces/SignalRContextType";
import { User } from "@/models/interfaces/User";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const useSignalR = (): SignalRContextType => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error("useSignalR must be used within a SignalRContextProvider");
    }
    return context;
}

export const SignalRContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [room, setRoom] = useState<QuizRoom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [user, _setUser] = useState<User | null>(null);
    const userRef = useRef<User | null>(null);

    const setUser = (data: User | null) => {
        userRef.current = data;
        _setUser(data); 
    }
    
    const connectToHub = useCallback(async (currentUser: User, currentRoomCode?: string) => {
        const url = `${import.meta.env.VITE_BACKEND_QUIZ_URL}/quizRoomHub`;

        const newConnection = new HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        const updatePlayerInRoom = (player: PlayerInfo) => {
             setRoom(prevRoom => {
                if (!prevRoom) return null;
                const newPlayers = prevRoom.players.map(p => p.userId === player.userId ? player : p);
                return { ...prevRoom, players: newPlayers };
            });
        }

        newConnection.on('RoomCreated', (roomData: QuizRoom) => {
            console.log('Room Created:', roomData);

            const hostUser = userRef.current;
            if (hostUser && roomData.hostUserId === hostUser.id) {
                const hostAsPlayer: PlayerInfo = {
                    userId: hostUser.id,
                    displayName: hostUser.displayName,
                    score: 0,
                };
                // Add the host to the players list before setting state.
                roomData.players = [hostAsPlayer];
            }

            setRoom(roomData);
            sessionStorage.setItem('quizhub_roomcode', roomData.roomCode);
            navigate('/lobby');
        });

        newConnection.on('PlayerJoined', (newPlayer) => {
            console.log('Player Joined:', newPlayer);
            setRoom(prevRoom => prevRoom ? { ...prevRoom, players: [...prevRoom.players, newPlayer] } : null);
        });

        newConnection.on('PlayerDisconnected', (disconnectedPlayer: PlayerInfo) => {
            console.log('Player Disconnected:', disconnectedPlayer.displayName);
            updatePlayerInRoom(disconnectedPlayer);
        });

        newConnection.on('PlayerReconnected', (reconnectedPlayer: PlayerInfo) => {
            console.log('Player Reconnected:', reconnectedPlayer.displayName);
            updatePlayerInRoom(reconnectedPlayer);
        });

        newConnection.on('PlayerLeft', (leftPlayer) => {
            console.log('Player Left:', leftPlayer);
            setRoom(prevRoom => prevRoom ? { ...prevRoom, players: prevRoom.players.filter(p => p.userId !== leftPlayer.userId) } : null);
        });
        
        newConnection.on('Error', (errorMessage: string) => {
            console.error('SignalR Error:', errorMessage);
            setError(errorMessage);
        });

        newConnection.on('Room', (roomData: QuizRoom) => {
            console.log('Received room data:', roomData);
            setRoom(roomData);
            if(roomData) navigate('/lobby');
        });

        newConnection.on('RoomNotFound', () => {
            console.error('Room not found!');
            setError('The room code is invalid or the room has closed.');
            sessionStorage.removeItem('quizhub_roomcode');
            setRoom(null);
            navigate('/');
        });
        
        newConnection.on('StateUpdated', (newState) => {
            console.log('State Updated:', newState);
            setRoom(prevRoom => prevRoom ? { ...prevRoom, state: newState } : null);
        });

        try {
            await newConnection.start();
            console.log('SignalR Connected!');
            setConnection(newConnection);

            // --- Reconnection Logic ---
            if (currentRoomCode) {
                console.log(`Attempting to rejoin room ${currentRoomCode}...`);
                await newConnection.invoke('JoinRoom', currentRoomCode, currentUser.id, currentUser.displayName);
            }

        } catch (e) {
            console.error('Connection failed: ', e);
            setError('Could not connect to the server.');
        } finally {
            setIsLoading(false);
        }

    }, [navigate]);

    useEffect(() => {
        const savedUser = sessionStorage.getItem('quizhub_user');
        const savedRoomCode = sessionStorage.getItem('quizhub_roomcode');
        
        if (savedUser) {
            const currentUser = JSON.parse(savedUser) as User;
            setUser(currentUser);
            connectToHub(currentUser, savedRoomCode ?? undefined);
        } else {
            setIsLoading(false);
        }

    }, []);

    const updateServerState = async(newState: Partial<QuizRoomState>) => {
        if (connection && room) {
            const finalState: QuizRoomState = { ...room.state, ...newState };
            await connection.invoke("UpdateState", room.roomCode, finalState);
        }
    }

    const createRoom = async (displayName: string, quizId: number) => {
        const currentUser: User = { id: `user_${Date.now()}`, displayName };
        setUser(currentUser);
        sessionStorage.setItem('quizhub_user', JSON.stringify(currentUser));

        if (!connection) {
             await connectToHub(currentUser);
             await new Promise(resolve => setTimeout(resolve, 200));
        }
        await connection?.invoke('CreateRoom', currentUser.id, displayName, quizId);
    };

    const joinRoom = async (displayName: string, roomCode: string) => {
        const currentUser = { id: `user_${Date.now()}`, displayName };
        setUser(currentUser);
        sessionStorage.setItem('quizhub_user', JSON.stringify(currentUser));
        sessionStorage.setItem('quizhub_roomcode', roomCode.toUpperCase());

        if (!connection) {
            await connectToHub(currentUser, roomCode.toUpperCase());
        } else {
            await connection.invoke('JoinRoom', roomCode.toUpperCase(), currentUser.id, displayName);
        }
    };

    const leaveRoom = async () => {
        if (connection && room && user) {
            // This is a graceful leave, so we don't need the grace period.
            // We can add a specific method for this if needed, e.g., "ForceLeaveRoom"
            await connection.invoke('LeaveRoom', room.roomCode, user.id);
        }
        setRoom(null);
        setUser(null);
        sessionStorage.clear();
        navigate('/');
        // Force a full reconnect if they try to join again
        await connection?.stop();
        setConnection(null);
    };

    const startGame = async () => {
        if (connection && room && user && room.hostUserId === user.id) {
            const newState: QuizRoomState = {
                isActive: true,
                currentQuestionIndex: 0,
                answers: {},
                questionEndTime: Date.now() + 30000 //30 sec TODO - Change to const or variable
            }
            await updateServerState(newState);
        }
    };

    const submitAnswer = async (answerIndex: number) => {
        if(room && user && room.state.answers[user.id] === undefined) {
            const newAnswers = { ...room.state.answers, [user.id]: answerIndex };
            await updateServerState({ answers: newAnswers });
        }
    }

    const nextQuestion = async () => {
        if(room && user && room.hostUserId === user.id && room.quizData && room.state.isActive) {
            const isLastQuestion = room.state.currentQuestionIndex >= room.quizData.questions.length - 1;
            if (isLastQuestion) {
                await updateServerState({ isActive: false, questionEndTime: null });
            } else {
                await updateServerState({
                    currentQuestionIndex: room.state.currentQuestionIndex + 1,
                    questionEndTime: Date.now() + 30000,
                    answers: {}
                });
            }

        }
    }

    const value: SignalRContextType = {
        connection,
        room,
        user,
        isLoading,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        submitAnswer,
        nextQuestion
    };

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    );

}