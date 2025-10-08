"use client";

import Image from "next/image";
import { motion } from "framer-motion";

function Secu({
  size = 20,
  className,
  stroke = "currentColor",
  fill = "none",
}: {
  size?: number;
  className?: string;
  stroke?: string;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l7 3.5v6.2c0 4.9-3.3 9.3-7 10.3-3.7-1-7-5.4-7-10.3V5.5L12 2z"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 6l4.5 2v3.8c0 3.4-2.4 6.6-4.5 7.4-2.1-.8-4.5-4-4.5-7.4V8l4.5-2z"
        fill={fill}
      />
    </svg>
  );
}

const steps = [
  {
    iconSrc: "/Icon.svg",
    title: "Connect Your Wallet",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lacus in tristique odio mauris feugiat aliquam.",
  },
  {
    iconSrc: "/Icon1.svg",
    title: "Select Amount",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lacus in tristique odio mauris feugiat aliquam.",
  },
  {
    iconSrc: "/Icon2.svg",
    title: "Choose Payment",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lacus in tristique odio mauris feugiat aliquam.",
  },
  {
    iconSrc: "/Icon3.svg",
    title: "Confirm Transaction",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lacus in tristique odio mauris feugiat aliquam.",
  },
];

export default function HowToBuy() {
  return (
    <section id="how-to-buy" className="mb-10  bg-bgColor font-nunito">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondBgColor text-amber-400 text-xs">
            <Secu size={16} />
            Secure Purchase Process
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            How to Buy PLT Tokens
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
            Follow these simple steps to participate in our presale and acquire
            PLT tokens.
            <br /> The process is secure, transparent, and only takes a few
            minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative bg-fourthBgColor rounded-2xl border border-bgColor/60 px-6 sm:px-8 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 mt-16 sm:mt-20"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-52 md:w-[234px] h-28 sm:h-36 md:h-[160px] flex items-center justify-center pointer-events-none select-none">
                <Image
                  src={step.iconSrc}
                  alt={step.title}
                  width={264}
                  height={160}
                  className="w-full h-auto"
                />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl text-center font-bold mb-3 px-2 bg-gradient-to-r from-[#F4AD30] to-[#F4AD30] bg-clip-text text-transparent">
                {step.title}
              </h3>
              <p className="text-white/70 text-xs sm:text-sm md:text-base tracking-wider pb-12 sm:pb-16 md:pb-20 text-center">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-500 text-white font-semibold shadow-md">
            Connect Wallet to Now
          </button>
          <div className="mt-3 text-xs sm:text-sm flex justify-center items-center gap-2">
            <Secu size={14} />
            Secure, Fast & Easy Process
          </div>
        </div>
      </div>
    </section>
  );
}
