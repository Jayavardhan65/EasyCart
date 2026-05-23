import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyOrders } from '../services/api'
import { useAuth } from '../context/AuthContext'

const statusStyle = (s) => {
  if (s === 'Delivered') return 'bg-green-50 text-green-600'
  if (s === 'Out for Delivery') return 'bg-blue-50 text-blue-600'
  if (s === 'Shipped') return 'bg-purple-50 text-purple-600'
  return 'bg-orange-50 text-orange-500'
}

const statusEmoji = (s) => {
  if (s === 'Delivered') return '✅'
  if (s === 'Out for Delivery') return '🚚'
  if (s === 'Shipped') return '📦'
  return '✓'
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchMyOrders().then(data => {
      setOrders(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [user])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400 font-semibold animate-pulse">Loading orders...</p>
    </div>
  )

  if (!orders.length) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-5xl">📦</p>
      <p className="text-gray-500 font-semibold">No orders yet</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-lg">Start Shopping</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Orders</h2>
        {orders.map(o => (
          <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-4">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="font-bold text-gray-800 text-sm">{o.orderId}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle(o.status)}`}>
                {statusEmoji(o.status)} {o.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            {o.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-50">
                <span className="truncate mr-2">{item.emoji} {item.name} × {item.quantity}</span>
                <span className="flex-shrink-0 ml-2">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            {o.shipping && (
              <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 font-semibold mb-1">📍 Delivery Address</p>
                <p className="text-xs text-gray-600">{o.shipping.name} · {o.shipping.phone}</p>
                <p className="text-xs text-gray-500">{o.shipping.address}, {o.shipping.city} - {o.shipping.pincode}</p>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 mt-3 pt-3">
              <span>Total</span>
              <span>₹{o.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
