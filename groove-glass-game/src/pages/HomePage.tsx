import React, { useState } from 'react';
import { useSignalR } from '@/components/providers/SignalRContextProvider';
import { useSpotifyAuth } from '@/components/providers/SpotifyAuthProvider';
import HostQuizSelect from './HostQuizSelect';
import { Link } from 'react-router-dom';
import SpotifyDeviceSelect from '@/components/customui/SpotifyDeviceSelect';
import CreateQuiz from './CreateQuiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Users, Plus, Music } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Switch } from '@/components/ui/switch';

function HomePage() {
    const { createRoom, joinRoom, error } = useSignalR();
    const { spotifyUser, loading } = useSpotifyAuth();
    const [displayName, setDisplayName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

    if(loading){
        return <div className='space-y-8'>
            {Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted dark:bg-accent rounded w-1/3 mb-2" />
                        <div className="h-4 bg-muted dark:bg-accent rounded w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 bg-muted dark:bg-accent rounded mb-2" />
                        <div className="h-8 bg-muted dark:bg-accent rounded w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>;
    }

    const handleValidation = () => {
        if (!displayName.trim()) {
            alert('Please enter a display name.');
            return false;
        }
        return true;
    };

    const handleCreateRoom = async () => {
        if (!handleValidation()) return;
        setIsSubmitting(true);

        if (selectedQuiz === null) {
            alert('Please select a quiz to host.');
            setIsSubmitting(false);
            return;
        }

        try {
            await createRoom(displayName, selectedQuiz);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!handleValidation() || !roomCode.trim()) {
            alert('Please enter a room code.');
            return;
        }
        setIsSubmitting(true);
        try {
            await joinRoom(displayName, roomCode);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {/* Get Started Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>Enter your display name to join or create a quiz</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            type="text"
                            placeholder="Enter your display name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Join Room Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Join a Quiz
                        </CardTitle>
                        <CardDescription>
                            Enter a room code to join an existing quiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomCode">Room Code</Label>
                            <Input
                                id="roomCode"
                                type="text"
                                placeholder="Enter 6-digit room code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="uppercase text-center font-mono tracking-wider"
                                maxLength={6}
                            />
                        </div>
                        <Button 
                            onClick={handleJoinRoom} 
                            variant='secondary'
                            disabled={isSubmitting || !displayName || !roomCode}
                            className="w-full"
                        >
                            {isSubmitting ? 'Joining...' : 'Join Room'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Create Room Section */}
                {spotifyUser ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Host a Quiz
                            </CardTitle>
                            <CardDescription>
                                Ready to challenge your friends? Create a new room now!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Quiz</Label>
                                <HostQuizSelect selectedQuiz={selectedQuiz} setSelectedQuiz={setSelectedQuiz} />
                            </div>
                            <Button 
                                onClick={handleCreateRoom} 
                                disabled={isSubmitting || !displayName || !selectedQuiz}
                                className="w-full"
                            >
                                {isSubmitting ? 'Creating...' : 'Create New Room'}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Music className="w-5 h-5" />
                                Host a Quiz
                            </CardTitle>
                            <CardDescription>
                                You need to connect your Spotify account to create or host quizzes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" disabled className="w-full">
                                Connect Spotify to Host
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create Quiz Section */}
            {spotifyUser && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Music className="w-5 h-5" />
                            Create New Quiz
                        </CardTitle>
                        <CardDescription>
                            Build your own custom quiz with your favorite tracks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateQuiz />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default HomePage;