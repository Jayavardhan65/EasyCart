import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 mt-8">
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-white font-bold text-lg mb-2">EasyCart</p>
          <p className="text-sm text-gray-500">Your one-stop shop for everything you need, delivered fast.</p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-2">Quick Links</p>
          <div className="flex flex-col gap-1">
            <Link to="/" className="text-sm hover:text-orange-400 transition-colors">Shop</Link>
            <Link to="/orders" className="text-sm hover:text-orange-400 transition-colors">My Orders</Link>
            <Link to="/contact" className="text-sm hover:text-orange-400 transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-2">Policies</p>
          <div className="flex flex-col gap-1">
            <span className="text-sm">Free shipping over ₹499</span>
            <span className="text-sm">Easy returns</span>
            <span className="text-sm">Secure payments</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center text-xs text-gray-600 py-4">
        © 2025 EasyCart. All rights reserved.
      </div>
    </footer>
  )
}
