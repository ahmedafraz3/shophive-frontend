import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import { formatPrice } from "../../utils/currency";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault(); // don't navigate to product page
    addToCart(product, 1);
  };

  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-gray-100">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-xs text-gray-600">
            {product.rating.toFixed(1)} ({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.discountPrice > 0 ? product.discountPrice : product.price)}
          </span>
          {product.discountPrice > 0 && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Seller name */}
        <p className="text-xs text-gray-400 mt-1">{product.seller?.shopName}</p>

        {/* Add to cart — only for buyers */}
        {user?.role === "buyer" && product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full bg-[#c9a84c] hover:bg-[#b8953f] text-[#0f1b35] text-sm font-medium py-2 rounded-lg transition"
          >
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;