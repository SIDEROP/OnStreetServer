import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "StreetVendor", required: true },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    deliveryAddress: { type: String, required: true },
  }, { timestamps: true });
  
export default mongoose.model("Order", OrderSchema);