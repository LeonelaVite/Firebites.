import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    idempotencyKey: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD' },
    status: { type: String, required: true, default: 'received' },
    paymentStatus: { type: String, required: true, default: 'not_processed' },
    emailStatus: {
      type: String,
      required: true,
      enum: ['pending', 'not-configured', 'accepted', 'rejected', 'failed'],
      default: 'pending',
    },
    emailMessage: { type: String, default: '' },
    emailMessageId: { type: String, default: '' },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
)

const Order = mongoose.model('Order', orderSchema)

export default Order
