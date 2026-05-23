import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// Step 1 — username + password
router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Credentials valid. Enter PIN.' })
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' })
  }
})

// Step 2 — PIN verify + issue JWT
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body
  if (pin === process.env.ADMIN_PIN) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' })
    res.json({ success: true, token })
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' })
  }
})

export default router
