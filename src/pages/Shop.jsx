import { useState } from 'react'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'

const CATS = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports']

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      <div className="relative bg-gray-100" style={{paddingBottom:'75%'}}>
        <div className="absolute inset-0 bg-gray-200" />
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="h-4 bg-gray-200 rounded-full w-1/4" />
          <div className="h-7 bg-gray-200 rounded-lg w-14" />
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const { products, loading } = useProducts()
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    (cat === 'All' || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero */}
      <div className="bg-gray-800 text-white text-center py-10 sm:py-16 px-4">
        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Free shipping over ₹499</span>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Discover Great Products</h1>
        <p className="text-gray-400 text-sm mb-5">Browse our curated collection</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 w-full sm:max-w-xs"
          />
          <div className="flex gap-2 flex-wrap">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${cat === c ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500'}`}
              >{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="font-bold text-gray-700 text-base mb-4">
          {loading ? (
            <span className="inline-block h-4 w-32 bg-gray-200 rounded-full animate-pulse" />
          ) : (
            <>{cat === 'All' ? 'All Products' : cat} <span className="text-gray-400 font-normal text-sm ml-2">({filtered.length})</span></>
          )}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🛍️</p>
            <p className="text-gray-500 font-semibold">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {filtered.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
