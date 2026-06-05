import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import shopkeeperRoutes from './routes/shopkeepers.js'
import deliveryRoutes from './routes/delivery.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true)
  },
  credentials: true
}))

app.use(express.json({ limit: "20mb" }))
app.use(express.urlencoded({ extended: true, limit: "20mb" }))
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/shopkeepers', shopkeeperRoutes)
app.use('/api/delivery', deliveryRoutes)
app.get('/', (req, res) => res.json({ message: 'EasyCart API running' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => console.error('DB connection error:', err))
