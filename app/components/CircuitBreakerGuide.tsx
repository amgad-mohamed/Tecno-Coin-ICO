"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

interface CircuitBreakerGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const CircuitBreakerGuide = ({
  isOpen,
  onClose,
  onReset,
}: CircuitBreakerGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Check Network",
      description: "Ensure you're connected to Sepolia testnet",
      action: "Switch to Sepolia in MetaMask if needed",
    },
    {
      title: "Wait and Retry",
      description: "Wait 30-60 seconds before trying again",
      action: "The circuit breaker usually resets automatically",
    },
    {
      title: "Reset MetaMask",
      description: "Close and reopen MetaMask browser extension",
      action: "This clears the circuit breaker state",
    },
    {
      title: "Check Gas Fees",
      description: "Ensure you have enough ETH for gas fees",
      action: "You need ETH to pay for transaction fees",
    },
  ];

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiAlertTriangle className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Circuit Breaker Active
                  </h3>
                  <p className="text-sm text-gray-500">
                    MetaMask safety mechanism triggered
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <FiAlertTriangle className="text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Transaction Blocked
                  </p>
                  <p className="text-xs text-orange-600">
                    MetaMask has temporarily blocked transactions for your
                    safety
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Try these solutions:
                </h4>
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-amber-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {step.description}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        {step.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-300"
                >
                  <FiRefreshCw className="text-sm" />
                  <span className="text-sm font-medium">Reset & Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CircuitBreakerGuide;
