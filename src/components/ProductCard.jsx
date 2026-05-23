import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart()
  const inCart = cart.find(i => i._id === product._id)
  const outOfStock = product.stock === 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all flex flex-col">
      <div className="bg-gray-50 aspect-square flex items-center justify-center text-4xl sm:text-5xl relative">
        {product.emoji}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-red-400 bg-red-50 border border-red-100 px-2 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        {product.badge && (
          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold mb-1.5 inline-block self-start">{product.badge}</span>
        )}
        <p className="font-bold text-gray-800 text-xs sm:text-sm leading-tight">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-1">{product.category}</p>
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-yellow-500 font-semibold mb-1">⚠️ Only {product.stock} left</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-orange-500 font-bold text-sm sm:text-base">₹{product.price.toLocaleString()}</span>
          <button
            onClick={() => !outOfStock && addToCart(product)}
            disabled={outOfStock}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
              outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : inCart ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {outOfStock ? 'Sold Out' : inCart ? `✓ ${inCart.quantity}` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
