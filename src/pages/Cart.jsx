import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { cart, changeQty, removeFromCart } = useCart()
  const navigate = useNavigate()

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 499 ? 0 : 49
  const total = subtotal + shipping

  if (!cart.length) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-5xl">🛒</p>
      <p className="text-gray-500 font-semibold">Your cart is empty</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-lg">Browse Products</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Cart ({cart.length} items)</h2>

        <div className="lg:grid lg:grid-cols-5 lg:gap-6">
          {/* Items */}
          <div className="lg:col-span-3 space-y-3 mb-4 lg:mb-0">
            {cart.map(item => (
              <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">₹{item.price.toLocaleString()} each</p>
                  {item.stock <= 5 && item.stock > 0 && (
                    <p className="text-xs text-yellow-500 font-semibold">⚠️ Only {item.stock} left</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => changeQty(item._id, -1)} className="w-7 h-7 bg-gray-100 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-orange-50 hover:border-orange-400 transition-colors text-sm">−</button>
                  <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                  <button onClick={() => changeQty(item._id, 1)} className="w-7 h-7 bg-gray-100 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-orange-50 hover:border-orange-400 transition-colors text-sm">+</button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-400 text-base transition-colors">🗑</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-600 py-1"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-600 py-1"><span>Shipping</span><span className={shipping === 0 ? 'text-green-500 font-bold' : ''}>{shipping === 0 ? 'Free 🎉' : '₹' + shipping}</span></div>
              {shipping > 0 && <p className="text-xs text-gray-400 mb-1">Add ₹{(499 - subtotal).toLocaleString()} more for free shipping</p>}
              <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 mt-2 pt-3"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Checkout →</button>
              <button onClick={() => navigate('/')} className="w-full border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl mt-2 hover:bg-gray-50 transition-colors text-sm">← Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
