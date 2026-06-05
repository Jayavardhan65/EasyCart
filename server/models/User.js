import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  name: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  pincode: String,
}, { _id: true })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  addresses: [addressSchema],
}, { timestamps: true })

export default mongoose.model('User', userSchema)
