'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    endDate: Date;
    label?: string;
    onComplete?: () => void;
}

export default function CountdownTimer({
    endDate,
    label = 'Sale ends in:',
    onComplete,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = endDate.getTime();
            const difference = target - now;

            if (difference <= 0) {
                setIsExpired(true);
                onComplete?.();
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        };

        // Use setTimeout to avoid direct setState in effect body
        const initialTimer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 0);

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(timer);
        };
    }, [endDate, onComplete]);

    if (isExpired) {
        return null;
    }

    const timeUnits = [
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
    ];

    return (
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {label}
                </span>
                <div className="flex gap-2">
                    {timeUnits.map((unit, index) => (
                        <div key={unit.label} className="flex items-center">
                            <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[52px] text-center">
                                <span className="text-xl font-bold tabular-nums">
                                    {String(unit.value).padStart(2, '0')}
                                </span>
                                <span className="text-xs block uppercase tracking-wider opacity-90">
                                    {unit.label}
                                </span>
                            </div>
                            {index < timeUnits.length - 1 && (
                                <span className="text-xl font-bold mx-1 opacity-75">:</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
