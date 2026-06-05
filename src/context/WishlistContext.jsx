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
    setWishlist(w => {
      const exists = w.find(i => i._id === product._id)
      if (exists) {
        toast('Removed from wishlist', { icon: '🤍' })
        return w.filter(i => i._id !== product._id)
      } else {
        toast('Added to wishlist!', { icon: '❤️' })
        return [...w, product]
      }
    })
  }

  const isWishlisted = (productId) => wishlist.some(i => i._id === productId)
  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
