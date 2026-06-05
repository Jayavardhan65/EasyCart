import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'

const CATEGORY_EMOJI = {
  Electronics: '⚡', Fashion: '👗', Home: '🏠', Books: '📚', Sports: '🏃', default: '📦'
}

const DESCRIPTIONS = {
  Electronics: 'High-quality electronic product with modern features. Built for performance and reliability.',
  Fashion: 'Stylish and comfortable. Perfect for everyday wear with a modern fit and premium finish.',
  Home: 'Elevate your living space with this well-crafted home essential. Durable and designed to last.',
  Books: 'Expand your knowledge and skills with this highly regarded title. A must-read in its category.',
  Sports: 'Engineered for performance. Whether training or competing, this gear keeps you at your best.',
  default: 'A great product at an unbeatable price. Trusted by thousands of happy customers.'
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products } = useProducts()
  const { cart, addToCart, changeQty } = useCart()
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)

  const product = products.find(p => p._id === id)

  if (!product) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">🔍</p>
      <p className="text-gray-500 font-semibold">Product not found</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-lg">Back to Shop</button>
    </div>
  )

  const inCart = cart.find(i => i._id === product._id)
  const outOfStock = product.stock === 0
  const images = product.images?.length > 0 ? product.images : null
  const emoji = CATEGORY_EMOJI[product.category] || CATEGORY_EMOJI.default
  const description = DESCRIPTIONS[product.category] || DESCRIPTIONS.default

  const stockBadge = () => {
    if (product.stock === 0) return <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Out of Stock</span>
    if (product.stock <= 5) return <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-full">⚠️ Only {product.stock} left</span>
    return <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">✓ In Stock ({product.stock})</span>
  }

  const metaDesc = description + ' Buy ' + product.name + ' online at EasyCart for just ₹' + product.price.toLocaleString() + '.'
  const metaImage = product.images?.[0] || ''

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Helmet>
          <title>{product.name} — EasyCart</title>
          <meta name="description" content={metaDesc} />
          <meta property="og:title" content={product.name + ' — EasyCart'} />
          <meta property="og:description" content={metaDesc} />
          <meta property="og:type" content="product" />
          {metaImage && <meta property="og:image" content={metaImage} />}
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={product.name + ' — EasyCart'} />
          <meta name="twitter:description" content={metaDesc} />
          {metaImage && <meta name="twitter:image" content={metaImage} />}
        </Helmet>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <button onClick={() => navigate('/')} className="hover:text-orange-500 transition-colors">Home</button>
          <span>›</span>
          <button onClick={() => navigate('/?cat=' + product.category)} className="hover:text-orange-500 transition-colors">{product.category}</button>
          <span>›</span>
          <span className="text-gray-600 truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image panel */}
            <div className="bg-gray-50 relative" style={{ minHeight: '300px' }}>
              {images ? (
                <div className="relative h-full" style={{ minHeight: '300px' }}>
                  <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" style={{ minHeight: '300px' }} />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center">‹</button>
                      <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center">›</button>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-orange-500' : 'bg-gray-300'}`} />)}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <span className="text-9xl opacity-20">{emoji}</span>
                </div>
              )}
              {product.badge && (
                <span className="absolute top-3 left-3 text-xs bg-orange-500 text-white px-2.5 py-1 rounded-full font-bold">{product.badge}</span>
              )}
            </div>

            {/* Info panel */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-bold text-orange-500">₹{product.price.toLocaleString()}</span>
                {stockBadge()}
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

              {/* Specs */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between"><span>Category</span><span className="font-semibold text-gray-700">{product.category}</span></div>
                <div className="flex justify-between"><span>Availability</span><span className="font-semibold text-gray-700">{product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}</span></div>
                {product.shopName && <div className="flex justify-between"><span>Seller</span><span className="font-semibold text-gray-700">{product.shopName}</span></div>}
              </div>

              {/* Cart actions */}
              {inCart ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                    <button onClick={() => changeQty(product._id, -1)} className="w-7 h-7 bg-white border border-gray-200 rounded-lg font-bold text-gray-600 hover:border-orange-400 transition-colors text-sm">−</button>
                    <span className="font-bold text-sm w-6 text-center">{inCart.quantity}</span>
                    <button onClick={() => changeQty(product._id, 1)} className="w-7 h-7 bg-white border border-gray-200 rounded-lg font-bold text-gray-600 hover:border-orange-400 transition-colors text-sm">+</button>
                  </div>
                  <button onClick={() => navigate('/cart')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">View Cart →</button>
                </div>
              ) : (
                <button
                  onClick={() => !outOfStock && addToCart(product)}
                  disabled={outOfStock}
                  className={`w-full font-bold py-3 rounded-xl transition-colors ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                >
                  {outOfStock ? 'Out of Stock' : '+ Add to Cart'}
                </button>
              )}

              <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-orange-500 transition-colors text-center">← Back to Shop</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
