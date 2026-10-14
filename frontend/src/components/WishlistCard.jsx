import { Link } from "react-router-dom";
import { useContext } from "react";
import CartContext from "../context/CartContext";
import { resolveProduct } from "../data/productRegistry";

function WishlistCard({ product, onRemove, removing }) {
  const { addCart } = useContext(CartContext) || { addCart: () => {} };

  const resolved = resolveProduct(product);
  const prodName = resolved.title || resolved.name || "Technical Outerwear";
  const prodPrice = resolved.price || 250;
  const prodImage = resolved.image || "/assets/cat_sale_pop.png";

  const handleAddToCart = async () => {
    try {
      await addCart(resolved);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative bg-[#140c10]/90 hover:bg-[#190f14] border border-white/[0.08] hover:border-white/25 rounded-2xl p-4 pt-2 flex flex-col justify-between transition-all duration-300 group shadow-lg hover:shadow-2xl">
      {/* Remove from Wishlist Trash Button */}
      <button
        type="button"
        onClick={() => onRemove(product._id || product.id)}
        disabled={removing}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-400 flex items-center justify-center transition-all duration-200 z-20 cursor-pointer disabled:opacity-50"
        title="Remove from Wishlist"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Pop Out Product Image */}
      <div className="relative w-full h-36 sm:h-40 flex items-center justify-center -mt-7 sm:-mt-8 mb-1 pointer-events-none z-10">
        <img
          src={prodImage}
          alt={prodName}
          className="max-h-[120%] sm:max-h-[130%] max-w-[110%] object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.85)] group-hover:scale-115 group-hover:-translate-y-2 transition-all duration-300 select-none"
        />
      </div>

      {/* Product Info */}
      <div className="w-full pt-1 select-none">
        <div className="flex items-center justify-between mb-0.5">
          <Link
            to={`/products/${product._id || product.id || ""}`}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-tight line-clamp-1"
          >
            {prodName}
          </Link>
          <span className="text-xs sm:text-sm font-black text-white shrink-0 ml-2">
            ${prodPrice}
          </span>
        </div>

        <p className="text-[10px] text-white/50 leading-tight mb-3">
          {product.category || "Technical Apparel"} • In Stock
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-[10.5px] font-black tracking-wider uppercase transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Move to Cart</span>
          </button>

          <Link
            to={`/products/${product._id || product.id || ""}`}
            className="py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-[10.5px] font-bold tracking-wider uppercase transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;