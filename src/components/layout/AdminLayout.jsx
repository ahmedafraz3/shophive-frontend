import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  FiBarChart2,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiLogOut,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const NAV = [
  { id: "overview", label: "Overview", icon: FiBarChart2 },
  { id: "users", label: "Users", icon: FiUsers },
  { id: "products", label: "Products", icon: FiPackage },
  { id: "orders", label: "Orders", icon: FiShoppingCart },
  { id: "categories", label: "Categories", icon: FiTag },
];

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f2f5" }}>

      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? "72px" : "240px",
          background: "linear-gradient(180deg, #0f1b35 0%, #1a2f5e 100%)",
          boxShadow: "4px 0 20px rgba(15,27,53,0.3)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/carts.png" alt="ShopHive" onError={(e) => (e.currentTarget.src = '/favicon.png')}
              className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-black text-white text-sm leading-tight">ShopHive</p>
              <p className="text-xs font-medium" style={{ color: "#c9a84c" }}>Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{
                  background: activeTab === item.id
                    ? "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(240,208,128,0.1))"
                    : "transparent",
                  borderLeft: activeTab === item.id ? "3px solid #c9a84c" : "3px solid transparent",
                }}
              >
                <span className="text-lg shrink-0" style={{ color: activeTab === item.id ? "#f0d080" : "rgba(255,255,255,0.65)" }}>
                  <Icon />
                </span>
                {!collapsed && (
                  <span
                    className="text-sm font-semibold transition-all"
                    style={{ color: activeTab === item.id ? "#f0d080" : "rgba(255,255,255,0.6)" }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-white/50 text-xs"
          >
            {collapsed ? <FiChevronsRight size={14} /> : <FiChevronsLeft size={14} />}
            {!collapsed && "Collapse"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition text-red-400 text-sm font-semibold"
          >
            <FiLogOut className="shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white px-8 py-4 flex items-center justify-between"
          style={{ boxShadow: "0 2px 8px rgba(15,27,53,0.06)" }}>
          <div>
            <h1 className="text-lg font-black text-gray-900 capitalize">
              {NAV.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs font-semibold" style={{ color: "#c9a84c" }}>Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)", color: "#f0d080" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;