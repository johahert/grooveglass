import React, { useState } from 'react';
import { useSignalR } from '@/components/providers/SignalRContextProvider';
import { useSpotifyAuth } from '@/components/providers/SpotifyAuthProvider';
import HostQuizSelect from './HostQuizSelect';
import { Link } from 'react-router-dom';
import SpotifyDeviceSelect from '@/components/customui/SpotifyDeviceSelect';

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
        <div className="space-y-12">
            {error && <div className="bg-red-900 border border-red-500 text-red-200 p-4 rounded-lg text-center">{error}</div>}
            
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Get Started</h2>
                <input
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Join Room Section */}
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 flex flex-col">
                    <h3 className="text-2xl font-semibold mb-4 text-center">Join a Quiz</h3>
                    <input
                        type="text"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase"
                        maxLength={6}
                    />
                    <button 
                        onClick={handleJoinRoom} 
                        disabled={isSubmitting || !displayName || !roomCode}
                        className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Joining...' : 'Join Room'}
                    </button>
                </div>


                {/* Create Room Section */}
                {spotifyUser && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 flex flex-col">
                        <h3 className="text-2xl font-semibold mb-4 text-center">Host a Quiz</h3>
                        <p className="text-gray-400 text-center mb-4 flex-grow">Ready to challenge your friends? Create a new room now!</p>
                        <div className='mb-4'>
                            <HostQuizSelect selectedQuiz={selectedQuiz} setSelectedQuiz={setSelectedQuiz} />
                        </div>
                        <button 
                            onClick={handleCreateRoom} 
                            disabled={isSubmitting || !displayName || !selectedQuiz}
                            className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create New Room'}
                        </button>
                    </div>
                )}

                {/* Create Quiz Section */}
                {spotifyUser && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 flex flex-col">
                        <h3 className="text-2xl font-semibold mb-4 text-center">Create Your Own Quiz</h3>
                        <p className="text-gray-400 text-center mb-4 flex-grow">
                            Want to make a custom quiz? Start building your own!
                        </p>
                        <Link
                            to="/create-quiz"
                            className="w-full mt-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-300"
                        >
                            Create Quiz
                        </Link>
                    </div>
                )}

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