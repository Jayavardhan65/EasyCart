import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import Shopkeeper from './pages/Shopkeeper'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import BottomNav from './components/BottomNav'
import { Toaster } from 'react-hot-toast'
import NotFound from './pages/NotFound'
import OrderConfirmation from './pages/OrderConfirmation'
import Search from './pages/Search'
import Wishlist from './pages/Wishlist'
import Delivery from './pages/Delivery'
import Addresses from './pages/Addresses'

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="bottom-center" toastOptions={{ duration: 2000, style: { background: "#1f2937", color: "#fff", fontWeight: 600, fontSize: "0.875rem" } }} />
    <BrowserRouter>
      <Routes>
        <Route path="/shopkeeper" element={<Shopkeeper />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/search" element={<Search />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
            <Footer />
            <BottomNav />
          </>
        } />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
