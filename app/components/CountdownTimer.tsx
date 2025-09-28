"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsClock } from "react-icons/bs";
import type { IconType } from "react-icons";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({
  endDate,
  title,
}: {
  endDate: string;
  title: string;
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });


  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="relative flex flex-col items-center">
      <div className="bg-card shadow-lg rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 min-w-[60px] sm:min-w-[80px] md:min-w-[100px] relative overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gray-100/10" />
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <span className="block text-2xl sm:text-3xl md:text-4xl font-bold text-center gradient-text">
              {value.toString().padStart(2, "0")}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="feature-card p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* @ts-ignore */}
        <BsClock size={20} className="text-primary text-xl sm:text-2xl" />
        <h3 className="text-gray-600 text-base sm:text-lg font-medium">
          {title} {/* Presale Ends In */}
        </h3>
      </div>

      <div className="flex justify-between items-start gap-2 sm:gap-4 md:gap-6">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
};

export default CountdownTimer;
