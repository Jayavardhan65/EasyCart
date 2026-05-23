import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart()
  const [imgIdx, setImgIdx] = useState(0)
  const inCart = cart.find(i => i._id === product._id)
  const outOfStock = product.stock === 0
  const images = product.images?.length > 0 ? product.images : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all flex flex-col">
      <div className="aspect-square relative bg-gray-100">
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
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-red-400 bg-red-50 border border-red-100 px-2 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        {product.badge && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold mb-1.5 inline-block self-start">{product.badge}</span>}
        <p className="font-bold text-gray-800 text-xs sm:text-sm leading-tight">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-1">{product.category}</p>
        {product.stock > 0 && product.stock <= 5 && <p className="text-xs text-yellow-500 font-semibold mb-1">⚠️ Only {product.stock} left</p>}
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
