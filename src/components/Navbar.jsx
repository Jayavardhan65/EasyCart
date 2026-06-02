import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isAdmin = pathname === '/admin'
  const isShopkeeper = pathname === '/shopkeeper'

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLink = (path, label) => (
    <Link
      to={path}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors ${pathname === path ? 'text-orange-400' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
    >{label}</Link>
  )

  return (
    <>
      <a href="#main-content" className="skip-nav">Skip to content</a>
      <nav className="bg-gray-800 sticky top-0 z-50">
        <div className="h-14 flex items-center justify-between px-4 md:px-6">
          <Link to="/" className="text-white text-xl font-bold">EasyCart</Link>

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
              {navLink('/wishlist', 'Wishlist')}
              {navLink('/contact', 'Contact')}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isAdmin && !isShopkeeper && user && (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name.split(' ')[0]}
                  <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-600">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm text-white font-semibold truncate">{user.name}</p>
                    </div>
                    <button
                      onClick={() => { logout(); navigate('/'); setDropdownOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAdmin && !isShopkeeper && !user && (
              <Link to="/login" className="hidden md:block text-sm font-semibold px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Login</Link>
            )}

            {isAdmin && user && (
              <span className="text-sm text-gray-300 px-3 hidden md:block">👤 {user.name} <span className="text-xs text-gray-500 ml-1">(logged in)</span></span>
            )}

            {!isAdmin && !isShopkeeper && (
              <button onClick={() => setMenuOpen(o => !o)} className="hidden">
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            )}
          </div>
        </div>

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
              {navLink('/wishlist', 'Wishlist')}
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
    </>
  )
}
