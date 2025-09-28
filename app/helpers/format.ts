// src/helpers/format.ts
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";

/**
 * تحويل من ETH إلى Wei
 */
export const toWei = (eth: string) => parseEther(eth);

/**
 * تحويل من Wei إلى ETH
 */
export const toEth = (wei: bigint) => formatEther(wei);

/**
 * تحويل من Token Amount إلى أصغر وحدة (حسب decimals)
 * مثال: USDT (6 decimals) → parseUnits("100.5", 6)
 */
export const toTokenUnits = (amount: string, decimals: number) =>
  parseUnits(amount, decimals);

/**
 * تحويل من أصغر وحدة إلى Token Amount مقروءة
 */
export const fromTokenUnits = (amount: bigint, decimals: number) =>
  formatUnits(amount, decimals);

/**
 * فورمات رقم للعرض (2 أرقام عشرية)
 */
export const formatDisplay = (value: string | number, fractionDigits = 2) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};
