import { useEffect, useMemo, useState } from 'react';
import { Timer } from './Timer';
import { useSignalR } from '../providers/SignalRContextProvider';
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';
import { PlaySpotifyTrack } from '../services/api/SpotifyTrackApiService';
import PlaybackControl from './PlaybackControl';
import SoundwaveBackground from './SoundwaveBackground';

function QuizGameView() {
    const { room, user, submitAnswer, nextQuestion } = useSignalR();
    const { spotifyUser } = useSpotifyAuth();
    const [, setForceRender] = useState(0);

    const answeredIndex = useMemo(() => room?.state.answers?.[user.id], [room, user]);

    const allPlayersAnswered = useMemo(() => {
        if (!room) return false;
        return room.players.length === Object.keys(room.state.answers ?? {}).length;
    }, [room]);

    // THE FIX: This effect sets up an interval to force the component to re-render every second.
    useEffect(() => {
        if(allPlayersAnswered) return;

        const interval = setInterval(() => {
            // By updating state, we trigger a re-render, which re-evaluates `isTimeUp`.
            setForceRender(c => c + 1);
        }, 1000);

        // Cleanup the interval when the component unmounts.
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const playTrack = async () => {
            if (!spotifyUser?.selectedDevice.id) return;
            console.log("Spotify User Selected Device:", spotifyUser.selectedDevice.id);

            console.log(room?.quizData)

            console.log(currentQuestion?.correctAnswer)

            console.log("Current Question Index:", room?.state?.currentQuestionIndex);
            const currentTrackId = room?.quizData?.questions[room.state.currentQuestionIndex]?.spotifyTrack;
            console.log("Current Track ID:", currentTrackId);

            await PlaySpotifyTrack(currentTrackId, spotifyUser?.selectedDevice.id, spotifyUser);
        }
        playTrack();

    }, [room?.state?.currentQuestionIndex])

    const currentQuestion = useMemo(() => {
        if (!room?.quizData?.questions) return null;
        return room.quizData.questions[room.state.currentQuestionIndex];
    }, [room]);

    if (!room || !user || !currentQuestion) {
        return <div className="text-center text-gray-500">Loading...</div>;
    }

    const isHost = user.id === room.hostUserId;
    const hasAnswered = room.state.answers?.[user.id] !== undefined;
    const isTimeUp = room.state.questionEndTime ? Date.now() > room.state.questionEndTime : false;

    const answerColors = ['bg-red-600', 'bg-blue-600', 'bg-yellow-600', 'bg-green-600'];
    const answerHoverColors = ['hover:bg-red-500', 'hover:bg-blue-500', 'hover:bg-yellow-500', 'hover:bg-green-500'];

    return (
        <div className="bg-primary-element p-8 rounded-xl shadow-2xl border border-subtle">

            <PlaybackControl
                selectedDevice={spotifyUser?.selectedDevice?.id}
                currentTrack={currentQuestion?.spotifyTrack}
            />

            <div className="flex justify-between items-end mb-6 border border-white/10 bg-white/5 p-4 rounded-lg">
                <div className='h-full flex flex-1 flex-col justify-end'>

                    <h2 className="text-lg text-white/25">Question {room.state.currentQuestionIndex + 1}</h2>
                    <h3 className="text-3xl">{currentQuestion.question}</h3>
                </div>
                {room.state.questionEndTime && !allPlayersAnswered && <Timer endTime={room.state.questionEndTime} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.answers.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => submitAnswer(index)}
                        disabled={hasAnswered || isTimeUp}
                        className={`p-6 text-xl font-semibold rounded-lg transition duration-300 text-white border border-white/15 ${(
                            allPlayersAnswered || isTimeUp
                        ) && index === currentQuestion.correctAnswer ? 'bg-primary-400' : 'bg-white/5 hover:bg-white/10'} ${answeredIndex === index ? 'ring ring-primary-300' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {answer}
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
                <div className="mb-4 md:mb-0">
                    <p>{Object.keys(room.state.answers ?? {}).length} / {room.players.length} players have answered</p>
                </div>
                {isHost && (isTimeUp || allPlayersAnswered) && (
                    <button onClick={nextQuestion} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                        {room.state.currentQuestionIndex >= (room.quizData?.questions.length ?? 0) - 1 ? 'Show Final Scores' : 'Next Question'}
                    </button>
                )}
            </div>
        </div>
    );
}
export default QuizGameView;