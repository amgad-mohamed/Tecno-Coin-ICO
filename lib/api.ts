export type NewTransactionBody = {
  type: "BUY" | "SELL";
  amount: number;
  price: number;
  currency: "USDT" | "ETH";
  status: "COMPLETED" | "PENDING";
  date: string;
  hash: `0x${string}`;
  walletAddress?: `0x${string}`;
  priceId?: string;
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

export async function getTransactions(page = 1, limit = 10, priceId?: string, walletAddress?: string) {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (priceId) qs.set("priceId", priceId);
    if (walletAddress) qs.set("walletAddress", walletAddress);
    const res = await fetch(`/api/transactions?${qs.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      throw new Error(err.error || "Failed to fetch transactions");
    }
  
    return res.json();
  }

export async function getAllTransactions(priceId?: string, walletAddress?: string, type?: string, status?: string) {
  const qs = new URLSearchParams();
  if (priceId) qs.set("priceId", priceId);
  if (walletAddress) qs.set("walletAddress", walletAddress);
  if (type) qs.set("type", type);
  if (status) qs.set("status", status);
  const url = `/api/transactions/all${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error || "Failed to fetch all transactions");
  }
  return res.json();
}

// Prices API
export type NewPriceBody = {
  token: string;
  price: number;
  validUntil?: string; // optional; server will default to tomorrow end-of-day
  reason?: string;
};

export async function postPriceChange(body: NewPriceBody) {
  const res = await fetch("/api/prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error || "Failed to save price change");
  }
  return res.json();
}

export async function getActivePrice(token: string) {
  const res = await fetch(`/api/prices?token=${encodeURIComponent(token)}&active=true`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error || "Failed to fetch active price");
  }
  const data = await res.json();
  const first = Array.isArray(data?.prices) ? data.prices[0] : null;
  return first || null;
}

export async function getPrices(token?: string) {
  const qs = new URLSearchParams();
  if (token) qs.set("token", token);
  const url = `/api/prices${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error || "Failed to fetch prices");
  }
  const data = await res.json();
  return Array.isArray(data?.prices) ? data.prices : [];
}
  