"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTransactions, getPrices } from "@/lib/api";

export default function AdminTransactionsPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const viewOnSepolia = (hash: string) => {
    const sepoliaUrl = `https://sepolia.etherscan.io/tx/${hash}`;
    window.open(sepoliaUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getPrices("MEM");
        setPrices(list);
      } catch {}
    };
    void load();
  }, []);

  useEffect(() => {
    const loadTx = async () => {
      setLoading(true);
      try {
        const result = await getTransactions(1, 50, selectedPriceId);
        setTransactions(result.transactions || []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    void loadTx();
  }, [selectedPriceId]);

  return (
    <div className="p-6 sm:p-8">
      <div className="bg-thirdBgColor rounded-xl shadow-md p-4 sm:p-6 border border-bgColor/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <label className="text-sm text-white/70">
            Filter by Price
          </label>
          <select
            value={selectedPriceId || ""}
            onChange={(e) => setSelectedPriceId(e.target.value || undefined)}
            className="px-3 py-2 border border-bgColor/60 rounded-lg bg-fourthBgColor text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">All Prices</option>
            {prices.map((p) => (
              <option key={p._id} value={p._id}>
                {p.price} USD — {new Date(p.createdAt).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-white/60">
                Loading transactions...
              </span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-white/60">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction: any, idx: number) => (
                <motion.div
                  key={transaction.hash ?? idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-fourthBgColor rounded-lg p-4 border border-bgColor/60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "BUY"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {transaction.type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : transaction.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Amount:</span>
                      <span className="font-medium">{transaction.amount.toLocaleString()} NEFE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Price:</span>
                      <span className="font-medium">
                        {transaction.currency === "ETH"
                          ? `${Number(transaction.price).toFixed(6)} ETH`
                          : `${Number(transaction.price).toFixed(2)} USDT`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Date:</span>
                      <span className="text-sm text-white/60">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => viewOnSepolia(transaction.hash)}
                    className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-all duration-300"
                  >
                    View on Sepolia
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm lg:text-base">
            <thead>
              <tr className="rounded-lg">
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">Type</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">Amount</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">Price</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">Date</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">Status</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 lg:px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-white/60">
                        Loading transactions...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 lg:px-6 py-8 text-center text-white/60"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction: any, idx: number) => (
                  <tr
                    key={transaction.hash ?? idx}
                    className="border-b border-bgColor/60 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "BUY"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      {transaction.amount.toLocaleString()} NEFE
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      {transaction.currency === "ETH"
                        ? `${Number(transaction.price).toFixed(6)} ETH`
                        : `${Number(transaction.price).toFixed(2)} USDT`}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <span className="hidden lg:inline">
                        {new Date(transaction.date).toLocaleString()}
                      </span>
                      <span className="lg:hidden">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-400"
                            : transaction.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <button
                        onClick={() => viewOnSepolia(transaction.hash)}
                        className="bg-amber-500 text-white px-3 lg:px-4 py-2 rounded-full text-xs font-medium hover:bg-amber-600 transition-all duration-300"
                      >
                        <span className="hidden lg:inline">View on Sepolia</span>
                        <span className="lg:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
