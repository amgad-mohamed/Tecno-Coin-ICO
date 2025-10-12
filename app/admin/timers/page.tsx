"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import TimerManagement from "../../components/TimerManagement";
import { useToastContext } from "../../context/ToastContext";

export default function TimersManagement() {
  const { showSuccess, showError } = useToastContext();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">
          Timers Management
        </h1>

        <div className="bg-secondBgColor rounded-2xl shadow-lg p-5 sm:p-8 border border-bgColor/60">
          <TimerManagement />
        </div>
      </motion.div>
    </div>
  );
}
