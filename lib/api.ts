export type NewTransactionBody = {
  type: "BUY" | "SELL";
  amount: number;
  price: number;
  currency: "USDT" | "ETH";
  status: "COMPLETED" | "PENDING";
  date: string;
  hash: `0x${string}`;
};

export async function postTransaction(body: NewTransactionBody) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error || "Failed to save transaction");
  }
  return res.json();
}

export async function getTransactions(page = 1, limit = 10) {
    const res = await fetch(`/api/transactions?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      throw new Error(err.error || "Failed to fetch transactions");
    }
  
    return res.json();
  }
  