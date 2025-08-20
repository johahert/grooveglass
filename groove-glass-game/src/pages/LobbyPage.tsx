import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignalR } from '@/components/providers/SignalRContextProvider';
import QuizGameView from '@/components/customui/QuizGameView';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@radix-ui/react-select';
import { Car, Copy } from 'lucide-react';

function LobbyPage() {
    const { room, user, leaveRoom, startGame } = useSignalR();
    const navigate = useNavigate();

    // Redirect if user lands here without being in a room
    useEffect(() => {
        if (!room) {
            navigate('/');
        }
    }, [room, navigate]);

    if (!room || !user) {
        return <div>Loading...</div>; // Show spinner while redirecting or if data is missing
    }

    if(room.state.isActive) {
        return <QuizGameView />;
    }
    
    const isHost = user.id === room.hostUserId;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room.roomCode)
            .then(() => toast({
                title: 'Room code copied!',
                description: `Room code ${room.roomCode} has been copied to your clipboard.`,
                variant: 'default',
            }))
            .catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <Card >
            {room.state.currentQuestionIndex >= room.quizData.questions.length - 1 
            && !room.state.isActive 
            && room.quizData.questions.length > 1
            && (
            <CardHeader>
                <Card>
                    <CardHeader>
                        <div >
                            <h2 className="text-xl">Quiz is over!</h2>
                            <p >You can now view the final scores.</p>
                            {room.players?.map(player => (
                                <div key={player.userId}>
                                    <span className="font-semibold">{player.displayName}: </span>
                                    <span>{player.score ?? 0} points</span>
                                </div>
                            ))}
                        </div>
                    </CardHeader>
                </Card>
            </CardHeader>
            )}
            
            <CardHeader >
                <div className='flex w-full justify-between'>
                <div className='flex flex-col gap-2'>
                    <CardTitle className="flex items-center gap-2">
                            Lobby
                    </CardTitle>
                    <CardDescription>
                            Waiting for players to join the quiz room.
                    </CardDescription>
                </div>
               <Button 
                    className="border-2 border-dashed border-foreground"
                    variant='outline'
                    onClick={handleCopyCode}
                    title="Click to copy"
                    >
                    <Copy className='mr-2' size={24} />
                    <p className="text-3xl font-mono font-bold tracking-widest">{room.roomCode}</p>
                </Button>
                </div>
            
            </CardHeader>
            <CardContent>
                <CardTitle className="text-lg font-bold mb-2">Players ({room.players.length})</CardTitle>
                <Card>
                    <CardContent className='p-0 px-4'>
                        <ul className="divide-y divide-muted-accent">
                            {room.players.map((player) => (
                                <li key={player.userId} className="flex items-center justify-between w-full py-2 ">
                                    <span >{player.displayName}</span>
                                    <div className="flex items-center text-sm">
                                        {player.userId === room.hostUserId && <span className="text-accent-foreground">Host 👑</span>}
                                        {player.userId === user.id && <span className="text-blue-400">(You)</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Separator className="my-4" />
                <div className="flex justify-end gap-2" >
                    {isHost && (
                        <Button variant="default" size='lg' onClick={startGame} disabled={room.state.isActive || room.players.length < 1}>
                            {room.state.isActive ? 'Game in Progress' : 'Start Game'}
                        </Button>
                    )}
                    <Button variant="destructive" size='lg' onClick={leaveRoom}>
                        Leave Room
                    </Button>
                </div>
            </CardContent>

           
        </Card>
    );
}

export default LobbyPage;