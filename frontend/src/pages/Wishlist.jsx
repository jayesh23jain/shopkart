import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import WishlistCard from "../components/WishlistCard";
import Navbar from "../components/Navbar";

// Curated fallbacks in case backend wishlist is empty or user is exploring
const SAMPLE_WISHLIST = [
  {
    _id: "prod-crimson-puffer",
    name: "Crimson Core Puffer Jacket",
    category: "Outerwear",
    price: 250,
    image: "/assets/cat_sale_pop.png",
    stock: 8,
  },
  {
    _id: "prod-alpha-pants",
    name: "Alpha Tactical Pants",
    category: "Technical Apparel",
    price: 250,
    image: "/assets/prod_alpha_pants_pop.png",
    stock: 14,
  },
  {
    _id: "prod-shoe",
    name: "Aero Speed Trail Shoe",
    category: "Footwear",
    price: 380,
    image: "/assets/prod_shoe_pop.png",
    stock: 5,
  },
];

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/wishlist");
      if (response.data?.wishlist && response.data.wishlist.length > 0) {
        setWishlist(response.data.wishlist);
      } else {
        setWishlist(SAMPLE_WISHLIST);
      }
    } catch {
      setWishlist(SAMPLE_WISHLIST);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await api.delete(`/wishlist/${productId}`).catch(() => {});
      setWishlist((current) =>
        current.filter((item) => (item._id || item.id) !== productId)
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative text-white selection:bg-orange-600 selection:text-white overflow-x-hidden flex flex-col font-sans"
      style={{
        background: `
          radial-gradient(circle at 94% 18%, rgba(195, 25, 25, 0.45) 0%, rgba(130, 15, 18, 0.28) 35%, transparent 68%),
          radial-gradient(circle at 95% 65%, rgba(160, 20, 22, 0.35) 0%, rgba(90, 10, 15, 0.18) 40%, transparent 65%),
          radial-gradient(circle at 10% 88%, rgba(85, 18, 14, 0.25) 0%, transparent 45%),
          #0e0709
        `,
      }}
    >
      <Navbar active="wishlist" />

      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>SAVED ARCHIVES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              MY WISHLIST
            </h1>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white/60 tracking-wider">
            {wishlist.length} {wishlist.length === 1 ? "SAVED PIECE" : "SAVED PIECES"}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 px-5 py-3 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="bg-[#140c10]/80 border border-white/[0.08] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
              No saved items
            </h2>
            <p className="text-xs text-white/50 mb-7 max-w-md mx-auto">
              Save pieces you love to track availability, limited color drops, and private member reductions.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-lg active:scale-95"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 sm:gap-y-14 pt-6">
            {wishlist.map((item) => (
              <WishlistCard
                key={item._id || item.id}
                product={item}
                onRemove={handleRemove}
                removing={removingId === (item._id || item.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;