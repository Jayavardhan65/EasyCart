import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import DeliveryGuy from '../models/DeliveryGuy.js'
import Order from '../models/Order.js'
import authMiddleware from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const deliveryAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'delivery') return res.status(403).json({ message: 'Not a delivery account' })
    req.delivery = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, zone } = req.body
    const existing = await DeliveryGuy.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    await DeliveryGuy.create({ name, email, password: hashed, phone, zone })
    res.json({ success: true, message: 'Registration submitted. Await admin approval.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const guy = await DeliveryGuy.findOne({ email })
    if (!guy) return res.status(404).json({ message: 'Account not found' })
    if (guy.status === 'pending') return res.status(403).json({ message: 'Your account is pending admin approval' })
    if (guy.status === 'suspended') return res.status(403).json({ message: 'Your account has been suspended' })
    const match = await bcrypt.compare(password, guy.password)
    if (!match) return res.status(401).json({ message: 'Invalid password' })
    const token = jwt.sign(
      { id: guy._id, name: guy.name, email: guy.email, role: 'delivery' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ success: true, token, deliveryGuy: { id: guy._id, name: guy.name, email: guy.email, phone: guy.phone, zone: guy.zone } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all orders (for delivery guys to see and update)
router.get('/orders', deliveryAuth, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update order status
router.put('/orders/:id', deliveryAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: get all delivery guys
router.get('/', authMiddleware, async (req, res) => {
  try {
    const guys = await DeliveryGuy.find({}, '-password').sort({ createdAt: -1 })
    res.json(guys)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: update status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const guy = await DeliveryGuy.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    res.json(guy)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await DeliveryGuy.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
