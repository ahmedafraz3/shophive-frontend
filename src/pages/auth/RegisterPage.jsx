import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";

const inputClass = "w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] transition bg-gray-50";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "buyer", shopName: "", shopDescription: "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);
  useEffect(() => {
    if (error) clearError();
    if (localError) setLocalError("");
  }, [formData]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    const { name, email, password, confirmPassword, role, shopName, shopDescription } = formData;
    if (password !== confirmPassword) return setLocalError("Passwords do not match");
    if (password.length < 6) return setLocalError("Password must be at least 6 characters");
    if (role === "seller" && !shopName.trim()) return setLocalError("Shop name is required");

    const result = await register({ name, email, password, role, shopName, shopDescription });
    if (result.success) navigate(role === "seller" ? "/seller/dashboard" : "/");
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0f1b35 0%, #1a2f5e 50%, #0f1b35 100%)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-3 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)" }}>
            <img src="/carts.png" alt="ShopHive" onError={(e) => (e.currentTarget.src = '/favicon.png')}
              className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white">Create Account</h1>
          <p className="text-white/50 text-sm mt-1">Join ShopHive today</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {displayError && <div className="mb-5"><Message type="error" message={displayError} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="John Doe" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" required className={inputClass} />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "buyer", label: "🛍️ Buy Products" },
                  { value: "seller", label: "🏪 Sell Products" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: r.value }))}
                    className="py-3 rounded-xl border-2 text-sm font-semibold transition"
                    style={{
                      borderColor: formData.role === r.value ? "#c9a84c" : "#e5e7eb",
                      background: formData.role === r.value ? "linear-gradient(135deg, #c9a84c, #f0d080)" : "white",
                      color: formData.role === r.value ? "#0f1b35" : "#6b7280",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller fields */}
            {formData.role === "seller" && (
              <div className="p-4 rounded-2xl space-y-3" style={{ background: "#fdf8ee", border: "1px solid #e8d5a3" }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a84c" }}>
                  Shop Details
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shop Name</label>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleChange}
                    placeholder="My Awesome Store" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Description <span className="normal-case font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea name="shopDescription" value={formData.shopDescription} onChange={handleChange}
                    rows={2} placeholder="Tell buyers about your shop..."
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  placeholder="Min 6 chars" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" required className={inputClass} />
              </div>
            </div>

            {loading ? <Loader /> : (
              <button type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)", color: "white" }}>
                Create My Account
              </button>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-bold" style={{ color: "#c9a84c" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;