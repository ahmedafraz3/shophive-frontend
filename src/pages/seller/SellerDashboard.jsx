import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import Navbar from "../../components/layout/Navbar";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import useOrder from "../../hooks/useOrder";
import { formatPrice } from "../../utils/currency";
import {
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiClock,
  FiInbox,
  FiClipboard,
  FiUser,
  FiMapPin,
} from "react-icons/fi";

const statusColors = {
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-[#f7efd0] text-[#7a6427]",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { orders, loading: ordersLoading, error: ordersError, getSellerOrders, updateOrderStatus } = useOrder();

  const [products, setProducts] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    fetchMyProducts();
    getSellerOrders();
  }, []);

  const fetchMyProducts = async () => {
    setStatsLoading(true);
    try {
      const { data } = await API.get("/products/seller/my-products");
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    await updateOrderStatus(orderId, newStatus);
    setStatusUpdating(null);
  };

  // Calculate stats from real data
  const totalRevenue = orders.reduce((acc, order) => {
    if (order.orderStatus !== "cancelled") {
      const sellerItems = order.items.filter(
        (item) => products.some((p) => p._id === item.product?._id || p._id === item.product)
      );
      return acc + sellerItems.reduce((a, item) => a + item.price * item.quantity, 0);
    }
    return acc;
  }, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === "processing").length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered").length;

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: FiPackage,
      color: "bg-[#fdf7e2] text-[#c9a84c]",
      action: () => setActiveTab("products"),
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: FiShoppingCart,
      color: "bg-purple-50 text-purple-600",
      action: () => setActiveTab("orders"),
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue),
      icon: FiDollarSign,
      color: "bg-green-50 text-green-600",
      action: null,
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: FiClock,
      color: "bg-yellow-50 text-yellow-600",
      action: () => setActiveTab("orders"),
    },
  ];

  const tabs = ["overview", "products", "orders"];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your products and orders
            </p>
          </div>
          <button
            onClick={() => navigate("/seller/products")}
            className="bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            + Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-[#c9a84c] text-[#0f1b35] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                <div
                  key={stat.label}
                  onClick={stat.action || undefined}
                  className={`bg-white rounded-2xl shadow-sm p-5 ${
                    stat.action ? "cursor-pointer hover:shadow-md transition" : ""
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${stat.color}`}>
                    <Icon />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
                );
              })}
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-sm text-[#c9a84c] hover:underline"
                >
                  View all
                </button>
              </div>
              {ordersLoading ? (
                <Loader />
              ) : orders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-xs font-mono text-gray-500">
                          {order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {order.buyer?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatPrice(order.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent products */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Products</h2>
                <button
                  onClick={() => navigate("/seller/products")}
                  className="text-sm text-[#c9a84c] hover:underline"
                >
                  Manage all
                </button>
              </div>
              {statsLoading ? (
                <Loader />
              ) : products.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No products yet
                </p>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 4).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Stock: {product.stock} · {formatPrice(product.price)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">
                My Products ({products.length})
              </h2>
              <button
                onClick={() => navigate("/seller/products")}
                className="bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                + Add New
              </button>
            </div>

            {statsLoading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-3 text-gray-400 text-4xl">
                  <FiInbox />
                </div>
                <p className="text-gray-500">No products yet</p>
                <button
                  onClick={() => navigate("/seller/products")}
                  className="mt-4 text-[#c9a84c] hover:underline text-sm"
                >
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Product</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Category</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Price</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Stock</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]?.url}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-gray-800 truncate max-w-[150px]">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {product.category?.name}
                        </td>
                        <td className="py-3 px-2 font-medium">{formatPrice(product.price)}</td>
                        <td className="py-3 px-2">
                          <span className={product.stock < 5 ? "text-red-500 font-medium" : "text-gray-700"}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {ordersLoading && <Loader />}
            {ordersError && <Message type="error" message={ordersError} />}

            {!ordersLoading && orders.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                <div className="flex justify-center mb-4 text-gray-400 text-5xl">
                  <FiClipboard />
                </div>
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}

            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-5">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="font-mono text-xs text-gray-700">{order._id}</p>
                    <div className="text-sm font-medium text-gray-800 mt-0.5 flex items-center gap-1.5">
                      <FiUser className="text-gray-500" />
                      <span>{order.buyer?.name} · {order.buyer?.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                <div className="p-3 bg-[#fdf7e2] rounded-xl mb-4 text-xs text-gray-600">
                  <p className="font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiMapPin />
                    <span>Ship to:</span>
                  </p>
                  <p>
                    {order.shippingAddress?.fullName} · {order.shippingAddress?.phone}
                  </p>
                  <p>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                  </p>
                </div>

                {/* Status update */}
                {order.orderStatus !== "delivered" &&
                  order.orderStatus !== "cancelled" && (
                    <div className="flex flex-wrap gap-2">
                      <p className="text-xs text-gray-500 w-full">
                        Update Status:
                      </p>
                      {["processing", "shipped", "delivered", "cancelled"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order._id, status)}
                            disabled={
                              statusUpdating === order._id ||
                              order.orderStatus === status
                            }
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition border ${
                              order.orderStatus === status
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                                : status === "cancelled"
                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                : "border-[#c9a84c] text-[#c9a84c] hover:bg-[#fdf7e2]"
                            } disabled:opacity-50`}
                          >
                            {statusUpdating === order._id ? "..." : status}
                          </button>
                        )
                      )}
                    </div>
                  )}

                {/* Date */}
                <p className="text-xs text-gray-400 mt-3">
                  Ordered:{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;