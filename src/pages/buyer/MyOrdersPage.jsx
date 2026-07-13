import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useOrder from "../../hooks/useOrder";
import Navbar from "../../components/layout/Navbar";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import { formatPrice } from "../../utils/currency";

const statusColors = {
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-[#f7efd0] text-[#7a6427]",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { orders, loading, error, getMyOrders } = useOrder();

  useEffect(() => {
    getMyOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {loading && <Loader />}
        {error && <Message type="error" message={error} />}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500 font-medium mb-4">No orders yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#c9a84c] text-[#0f1b35] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#b8953f] transition"
            >
              Start Shopping
            </button>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
            >
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                  <p className="font-mono text-xs text-gray-700">{order._id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      statusColors[order.orderStatus]
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500">
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="mx-2">·</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">
                    Total: {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;