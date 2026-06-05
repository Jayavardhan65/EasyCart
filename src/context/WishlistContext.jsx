import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('easycart_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('easycart_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const toggleWishlist = (product) => {
    setWishlist(w =>
      w.find(i => i._id === product._id)
? (toast('Removed from wishlist', { icon: '🤍' }), w.filter(i => i._id !== product._id))
: (toast('Added to wishlist!', { icon: '❤️' }), [...w, product])
    )
  }

  const isWishlisted = (id) => wishlist.some(i => i._id === id)
  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
