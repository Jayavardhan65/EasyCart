import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product._id)
  const [imgIdx, setImgIdx] = useState(0)
  const ref = useScrollAnimation()
  const navigate = useNavigate()
  const inCart = cart.find(i => i._id === product._id)
  const outOfStock = product.stock === 0
  const images = product.images?.length > 0 ? product.images : null

  return (
    <div ref={ref} className="scroll-hidden bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all flex flex-col h-full">
      <div onClick={() => navigate(`/product/${product._id}`)} className="cursor-pointer relative bg-gray-50" style={{paddingBottom:'75%'}}>
        <div className="absolute inset-0">
          {images ? (
            <>
              <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">‹</button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">›</button>
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                    {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />)}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-30">📦</span>
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); toggleWishlist(product) }}
            className={"absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all z-10 " + (wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-400')}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-3.5 h-3.5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-red-400 bg-red-50 border border-red-100 px-2 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        {product.badge && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold mb-1.5 inline-block self-start">{product.badge}</span>}
        <p className="font-bold text-gray-800 text-xs sm:text-sm leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-1">{product.category}</p>
        {product.stock === 0 ? null : product.stock <= 5 ? <p className="text-xs text-yellow-500 font-semibold mb-1">⚠️ Only {product.stock} left</p> : <p className="text-xs text-green-500 font-semibold mb-1">✓ In Stock</p>}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-orange-500 font-bold text-sm sm:text-base">₹{product.price.toLocaleString()}</span>
          <button
            onClick={() => !outOfStock && addToCart(product)}
            disabled={outOfStock}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : inCart ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
          >
            {outOfStock ? 'Sold Out' : inCart ? `✓ ${inCart.quantity}` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
