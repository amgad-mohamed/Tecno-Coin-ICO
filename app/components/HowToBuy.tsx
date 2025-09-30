"use client";

import { motion } from "framer-motion";
import { BiWallet } from "react-icons/bi";
import {
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

const HowToBuy = () => {
  const steps = [
    {
      // @ts-ignore
      icon: <BiWallet className="text-2xl" />,
      title: "Connect Your Wallet",
      description:
        "Connect your MetaMask, Trust Wallet or any other ERC-20 compatible wallet to get started.",
      illustration: (
        <svg className="w-full h-40" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.2 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.1 }}
              />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#grad1)" />
          <rect x="65" y="55" width="70" height="90" rx="12" fill="#3B82F6" />
          <rect x="72" y="65" width="56" height="25" rx="6" fill="#60A5FA" />
          <circle cx="100" cy="120" r="12" fill="white" />
          <path
            d="M85 95h30"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M85 105h20"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="100"
            r="95"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      ),
    },
    {
      // @ts-ignore
      icon: <FiDollarSign className="text-2xl" />,
      title: "Select Amount",
      description:
        "Choose the amount of MEM tokens you want to purchase (min 1,000 MEM).",
      illustration: (
        <svg className="w-full h-40" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.2 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.1 }}
              />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#grad2)" />
          <path
            d="M60 100h80"
            stroke="#3B82F6"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="20" fill="#3B82F6" />
          <text x="93" y="108" fill="white" fontSize="24" fontWeight="bold">
            $
          </text>
          <path
            d="M75 80c25-20 50-20 75 0"
            stroke="#60A5FA"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          <path
            d="M75 120c25 20 50 20 75 0"
            stroke="#60A5FA"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          <circle
            cx="100"
            cy="100"
            r="95"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      ),
    },
    {
      // @ts-ignore
      icon: <FiCreditCard className="text-2xl" />,
      title: "Choose Payment",
      description: "Select your preferred payment method (ETH or USDT).",
      illustration: (
        <svg className="w-full h-40" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.2 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.1 }}
              />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#grad3)" />
          <rect x="50" y="70" width="100" height="60" rx="12" fill="#3B82F6" />
          <rect x="60" y="85" width="45" height="8" rx="4" fill="white" />
          <circle cx="135" cy="95" r="10" fill="#FCD34D" />
          <circle cx="150" cy="95" r="10" fill="#60A5FA" opacity="0.8" />
          <path
            d="M60 110h25"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="100"
            r="95"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      ),
    },
    {
      // @ts-ignore
      icon: <FiCheckCircle className="text-2xl" />,
      title: "Confirm Transaction",
      description:
        "Review your transaction details and confirm the purchase in your wallet.",
      illustration: (
        <svg className="w-full h-40" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.2 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#3B82F6", stopOpacity: 0.1 }}
              />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#grad4)" />
          <circle cx="100" cy="100" r="45" fill="#3B82F6" />
          <path
            d="M80 100l15 15 25-25"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="100"
            cy="100"
            r="95"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M60 60c40-30 80-30 120 0"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          <path
            d="M60 140c40 30 80 30 120 0"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="how-to-buy"
      className="relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-60 h-60 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            {/* @ts-ignore */}
            <FiShield className="text-xs sm:text-sm" />
            <span>Secure Purchase Process</span>
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-transparent bg-clip-text">
            How to Buy MEM Tokens
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            Follow these simple steps to participate in our presale and acquire
            MEM tokens. The process is secure, transparent, and only takes a few
            minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 relative">
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 hidden lg:block -translate-y-1/2" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-gray-100"
            >
              {/* Step Number */}
              <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                {index + 1}
              </div>

              {/* Illustration */}
              <div className="mb-3 sm:mb-4 md:mb-6">{step.illustration}</div>

              {/* Icon and Title */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {/* @ts-ignore */}
                  {step.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                  {step.title}
                </h3>
              </div>

              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                {step.description}
              </p>

              {/* Arrow for connection (except last item) */}
              {index < steps.length - 1 && (
                <div className="absolute -right-3 sm:-right-4 top-1/2 transform -translate-y-1/2 hidden lg:block z-10">
                  {/* @ts-ignore */}
                  <FiArrowRight className="text-primary/40 text-xl sm:text-2xl" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 sm:mt-12 md:mt-20 text-center"
        >
          <button className="btn-primary inline-flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl">
            {/* @ts-ignore */}
            <BiWallet className="text-lg sm:text-xl md:text-2xl text-primary" />
            <span>Connect Wallet Now</span>
          </button>
          <div className="mt-3 sm:mt-4 md:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            {/* @ts-ignore */}
            <FiShield className="text-lg sm:text-xl md:text-2xl text-primary" />
            <p>Secure, Fast & Easy Process</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToBuy;
