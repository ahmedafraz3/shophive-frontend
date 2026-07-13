import { useState, useEffect, useRef } from "react";
import API from "../../api/axios";
import Navbar from "../../components/layout/Navbar";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import { formatPrice } from "../../utils/currency";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  category: "",
  isActive: true,
};

const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = adding new
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get("/products/seller/my-products");
      setProducts(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.data);
    } catch {}
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditProduct(null);
    setFormData(EMPTY_FORM);
    setImages([]);
    setImagePreviews([]);
    setFormError("");
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      stock: product.stock,
      category: product.category?._id || "",
      isActive: product.isActive,
    });
    setImages([]);
    setImagePreviews(product.images.map((img) => img.url));
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setFormData(EMPTY_FORM);
    setImages([]);
    setImagePreviews([]);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImages(files);

    // Generate previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Submit — add or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.description || !formData.price ||
        !formData.stock || !formData.category) {
      return setFormError("Please fill in all required fields");
    }

    if (!editProduct && images.length === 0) {
      return setFormError("Please select at least one image");
    }

    setFormLoading(true);

    try {
      // Must use FormData for file upload
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("discountPrice", formData.discountPrice || 0);
      form.append("stock", formData.stock);
      form.append("category", formData.category);
      form.append("isActive", formData.isActive);
      images.forEach((img) => form.append("images", img));

      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Product updated successfully!");
      } else {
        await API.post("/products", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Product added successfully!");
      }

      handleCloseModal();
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setSuccess("Product deleted successfully!");
      setDeleteId(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} products listed
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            + Add Product
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4">
            <Message type="success" message={success} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4">
            <Message type="error" message={error} />
          </div>
        )}

        {/* Loading */}
        {loading && <Loader />}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500 font-medium mb-2">No products yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Add your first product to start selling
            </p>
            <button
              onClick={handleOpenAdd}
              className="bg-[#c9a84c] text-[#0f1b35] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#b8953f] transition"
            >
              Add First Product
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 bg-gray-100">
                  <img
                    src={product.images[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-1">
                    {product.category?.name}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className={`text-xs font-medium ${
                      product.stock < 5 ? "text-red-500" : "text-gray-500"
                    }`}>
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-xs text-gray-500">
                      {product.rating.toFixed(1)} ({product.numReviews})
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="flex-1 text-sm font-medium py-2 rounded-lg border border-[#c9a84c] text-[#c9a84c] hover:bg-[#fdf7e2] transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(product._id)}
                      className="flex-1 text-sm font-medium py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add/Edit Product Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {formError && <Message type="error" message={formError} />}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Nike Air Max 90"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Describe your product..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
                />
              </div>

              {/* Price + Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="99.99"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price (Rs)
                    <span className="text-gray-400 font-normal"> (optional)</span>
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleFormChange}
                    placeholder="79.99"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
              </div>

              {/* Stock + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    placeholder="100"
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-[#c9a84c]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Product is active and visible to buyers
                </label>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images{" "}
                  {!editProduct && <span className="text-red-500">*</span>}
                  {editProduct && (
                    <span className="text-gray-400 font-normal">
                      {" "}(leave empty to keep existing)
                    </span>
                  )}
                </label>

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {imagePreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`preview-${i}`}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#c9a84c] hover:bg-[#fdf7e2] transition"
                >
                  <p className="text-3xl mb-1">📸</p>
                  <p className="text-sm text-gray-500">
                    Click to upload images (max 5)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, or WebP · Max 5MB each
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Form actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-[#c9a84c] hover:bg-[#b8953f] disabled:bg-[#d8c086] text-[#0f1b35] font-semibold rounded-xl transition text-sm"
                >
                  {formLoading
                    ? "Saving..."
                    : editProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <p className="text-4xl text-center mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete the product and all its images from
              Cloudinary. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;