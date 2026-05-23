import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  badge: { type: String, default: null },
  stock: { type: Number, default: 0 },
  shopkeeperId: { type: String, default: null },
  shopName: { type: String, default: null },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)
