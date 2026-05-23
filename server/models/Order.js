import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: String, default: null },
  items: [{
    _id: String,
    name: String,
    emoji: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'Confirmed' },
  shipping: {
    name: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    pincode: String
  },
  shippingCharge: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
