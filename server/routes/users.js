import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import authMiddleware from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const sendOTP = async (email, otp) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'EasyCart', email: process.env.EMAIL_USER },
      to: [{ email }],
      subject: 'Your EasyCart OTP',
      htmlContent: `<div style="font-family:sans-serif;padding:20px">
        <h2 style="color:#f97316">EasyCart</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing:8px;color:#1f2937">${otp}</h1>
        <p style="color:#9ca3af;font-size:12px">Expires in 10 minutes</p>
      </div>`
    })
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Email send failed')
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing && existing.isVerified) return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    if (existing) {
      existing.name = name
      existing.password = hashed
      existing.otp = otp
      existing.otpExpiry = otpExpiry
      await existing.save()
    } else {
      await User.create({ name, email, password: hashed, otp, otpExpiry })
    }

    await sendOTP(email, otp)
    res.json({ success: true, message: 'OTP sent to your email' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' })
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'OTP expired' })

    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, user: { name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, user: { name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp -otpExpiry').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router

// User auth middleware (for address routes)
const userAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authenticated' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch { res.status(401).json({ message: 'Invalid token' }) }
}

// Get all saved addresses
router.get('/addresses', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId, 'addresses')
    res.json(user?.addresses || [])
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Add a new address
router.post('/addresses', userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { addresses: req.body } },
      { new: true }
    )
    res.json(user.addresses)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Delete an address
router.delete('/addresses/:addressId', userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true }
    )
    res.json(user.addresses)
  } catch (err) { res.status(500).json({ message: err.message }) }
})
