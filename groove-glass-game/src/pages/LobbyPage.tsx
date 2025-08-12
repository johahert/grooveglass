import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignalR } from '@/components/providers/SignalRContextProvider';

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
    
    const isHost = user.id === room.hostUserId;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room.roomCode)
            .then(() => alert('Room code copied to clipboard!'))
            .catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white">Lobby</h2>
                    <p className="text-gray-400">Waiting for players to join...</p>
                </div>
                <div 
                    className="bg-gray-900 border-2 border-dashed border-gray-600 p-4 rounded-lg text-center cursor-pointer hover:border-blue-500 transition"
                    onClick={handleCopyCode}
                    title="Click to copy"
                >
                    <p className="text-gray-400 text-sm">ROOM CODE</p>
                    <p className="text-3xl font-mono font-bold tracking-widest text-white">{room.roomCode}</p>
                </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Players ({room.players.length})</h3>
                <ul className="space-y-3">
                    {room.players.map((player) => (
                        <li key={player.userId} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                            <span className="font-medium text-white">{player.displayName}</span>
                            <div className="flex items-center space-x-2 text-sm">
                                {player.userId === room.hostUserId && <span className="text-yellow-400">Host 👑</span>}
                                {player.userId === user.id && <span className="text-blue-400">(You)</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                {isHost && (
                    <button 
                        onClick={startGame} 
                        disabled={room.state.isActive || room.players.length < 1}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {room.state.isActive ? 'Game in Progress' : 'Start Game'}
                    </button>
                )}
                 <button 
                    onClick={leaveRoom} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                >
                    Leave Room
                </button>
            </div>
        </div>
    );
}

export default LobbyPage;