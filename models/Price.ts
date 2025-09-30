import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface Price extends Document {
  token: string; // token symbol or contract reference
  price: number; // stored in USDT units (decimals normalized)
  validUntil: Date; // typically tomorrow's date
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const priceSchema = new Schema<Price>(
  {
    token: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    validUntil: { type: Date, required: true, index: true },
    reason: { type: String },
  },
  { timestamps: true }
);

priceSchema.index({ token: 1, createdAt: -1 });

const PriceModel: Model<Price> =
  mongoose.models.Price || mongoose.model<Price>("Price", priceSchema);

export default PriceModel;


