import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Create the TimerContext
const TimerContext = createContext<{
  timeConsumed: number;
  elapsedTime: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
} | undefined>(undefined);

let time = 0;

const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeConsumed, setTimeConsumed] = useState<number>(0);


  // Manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        let calculated = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(calculated);
        setTimeConsumed(calculated);
        time = calculated;
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      setTimeConsumed(time)
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  // Función para iniciar el temporizador
  const startTimer = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  // Función para detener el temporizador
  const stopTimer = () => {
    setIsRunning(false);
    setStartTime(null);
  };

  // Función para reiniciar el temporizador
  const resetTimer = () => {
    setElapsedTime(0);
    setStartTime(null);
    setIsRunning(false);
    setTimeConsumed(0);
    time = 0;
  };

  const props = {
    timeConsumed: timeConsumed,
    elapsedTime: elapsedTime,
    isRunning: isRunning,
    startTimer: startTimer,
    stopTimer: stopTimer,
    resetTimer: resetTimer,
  }

  return (
    <TimerContext.Provider value={props}>
      {children}
    </TimerContext.Provider>
  );
};

export { TimerProvider, TimerContext };
