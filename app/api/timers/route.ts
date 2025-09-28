import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TimerModel from "@/models/Timer";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    // Optional filters
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (isActive !== null) filter.isActive = isActive === "true";

    const timers = await TimerModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TimerModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ timers, total, totalPages, page }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.startTime || !body.endTime || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: name, startTime, endTime, type" },
        { status: 400 }
      );
    }

    // Enforce single timer creation - disallow creating more than one timer
    const existingCount = await TimerModel.countDocuments({});
    if (existingCount >= 1) {
      return NextResponse.json(
        { error: "Only one timer is allowed. Delete or edit the existing timer." },
        { status: 400 }
      );
    }

    // Validate dates
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    const doc = await TimerModel.create({
      ...body,
      startTime,
      endTime,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Timer ID is required" },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime ? new Date(updateData.startTime) : undefined;
      const endTime = updateData.endTime ? new Date(updateData.endTime) : undefined;
      
      if (startTime && isNaN(startTime.getTime())) {
        return NextResponse.json(
          { error: "Invalid start time format" },
          { status: 400 }
        );
      }

      if (endTime && isNaN(endTime.getTime())) {
        return NextResponse.json(
          { error: "Invalid end time format" },
          { status: 400 }
        );
      }

      if (startTime && endTime && startTime >= endTime) {
        return NextResponse.json(
          { error: "Start time must be before end time" },
          { status: 400 }
        );
      }
    }

    const doc = await TimerModel.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return NextResponse.json(
        { error: "Timer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc, { status: 200 });
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

    if (!id) {
      return NextResponse.json(
        { error: "Timer ID is required" },
        { status: 400 }
      );
    }

    const doc = await TimerModel.findByIdAndDelete(id);
    
    if (!doc) {
      return NextResponse.json(
        { error: "Timer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 