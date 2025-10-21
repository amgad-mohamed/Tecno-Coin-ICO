"use client";

import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import { FiClock, FiGift, FiTag } from "react-icons/fi";
import { useTokenStakingContract } from "../services/useTokenStakingContract";

const ReleasesSection = () => {
  const {
    useGetRelease: useGetReleaseHook,
    useGetReleasesCount,
    useTotalStakingAmount,
  } = useTokenStakingContract();

  // Contract data
  const { data: totalStakingAmt } = useTotalStakingAmount();
  const { data: release0 } = useGetReleaseHook(0);
  const { data: release1 } = useGetReleaseHook(1);
  const { data: release2 } = useGetReleaseHook(2);
  const { data: release3 } = useGetReleaseHook(3);
  const { data: release4 } = useGetReleaseHook(4);
  const { data: releasesCount } = useGetReleasesCount();

  // Derived values
  const releases = [release0, release1, release2, release3, release4];
  const times = releases.map((r) => {
    const val = Array.isArray(r) ? r[0] : undefined;
    return typeof val === "bigint"
      ? Number(val)
      : typeof val === "number"
      ? val
      : 0;
  });
  const prices = releases.map((r) => {
    const val = Array.isArray(r) ? r[1] : undefined;
    const n =
      typeof val === "bigint" ? Number(val) : typeof val === "number" ? val : 0;
    return n / 1e6;
  });
  const rewards = releases.map((r) => {
    const val = Array.isArray(r) ? r[2] : undefined;
    return typeof val === "bigint" ? Number(val) : typeof val === "number" ? val : 0;
  });
  const AMOUNT_PER_RELEASE =
    (typeof totalStakingAmt === "bigint" ? Number(totalStakingAmt) / 1e18 : 0) /
    10;

  const nowSec = Math.floor(Date.now() / 1000);
  const nextTs = times.filter((v) => v > nowSec).sort((a, b) => a - b)[0];
  const nextReleaseIso = nextTs ? new Date(nextTs * 1000).toISOString() : "";
  const nextIndex = typeof nextTs === "number" ? times.indexOf(nextTs) : -1;
  const prevTs = times.filter((v) => v > 0 && v <= nowSec).sort((a, b) => b - a)[0];
  const prevIndex = typeof prevTs === "number" ? times.indexOf(prevTs) : -1;

  const releaseSchedule = [
    {
      label: "First Release",
      ts: times[0],
      price: prices[0] || 0,
      reward: rewards[0] || 0,
    },
    {
      label: "Second Release",
      ts: times[1],
      price: prices[1] || 0,
      reward: rewards[1] || 0,
    },
    {
      label: "Third Release",
      ts: times[2],
      price: prices[2] || 0,
      reward: rewards[2] || 0,
    },
    {
      label: "Forth Release",
      ts: times[3],
      price: prices[3] || 0,
      reward: rewards[3] || 0,
    },
    {
      label: "Final Release",
      ts: times[4],
      price: prices[4] || 0,
      reward: rewards[4] || 0,
    },
  ];

  return (
    <section className="py-10 relative z-10 font-nunito">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondBgColor text-amber-400 text-xs">
            On-chain Schedule
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Staking Releases
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-white/70 max-w-2xl mx-auto">
            Stay up to date with upcoming and completed releases. Rewards and prices
            are defined on-chain via the staking contract.
          </p>
        </div>

        <div className="space-y-3">
          {releaseSchedule.map((item, idx) => {
            const ts =
              typeof item.ts === "number"
                ? item.ts
                : typeof item.ts === "bigint"
                ? Number(item.ts)
                : 0;
            const isDone = ts > 0 && ts * 1000 < Date.now();
            const status = isDone ? "Released" : ts ? "Upcoming" : "Unset";
            const isPrevious = idx === prevIndex && isDone && ts > 0;
            const badgeClass = isDone
              ? "bg-emerald-500/10 text-emerald-300"
              : ts
              ? "bg-amber-500/10 text-amber-300"
              : "bg-red-500/10 text-red-300";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`group relative p-4 sm:p-5 bg-secondBgColor rounded-tr-3xl rounded-bl-3xl border border-bgColor/60 w-full overflow-hidden
                  ${isPrevious ? "ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/10" : "hover:bg-white/5 hover:border-bgColor"}`}
              >
                {/* Accent glow for previous */}
                {isPrevious && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-100 pointer-events-none" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-bgColor/60 ${isPrevious ? "bg-emerald-500/10" : "bg-white/5"}`}>
                      <FiClock className={`w-5 h-5 ${isPrevious ? "text-emerald-400" : "text-white/70"}`} />
                    </div>
                    <div>
                      <div className="text-white/80 font-semibold">{item.label}</div>
                      <div className="text-xs text-white/60">{ts ? new Date(ts * 1000).toLocaleString() : "-"}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {isPrevious && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300">
                        Previous
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>{status}</span>
                    <span className="inline-flex items-center gap-1 text-sm sm:text-base truncate text-white">
                      <FiGift className="w-4 h-4 text-amber-300" />
                      <span className="font-semibold bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent">
                        {item.reward}% Rewards
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm sm:text-base truncate text-white">
                      <FiTag className="w-4 h-4 text-amber-300" />
                      <span className="font-medium">{item.price?.toFixed?.(6) ?? "-"}</span>
                      <span className="text-white/60">USDT</span>
                    </span>
                    <span className="text-sm sm:text-base text-white/70">
                      {AMOUNT_PER_RELEASE.toLocaleString()} NEFE
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {nextReleaseIso && (
          <div className="mt-6">
            <h5 className="text-sm sm:text-md font-semibold text-white mb-2">Next Release Countdown</h5>
            <CountdownTimer endDate={nextReleaseIso} title="Next Release" />
          </div>
        )}

        {releasesCount !== undefined && Number(releasesCount) > 5 && (
          <div className="mt-3 text-xs text-amber-300">
            Contract has {String(releasesCount)} releases; displaying first 5 only.
          </div>
        )}
      </div>
    </section>
  );
};

export default ReleasesSection;