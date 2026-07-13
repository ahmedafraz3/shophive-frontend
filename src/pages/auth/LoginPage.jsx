
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError, user } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) {
      if (user.role === "seller") navigate("/seller/dashboard");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) clearError();
  }, [formData]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.role === "seller") navigate("/seller/dashboard");
      else if (result.role === "admin") navigate("/admin");
      else navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f1b35 0%, #1a2f5e 50%, #0f1b35 100%)" }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16">
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)" }}>
            <img src="/carts.png" alt="ShopHive" onError={(e) => (e.currentTarget.src = '/favicon.png')}
              className="w-full h-full object-contain" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Welcome to<br />
            <span style={{ color: "#f0d080" }}>ShopHive</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Pakistan's premium multi-vendor marketplace. Buy, sell, and grow your business.
          </p>
        </div>

        <div className="space-y-4">
          {["🛒 Browse thousands of products", "🏪 Start selling in minutes", "🔒 Secure payments & delivery"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: "#c9a84c" }}></div>
              <p className="text-white/70 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">

            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
            </div>

            {error && <div className="mb-5"><Message type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] transition bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] transition bg-gray-50"
                />
              </div>

              {loading ? <Loader /> : (
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)", color: "white" }}
                >
                  Sign In to ShopHive
                </button>
              )}
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            <p className="text-center text-sm text-gray-500">
              New to ShopHive?{" "}
              <Link to="/register" className="font-bold hover:opacity-80 transition" style={{ color: "#c9a84c" }}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;