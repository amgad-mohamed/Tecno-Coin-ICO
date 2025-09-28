"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import TimerManagement from "../../components/TimerManagement";
import { useToastContext } from "../../context/ToastContext";

export default function TimersManagement() {
  const { showSuccess, showError } = useToastContext();

  return (
    <div className="p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">
          Timers Management
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-200 dark:border-gray-700">
          <TimerManagement />
        </div>
      </motion.div>
    </div>
  );
}
