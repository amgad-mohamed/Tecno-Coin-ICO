"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { FiSettings, FiAlertCircle } from "react-icons/fi";
import { useTokenStakingContract } from "../../services/useTokenStakingContract";
import CountdownTimer from "../../components/CountdownTimer";
import { useToastContext } from "../../context/ToastContext";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";

export default function StakingManagement() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { showSuccess, showError, showInfo } = useToastContext();

  // Contract hooks
  const {
    useCalculateAvailableRelease,
    useTotalReleased,
    useTotalStakingAmount,
    useGetRelease: useGetReleaseHook,
    useGetReleasesCount,
    updateReleasePlan,
    releaseTokens,
    isPending,
    isConfirming,
    isConfirmed,
  } = useTokenStakingContract();

  // Contract data
  const { data: stakingAvailable } = useCalculateAvailableRelease();
  const { data: stakingTotalReleased } = useTotalReleased();
  const { data: totalStakingAmt } = useTotalStakingAmount();

  // Read release tuples by index (0..4)
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
    (typeof totalStakingAmt === "bigint" ? Number(totalStakingAmt) / 1e18 : 0) / 10;
  const nowSec = Math.floor(Date.now() / 1000);
  const nextTs = times.filter((v) => v > nowSec).sort((a, b) => a - b)[0];
  const nextReleaseIso = nextTs ? new Date(nextTs * 1000).toISOString() : "";

  const handleReleaseTokens = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    try {
      await releaseTokens();
      // Success toast will be shown after confirmation
    } catch (error) {
      console.error("Failed to release tokens:", error);
      showError("Token Release Failed", "Failed to release staking tokens");
    }
  }, [releaseTokens, showError, isConnected, address, open]);

  // Show success only after the transaction is confirmed on-chain
  useEffect(() => {
    if (isConfirmed) {
      showSuccess(
        "Tokens Released",
        "Staking tokens have been released successfully"
      );
    }
  }, [isConfirmed, showSuccess]);

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

  // ---------------- Admin: Edit Release Plan ----------------
  type ReleaseRow = {
    date: string; // datetime-local string
    price: string; // decimal string, 6 decimals
    rewardPercent: string; // integer percent
  };

  const [rows, setRows] = useState<ReleaseRow[]>([
    { date: "", price: "", rewardPercent: "" },
    { date: "", price: "", rewardPercent: "" },
    { date: "", price: "", rewardPercent: "" },
    { date: "", price: "", rewardPercent: "" },
    { date: "", price: "", rewardPercent: "" },
  ]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Prefill rows from contract when releases are available
  useEffect(() => {
    const toDec6 = (val: any) => {
      const n =
        typeof val === "bigint"
          ? Number(val)
          : typeof val === "number"
          ? val
          : 0;
      return (n / 1e6).toString();
    };
    const toDateTimeLocal = (seconds: any) => {
      const sec =
        typeof seconds === "bigint"
          ? Number(seconds)
          : typeof seconds === "number"
          ? seconds
          : 0;
      if (!sec) return "";
      const d = new Date(sec * 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const nextRows: ReleaseRow[] = rows.map((row, idx) => {
      const r = releases[idx];
      const timeVal = Array.isArray(r) ? r[0] : undefined;
      const priceVal = Array.isArray(r) ? r[1] : undefined;
      const rewardVal = Array.isArray(r) ? r[2] : undefined;
      return {
        date: toDateTimeLocal(timeVal),
        price: toDec6(priceVal),
        rewardPercent:
          typeof rewardVal === "bigint" || typeof rewardVal === "number"
            ? String(Number(rewardVal))
            : "",
      };
    });
    setRows(nextRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release0, release1, release2, release3, release4]);

  const handleRowChange = (
    idx: number,
    key: keyof ReleaseRow,
    value: string
  ) => {
    // Prevent changes for past releases
    const originalTs = typeof times?.[idx] === "number" ? times[idx] : 0;
    if (originalTs > 0 && originalTs < nowSec) {
      return;
    }

    // Clamp Reward Percent between 1 and 100 (allow empty to type)
    let nextValue = value;
    if (key === "rewardPercent") {
      const trimmed = value.trim();
      if (trimmed !== "") {
        const num = Math.floor(Number(trimmed));
        if (!Number.isNaN(num)) {
          const clamped = Math.min(100, Math.max(1, num));
          nextValue = String(clamped);
        }
      }
    }

    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: nextValue };
      return next;
    });
  };

  const handleUpdatePlan = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    try {
      setLoadingUpdate(true);

      // Build seconds array from inputs
      const secsArr = rows.map((r) => {
        const ms = r.date ? new Date(r.date).getTime() : 0;
        return Math.floor(ms / 1000);
      });

      // Override past indices with original contract values (lock past releases)
      const normalizedSecs = secsArr.map((sec, idx) => {
        const orig = typeof times?.[idx] === "number" ? times[idx] : 0;
        return orig > 0 && orig < nowSec ? orig : sec;
      });

      // Validate chronological order: each previous < next
      for (let i = 0; i < normalizedSecs.length - 1; i++) {
        const a = normalizedSecs[i];
        const b = normalizedSecs[i + 1];
        if (a > 0 && b > 0 && a >= b) {
          showError(
            "Invalid Order",
            `Release ${i + 1} must be earlier than Release ${i + 2}`
          );
          setLoadingUpdate(false);
          return;
        }
      }

      // Validate reward percent range for non-past releases (1..100)
      for (let i = 0; i < rows.length; i++) {
        const origTs = typeof times?.[i] === "number" ? times[i] : 0;
        if (!(origTs > 0 && origTs < nowSec)) {
          const valStr = rows[i]?.rewardPercent ?? "";
          const valNum = Number(valStr);
          if (!Number.isFinite(valNum) || valNum < 1 || valNum > 100) {
            showError(
              "Invalid Reward",
              `Release ${i + 1} reward must be between 1 and 100%`
            );
            setLoadingUpdate(false);
            return;
          }
        }
      }

      const timesArr = normalizedSecs.map((s) => BigInt(s));
      const pricesArr = rows.map((r, idx) => {
        const origPrice = Array.isArray(releases[idx]) ? (releases[idx][1] as bigint) : 0n;
        const origTs = typeof times?.[idx] === "number" ? times[idx] : 0;
        return origTs > 0 && origTs < nowSec
          ? origPrice
          : ethers.parseUnits(r.price || "0", 6);
      });
      const rewardPercentsArr = rows.map((r, idx) => {
        const origReward = Array.isArray(releases[idx]) ? (releases[idx][2] as bigint) : 0n;
        const origTs = typeof times?.[idx] === "number" ? times[idx] : 0;
        return origTs > 0 && origTs < nowSec
          ? origReward
          : BigInt(r.rewardPercent || "0");
      });

      await updateReleasePlan(timesArr, pricesArr, rewardPercentsArr);
      showInfo("Release Plan", "Update transaction submitted");
    } catch (error) {
      console.error("Failed to update release plan:", error);
      showError("Update Failed", "Could not update release plan");
    } finally {
      setLoadingUpdate(false);
    }
  }, [
    isConnected,
    address,
    rows,
    updateReleasePlan,
    open,
    showInfo,
    showError,
  ]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full"
      >
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-center sm:text-left">
          Staking Management
        </h1>

        <div className="bg-secondBgColor rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-bgColor/60">
          {/* Header */}
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Staking Contract
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-fourthBgColor rounded-lg text-center sm:text-left">
              <span className="text-white/70 block text-sm">
                Available to Release
              </span>
              <span className="font-semibold text-base sm:text-lg text-white">
                {typeof stakingAvailable === "bigint"
                  ? (Number(stakingAvailable) / 1e18).toLocaleString()
                  : "0"}{" "}
                NEFE
              </span>
            </div>

            <div className="p-4 bg-fourthBgColor rounded-lg text-center sm:text-left">
              <span className="text-white/70 block text-sm">
                Total Released
              </span>
              <span className="font-semibold text-base sm:text-lg text-white">
                {typeof stakingTotalReleased === "bigint"
                  ? (Number(stakingTotalReleased) / 1e18).toLocaleString()
                  : "0"}{" "}
                NEFE
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="pt-4 border-t border-bgColor/60 mt-4" />

          {/* Release Schedule */}
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
            Release Schedule
          </h4>
          <div className="space-y-2">
            {releaseSchedule.map((item, idx) => {
              const ts = typeof item.ts === "number" ? item.ts : typeof item.ts === "bigint" ? Number(item.ts) : 0;
              const isDone = ts > 0 && ts * 1000 < Date.now();
              const status = isDone ? "Released" : "Upcoming";
              const badgeClass = isDone
                ? "bg-amber-500/10 text-amber-300"
                : "bg-white/10 text-white/70";

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
                             p-3 bg-fourthBgColor rounded-lg gap-2 w-full overflow-hidden"
                >
                  <span className="text-white/70 break-words">
                    {item.label}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                    >
                      {status}
                    </span>
                    <span className="font-medium text-sm sm:text-base truncate text-white">
{/* -                      Reward {item.reward}% • Price{" "}
-                      {item.price?.toFixed?.(6) ?? "-"} USDT •{" "}
-                      {ts ? new Date(ts * 1000).toLocaleString() : "-"} */}
+                      Reward {item.reward}% • Price {item.price?.toFixed?.(6) ?? "-"} USDT • {ts ? new Date(ts * 1000).toLocaleString() : "-"} • {AMOUNT_PER_RELEASE.toLocaleString()} NEFE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Countdown */}
          {nextReleaseIso && (
            <div className="mt-4">
              <h5 className="text-md font-semibold text-white mb-2">
                Next Release Countdown
              </h5>
              <CountdownTimer endDate={nextReleaseIso} title="Next Release" />
            </div>
          )}
          <motion.button
            disabled={
              !stakingAvailable ||
              (typeof stakingAvailable === "bigint" &&
                stakingAvailable === BigInt(0))
            }
            onClick={handleReleaseTokens}
            className="mt-6 w-full px-4 py-2 bg-amber-500 text-white rounded-lg 
                       hover:bg-amber-600 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       text-sm sm:text-base"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
          >
            {(isPending || isConfirming) ? (
              <Loader2 className="inline mr-2 animate-spin" size={16} />
            ) : null}
            Release Tokens
          </motion.button>
          {/* Divider */}
          <div className="pt-4 border-t border-bgColor/60 mt-4" />

          {/* Admin: Update Release Plan */}
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <FiSettings /> Edit Release Plan
          </h4>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-fourthBgColor p-3 rounded-lg"
              >
                {(() => {
                  const tsOriginal = typeof times?.[idx] === "number" ? times[idx] : 0;
                  const isPast = tsOriginal > 0 && tsOriginal < nowSec;
                  return (
                    <>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Time {isPast && (
                            <span className="ml-1 text-amber-300">(Locked)</span>
                          )}
                        </label>
                        <input
                          type="datetime-local"
                          value={rows[idx]?.date || ""}
                          onChange={(e) =>
                            handleRowChange(idx, "date", e.target.value)
                          }
                          disabled={isPast}
                          readOnly={isPast}
                          className={`w-full px-3 py-2 rounded-md text-black ${isPast ? "opacity-60 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Token Price (USDT, 6 decimals)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={rows[idx]?.price || ""}
                          onChange={(e) =>
                            handleRowChange(idx, "price", e.target.value)
                          }
                          disabled={isPast}
                          readOnly={isPast}
                          className={`w-full px-3 py-2 rounded-md text-black ${isPast ? "opacity-60 cursor-not-allowed" : ""}`}
                          placeholder="e.g. 0.100000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Reward Percent
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            inputMode="numeric"
                            value={rows[idx]?.rewardPercent || ""}
                            onChange={(e) =>
                              handleRowChange(idx, "rewardPercent", e.target.value)
                            }
                            disabled={isPast}
                            readOnly={isPast}
                            className={`w-full px-3 pr-8 py-2 rounded-md text-black ${isPast ? "opacity-60 cursor-not-allowed" : ""}`}
                            placeholder="e.g. 10"
                          />
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-black/60">%</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}

            <motion.button
              onClick={handleUpdatePlan}
              disabled={loadingUpdate}
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg 
                         hover:bg-amber-600 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loadingUpdate ? "Updating..." : "Update Release Plan"}
            </motion.button>
            {releasesCount !== undefined && Number(releasesCount) > 5 && (
              <div className="text-xs text-amber-300">
                <FiAlertCircle className="inline mr-1" /> Contract has{" "}
                {String(releasesCount)} releases; only the first 5 are editable
                here.
              </div>
            )}
          </div>

          {/* Release Button */}
        </div>
      </motion.div>
    </div>
  );
}
