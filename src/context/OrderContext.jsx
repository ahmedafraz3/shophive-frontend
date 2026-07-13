import { createContext, useState } from "react";
import API from "../api/axios";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Place order
  const placeOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post("/orders", orderData);
      setOrder(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to place order";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get my orders (buyer)
  const getMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get("/orders/my-orders");
      setOrders(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Get single order
  const getOrderById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  // Get seller orders
  const getSellerOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get("/orders/seller/my-orders");
      setOrders(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status (seller)
  const updateOrderStatus = async (id, orderStatus) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.put(`/orders/${id}/status`, { orderStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? data.data : o))
      );
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update status";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        order,
        loading,
        error,
        placeOrder,
        getMyOrders,
        getOrderById,
        getSellerOrders,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};