"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiList, FiAlertCircle } from "react-icons/fi";
import { useAccount, useBalance } from "wagmi";
import { getTransactions } from "@/lib/api";
import { Transaction } from "@/models/Transaction";

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { address, isConnected } = useAccount(); // wagmi account hook
  // const { data: ethBalance } = useBalance({
  //   address,
  //   enabled: !!address,
  // });
  // const { data: usdtBalance } = useBalance({
  //   address,
  //   token: "0xYourUSDTContractAddress", // <-- replace with CONTRACT_ADDRESS.MOCK_USDT
  //   enabled: !!address,
  // });

  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getTransactions(currentPage, ITEMS_PER_PAGE);
        setTransactions(result.transactions);
        setTotalTransactions(result.total);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [currentPage]);

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
              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl"
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
              <h1 className="text-2xl font-bold">Transaction History</h1>
            </div>
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
                  {transactions.map((transaction, idx) => (
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
                        {transaction.amount.toLocaleString()} PLT
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
                          className="bg-[#178440] text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          View on Sepolia
                        </button>
                      </td>
                    </tr>
                  ))}
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
