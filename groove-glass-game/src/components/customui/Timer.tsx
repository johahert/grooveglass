import { useEffect, useMemo, useState } from 'react';

export const Timer = ({ endTime }: { endTime: number }) => {
    const [timeLeft, setTimeLeft] = useState(Math.round((endTime - Date.now()) / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = Math.round((endTime - Date.now()) / 1000);
            setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0);
        }, 500);
        return () => clearInterval(interval);
    }, [endTime]);

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (timeLeft / 30) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle className="text-blue-500 transition-all duration-500 ease-linear" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{timeLeft}</span>
        </div>
    );
};
