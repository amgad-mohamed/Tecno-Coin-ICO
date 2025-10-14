import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TransactionModel from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const priceId = searchParams.get("priceId");
    const walletAddress = searchParams.get("walletAddress");

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priceId) filter.priceId = priceId;
    if (walletAddress) filter.walletAddress = walletAddress;

    const transactions = await TransactionModel.find(filter)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}