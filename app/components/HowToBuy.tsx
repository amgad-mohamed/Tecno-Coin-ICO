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
    title: "CREATE A WALLET",
    description:
      "Download MetaMask or your wallet of choice from the app store or Google Play Store for free. Desktop users, download the Google Chrome extension by going to metamask.io.",
  },
  {
    iconSrc: "/Icon1.svg",
    title: "GET SOME USDT",
    description:
      "Have USDT in your wallet to swap for NEFE. If you don’t have any USDT , you can buy directly on MetaMask, transfer from another wallet, or buy on another exchange and send it to your wallet.",
  },
  {
    iconSrc: "/Icon2.svg",
    title: "CLAIM YOUR NEFE",
    description:
      "Connect your wallet above. Enter the amount of USDT you wish to contribute, then confirm the transaction. Once the ICO period is over, you will be able to claim your NEFE tokens from this page.",
  },
  // {
  //   iconSrc: "/Icon3.svg",
  //   title: "Confirm Transaction",
  //   description:
  //     "Lorem ipsum dolor sit amet consectetur. Lacus in tristique odio mauris feugiat aliquam.",
  // },
];

export default function HowToBuy() {
  return (
    <section id="how-to-buy" className="mb-10 bg-bgColor font-nunito">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondBgColor text-amber-400 text-xs">
            <Secu size={16} />
            Secure Purchase Process
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            How to Buy NEFE
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
            Follow these simple steps to participate in our presale and acquire
            NEFE tokens.
            <br /> The process is secure, transparent, and only takes a few
            minutes.
          </p>
          {/* Step Progress Indicator */}
          {/* <div className="mt-6 flex items-center justify-center gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center text-sm font-semibold">
                  {n}
                </div>
                {n < 3 && (
                  <div className="w-10 h-[2px] bg-white/10" />
                )}
              </div>
            ))}
          </div> */}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-secondBgColor rounded-tr-3xl rounded-bl-3xl border border-bgColor/60 p-6 sm:p-8 flex items-center gap-5 sm:gap-8 hover:bg-white/5 hover:border-bgColor transition-colors"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-3 w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center text-sm font-semibold shadow-sm">
                {idx + 1}
              </div>
              {/* Icon left */}
              <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/5 border border-bgColor/60 shadow-inner flex items-center justify-center overflow-hidden">
                <Image
                  src={step.iconSrc}
                  alt={step.title}
                  width={96}
                  height={96}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              </div>
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent">
                  {step.title}
                </h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-2 text-[11px] sm:text-xs text-white/60">
                  {idx === 0 && "Install MetaMask on mobile or Chrome"}
                  {idx === 1 && "You can buy USDT on most exchanges"}
                  {idx === 2 && "Connect wallet then contribute USDT"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/audit"
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 text-white font-semibold shadow-md hover:bg-amber-600 transition-colors"
          >
            <span>Audit</span>
          </a>
          <div className="mt-3 text-xs sm:text-sm flex justify-center items-center gap-2 text-white/80">
            <Secu size={14} />
            Audited • Verified security and best practices
          </div>
        </div>
      </div>
    </section>
  );
}
