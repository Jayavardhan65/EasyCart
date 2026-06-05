import mongoose from 'mongoose'

const deliveryGuySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  zone: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('DeliveryGuy', deliveryGuySchema)
