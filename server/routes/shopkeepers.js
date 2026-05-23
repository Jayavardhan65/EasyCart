import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Shopkeeper from '../models/Shopkeeper.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import authMiddleware from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const shopkeeperAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'shopkeeper') return res.status(403).json({ message: 'Not a shopkeeper' })
    req.shopkeeper = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, shopName, phone } = req.body
    const existing = await Shopkeeper.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    await Shopkeeper.create({ name, email, password: hashed, shopName, phone })
    res.json({ success: true, message: 'Registration submitted. Await admin approval.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const sk = await Shopkeeper.findOne({ email })
    if (!sk) return res.status(404).json({ message: 'Shopkeeper not found' })
    if (sk.status === 'pending') return res.status(403).json({ message: 'Your account is pending admin approval' })
    if (sk.status === 'suspended') return res.status(403).json({ message: 'Your account has been suspended' })
    const match = await bcrypt.compare(password, sk.password)
    if (!match) return res.status(401).json({ message: 'Invalid password' })
    const token = jwt.sign({ id: sk._id, email: sk.email, shopName: sk.shopName, role: 'shopkeeper' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, shopkeeper: { id: sk._id, name: sk.name, email: sk.email, shopName: sk.shopName } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/products', shopkeeperAuth, async (req, res) => {
  try {
    const products = await Product.find({ shopkeeperId: req.shopkeeper.id }).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/products', shopkeeperAuth, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock) || 0,
      badge: req.body.badge || null,
      images: req.body.images || [],
      shopkeeperId: req.shopkeeper.id,
      shopName: req.shopkeeper.shopName
    })
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.put('/products/:id', shopkeeperAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopkeeperId: req.shopkeeper.id },
      {
        name: req.body.name,
        category: req.body.category,
        price: Number(req.body.price),
        stock: Number(req.body.stock) || 0,
        badge: req.body.badge || null,
        images: req.body.images || []
      },
      { new: true }
    )
    if (!product) return res.status(403).json({ message: 'Not your product' })
    res.json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/products/:id', shopkeeperAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, shopkeeperId: req.shopkeeper.id })
    if (!product) return res.status(403).json({ message: 'Not your product' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/orders', shopkeeperAuth, async (req, res) => {
  try {
    const myProducts = await Product.find({ shopkeeperId: req.shopkeeper.id }, 'name')
    const myProductNames = myProducts.map(p => p.name)
    const orders = await Order.find({ 'items.name': { $in: myProductNames } }).sort({ createdAt: -1 })
    const filtered = orders.map(o => ({
      ...o.toObject(),
      items: o.items.filter(i => myProductNames.includes(i.name))
    }))
    res.json(filtered)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopkeepers = await Shopkeeper.find({}, '-password').sort({ createdAt: -1 })
    res.json(shopkeepers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const sk = await Shopkeeper.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    res.json(sk)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Shopkeeper.findByIdAndDelete(req.params.id)
    await Product.deleteMany({ shopkeeperId: req.params.id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
