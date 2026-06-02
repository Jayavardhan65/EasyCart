import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // If someone navigates here directly with no state, redirect to orders
  useEffect(() => {
    if (!state?.order) navigate('/orders')
  }, [])

  if (!state?.order) return null

  const { order } = state

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-sm">

        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-1">Order Placed!</h1>
        <p className="text-gray-400 text-sm mb-4">Thank you for shopping with EasyCart 🎉</p>

        {/* Order ID */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
          <p className="font-bold text-orange-500 text-sm">{order.orderId}</p>
        </div>

        {/* Items */}
        <div className="text-left mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items Ordered</p>
          <div className="space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="flex-shrink-0 font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 pt-3 mb-5">
          <span>Total Paid</span>
          <span className="text-orange-500">₹{order.total.toLocaleString()}</span>
        </div>

        {/* Delivery address */}
        {order.shipping && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-left mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-1">📍 Delivering to</p>
            <p className="text-sm text-gray-700 font-semibold">{order.shipping.name}</p>
            <p className="text-xs text-gray-500">{order.shipping.address}, {order.shipping.city} - {order.shipping.pincode}</p>
            <p className="text-xs text-gray-400 mt-0.5">{order.shipping.phone}</p>
          </div>
        )}

        {/* Estimated delivery */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-6">
          <p className="text-xs text-blue-600 font-semibold">🚚 Estimated Delivery: 3–5 business days</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/orders')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors">
            View My Orders
          </button>
          <button onClick={() => navigate('/')} className="w-full border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  )
}
