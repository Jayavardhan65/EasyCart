import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, fetchAddresses, saveAddress, deleteAddress } from '../services/api'

const EMPTY_FORM = { label: 'Home', name: '', phone: '', email: '', address: '', city: '', pincode: '' }

export default function Checkout() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('select') // 'select' | 'new'
  const [form, setForm] = useState({ ...EMPTY_FORM, name: user?.name || '', email: user?.email || '' })
  const [saveForLater, setSaveForLater] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addrLoading, setAddrLoading] = useState(true)

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 499 ? 0 : 49
  const total = subtotal + shipping

  useEffect(() => {
    if (!user) { setAddrLoading(false); setMode('new'); return }
    fetchAddresses()
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setSavedAddresses(list)
        if (list.length > 0) { setSelectedId(list[0]._id); setMode('select') }
        else setMode('new')
      })
      .catch(() => setMode('new'))
      .finally(() => setAddrLoading(false))
  }, [user])

  const getShipping = () => {
    if (mode === 'select') return savedAddresses.find(a => a._id === selectedId)
    return form
  }

  const handleOrder = async () => {
    const shipping_addr = getShipping()
    if (!shipping_addr?.name || !shipping_addr?.phone || !shipping_addr?.address || !shipping_addr?.city || !shipping_addr?.pincode)
      return setError('Please fill all delivery fields')
    setLoading(true); setError('')
    try {
      if (mode === 'new' && saveForLater && user) {
        const updated = await saveAddress(form)
        setSavedAddresses(Array.isArray(updated) ? updated : [])
      }
      const res = await createOrder({
        items: cart.map(i => ({ _id: i._id, name: i.name, emoji: i.emoji, price: i.price, quantity: i.quantity })),
        total,
        shipping: shipping_addr
      })
      if (res._id) { clearCart(); navigate('/order-confirmation', { state: { order: res } }) }
      else setError(res.message || 'Order failed')
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation()
    const updated = await deleteAddress(id)
    const list = Array.isArray(updated) ? updated : []
    setSavedAddresses(list)
    if (selectedId === id) {
      if (list.length > 0) setSelectedId(list[0]._id)
      else { setSelectedId(null); setMode('new') }
    }
  }

  if (!cart.length) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-5xl">📦</p>
      <p className="text-gray-500 font-semibold">No items to checkout</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-lg">Browse Products</button>
    </div>
  )

  const labelIcons = { Home: '🏠', Work: '💼', Other: '📍' }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Checkout</h2>

        <div className="lg:grid lg:grid-cols-5 lg:gap-6">

          {/* Left — delivery */}
          <div className="lg:col-span-3 mb-4 lg:mb-0 space-y-3">

            {/* Saved addresses */}
            {user && !addrLoading && savedAddresses.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-700 text-sm">📍 Saved Addresses</h3>
                  <button
                    onClick={() => { setMode(mode === 'new' ? 'select' : 'new'); setError('') }}
                    className="text-xs text-orange-500 font-semibold hover:underline"
                  >{mode === 'new' ? '← Use saved' : '+ Add new'}</button>
                </div>

                {mode === 'select' && (
                  <div className="space-y-2">
                    {savedAddresses.map(addr => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedId(addr._id)}
                        className={`relative border rounded-xl p-3 cursor-pointer transition-all ${selectedId === addr._id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors ${selectedId === addr._id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                            {selectedId === addr._id && <div className="w-full h-full rounded-full bg-white scale-50 block" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm">{labelIcons[addr.label] || '📍'}</span>
                              <span className="text-xs font-bold text-gray-700">{addr.label}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{addr.name} · {addr.phone}</p>
                            <p className="text-xs text-gray-500">{addr.address}, {addr.city} - {addr.pincode}</p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteAddress(addr._id, e)}
                            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg"
                          >×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New address form */}
            {(mode === 'new' || !user) && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-700 mb-4 text-sm">
                  {savedAddresses.length > 0 ? '➕ New Address' : '📍 Delivery Details'}
                </h3>

                {/* Label selector */}
                {user && (
                  <div className="flex gap-2 mb-4">
                    {['Home', 'Work', 'Other'].map(l => (
                      <button
                        key={l}
                        onClick={() => setForm(f => ({ ...f, label: l }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.label === l ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >{labelIcons[l]} {l}</button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['name',    'Full Name',  'John Doe',        'sm:col-span-2'],
                    ['phone',   'Phone',      '9876543210',      ''],
                    ['email',   'Email',      'you@example.com', ''],
                    ['address', 'Address',    '123 Main St',     'sm:col-span-2'],
                    ['city',    'City',       'Mumbai',          ''],
                    ['pincode', 'Pincode',    '400001',          ''],
                  ].map(([key, label, placeholder, span]) => (
                    <div key={key} className={span}>
                      <label className="text-xs text-gray-500 font-medium">{label}</label>
                      <input
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400"
                      />
                    </div>
                  ))}
                </div>

                {user && (
                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveForLater}
                      onChange={e => setSaveForLater(e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-xs text-gray-500">Save this address for future orders</span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Right — order summary */}
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
