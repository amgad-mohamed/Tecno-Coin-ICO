/**
 * وحدة حسابات ERC-20 بدقة 6 منازل عشرية
 * تقوم بتنفيذ العمليات الحسابية بدقة كاملة باستخدام BigInt
 * لتجنب مشاكل الأرقام العائمة في JavaScript
 */

/**
 * تحويل قيمة من صيغة عشرية إلى صيغة integer مقياس 10^6
 * @param value القيمة كـ string (مثل "100" أو "0.007")
 * @returns قيمة BigInt تمثل القيمة مضروبة في 10^6 مع تقريب لأسفل
 */
export function toWei(value: string): bigint {
  // تحويل القيمة إلى عدد عشري
  const decimalValue = value.includes('.') 
    ? value 
    : `${value}.0`;
  
  // تقسيم الرقم إلى جزء صحيح وجزء عشري
  const [integerPart, fractionalPart = ''] = decimalValue.split('.');
  
  // تنسيق الجزء العشري ليكون بطول 6 أو أقل
  const paddedFractionalPart = fractionalPart.padEnd(6, '0').slice(0, 6);
  
  // دمج الأجزاء لتكوين عدد صحيح
  const combinedInteger = `${integerPart}${paddedFractionalPart}`;
  
  // تحويل إلى BigInt مع إزالة الأصفار في البداية إن وجدت
  return BigInt(combinedInteger.replace(/^0+/, '') || '0');
}

/**
 * تحويل قيمة من صيغة integer مقياس 10^6 إلى صيغة عشرية قابلة للقراءة
 * @param weiValue قيمة BigInt تمثل القيمة بمقياس 10^6
 * @returns سلسلة نصية تمثل القيمة العشرية بدقة 6 منازل
 */
export function fromWei(weiValue: bigint): string {
  // تحويل القيمة إلى سلسلة نصية
  let valueStr = weiValue.toString();
  
  // إضافة أصفار في البداية إذا كان طول السلسلة أقل من 6
  valueStr = valueStr.padStart(7, '0');
  
  // تحديد موضع الفاصلة العشرية
  const decimalPosition = valueStr.length - 6;
  
  // إدراج الفاصلة العشرية في الموضع المناسب
  const result = `${valueStr.slice(0, decimalPosition)}.${valueStr.slice(decimalPosition)}`;
  
  // إزالة الأصفار الزائدة في البداية
  const withoutLeadingZeros = result.replace(/^0+(\d)/, '$1');
  
  // إزالة الأصفار الزائدة في النهاية (بعد الفاصلة العشرية)
  return withoutLeadingZeros.replace(/\.?0+$/, '');
}

/**
 * حساب النتيجة باستخدام الصيغة: result = amount ÷ rate + (amount ÷ rate) × multiplier
 * جميع العمليات تتم بدقة كاملة باستخدام BigInt
 * @param amount المبلغ (مثل "100")
 * @param rate السعر (مثل "0.007")
 * @param multiplier المضاعف (مثل "0.029999")
 * @returns كائن يحتوي على النتيجة بصيغة BigInt والقيمة القابلة للقراءة
 */
export function calculateTokenAmount(
  amount: string,
  rate: string,
  multiplier: string
): { integerERC20: bigint; humanReadable: string } {
  // تحويل المدخلات إلى صيغة وحدات صغيرة (مقياس 10^6)
  const amountUnits = toWei(amount);
  const rateUnits = toWei(rate);
  const multiplierUnits = toWei(multiplier);
  
  // ثابت 10^6 كـ BigInt
  const ONE_BASE = BigInt(10) ** BigInt(6);
  
  // حساب القيمة الأساسية: amount ÷ rate
  // نضرب amountUnits بـ 10^6 قبل القسمة للحفاظ على الدقة
  const base = (amountUnits * ONE_BASE) / rateUnits;
  
  // حساب المكافأة: base × multiplier
  // نقسم على 10^6 لتعويض المقياس الإضافي من multiplierUnits
  const bonus = (base * multiplierUnits) / ONE_BASE;
  
  // إجمالي الوحدات: base + bonus
  const totalUnits = base + bonus;
  
  // إرجاع النتيجة بالصيغتين
  return {
    integerERC20: totalUnits,
    humanReadable: fromWei(totalUnits)
  };
}

/**
 * اختبار الحساب باستخدام قيم محددة
 */
export function runTest(): void {
  const amount = "100";
  const rate = "0.007";
  const multiplier = "0.029999";
  
  const result = calculateTokenAmount(amount, rate, multiplier);
  
  console.log("المدخلات:");
  console.log(`- المبلغ: ${amount}`);
  console.log(`- السعر: ${rate}`);
  console.log(`- المضاعف: ${multiplier}`);
  console.log("\nالنتائج:");
  console.log(`- integerERC20: ${result.integerERC20.toString()}`);
  console.log(`- humanReadable: ${result.humanReadable}`);
  
  // القيمة المتوقعة (محسوبة مسبقاً لأساس 6 منازل)
  const expectedValue = BigInt("14714271427");
  
  // التحقق من صحة النتيجة
  if (result.integerERC20 === expectedValue) {
    console.log("\n✅ الاختبار ناجح: النتيجة تطابق القيمة المتوقعة");
  } else {
    console.log("\n❌ الاختبار فاشل: النتيجة لا تطابق القيمة المتوقعة");
    console.log(`- القيمة المتوقعة: ${expectedValue.toString()}`);
    console.log(`- القيمة الفعلية: ${result.integerERC20.toString()}`);
  }
}

// تشغيل الاختبار إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runTest();
}