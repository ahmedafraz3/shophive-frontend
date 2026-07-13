import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import API from "../../api/axios";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import { formatPrice } from "../../utils/currency";
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
} from "react-icons/fi";

// ── Stat Card ──
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: color + "20" }}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs mt-1 font-semibold" style={{ color: "#c9a84c" }}>{sub}</p>}
  </div>
);

// ── Status Badge ──
const StatusBadge = ({ status }) => {
  const styles = {
    processing: { bg: "#fef3c7", color: "#92400e" },
    shipped:    { bg: "#fdf7e2", color: "#7a6427" },
    delivered:  { bg: "#d1fae5", color: "#065f46" },
    cancelled:  { bg: "#fee2e2", color: "#991b1b" },
    pending:    { bg: "#f3f4f6", color: "#374151" },
    paid:       { bg: "#d1fae5", color: "#065f46" },
    failed:     { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

// ── Simple Bar Chart ──
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <p className="text-xs font-bold text-gray-500">{formatPrice(d.revenue)}</p>
          <div className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: `${Math.max((d.revenue / max) * 100, 4)}%`,
              background: "linear-gradient(180deg, #c9a84c, #f0d080)",
            }} />
          <p className="text-xs text-gray-400 font-medium">{d.month}</p>
        </div>
      ))}
    </div>
  );
};

// ── Overview Tab ──
const OverviewTab = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={<FiUsers />} label="Total Users"     value={stats.totalUsers}                color="#c9a84c" />
      <StatCard icon={<FiPackage />} label="Total Products" value={stats.totalProducts}             color="#0f1b35" />
      <StatCard icon={<FiShoppingCart />} label="Total Orders" value={stats.totalOrders}           color="#f59e0b" />
      <StatCard icon={<FiDollarSign />} label="Total Revenue" value={formatPrice(stats.totalRevenue)} color="#10b981" />
    </div>

    {/* Order status breakdown */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(stats.ordersByStatus).map(([status, count]) => (
        <div key={status} className="bg-white rounded-2xl p-4 text-center"
          style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
          <p className="text-2xl font-black text-gray-900">{count}</p>
          <StatusBadge status={status} />
        </div>
      ))}
    </div>

    {/* Revenue chart */}
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
      <h3 className="font-black text-gray-900 mb-6">Revenue — Last 6 Months</h3>
      <BarChart data={stats.monthlyRevenue} />
    </div>
  </div>
);

// ── Users Tab ──
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setLoading(true);
    API.get("/admin/users")
      .then(({ data }) => setUsers(data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (user) => {
    setUpdating(user._id);
    try {
      const { data } = await API.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers((p) => p.map((u) => u._id === user._id ? data.data : u));
    } catch {}
    setUpdating(null);
  };

  const handleRoleChange = async (user, role) => {
    setUpdating(user._id);
    try {
      const { data } = await API.put(`/admin/users/${user._id}`, { role });
      setUsers((p) => p.map((u) => u._id === user._id ? data.data : u));
    } catch {}
    setUpdating(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((p) => p.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message type="error" message={error} />;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)" }}>
        <h3 className="font-black text-white">All Users ({users.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)", color: "#f0d080" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {user.shopName && <p className="text-xs font-medium" style={{ color: "#c9a84c" }}>{user.shopName}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    disabled={updating === user._id}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-gray-100 focus:outline-none focus:border-[#c9a84c] bg-white capitalize"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={user.isActive ? "delivered" : "cancelled"} />
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(user)}
                      disabled={updating === user._id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition"
                      style={{
                        borderColor: user.isActive ? "#ef4444" : "#10b981",
                        color: user.isActive ? "#ef4444" : "#10b981",
                      }}
                    >
                      {updating === user._id ? "..." : user.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Products Tab ──
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    setLoading(true);
    API.get("/admin/products")
      .then(({ data }) => setProducts(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await API.put(`/admin/products/${id}/toggle`);
      setProducts((p) => p.map((prod) => prod._id === id ? data.data : prod));
    } catch {}
    setToggling(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product and its images permanently?")) return;
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts((p) => p.filter((prod) => prod._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
      <div className="px-6 py-4 border-b border-gray-100"
        style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)" }}>
        <h3 className="font-black text-white">All Products ({products.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Product", "Seller", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]?.url} alt={product.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <p className="font-bold text-gray-900 max-w-[150px] truncate">{product.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{product.seller?.shopName || product.seller?.name}</td>
                <td className="px-5 py-4 text-gray-500">{product.category?.name}</td>
                <td className="px-5 py-4 font-bold text-gray-900">{formatPrice(product.price)}</td>
                <td className="px-5 py-4">
                  <span className={product.stock < 5 ? "text-red-500 font-bold" : "text-gray-700"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={product.isActive ? "delivered" : "cancelled"} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(product._id)} disabled={toggling === product._id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition"
                      style={{
                        borderColor: product.isActive ? "#f59e0b" : "#10b981",
                        color: product.isActive ? "#f59e0b" : "#10b981",
                      }}>
                      {toggling === product._id ? "..." : product.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(product._id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 transition">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Orders Tab ──
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setLoading(true);
    API.get("/admin/orders")
      .then(({ data }) => setOrders(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, orderStatus) => {
    setUpdating(id);
    try {
      const { data } = await API.put(`/admin/orders/${id}/status`, { orderStatus });
      setOrders((p) => p.map((o) => o._id === id ? data.data : o));
    } catch {}
    setUpdating(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="font-bold text-gray-900">{order.buyer?.name}</p>
                <p className="text-xs text-gray-400">{order.buyer?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.orderStatus} />
              <span className="font-black text-gray-900">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-wrap gap-2 mb-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status update */}
          {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && (
            <div className="flex flex-wrap gap-2">
              {["processing", "shipped", "delivered", "cancelled"].map((s) => (
                <button key={s} onClick={() => handleStatus(order._id, s)}
                  disabled={updating === order._id || order.orderStatus === s}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border-2 capitalize transition"
                  style={{
                    borderColor: order.orderStatus === s ? "#c9a84c" : "#e5e7eb",
                    background: order.orderStatus === s ? "linear-gradient(135deg, #c9a84c, #f0d080)" : "white",
                    color: order.orderStatus === s ? "#0f1b35" : s === "cancelled" ? "#ef4444" : "#6b7280",
                  }}>
                  {updating === order._id ? "..." : s}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            {new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>
      ))}
    </div>
  );
};

// ── Categories Tab ──
const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = () => {
    setLoading(true);
    API.get("/admin/categories")
      .then(({ data }) => setCategories(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await API.post("/admin/categories", { name });
      setCategories((p) => [...p, data.data]);
      setName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.put(`/admin/categories/${id}`, { name: editName });
      setCategories((p) => p.map((c) => c._id === id ? data.data : c));
      setEditId(null);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      setCategories((p) => p.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="max-w-2xl space-y-5">

      {/* Add form */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
        <h3 className="font-black text-gray-900 mb-4">Add New Category</h3>
        {error && <div className="mb-3"><Message type="error" message={error} /></div>}
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name e.g. Electronics"
            className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] bg-gray-50"
          />
          <button type="submit" disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)", color: "white" }}>
            {saving ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
        <div className="px-6 py-4 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)" }}>
          <h3 className="font-black text-white">Categories ({categories.length})</h3>
        </div>
        {loading ? <Loader /> : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                {editId === cat._id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-[#c9a84c] rounded-xl text-sm focus:outline-none"
                    />
                    <button onClick={() => handleUpdate(cat._id)} disabled={saving}
                      className="text-xs font-bold px-4 py-2 rounded-xl"
                      style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0f1b35" }}>
                      {saving ? "..." : "Save"}
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="text-xs font-bold px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-500">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() => { setEditId(cat._id); setEditName(cat.name); }}
                      className="text-xs font-bold px-4 py-2 rounded-xl border-2 border-[#c9a84c] transition hover:bg-[#fdf8ee]"
                      style={{ color: "#c9a84c" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cat._id)}
                      className="text-xs font-bold px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition">
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === "overview") {
      setLoading(true);
      API.get("/admin/stats")
        .then(({ data }) => setStats(data.data))
        .catch((err) => setError(err.response?.data?.message || "Failed to load stats"))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "overview" && (
        loading ? <Loader /> :
        error ? <Message type="error" message={error} /> :
        stats ? <OverviewTab stats={stats} /> : null
      )}
      {activeTab === "users"      && <UsersTab />}
      {activeTab === "products"   && <ProductsTab />}
      {activeTab === "orders"     && <OrdersTab />}
      {activeTab === "categories" && <CategoriesTab />}
    </AdminLayout>
  );
};

export default AdminDashboard;