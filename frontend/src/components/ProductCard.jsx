import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CartContext from "../context/CartContext";

function ProductCard({ product }) {
  const { addCart } = useContext(CartContext);
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const handleAddCart = async () => {
    try {
      setAddingToCart(true);
      await addCart(product);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddWishlist = async () => {
    try {
      setSaving(true);
      setWishlistError("");

      await api.post(`/wishlist/${product._id}`);
      setWishlistAdded(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistError("Already in your wishlist");
      } else {
        setWishlistError("Unable to save to wishlist");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#141316]/90 backdrop-blur-xl rounded-[28px] border border-white/10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:border-white/25 hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] transition-all duration-300 flex flex-col justify-between group">
      {/* Product Image Container */}
      <div className="relative w-full h-60 bg-gradient-to-b from-white/5 to-transparent overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/80">
          {product.category || "Outerwear"}
        </div>
        <button
          onClick={handleAddWishlist}
          disabled={saving || wishlistAdded}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            wishlistAdded
              ? "bg-red-500 text-white shadow-md"
              : "bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/20 border border-white/10"
          }`}
          title="Wishlist"
        >
          <svg className="w-4 h-4" fill={wishlistAdded ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-orange-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-black text-white">
              ₹{product.price}
            </span>
            <span className={`text-[11px] font-semibold ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Sold Out"}
            </span>
          </div>
        </div>

        {wishlistError && (
          <p className="text-[11px] text-red-400 mt-2 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
            {wishlistError}
          </p>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <Link
            to={`/products/${product._id}`}
            className="py-2.5 rounded-full text-center text-xs font-bold text-white/80 bg-white/10 hover:bg-white/20 border border-white/10 hover:text-white transition-all"
          >
            Details
          </Link>

          <button
            onClick={handleAddCart}
            disabled={addingToCart || product.stock <= 0}
            className="py-2.5 rounded-full text-center text-xs font-extrabold text-black bg-white hover:bg-orange-400 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-40"
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;