import { useState, useEffect } from 'react'
import { fetchOrders, updateOrderStatus } from '../services/api'

const DELIVERY_PIN = '7777'

const statusStyle = (s) => {
  if (s === 'Delivered') return 'bg-green-50 text-green-600 border-green-100'
  if (s === 'Out for Delivery') return 'bg-blue-50 text-blue-600 border-blue-100'
  if (s === 'Shipped') return 'bg-purple-50 text-purple-600 border-purple-100'
  return 'bg-orange-50 text-orange-500 border-orange-100'
}

const statusEmoji = (s) => {
  if (s === 'Delivered') return '✅'
  if (s === 'Out for Delivery') return '🚚'
  if (s === 'Shipped') return '📦'
  return '🕐'
}

export default function Delivery() {
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('delivery_auth') === 'true')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('active')
  const [updating, setUpdating] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (!loggedIn) return
    setLoading(true)
    fetchOrders()
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [loggedIn])

  const handlePin = (digit) => {
    const newPin = pin + digit
    setPin(newPin)
    setPinError(false)
    if (newPin.length === 4) {
      if (newPin === DELIVERY_PIN) {
        localStorage.setItem('delivery_auth', 'true')
        setLoggedIn(true)
      } else {
        setPinError(true)
        setTimeout(() => setPin(''), 600)
      }
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('delivery_auth')
    setLoggedIn(false)
    setPin('')
    setOrders([])
  }

  const filtered = orders.filter(o => {
    if (filter === 'active') return o.status !== 'Delivered'
    if (filter === 'delivered') return o.status === 'Delivered'
    return true
  })

  // PIN LOGIN SCREEN
  if (!loggedIn) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-xs text-center">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚚</span>
        </div>
        <h1 className="text-white font-bold text-xl mb-1">Delivery Portal</h1>
        <p className="text-gray-400 text-sm mb-6">Enter your 4-digit PIN</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < pin.length ? (pinError ? 'bg-red-500' : 'bg-orange-500') : 'bg-gray-600'}`} />
          ))}
        </div>

        {pinError && <p className="text-red-400 text-xs mb-4 animate-pulse">Incorrect PIN. Try again.</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
            <button
              key={i}
              onClick={() => {
                if (k === '⌫') { setPin(p => p.slice(0,-1)); setPinError(false) }
                else if (k !== '') handlePin(String(k))
              }}
              className={`h-12 rounded-xl font-bold text-lg transition-all ${k === '' ? 'invisible' : 'bg-gray-700 text-white hover:bg-gray-600 active:bg-orange-500'}`}
            >{k}</button>
          ))}
        </div>
      </div>
    </div>
  )

  // DASHBOARD
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg">🚚</div>
            <div>
              <p className="font-bold text-sm">Delivery Dashboard</p>
              <p className="text-gray-400 text-xs">{filtered.length} order{filtered.length !== 1 ? 's' : ''} to show</p>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">Logout</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-2xl mx-auto flex gap-1 py-2">
          {[
            { key: 'active', label: '🚚 Active', count: orders.filter(o => o.status !== 'Delivered').length },
            { key: 'delivered', label: '✅ Delivered', count: orders.filter(o => o.status === 'Delivered').length },
            { key: 'all', label: '📋 All', count: orders.length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f.key ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {f.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-400 animate-pulse font-semibold">Loading orders...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 font-semibold">No orders here</p>
          </div>
        )}

        {filtered.map(order => (
          <div key={order._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Order header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800 text-sm">{order.orderId}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle(order.status)}`}>
                    {statusEmoji(order.status)} {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expandedOrder === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Delivery address — always visible */}
            {order.shipping && (
              <div className="px-4 pb-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-600 mb-1">📍 Deliver To</p>
                  <p className="text-sm font-bold text-gray-800">{order.shipping.name}</p>
                  <p className="text-xs text-gray-600">{order.shipping.address}</p>
                  <p className="text-xs text-gray-600">{order.shipping.city} — {order.shipping.pincode}</p>
                  <a href={`tel:${order.shipping.phone}`} className="text-xs text-blue-500 font-semibold mt-1 inline-block hover:underline">📞 {order.shipping.phone}</a>
                </div>
              </div>
            )}

            {/* Expanded — items */}
            {expandedOrder === order._id && (
              <div className="px-4 pb-3 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                <div className="space-y-1.5 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-sm border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>₹{order.total?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {order.status !== 'Delivered' && (
              <div className="px-4 pb-4 flex gap-2">
                {order.status !== 'Out for Delivery' && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, 'Out for Delivery')}
                    disabled={updating === order._id}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                  >
                    {updating === order._id ? '...' : '🚚 Mark Out for Delivery'}
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                  disabled={updating === order._id}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {updating === order._id ? '...' : '✅ Mark Delivered'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
