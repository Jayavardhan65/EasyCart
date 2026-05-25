import express from 'express'
import jwt from 'jsonwebtoken'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import dotenv from 'dotenv'
dotenv.config()

const getUserId = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.id
  } catch { return null }
}

const router = express.Router()

const STATUS_CONTENT = {
  'Shipped': {
    emoji: '📦',
    subject: 'Your EasyCart order has been shipped!',
    heading: 'Your order is on its way!',
    message: 'Great news! Your order has been packed and handed over to our delivery partner.',
    color: '#7c3aed'
  },
  'Out for Delivery': {
    emoji: '🚚',
    subject: 'Your EasyCart order is out for delivery!',
    heading: 'Out for delivery today!',
    message: 'Your order is out for delivery and will reach you today. Please keep your phone handy.',
    color: '#2563eb'
  },
  'Delivered': {
    emoji: '✅',
    subject: 'Your EasyCart order has been delivered!',
    heading: 'Order delivered successfully!',
    message: 'Your order has been delivered. We hope you love your purchase!',
    color: '#16a34a'
  }
}

const sendStatusEmail = async (order, status) => {
  const c = STATUS_CONTENT[status]
  if (!c || !order.shipping?.email) return

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'EasyCart', email: process.env.EMAIL_USER },
      to: [{ email: order.shipping.email }],
      subject: c.subject,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="color:#f97316;margin:0">EasyCart</h2>
          </div>
          <div style="background:#f9fafb;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px">
            <p style="font-size:48px;margin:0 0 12px">${c.emoji}</p>
            <h2 style="color:#1f2937;margin:0 0 8px">${c.heading}</h2>
            <p style="color:#6b7280;margin:0">${c.message}</p>
          </div>
          <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px">
            <p style="font-size:12px;color:#9ca3af;margin:0 0 12px;font-weight:600;text-transform:uppercase">Order Details</p>
            <p style="margin:0 0 4px;font-weight:700;color:#1f2937">${order.orderId}</p>
            ${order.items.map(i => `
              <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;padding:6px 0;border-bottom:1px solid #f3f4f6">
                <span>${i.name} × ${i.quantity}</span>
                <span>₹${(i.price * i.quantity).toLocaleString('en-IN')}</span>
              </div>
            `).join('')}
            <div style="display:flex;justify-content:space-between;font-weight:700;color:#1f2937;margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb">
              <span>Total</span>
              <span>₹${order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:20px">
            <p style="font-size:12px;color:#9ca3af;margin:0 0 6px;font-weight:600">📍 DELIVERY ADDRESS</p>
            <p style="margin:0;font-weight:600;color:#1f2937">${order.shipping.name} · ${order.shipping.phone}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:14px">${order.shipping.address}, ${order.shipping.city} - ${order.shipping.pincode}</p>
          </div>
          <div style="text-align:center;padding:16px;background:${c.color};border-radius:12px">
            <p style="color:white;font-weight:700;font-size:16px;margin:0">Status: ${status}</p>
          </div>
          <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px">Thank you for shopping with EasyCart 🛍️</p>
        </div>
      `
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Email send failed')
  }
}

router.get('/my', async (req, res) => {
  try {
    const userId = getUserId(req)
    console.log('[/my] userId:', userId, '| auth:', req.headers.authorization?.slice(0,30))
    if (!userId) return res.status(401).json({ message: 'Not authenticated' })
    const allOrders = await Order.find({}).limit(3)
    console.log('[/my] sample userIds in DB:', allOrders.map(o => o.userId))
    const orders = await Order.find({ userId }).sort({ createdAt: -1 })
    console.log('[/my] matched orders:', orders.length)
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { items } = req.body
    for (const item of items) {
      const product = await Product.findById(item._id)
      if (!product) return res.status(404).json({ message: `Product "${item.name}" not found` })
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Only ${product.stock} left in stock for "${item.name}"` })
      }
    }
    for (const item of items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } })
    }
    const orderId = 'EC' + Date.now().toString().slice(-6)
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const userId = getUserId(req)
    const order = await Order.create({ ...req.body, orderId, total, status: 'Confirmed', userId })
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })

    try {
      await sendStatusEmail(order, req.body.status)
    } catch (emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message)
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
