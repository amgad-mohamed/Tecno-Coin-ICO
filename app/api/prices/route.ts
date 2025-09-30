import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PriceModel from "@/models/Price";

// GET /api/prices?token=MEM&active=true
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const active = searchParams.get("active");

    // If requesting the active price, always return the last created entry for the token
    if (active === "true") {
      const query: Record<string, any> = {};
      if (token) query.token = token;
      const latest = await PriceModel.findOne(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ prices: latest ? [latest] : [] }, { status: 200 });
    }

    const query: Record<string, any> = {};
    if (token) query.token = token;
    const prices = await PriceModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ prices }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/prices
// body: { token: string, price: number, validUntil?: string, reason?: string }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { token, price, validUntil, reason } = body || {};

    if (!token || typeof price !== "number") {
      return NextResponse.json({ error: "token and price are required" }, { status: 400 });
    }

    const validUntilDate = validUntil ? new Date(validUntil) : (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1); // tomorrow
      d.setHours(23, 59, 59, 999);
      return d;
    })();

    const doc = await PriceModel.create({ token, price, validUntil: validUntilDate, reason });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


