import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartCount } = useCart()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = pathname === '/admin'
  const isShopkeeper = pathname === '/shopkeeper'

  const navLink = (path, label) => (
    <Link
      to={path}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors ${pathname === path ? 'text-orange-400' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
    >{label}</Link>
  )

  return (
    <nav className="bg-gray-800 sticky top-0 z-50">
      <div className="h-14 flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="text-white text-xl font-bold">EasyCart</Link>

        {/* Desktop links */}
        {!isAdmin && !isShopkeeper && (
          <div className="hidden md:flex items-center gap-1">
            {navLink('/', 'Shop')}
            <Link
              to="/cart"
              className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors relative ${pathname === '/cart' ? 'text-orange-400' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">{cartCount}</span>
              )}
            </Link>
            {navLink('/orders', 'Orders')}
            {user ? (
              <>
                <span className="text-sm text-gray-300 px-3">👤 {user.name.split(' ')[0]}</span>
                <button onClick={() => { logout(); navigate('/') }} className="text-sm font-semibold px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Logout</button>
              </>
            ) : navLink('/login', 'Login')}
            {navLink('/contact', 'Contact')}
          </div>
        )}

        {isAdmin && user && (
          <span className="text-sm text-gray-300 px-3 hidden md:block">👤 {user.name} <span className="text-xs text-gray-500 ml-1">(logged in)</span></span>
        )}

        {/* Mobile: hamburger only */}
        <div className="flex items-center gap-2">
          {!isAdmin && !isShopkeeper && (
            <button onClick={() => setMenuOpen(o => !o)} className="md:hidden text-gray-300 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors">
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && !isAdmin && !isShopkeeper && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3 flex flex-col gap-1">
          {navLink('/', 'Shop')}
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors flex items-center justify-between ${pathname === '/cart' ? 'text-orange-400' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            Cart
            {cartCount > 0 && <span className="bg-orange-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
          </Link>
          {navLink('/orders', 'Orders')}
          {navLink('/contact', 'Contact')}
          {user ? (
            <>
              <span className="text-sm text-gray-400 px-3 py-2">👤 {user.name}</span>
              <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} className="text-sm font-semibold px-3 py-2 rounded-md text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Logout</button>
            </>
          ) : navLink('/login', 'Login')}
        </div>
      )}
    </nav>
  )
}
