import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import Navbar from "../../components/layout/Navbar";
import ProductCard from "../../components/common/ProductCard";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        setCategories(data.data);
      } catch {
        // non-blocking
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.keyword) params.append("keyword", filters.keyword);
        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.rating) params.append("rating", filters.rating);
        params.append("sort", filters.sort);
        params.append("page", filters.page);
        params.append("limit", 12);

        setSearchParams(params);

        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.data);
        setTotalPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setFilters({ keyword: "", category: "", minPrice: "", maxPrice: "", rating: "", sort: "newest", page: 1 });
  };

  const hasActiveFilters = filters.keyword || filters.category || filters.minPrice || filters.maxPrice || filters.rating;

  return (
    <div className="min-h-screen" style={{ background: "#f0f2f5" }}>
      <Navbar />

      {/* Hero banner */}
      <div className="py-10 px-4 text-center" style={{ background: "linear-gradient(135deg, #0f1b35 0%, #1a2f5e 100%)" }}>
        <h2 className="text-3xl font-black text-white mb-2">
          Premium Products, <span style={{ color: "#f0d080" }}>Best Prices</span>
        </h2>
        <p className="text-white/50 text-sm">
          {total > 0 ? `${total} products available` : "Discover our collection"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="rounded-2xl overflow-hidden sticky top-24"
              style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)", background: "white" }}>

              {/* Sidebar header */}
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #0f1b35, #1a2f5e)" }}>
                <span className="text-sm font-bold text-white">Filters</span>
                {hasActiveFilters && (
                  <button onClick={handleClearFilters}
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ background: "#c9a84c", color: "#0f1b35" }}>
                    Clear
                  </button>
                )}
              </div>

              <div className="p-5 space-y-6">
                {/* Category */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#c9a84c" }}>
                    Category
                  </p>
                  <div className="space-y-1">
                    {[{ _id: "", name: "All Categories" }, ...categories].map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleFilterChange("category", cat._id)}
                        className="block w-full text-left text-sm px-3 py-2 rounded-xl transition font-medium"
                        style={{
                          background: filters.category === cat._id ? "linear-gradient(135deg, #0f1b35, #1a2f5e)" : "transparent",
                          color: filters.category === cat._id ? "white" : "#6b7280",
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#c9a84c" }}>
                    Price (PKR)
                  </p>
                  <div className="space-y-2">
                    <input type="number" placeholder="Min" value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] bg-gray-50" />
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] bg-gray-50" />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#c9a84c" }}>
                    Min Rating
                  </p>
                  <div className="space-y-1">
                    {[4, 3, 2, 1].map((r) => (
                      <button key={r}
                        onClick={() => handleFilterChange("rating", filters.rating == r ? "" : r)}
                        className="flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-xl transition"
                        style={{
                          background: filters.rating == r ? "linear-gradient(135deg, #c9a84c, #f0d080)" : "transparent",
                          color: filters.rating == r ? "#0f1b35" : "#6b7280",
                          fontWeight: filters.rating == r ? "700" : "500",
                        }}
                      >
                        <span style={{ color: "#c9a84c" }}>{"★".repeat(r)}</span>
                        <span className="text-xs">& up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-gray-500">
                {loading ? "Loading..." : (
                  <><span className="font-black text-gray-900">{total}</span> products found</>
                )}
              </p>
              <select value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="text-sm border-2 border-gray-100 rounded-xl px-4 py-2 focus:outline-none focus:border-[#c9a84c] bg-white font-medium">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="top_rated">Top Rated</option>
              </select>
            </div>

            {loading && <Loader />}
            {error && <Message type="error" message={error} />}

            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="bg-white rounded-2xl p-20 text-center"
                    style={{ boxShadow: "0 2px 12px rgba(15,27,53,0.08)" }}>
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="font-bold text-gray-700 mb-1">No products found</p>
                    <p className="text-sm text-gray-400 mb-4">Try adjusting your filters</p>
                    <button onClick={handleClearFilters}
                      className="text-sm font-bold px-5 py-2.5 rounded-xl"
                      style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0f1b35" }}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {products.map((p) => <ProductCard key={p._id} product={p} />)}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-xl hover:border-[#c9a84c] disabled:opacity-30 transition bg-white">
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p}
                        onClick={() => handlePageChange(p)}
                        className="px-4 py-2 text-sm font-bold rounded-xl border-2 transition"
                        style={{
                          borderColor: filters.page === p ? "#c9a84c" : "#e5e7eb",
                          background: filters.page === p ? "linear-gradient(135deg, #c9a84c, #f0d080)" : "white",
                          color: filters.page === p ? "#0f1b35" : "#6b7280",
                        }}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                      className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-xl hover:border-[#c9a84c] disabled:opacity-30 transition bg-white">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
