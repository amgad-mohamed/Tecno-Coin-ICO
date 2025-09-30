import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TransactionModel from "@/models/Transaction";


export async function GET(req: NextRequest) {
    try {
      await connectDB();

      const { searchParams } = new URL(req.url);
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 10;
      const type = searchParams.get("type");
      const status = searchParams.get("status");
      const priceId = searchParams.get("priceId");
  const walletAddress = searchParams.get("walletAddress");

      // Optional filters
      const filter: Record<string, unknown> = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (priceId) filter.priceId = priceId;
  if (walletAddress) filter.walletAddress = walletAddress;

      const transactions = await TransactionModel.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await TransactionModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({ transactions, total, totalPages, page }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const doc = await TransactionModel.create(body);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;
    const doc = await TransactionModel.findByIdAndDelete(id);
    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}