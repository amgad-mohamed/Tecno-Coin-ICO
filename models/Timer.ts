import mongoose, { Schema, Model, Document } from "mongoose";

export interface Timer extends Document {
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  type: "ICO" | "STAKING" | "GENERAL";
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const timerSchema = new Schema<Timer>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    enum: ["ICO", "STAKING", "GENERAL"],
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for efficient queries
timerSchema.index({ type: 1, isActive: 1 });
timerSchema.index({ endTime: 1 });

const TimerModel: Model<Timer> =
  mongoose.models.Timer ||
  mongoose.model<Timer>("Timer", timerSchema);

export default TimerModel; 