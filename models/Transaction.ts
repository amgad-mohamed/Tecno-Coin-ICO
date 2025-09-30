import mongoose, { Schema, Model, Document } from "mongoose";

export interface Transaction extends Document {
  type: "BUY" | "SELL";
  amount: number;
  price: number;
  currency: "USDT" | "ETH";
  status: "COMPLETED" | "PENDING";
  date: Date;
  hash: `0x${string}`;
  walletAddress?: `0x${string}`;
  priceId?: mongoose.Types.ObjectId;
}

const transactionSchema = new Schema<Transaction>({
  type: {
    type: String,
    enum: ["BUY", "SELL"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["USDT", "ETH"],
    required: true,
  },
  status: {
    type: String,
    enum: ["COMPLETED", "PENDING"],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: false,
    index: true,
  },
  priceId: {
    type: Schema.Types.ObjectId,
    ref: "Price",
    required: false,
    index: true,
  },
});

const TransactionModel: Model<Transaction> =
  mongoose.models.Transaction ||
  mongoose.model<Transaction>("Transaction", transactionSchema);

export default TransactionModel;


