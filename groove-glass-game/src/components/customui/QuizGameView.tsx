import { useMemo } from "react";
import { Timer } from "./Timer";
import { useSignalR } from "../providers/SignalRContextProvider";

function QuizGameView() {
    const { room, user, submitAnswer, nextQuestion } = useSignalR();

    const currentQuestion = useMemo(() => {
        if (!room || !room.quizData) return null;
        return room.quizData.questions[room.state.currentQuestionIndex];
    }, [room]);

    if (!room || !user || !currentQuestion) return <div>Loading...</div>;

    const isHost = user.id === room.hostUserId;
    const hasAnswered = room.state.answers[user.id] !== undefined;
    const allPlayersAnswered = room.players.length === Object.keys(room.state.answers).length;
    const isTimeUp = room.state.questionEndTime ? Date.now() > room.state.questionEndTime : false;

    const answerColors = ['bg-red-600', 'bg-blue-600', 'bg-yellow-600', 'bg-green-600'];
    const answerHoverColors = ['hover:bg-red-500', 'hover:bg-blue-500', 'hover:bg-yellow-500', 'hover:bg-green-500'];

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
            {/* Header: Question Number and Timer */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Question {room.state.currentQuestionIndex + 1}</h2>
                {room.state.questionEndTime && <Timer endTime={room.state.questionEndTime} />}
            </div>

            {/* Question Text */}
            <div className="bg-gray-900 p-6 rounded-lg mb-8 text-center">
                <h3 className="text-3xl font-semibold">{currentQuestion.question}</h3>
            </div>

            {/* Answer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.answers.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => submitAnswer(index)}
                        disabled={hasAnswered || isTimeUp}
                        className={`p-6 text-xl font-semibold rounded-lg transition duration-300 text-white ${answerColors[index]} ${!hasAnswered && !isTimeUp ? answerHoverColors[index] : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {answer}
                    </button>
                ))}
            </div>

            {/* Footer: Player Status and Host Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
                <div className="mb-4 md:mb-0">
                    <p>{Object.keys(room.state.answers).length} / {room.players.length} players have answered</p>
                </div>
                {isHost && (isTimeUp || allPlayersAnswered) && (
                    <button onClick={nextQuestion} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                        {room.state.currentQuestionIndex >= room.quizData.questions.length - 1 ? 'Show Final Scores' : 'Next Question'}
                    </button>
                )}
            </div>
        </div>
    );
}
export default QuizGameView;