import { useEffect, useMemo, useState } from 'react';
import { Timer } from './Timer';
import { useSignalR } from '../providers/SignalRContextProvider';
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';
import { PlaySpotifyTrack } from '../services/api/SpotifyTrackApiService';
import PlaybackControl from './PlaybackControl';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';

function QuizGameView() {
    const { room, user, submitAnswer, nextQuestion } = useSignalR();
    const auth = useSpotifyAuth();
    const spotifyUser = auth.spotifyUser;
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

            await PlaySpotifyTrack(currentTrackId, spotifyUser?.selectedDevice.id, auth);
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

    return (
        <Card>
            <CardHeader>
                <PlaybackControl
                    selectedDevice={spotifyUser?.selectedDevice?.id}
                    currentTrack={currentQuestion?.spotifyTrack}
                />
                    <h2 className="text-lg text-white/25">Question {room.state.currentQuestionIndex + 1}</h2>
                    <h3 className="text-3xl">{currentQuestion.question}</h3>
                {room.state.questionEndTime && !allPlayersAnswered && <Timer endTime={room.state.questionEndTime} />}
            </CardHeader>
            <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.answers.map((answer, index) => (
                    <Button
                    size='lg'
                    key={index}
                    onClick={() => submitAnswer(index)}
                    disabled={hasAnswered || isTimeUp}
                    className={`p-8 text-xl ${(
                        allPlayersAnswered || isTimeUp
                    ) && index === currentQuestion.correctAnswer ? 'bg-teal-200' : 'bg-muted-foreground'} ${answeredIndex === index ? 'ring ring-teal-500' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {answer}
                    </Button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground">
                <p>{Object.keys(room.state.answers ?? {}).length} / {room.players.length} players have answered</p>
                {isHost && (isTimeUp || allPlayersAnswered) && (
                    <Button onClick={nextQuestion} >
                        {room.state.currentQuestionIndex >= (room.quizData?.questions.length ?? 0) - 1 ? 'Show Final Scores' : 'Next Question'}
                    </Button>
                )}
            </div>
            </CardContent>
        </Card>
    );
}
export default QuizGameView;