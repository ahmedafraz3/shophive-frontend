import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useOrder from "../../hooks/useOrder";
import useAuth from "../../hooks/useAuth";
import Navbar from "../../components/layout/Navbar";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/currency";
import Message from "../../components/common/Message";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemsPrice,
    shippingPrice,
    totalPrice,
    totalItems,
  } = useCart();
  const { placeOrder, loading, error } = useOrder();

  const [step, setStep] = useState("cart"); // "cart" | "checkout" | "success"
  const [orderPlaced, setOrderPlaced] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Pakistan",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [formError, setFormError] = useState("");

  const handleAddressChange = (e) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    setFormError("");

    // Validate address
    const { fullName, phone, address, city, postalCode, country } =
      shippingAddress;
    if (!fullName || !phone || !address || !city || !postalCode || !country) {
      return setFormError("Please fill in all shipping fields");
    }

    const orderData = {
      items: cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod,
    };

    const result = await placeOrder(orderData);

    if (result.success) {
      setOrderPlaced(result.data);
      clearCart();
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Step: Success ──
  if (step === "success" && orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-10">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-500 mb-6">
              Your order has been received and is being processed.
            </p>

            {/* Order summary card */}
            <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-medium text-gray-800 text-xs">
                  {orderPlaced._id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-medium">{orderPlaced.items?.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-[#c9a84c]">
                  {formatPrice(orderPlaced.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">{orderPlaced.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
                  {orderPlaced.orderStatus}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/my-orders")}
                className="flex-1 bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] font-semibold py-3 rounded-xl transition"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty Cart ──
  if (cartItems.length === 0 && step === "cart") {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some products to get started
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] font-semibold px-8 py-3 rounded-xl transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["cart", "checkout"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  step === s
                    ? "bg-[#c9a84c] text-[#0f1b35]"
                    : i < ["cart", "checkout"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < ["cart", "checkout"].indexOf(step) ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-medium capitalize ${
                  step === s ? "text-[#c9a84c]" : "text-gray-400"
                }`}
              >
                {s}
              </span>
              {i < 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left — Cart Items or Checkout Form ── */}
          <div className="flex-1">

            {/* CART STEP */}
            {step === "cart" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Cart ({totalItems} items)
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition"
                    >
                      {/* Image */}
                      <img
                        src={item.images?.[0]?.url}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover shrink-0 cursor-pointer"
                        onClick={() => navigate(`/products/${item._id}`)}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-[#c9a84c]"
                          onClick={() => navigate(`/products/${item._id}`)}
                        >
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          {item.seller?.shopName}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition font-bold text-sm"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 text-sm font-medium border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition font-bold text-sm"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(
                                (item.discountPrice > 0
                                  ? item.discountPrice
                                  : item.price) * item.quantity
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatPrice(item.discountPrice > 0
                                ? item.discountPrice
                                : item.price)}{" "}
                              each
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="shrink-0 text-gray-300 hover:text-red-500 transition text-xl self-start"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHECKOUT STEP */}
            {step === "checkout" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setStep("cart")}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    ←
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">
                    Shipping Details
                  </h2>
                </div>

                {formError && (
                  <div className="mb-4">
                    <Message type="error" message={formError} />
                  </div>
                )}
                {error && (
                  <div className="mb-4">
                    <Message type="error" message={error} />
                  </div>
                )}

                <div className="space-y-4">
                  {/* Full name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="03001234567"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                    />
                  </div>

                  {/* City + Postal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Lahore"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleAddressChange}
                        placeholder="54000"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      placeholder="Pakistan"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                    />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["COD", "stripe", "paypal"].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 rounded-xl border text-sm font-medium transition ${
                            paymentMethod === method
                              ? "bg-[#c9a84c] text-[#0f1b35] border-[#c9a84c]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#c9a84c]"
                          }`}
                        >
                          {method === "COD" && "💵 COD"}
                          {method === "stripe" && "💳 Stripe"}
                          {method === "paypal" && "🅿️ PayPal"}
                        </button>
                      ))}
                    </div>
                    {paymentMethod !== "COD" && (
                      <p className="text-xs text-gray-400 mt-2">
                        ℹ️ Online payment integration coming soon. COD selected as fallback.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right — Order Summary ── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                Order Summary
              </h3>

              {/* Items in summary */}
              <div className="space-y-3 mb-5">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={item.images?.[0]?.url}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-[#c9a84c] text-[#0f1b35] text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 flex-1 line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs font-semibold text-gray-800 shrink-0">
                      {formatPrice(
                        (item.discountPrice > 0
                          ? item.discountPrice
                          : item.price) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span
                    className={`font-medium ${
                      shippingPrice === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {shippingPrice === 0 ? "FREE" : formatPrice(shippingPrice)}
                  </span>
                </div>
                {shippingPrice === 0 && (
                  <p className="text-xs text-green-600">
                    🎉 You qualify for free shipping!
                  </p>
                )}
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-[#c9a84c]">{formatPrice(itemsPrice)}</span>
                </div>
              </div>

              {/* CTA Button */}
              {step === "cart" && (
                <button
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-[#c9a84c] hover:bg-[#b8953f] disabled:bg-gray-300 text-[#0f1b35] font-semibold py-3 rounded-xl transition"
                >
                  Proceed to Checkout →
                </button>
              )}

              {step === "checkout" && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? "Placing Order..." : "Place Order ✓"}
                </button>
              )}

              {/* Security note */}
              <p className="text-xs text-gray-400 text-center mt-3">
                🔒 Your information is safe and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;