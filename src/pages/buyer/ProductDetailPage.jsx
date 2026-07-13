import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import Navbar from "../../components/layout/Navbar";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { formatPrice } from "../../utils/currency";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Image gallery
  const [activeImage, setActiveImage] = useState(0);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Cart feedback
  const [addedToCart, setAddedToCart] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess(false);
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment });
      setReviewSuccess(true);
      setComment("");
      setRating(5);
      fetchProduct(); // re-fetch to show new review + updated rating
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  // Check if buyer already reviewed
  const alreadyReviewed = product?.reviews?.some(
    (r) => r.user?._id === user?._id || r.user === user?._id
  );

  // Check if product is in cart
  const inCart = cartItems.some((item) => item._id === product?._id);

  // Discount percentage
  const discount =
    product?.discountPrice > 0
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        )
      : 0;

  const finalPrice =
    product?.discountPrice > 0 ? product.discountPrice : product?.price;

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16"><Loader /></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Message type="error" message={error} />
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <button onClick={() => navigate("/")} className="hover:text-[#c9a84c]">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-400">{product.category?.name}</span>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* ── Top Section — Image + Info ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Image Gallery */}
            <div className="md:w-1/2">
              {/* Main image */}
              <div className="w-full h-80 rounded-xl overflow-hidden bg-gray-100 mb-3">
                <img
                  src={product.images[activeImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        activeImage === i
                          ? "border-[#c9a84c]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 flex flex-col">

              {/* Category + Name */}
              <p className="text-sm text-[#c9a84c] font-medium mb-1">
                {product.category?.name}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Math.round(product.rating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating.toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(finalPrice)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <p className={`text-sm font-medium mb-4 ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}>
                {product.stock > 10
                  ? "✓ In Stock"
                  : product.stock > 0
                  ? `⚠ Only ${product.stock} left`
                  : "✗ Out of Stock"}
              </p>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Seller info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
                <div className="w-10 h-10 rounded-full bg-[#f7efd0] flex items-center justify-center text-[#c9a84c] font-bold text-lg">
                  {product.seller?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {product.seller?.shopName || product.seller?.name}
                  </p>
                  {product.seller?.shopDescription && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {product.seller.shopDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Add to cart section — buyers only */}
              {user?.role === "buyer" && product.stock > 0 && (
                <div className="flex items-center gap-3 mt-auto">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition font-bold"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition ${
                      addedToCart
                        ? "bg-green-500 text-white"
                        : inCart
                        ? "bg-gray-100 text-gray-700 border border-gray-300"
                        : "bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35]"
                    }`}
                  >
                    {addedToCart
                      ? "✓ Added to Cart!"
                      : inCart
                      ? "Add More"
                      : "Add to Cart"}
                  </button>

                  {/* Go to cart */}
                  {inCart && (
                    <button
                      onClick={() => navigate("/cart")}
                      className="py-2.5 px-4 rounded-lg border border-[#c9a84c] text-[#c9a84c] font-semibold text-sm hover:bg-[#fdf7e2] transition"
                    >
                      View Cart
                    </button>
                  )}
                </div>
              )}

              {/* Not logged in */}
              {!user && (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] font-semibold rounded-lg transition text-sm"
                >
                  Login to Add to Cart
                </button>
              )}

              {/* Out of stock */}
              {product.stock === 0 && (
                <div className="w-full py-2.5 bg-gray-100 text-gray-500 font-semibold rounded-lg text-center text-sm">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Customer Reviews
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({product.numReviews})
            </span>
          </h2>

          {/* Overall rating summary */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {product.rating.toFixed(1)}
                </p>
                <div className="text-yellow-400 text-lg">
                  {"★".repeat(Math.round(product.rating))}
                  {"☆".repeat(5 - Math.round(product.rating))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {product.numReviews} reviews
                </p>
              </div>
            </div>
          )}

          {/* Review list */}
          {product.reviews.length === 0 ? (
            <p className="text-gray-500 text-sm mb-6">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-4 mb-8">
              {product.reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#f7efd0] flex items-center justify-center text-[#c9a84c] font-bold text-sm">
                        {review.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-gray-800">
                        {review.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Write review form — buyers only, not already reviewed */}
          {user?.role === "buyer" && !alreadyReviewed && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Write a Review
              </h3>

              {reviewError && (
                <div className="mb-4">
                  <Message type="error" message={reviewError} />
                </div>
              )}
              {reviewSuccess && (
                <div className="mb-4">
                  <Message type="success" message="Review submitted successfully!" />
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star rating picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition ${
                          star <= rating
                            ? "text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 self-center">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-[#c9a84c] hover:bg-[#b8953f] disabled:bg-[#d8c086] text-[#0f1b35] font-semibold px-6 py-2.5 rounded-lg transition text-sm"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Already reviewed message */}
          {user?.role === "buyer" && alreadyReviewed && (
            <div className="border-t border-gray-100 pt-6">
              <Message type="info" message="You have already reviewed this product." />
            </div>
          )}

          {/* Not logged in */}
          {!user && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500">
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#c9a84c] hover:underline font-medium"
                >
                  Login
                </button>{" "}
                to write a review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;