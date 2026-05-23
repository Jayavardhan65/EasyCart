import mongoose from 'mongoose'

const shopkeeperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
}, { timestamps: true })

export default mongoose.model('Shopkeeper', shopkeeperSchema)
