import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist()
  const { addToCart, cart } = useCart()
  const navigate = useNavigate()

  if (!wishlist.length) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-6xl">🤍</p>
      <p className="text-gray-800 font-bold text-lg">Your wishlist is empty</p>
      <p className="text-gray-400 text-sm">Tap the ♥ on any product to save it here</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
        Browse Products
      </button>
    </div>
  )

  return (
    <div id="main-content" className="bg-gray-100 min-h-screen py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-800">My Wishlist <span className="text-gray-400 font-normal text-base ml-1">({wishlist.length})</span></h1>
        </div>

        <div className="space-y-3">
          {wishlist.map(p => {
            const inCart = cart.find(i => i._id === p._id)
            const outOfStock = p.stock === 0
            return (
              <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-orange-200 transition-colors">
                {/* Image / emoji */}
                <div
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
                >
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl">{p.emoji || '📦'}</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p onClick={() => navigate(`/product/${p._id}`)} className="font-bold text-gray-800 text-sm truncate cursor-pointer hover:text-orange-500 transition-colors">{p.name}</p>
                  <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                  <p className="text-orange-500 font-bold text-sm">₹{p.price?.toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => !outOfStock && addToCart(p)}
                    disabled={outOfStock}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : inCart ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                  >
                    {outOfStock ? 'Sold Out' : inCart ? '✓ In Cart' : '+ Add'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
