"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { FiSettings, FiAlertCircle } from "react-icons/fi";
import { useTokenStakingContract } from "../../services/useTokenStakingContract";
import CountdownTimer from "../../components/CountdownTimer";
import { useToastContext } from "../../context/ToastContext";

export default function StakingManagement() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { showSuccess, showError } = useToastContext();

  // Contract hooks
  const {
    useCalculateAvailableRelease,
    useTotalReleased,
    useFirstReleaseTime,
    useSecondReleaseTime,
    useThirdReleaseTime,
    useFinalReleaseTime,
    useTotalStakingAmount,
    useFirstReleaseAmount,
    useSecondReleaseAmount,
    useThirdReleaseAmount,
    releaseTokens,
  } = useTokenStakingContract();

  // Contract data
  const { data: stakingAvailable } = useCalculateAvailableRelease();
  const { data: stakingTotalReleased } = useTotalReleased();
  const { data: firstReleaseTs } = useFirstReleaseTime();
  const { data: secondReleaseTs } = useSecondReleaseTime();
  const { data: thirdReleaseTs } = useThirdReleaseTime();
  const { data: finalReleaseTs } = useFinalReleaseTime();
  const { data: totalStakingAmt } = useTotalStakingAmount();
  const { data: firstReleaseAmt } = useFirstReleaseAmount();
  const { data: secondReleaseAmt } = useSecondReleaseAmount();
  const { data: thirdReleaseAmt } = useThirdReleaseAmount();

  // Derived values
  const TOTAL_STAKING_AMOUNT =
    typeof totalStakingAmt === "bigint" ? Number(totalStakingAmt) / 1e18 : 0;
  const FIRST_RELEASE =
    typeof firstReleaseAmt === "bigint" ? Number(firstReleaseAmt) / 1e18 : 0;
  const SECOND_RELEASE =
    typeof secondReleaseAmt === "bigint" ? Number(secondReleaseAmt) / 1e18 : 0;
  const THIRD_RELEASE =
    typeof thirdReleaseAmt === "bigint" ? Number(thirdReleaseAmt) / 1e18 : 0;
  const FINAL_RELEASE = Math.max(
    TOTAL_STAKING_AMOUNT - (FIRST_RELEASE + SECOND_RELEASE + THIRD_RELEASE),
    0
  );

  const nowSec = Math.floor(Date.now() / 1000);
  const nextTs = [
    firstReleaseTs,
    secondReleaseTs,
    thirdReleaseTs,
    finalReleaseTs,
  ]
    .map((v) =>
      typeof v === "bigint" ? Number(v) : typeof v === "number" ? v : 0
    )
    .filter((v) => v > nowSec)
    .sort((a, b) => a - b)[0];
  const nextReleaseIso = nextTs ? new Date(nextTs * 1000).toISOString() : "";

  const handleReleaseTokens = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    try {
      await releaseTokens();
      showSuccess(
        "Tokens Released",
        "Staking tokens have been released successfully"
      );
    } catch (error) {
      console.error("Failed to release tokens:", error);
      showError("Token Release Failed", "Failed to release staking tokens");
    }
  }, [releaseTokens, showSuccess, showError, isConnected, address, open]);

  const releaseSchedule = [
    {
      label: "First Release",
      ts: firstReleaseTs,
      amt: FIRST_RELEASE,
    },
    {
      label: "Second Release",
      ts: secondReleaseTs,
      amt: SECOND_RELEASE,
    },
    {
      label: "Third Release",
      ts: thirdReleaseTs,
      amt: THIRD_RELEASE,
    },
    {
      label: "Final Release",
      ts: finalReleaseTs,
      amt: FINAL_RELEASE,
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto w-full"
      >
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white text-center sm:text-left">
          Staking Management
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Staking Contract
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center sm:text-left">
              <span className="text-gray-600 dark:text-gray-300 block text-sm">
                Available to Release
              </span>
              <span className="font-semibold text-base sm:text-lg">
                {typeof stakingAvailable === "bigint"
                  ? (Number(stakingAvailable) / 1e18).toLocaleString()
                  : "0"}{" "}
                PLT
              </span>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center sm:text-left">
              <span className="text-gray-600 dark:text-gray-300 block text-sm">
                Total Released
              </span>
              <span className="font-semibold text-base sm:text-lg">
                {typeof stakingTotalReleased === "bigint"
                  ? (Number(stakingTotalReleased) / 1e18).toLocaleString()
                  : "0"}{" "}
                PLT
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4" />

          {/* Release Schedule */}
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Release Schedule
          </h4>
          <div className="space-y-2">
            {releaseSchedule.map((item, idx) => {
              const ts = typeof item.ts === "bigint" ? Number(item.ts) : 0;
              const isDone = ts > 0 && ts * 1000 < Date.now();
              const status = isDone ? "Released" : "Upcoming";
              const badgeClass = isDone
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
                             p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2 w-full overflow-hidden"
                >
                  <span className="text-gray-600 dark:text-gray-300 break-words">
                    {item.label}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                    >
                      {status}
                    </span>
                    <span className="font-medium text-sm sm:text-base truncate">
                      {Number(item.amt).toLocaleString()} PLT •{" "}
                      {ts ? new Date(ts * 1000).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Countdown */}
          {nextReleaseIso && (
            <div className="mt-4">
              <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                Next Release Countdown
              </h5>
              <CountdownTimer endDate={nextReleaseIso} title="Next Release" />
            </div>
          )}

          {/* Release Button */}
          <motion.button
            disabled={
              !stakingAvailable ||
              (typeof stakingAvailable === "bigint" &&
                stakingAvailable === BigInt(0))
            }
            onClick={handleReleaseTokens}
            className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg 
                       hover:bg-purple-700 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Release Tokens
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
