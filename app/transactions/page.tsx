"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiList,
  FiAlertCircle,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";
import { useAccount, useBalance } from "wagmi";
import { getTransactions } from "@/lib/api";
import { Transaction } from "@/models/Transaction";
import { useMockUSDTContract } from "@/app/services/useMockUSDTContract";
import { formatEther, formatUnits } from "viem";

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { address, isConnected } = useAccount();

  // Get ETH balance using wagmi
  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  // Get USDT balance using the custom hook
  const { useBalanceOf: useUSDTBalance, useDecimals: useUSDTDecimals } =
    useMockUSDTContract();
  const { data: usdtBalance } = useUSDTBalance(address as `0x${string}`);
  const { data: usdtDecimals } = useUSDTDecimals();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!mounted || !address) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getTransactions(
          currentPage,
          ITEMS_PER_PAGE,
          undefined,
          address
        );
        setTransactions(result.transactions || []);
        setTotalTransactions(result.total || 0);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setError("Failed to load transactions. Please try again later.");
        setTransactions([]);
        setTotalTransactions(0);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, mounted, address]);

  const viewOnSepolia = (hash: string) => {
    const sepoliaUrl = `https://sepolia.etherscan.io/tx/${hash}`;
    window.open(sepoliaUrl, "_blank", "noopener,noreferrer");
  };

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  if (!mounted) return null;

  /** -------------------------------
   * Wallet Not Connected (old design)
   * ------------------------------- */
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <FiAlertCircle className="text-blue-500 text-3xl" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Wallet Not Connected
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Please connect your wallet to view your transactions and manage
              your tokens.
            </p>
            <motion.button
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiAlertCircle className="text-xl" />
              Connect Wallet
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  /** -------------------------------
   * Wallet Connected (old design)
   * ------------------------------- */
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3 mt-10">
              <FiList className="text-2xl text-primary" />
              <h1 className="text-base md:text-2xl font-bold">
                Your MEM Token Transactions
              </h1>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-red-500 text-xl" />
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-medium">
                    Error Loading Data
                  </h3>
                  <p className="text-red-600 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance Display Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ETH Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiDollarSign className="text-2xl" />
                  <h3 className="text-lg font-semibold">ETH Balance</h3>
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">
                {ethBalance
                  ? `${Number(formatEther(ethBalance.value)).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 6,
                      }
                    )}`
                  : "0.0000"}
              </div>
              <div className="text-blue-100 text-sm">
                {ethBalance?.symbol || "ETH"}
              </div>
            </motion.div>

            {/* USDT Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiCreditCard className="text-2xl" />
                  <h3 className="text-lg font-semibold">USDT Balance</h3>
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">
                {usdtBalance && usdtDecimals && typeof usdtBalance === "bigint"
                  ? `${Number(
                      formatUnits(usdtBalance, Number(usdtDecimals))
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}`
                  : "0.00"}
              </div>
              <div className="text-green-100 text-sm">USDT</div>
            </motion.div>
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Amount</th>
                    <th className="px-6 py-4 text-left">Price</th>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="text-muted-foreground">
                            Loading transactions...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction, idx) => (
                      <tr
                        key={transaction.hash ?? idx}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === "BUY"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {transaction.amount.toLocaleString()} MEM
                        </td>
                        <td className="px-6 py-4">
                          {transaction.currency === "ETH"
                            ? `${Number(transaction.price).toFixed(6)} ETH`
                            : `${Number(transaction.price).toFixed(2)} USDT`}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(transaction.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => viewOnSepolia(transaction.hash)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                          >
                            View on Sepolia
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
