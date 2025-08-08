import { useEffect, useState, useCallback } from 'react'; // 1. Import useCallback
import { QuizRoom } from '@/models/interfaces/QuizRoom';
import { useQuizRoomHub } from '@/hooks/useQuizRoomHub';
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';
import { PlayerInfo } from '@/models/interfaces/QuizPlayer';
import { toast } from '@/hooks/use-toast';
import { Card } from '../ui/card';

const HostQuizRoom = () => {
    const [room, setRoom] = useState<QuizRoom | null>(null);
    const [players, setPlayers] = useState<PlayerInfo[]>([]); // Initialize with []
    const [quizState, setQuizState] = useState(null);


    const { spotifyUser } = useSpotifyAuth();

    // 2. Wrap all callbacks passed to the hook in useCallback
    const onRoomCreated = useCallback((room: QuizRoom) => {
        setRoom(room);
    }, []); // setRoom is stable, so dependencies are empty

    const onPlayerJoined = useCallback((player: PlayerInfo) => {
        setPlayers(prev => (prev ? [...prev, player] : [player]));
        toast({
            title: "Player Joined",
            description: `${player.displayName} has joined the quiz`,
        });
    }, []); // setPlayers is stable

    const onPlayerLeft = useCallback((player: PlayerInfo) => {
        setPlayers(prev => (prev ? prev.filter(p => p.userId !== player.userId) : []));
    }, []); // setPlayers is stable

    const onStateUpdated = useCallback((state: any) => {
        setQuizState(state);
    }, []); // setQuizState is stable

    const { createRoom, joinRoom } = useQuizRoomHub({
        onRoomCreated,
        onPlayerJoined,
        onPlayerLeft,
        onStateUpdated,
        onRoom: (room: QuizRoom) => {}
    });

    useEffect(() => {
        if (room && spotifyUser) {
            console.log("Joining room with code:", room.roomCode);
            joinRoom(room.roomCode, spotifyUser.id, spotifyUser.displayName);
        }
    }, [room, spotifyUser, joinRoom]);

    return (
        <div className='grid grid-cols-2 gap-4'>
        <Card className="w-full  bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-2 px-4 mt-4 text-white">
            <h1>Host Quiz Room</h1>
            {spotifyUser && (
                <button onClick={() => createRoom(spotifyUser.id, 123)}>
                    Create Room
                </button>
            )}
            {room && (
                <div>
                    <h2>Room Code: {room.roomCode}</h2>
                    <h3>Host: {room.hostUserId}</h3>
                    <h3>Quiz ID: {room.quizId}</h3>
                    {players && players.length > 0 && (
                        <>
                            <h3>Connected players: {players.length}</h3>
                            {players.map(player => (
                                <h4 key={player.userId}> 
                                    {player.displayName}
                                </h4>
                            ))}
                        </>
                    )}
                </div>
            )}
        </Card>
        <Card className='w-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-2 px-4 mt-4 text-white'>

        </Card>
        </div>
    );
};

export default HostQuizRoom;