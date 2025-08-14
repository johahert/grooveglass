import React, { useState } from 'react';
import { useSignalR } from '@/components/providers/SignalRContextProvider';
import { useSpotifyAuth } from '@/components/providers/SpotifyAuthProvider';
import HostQuizSelect from './HostQuizSelect';
import { Link } from 'react-router-dom';
import SpotifyDeviceSelect from '@/components/customui/SpotifyDeviceSelect';
import CreateQuiz from './CreateQuiz';

function HomePage() {
    const { createRoom, joinRoom, error } = useSignalR();
    const { spotifyUser } = useSpotifyAuth();
    const [displayName, setDisplayName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

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
            await createRoom(displayName, selectedQuiz); // Hardcoding quizId to 1
            
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
        <div className="space-y-12 ">
            {error && <div className="bg-red-900 border border-red-500 text-red-200 p-4 rounded-lg text-center">{error}</div>}
            
            <div className="bg-primary-element p-8 rounded-xl shadow-xl border relative border-subtle overflow-hidden">
                <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="rounded-full border-4 border-primary-700 opacity-30 w-[400px] h-[400px] animate-pulse"></div>
                        <div className="rounded-full border-2 border-primary-600 opacity-20 w-[600px] h-[600px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="rounded-full border-2 border-primary-700 opacity-10 w-[800px] h-[800px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl  mb-6 text-primary">Get Started</h2>
                    <input
                        type="text"
                        placeholder="Enter your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition shadow-md"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Join Room Section */}
                <div>
                    <div className="bg-primary-element p-8 rounded-xl shadow-xl border border-subtle flex flex-col">
                        <h3 className="text-2xl mb-4 ">Join a Quiz</h3>
                        <input
                            type="text"
                            placeholder="Enter room code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:outline-none transition uppercase"
                            maxLength={6}
                            />
                        <button 
                            onClick={handleJoinRoom} 
                            disabled={isSubmitting || !displayName || !roomCode}
                            className="w-full mt-auto bg-gradient-to-br from-primary-400 to-primary-700 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            {isSubmitting ? 'Joining...' : 'Join Room'}
                        </button>
                    </div>
                </div>


                {/* Create Room Section */}
                {spotifyUser && (
                    <div className="bg-primary-element p-8 rounded-xl shadow-2xl border border-subtle flex flex-col">
                        <h3 className="text-2xl mb-4 ">Host a Quiz</h3>
                        <p className="text-gray-400 mb-4 flex-grow">Ready to challenge your friends? Create a new room now!</p>
                        <div className='mb-4'>
                            <HostQuizSelect selectedQuiz={selectedQuiz} setSelectedQuiz={setSelectedQuiz} />
                        </div>
                        <button 
                            onClick={handleCreateRoom} 
                            disabled={isSubmitting || !displayName || !selectedQuiz}
                            className="w-full mt-auto bg-gradient-to-br from-purple-400 to-purple-700 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create New Room'}
                        </button>
                    </div>
                )}

               

                {spotifyUser && 
                <div className='col-span-2'>
                    <CreateQuiz />
                </div>
                }

                {!spotifyUser && (
                    <div>
                        <p className="text-gray-400 mb-4 flex-grow">
                            You need to connect your Spotify account to create or host quizzes.
                        </p>
                    </div>
                )}

                
            </div>
        </div>
    );
}

export default HomePage;