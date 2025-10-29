import { parseUnits, formatUnits } from "viem";

const NEFE_DECIMALS = 6 as const;

/**
 * يحول قيمة NEFE من صيغة عشرية (حتى 6 خانات بعد الفاصلة)
 * إلى وحدات صغيرة (أساس 1e6) بدقة عالية باستخدام BigInt.
 *
 * يعتمد على viem.parseUnits لتجنب فقدان الدقة.
 *
 * @param amount قيمة NEFE كنص (مثال: "1.25" أو "0.000001")
 * @returns القيمة المحوّلة إلى وحدات صغيرة كـ bigint
 * @throws إذا كانت القيمة غير صالحة (ليست رقمًا عشريًا صحيح الصياغة)
 */
export function nefeToSmallUnits(amount: string): bigint {
  return parseUnits(amount, NEFE_DECIMALS);
}

/**
 * يحول قيمة NEFE من الوحدات الصغيرة (BigInt بأساس 1e6)
 * إلى صيغة عشرية قابلة للقراءة كنص دون فقدان أي أرقام.
 *
 * يعتمد على viem.formatUnits لضمان الدقة.
 *
 * @param amount القيمة بوحدات صغيرة كـ bigint
 * @returns القيمة بصيغة عشرية كنص (مثال: "1.25")
 */
export function smallUnitsToNefe(amount: bigint): string {
  return formatUnits(amount, NEFE_DECIMALS);
}

