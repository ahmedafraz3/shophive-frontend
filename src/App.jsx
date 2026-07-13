import HomePage from "./pages/buyer/HomePage";
import ProductDetailPage from "./pages/buyer/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CartPage from "./pages/buyer/CartPage";
import MyOrdersPage from "./pages/buyer/MyOrdersPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import MyProductsPage from "./pages/seller/MyProductsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Replace placeholder routes — already in your App.jsx, just make sure imports are real files now
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute role="buyer">
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute role="buyer">
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute role="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/products"
              element={
                <ProtectedRoute role="seller">
                  <MyProductsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
