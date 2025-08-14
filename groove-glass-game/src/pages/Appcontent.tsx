import { Routes, Route } from 'react-router-dom';
import { useSignalR } from '@/components/providers/SignalRContextProvider';
import HomePage from './HomePage';
import SpotifyUserToggle from '@/components/SpotifyUserToggle';
import LobbyPage from './LobbyPage';
import CreateQuiz from './CreateQuiz';
import RequireSpotifyLogin from '@/components/RequireSpotifyLogin';
import HostQuiz from './HostQuiz';

export const AppContent = () => {
    const { isLoading } = useSignalR();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-primary-background  text-white min-h-screen font-sans p-4 sm:p-8 relative">
            
            <div className="max-w-4xl mx-auto">
                <SpotifyUserToggle />
                <header className="text-center mb-12">
                     <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                        QuizHub 🧠
                    </h1>
                    <p className="text-gray-400 mt-2">The ultimate live quiz platform.</p>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/lobby" element={<LobbyPage />} />
                        <Route path='/create-quiz' element={
                            <RequireSpotifyLogin>
                                <CreateQuiz />
                            </RequireSpotifyLogin>
                        } />
                        {/* Catch-all route */}
                        <Route path="*" element={<HomePage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};