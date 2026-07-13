import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?keyword=${search.trim()}`);
      setSearch("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md overflow-hidden" style={{ background: "transparent" }}>
            <img src="/carts.png" alt="ShopHive" onError={(e) => (e.currentTarget.src = '/favicon.png')}
              className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold text-[#c9a84c] hidden md:inline">ShopHive</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
          <button
            type="submit"
            className="bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] px-4 py-2 rounded-r-lg text-sm font-medium transition"
          >
            Search
          </button>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Cart — buyers only */}
          {user?.role === "buyer" && (
            <Link to="/cart" className="relative">
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Seller dashboard link */}
          {user?.role === "seller" && (
            <Link
              to="/seller/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-[#c9a84c] transition"
            >
              Dashboard
            </Link>
          )}

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#c9a84c] transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#f7efd0] flex items-center justify-center text-[#c9a84c] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name.split(" ")[0]}</span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                    <span className="text-xs bg-[#f7efd0] text-[#c9a84c] px-2 py-0.5 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>

                  {user.role === "buyer" && (
                    <Link
                      to="/my-orders"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                  )}
                  {user.role === "seller" && (
                    <>
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/seller/products"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Products
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-[#c9a84c] transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-[#c9a84c] text-[#0f1b35] px-3 py-1.5 rounded-lg hover:bg-[#b8953f] transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;