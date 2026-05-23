import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"EasyCart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your EasyCart OTP',
    html: `<div style="font-family:sans-serif;padding:20px">
      <h2 style="color:#f97316">EasyCart</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:8px;color:#1f2937">${otp}</h1>
      <p style="color:#9ca3af;font-size:12px">Expires in 10 minutes</p>
    </div>`
  })
}

// Register
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

// Verify OTP
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

// Login
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

export default router

// Admin — get all users
import authMiddleware from '../middleware/auth.js'

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp -otpExpiry').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin — delete user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
