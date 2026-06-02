import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/api'

export default function Checkout() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', phone: '', email: user?.email || '', address: '', city: '', pincode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 499 ? 0 : 49
  const total = subtotal + shipping

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.email || !form.address || !form.city || !form.pincode)
      return setError('Please fill all fields')
    setLoading(true); setError('')
    try {
      const res = await createOrder({
        items: cart.map(i => ({ _id: i._id, name: i.name, emoji: i.emoji, price: i.price, quantity: i.quantity })),
        total,
        shipping: form
      })
      if (res._id) { clearCart(); navigate('/order-confirmation', { state: { order: res } }) }
      else setError(res.message || 'Order failed')
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  if (!cart.length) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-5xl">📦</p>
      <p className="text-gray-500 font-semibold">No items to checkout</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-lg">Browse Products</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Checkout</h2>

        <div className="lg:grid lg:grid-cols-5 lg:gap-6">

          {/* Left — delivery form */}
          <div className="lg:col-span-3 mb-4 lg:mb-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-700 mb-4 text-sm">📍 Delivery Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['name',    'Full Name',  'John Doe',          'sm:col-span-2'],
                  ['phone',   'Phone',      '9876543210',        ''],
                  ['email',   'Email',      'you@example.com',   ''],
                  ['address', 'Address',    '123 Main St',       'sm:col-span-2'],
                  ['city',    'City',       'Mumbai',            ''],
                  ['pincode', 'Pincode',    '400001',            ''],
                ].map(([key, label, placeholder, span]) => (
                  <div key={key} className={span}>
                    <label className="text-xs text-gray-500 font-medium">{label}</label>
                    <input
                      value={form[key]}
                      onChange={e => setForm({...form, [key]: e.target.value})}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — order summary + place order */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">🛍️ Order Summary</h3>
              <div className="max-h-48 overflow-y-auto mb-3">
                {cart.map(i => (
                  <div key={i._id} className="flex justify-between text-sm text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                    <span className="truncate mr-2">{i.emoji} {i.name} × {i.quantity}</span>
                    <span className="flex-shrink-0 font-medium">₹{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600 py-1"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-600 py-1">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-500 font-semibold' : ''}>{shipping === 0 ? 'Free 🎉' : '₹' + shipping}</span>
              </div>
              {shipping > 0 && <p className="text-xs text-gray-400 mb-1">Add ₹{(499 - subtotal).toLocaleString()} more for free shipping</p>}
              <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 mt-2 pt-3"><span>Total</span><span>₹{total.toLocaleString()}</span></div>

              {error && <p className="text-red-500 text-xs text-center mt-3">{error}</p>}

              <button onClick={handleOrder} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors disabled:opacity-60">
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
              <button onClick={() => navigate('/cart')} className="w-full border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl mt-2 hover:bg-gray-50 transition-colors text-sm">← Back to Cart</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
