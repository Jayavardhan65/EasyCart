import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <AuthProvider>
      <ProductProvider>
        <WishlistProvider>
        <CartProvider>
          <App />
        </CartProvider>
        </WishlistProvider>
      </ProductProvider>
    </AuthProvider>
    </HelmetProvider>
  </StrictMode>
)
