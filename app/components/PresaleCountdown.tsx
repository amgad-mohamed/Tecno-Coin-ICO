"use client";

import { useEffect, useMemo, useState } from "react";
import { useTimers } from "../hooks/useTimers";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function PresaleCountdown() {
  const { timers, loading, error, fetchTimers } = useTimers();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    fetchTimers();
  }, []);

  const endTimeISO = useMemo(() => {
    const timer = timers?.[0];
    return timer ? timer.endTime : null;
  }, [timers]);

  useEffect(() => {
    if (!endTimeISO) return;
    const calculate = () => {
      const diff = new Date(endTimeISO).getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculate();
    const timerId = setInterval(calculate, 1000);
    return () => clearInterval(timerId);
  }, [endTimeISO]);

  if (loading) {
    return (
      <section className="py-10 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="h-6 w-24 bg-secondBgColor rounded animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  if (!endTimeISO) {
    return null;
  }

  const Tile = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center font-nunito">
      <div className="flex flex-col items-center bg-secondBgColor rounded-xl w-20 sm:w-24 md:w-36 py-6 sm:py-8 md:py-9 shadow-sm">
        <span className="block text-lg sm:text-xl md:text-2xl font-semibold text-white text-center">
          {value.toString().padStart(2, "0")}
        </span>
        <span className="mt-2 text-xs sm:text-base">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-bgColor font-nunito">
      <div className=" ">
        <h2 className="text-center text-2xl md:text-[32px] font-extrabold text-white mb-8">
          JOIN THE ICO
        </h2>
        <div className="flex flex-wrap justify-center gap-2 md:gap-12">
          <Tile value={timeLeft.days} label="Days" />
          <Tile value={timeLeft.hours} label="Hours" />
          <Tile value={timeLeft.minutes} label="Minutes" />
          <Tile value={timeLeft.seconds} label="Seconds" />
        </div>
      </div>
    </div>
  );
}
