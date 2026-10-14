import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import Navbar from "../components/Navbar";
import api from "../services/api";

/* ── Category Data matching requirements ── */
const CATEGORIES = [
  {
    id: "puffer",
    line1: "PUFFER",
    line2: "COLLECTION",
    gradient: "from-[#bf4413] via-[#8c2d08] to-[#421405]",
    border: "border-[#d8551f]/35",
    image: "/assets/cat_puffer_pop.png",
    link: "/products",
  },
  {
    id: "shirts",
    line1: "SHIRTS",
    line2: "",
    gradient: "from-[#2e3b4d] via-[#1e2735] to-[#111721]",
    border: "border-[#475b75]/35",
    image: "/assets/cat_shirt_pop.png",
    link: "/products",
  },
  {
    id: "electronics",
    line1: "ELECTRONICS",
    line2: "",
    gradient: "from-[#4a3928] via-[#33261a] to-[#1b140d]",
    border: "border-[#755d44]/35",
    image: "/assets/cat_electronics_pop.png",
    link: "/products",
  },
  {
    id: "sale",
    line1: "SALE",
    line2: "ITEMS",
    gradient: "from-[#be1b1b] via-[#851111] to-[#3f0808]",
    border: "border-[#e02b2b]/35",
    image: "/assets/cat_sale_pop.png",
    link: "/products",
  },
];

/* ── Recommended Products with 100% transparent cutouts & 3D pop effect ── */
const RECOMMENDED = [
  {
    id: "rec-shirt",
    title: "Shirt",
    price: 250,
    subtitle: "Luxury tailored contrast-collar button shirt",
    image: "/assets/cat_shirt_pop.png",
    colors: ["#38bdf8", "#ffffff"],
  },
  {
    id: "rec-pants",
    title: "Pants",
    price: 250,
    subtitle: "Technical tactical cargo running pants",
    image: "/assets/prod_pants_pop.png",
    colors: ["#18181b", "#3f3f46"],
  },
  {
    id: "rec-jacket",
    title: "Jacket",
    price: 250,
    subtitle: "Men high-gloss down puffer jacket",
    image: "/assets/cat_puffer_pop.png",
    colors: ["#ea580c", "#ffffff"],
  },
  {
    id: "rec-shoe",
    title: "Shoe",
    price: 380,
    subtitle: "Aerodynamic technical trail running sneaker",
    image: "/assets/prod_shoe_pop.png",
    colors: ["#f97316", "#18181b"],
  },
  {
    id: "rec-watch",
    title: "Watch",
    price: 850,
    subtitle: "Swiss chronograph black ceramic timepiece",
    image: "/assets/prod_watch_pop.png",
    colors: ["#18181b", "#e2e8f0"],
  },
  {
    id: "rec-hoodie",
    title: "Hoodie",
    price: 195,
    subtitle: "Heavyweight oversized streetwear fleece hoodie",
    image: "/assets/prod_hoodie_pop.png",
    colors: ["#18181b", "#71717a"],
  },
];

function Home() {
  const navigate = useNavigate();
  const { addCart, cartItems, getCart } = useContext(CartContext) || {
    addCart: () => { },
    cartItems: [],
    getCart: () => { },
  };

  const [customer, setCustomer] = useState({
    name: "Alex",
    points: 1200,
    balance: 1200,
  });
  const [toastMessage, setToastMessage] = useState("");
  const [recStartIdx, setRecStartIdx] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const cartCount = (cartItems || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  /* ── Fetch customer data gracefully without forcing /login redirect ── */
  useEffect(() => {
    let isMounted = true;
    api
      .post("customers/me")
      .then((res) => {
        if (isMounted && res.data) {
          setCustomer(res.data);
        }
      })
      .catch(() => {
        // Fallback default member view
      });

    if (getCart) {
      try {
        getCart();
      } catch {
        // silent
      }
    }

    return () => {
      isMounted = false;
    };
  }, [getCart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2600);
  };

  const handleToggleWishlist = async (product) => {
    const isSaved = wishlistIds.has(product.id);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(product.id);
        showToast(`Removed ${product.title} from Wishlist`);
      } else {
        next.add(product.id);
        showToast(`Saved ${product.title} to Wishlist!`);
      }
      return next;
    });

    try {
      if (product._id) {
        await api.post(`/wishlist/${product._id}`);
      }
    } catch {
      // graceful fallback
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addCart(product);
      showToast(`Added ${product.title || product.name || "Item"} to Bag!`);
    } catch {
      showToast(`Added ${product.title || product.name || "Item"} to Bag!`);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative text-white selection:bg-orange-600 selection:text-white"
      style={{
        background: `
          radial-gradient(circle at 92% 16%, rgba(195, 25, 25, 0.45) 0%, rgba(130, 15, 18, 0.28) 35%, transparent 68%),
          radial-gradient(circle at 95% 65%, rgba(160, 20, 22, 0.35) 0%, rgba(90, 10, 15, 0.18) 40%, transparent 65%),
          radial-gradient(circle at 12% 88%, rgba(85, 18, 14, 0.25) 0%, transparent 45%),
          #0f0709
        `,
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-xl border border-white/20 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ════════════════ 1. NAVBAR ════════════════ */}
      <Navbar active="home" />

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <main className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* ── Section Title: Announcements and Deals (Serif Font) ── */}
        <div className="flex items-center justify-between mb-3.5">
          <h1 className="font-serif text-2xl sm:text-[27px] text-[#f4eee9] tracking-tight font-normal">
            Announcements and Deals
          </h1>
          <Link
            to="/orders"
            className="text-[11px] font-semibold px-4 py-1.5 rounded-lg bg-[#201216]/90 hover:bg-[#301a21] border border-white/10 text-white/90 tracking-wide transition-all active:scale-95 shadow-sm"
          >
            View Dashboard
          </Link>
        </div>

        {/* ── 4 Copper/Amber Cards (Exact proportions and glow) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {/* Card 1: Loyalty Points */}
          <div className="bg-gradient-to-b from-[#873711] via-[#522008] to-[#250d04] border border-[#a84416]/30 rounded-2xl px-4 py-3 shadow-lg flex flex-col justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#f5c6a5] mb-1.5">
              MY ACCOUNT: LOYALTY POINTS
            </span>
            <div className="flex items-center gap-2.5">
              {/* Concentric red bullseye icon */}
              <div className="w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center shadow-md shrink-0">
                <div className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {customer?.points || 1200}
              </span>
            </div>
          </div>

          {/* Card 2: Account Balance */}
          <div className="bg-gradient-to-b from-[#873711] via-[#522008] to-[#250d04] border border-[#a84416]/30 rounded-2xl px-4 py-3 shadow-lg flex flex-col justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#f5c6a5] mb-1.5">
              MY ACCOUNT BALANCE
            </span>
            <div className="flex items-center gap-2.5">
              {/* Wallet/Card icon */}
              <div className="w-6 h-6 rounded bg-[#ea580c]/30 border border-[#ea580c]/60 flex items-center justify-center shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-[#f59e0b]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {customer?.balance || 1200}
              </span>
            </div>
          </div>

          {/* Card 3: Recent Orders Summary */}
          <div className="bg-gradient-to-b from-[#873711] via-[#522008] to-[#250d04] border border-[#a84416]/30 rounded-2xl px-4 py-3 shadow-lg flex flex-col justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#f5c6a5] mb-1.5">
              RECENT ORDERS SUMMARY
            </span>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#f5c6a5]/80 text-[11px]">Recent Orders</span>
                <span className="text-white font-bold text-[11px]">$536.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#f5c6a5]/80 text-[11px]">History Offers</span>
                <span className="text-white font-bold text-[11px]">$2,180.00</span>
              </div>
            </div>
          </div>

          {/* Card 4: Recent Orders */}
          <div className="bg-gradient-to-b from-[#873711] via-[#522008] to-[#250d04] border border-[#a84416]/30 rounded-2xl px-4 py-3 shadow-lg flex flex-col justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#f5c6a5] mb-1.5">
              RECENTS ORDERS
            </span>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#f5c6a5]/80 text-[11px]">Order:</span>
                <span className="text-white font-bold text-[11px]">$385.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#f5c6a5]/80 text-[11px]">Leaving now</span>
                <span className="text-white font-bold text-[11px]">$384.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════ 2. LUXURY ATELIER SALE HERO CONTAINER ════════════════ */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-6 border border-[#852a33]/35 shadow-2xl bg-gradient-to-r from-[#19080c] via-[#2d0e14] to-[#140508] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 group">
          {/* Ambient inner glow & radial depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(215,35,45,0.22)_0%,transparent_65%)] pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

          {/* Left Text & CTA */}
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>LIMITED TIME ATELIER EVENT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-2.5">
              SEASONAL ARCHIVE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#ea580c]">
                SALE
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wide mb-5 max-w-md">
              Unlock private member reductions up to 50% across luxury outerwear, technical apparel, and designer accessories.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/products"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#dc2626] hover:from-[#f97316] hover:to-[#ef4444] text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-[0_8px_25px_rgba(234,88,12,0.45)] active:scale-95"
              >
                Shop Collection
              </Link>
              <div className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11px] font-mono font-bold tracking-wider text-white/80 flex items-center gap-2 select-all">
                <span className="text-white/40">CODE:</span>
                <span className="text-[#f59e0b]">JM-VIP50</span>
              </div>
            </div>
          </div>

          {/* Right: Floating Pop-Out Product Showcase */}
          <div className="relative z-10 flex items-center justify-center shrink-0 w-64 sm:w-72 h-44 sm:h-52">
            {/* Glowing circular backdrop medallion */}
            <div className="absolute inset-0 m-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-orange-500/30 bg-gradient-to-br from-red-600/20 via-orange-600/10 to-transparent blur-md group-hover:scale-105 transition-transform duration-500" />

            {/* Floating Black Puffer Jacket */}
            <img
              src="/assets/cat_puffer_pop.png"
              alt="Sale Hero Jacket"
              className="relative z-10 max-h-[115%] w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] group-hover:scale-108 group-hover:-translate-y-1.5 transition-all duration-500 select-none pointer-events-none"
            />

            {/* Discount Floating Pill Badge */}
            <div className="absolute -bottom-2 -left-2 z-20 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ea580c] to-[#dc2626] border border-white/20 text-white shadow-xl flex items-center gap-1.5 select-none">
              <span className="text-[11px] font-black uppercase tracking-wider">UP TO 50% OFF</span>
            </div>
          </div>
        </div>

        {/* ════════════════ 3. EXPLORE OUR CATEGORIES ════════════════ */}
        <div className="mb-8 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/90 mb-3">
            EXPLORE OUR CATEGORIES
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className={`relative rounded-2xl h-24 sm:h-28 bg-gradient-to-r ${cat.gradient} border ${cat.border} px-4 py-3 flex items-center justify-between group shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                {/* Left Category Label */}
                <div className="z-10 flex flex-col leading-[1.15] select-none max-w-[55%]">
                  <span className="text-xs sm:text-[13px] font-black text-white tracking-wider uppercase drop-shadow">
                    {cat.line1}
                  </span>
                  {cat.line2 && (
                    <span className="text-xs sm:text-[13px] font-black text-white tracking-wider uppercase drop-shadow">
                      {cat.line2}
                    </span>
                  )}
                </div>

                {/* Right Category Image - 3D Pop Out Effect with transparent cutout */}
                <div className="absolute right-2 -top-4 sm:-top-5 bottom-0 w-28 sm:w-32 flex items-end justify-center pointer-events-none z-20 pb-0.5">
                  <img
                    src={cat.image}
                    alt={cat.line1}
                    className="max-h-[120%] sm:max-h-[128%] w-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.75)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 select-none"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ════════════════ 4. RECOMMENDED FOR YOU & LATEST FROM THE CATALOG ════════════════ */}
        <div className="mb-10">
          {/* Section Headers with functional chevrons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Recommended For You Header */}
            <div className="flex items-center justify-between pr-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                RECOMMENDED FOR YOU
              </span>
              <div className="flex items-center gap-1.5 text-white/50">
                <button
                  type="button"
                  onClick={() => setRecStartIdx((prev) => Math.max(0, prev - 1))}
                  className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center hover:text-white transition-colors active:scale-90"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRecStartIdx((prev) =>
                      Math.min(RECOMMENDED.length - 4, prev + 1)
                    )
                  }
                  className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center hover:text-white transition-colors active:scale-90"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Latest From Catalog Header */}
            <div className="hidden md:flex items-center justify-between pl-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                LATEST FROM THE CATALOG
              </span>
              <div className="flex items-center gap-1.5 text-white/50">
                <button
                  type="button"
                  onClick={() => setRecStartIdx((prev) => Math.max(0, prev - 1))}
                  className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center hover:text-white transition-colors active:scale-90"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRecStartIdx((prev) =>
                      Math.min(RECOMMENDED.length - 4, prev + 1)
                    )
                  }
                  className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center hover:text-white transition-colors active:scale-90"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Grid with 3D POPPING OUT effect, Wishlist & Add to Cart */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 pt-6">
            {RECOMMENDED.map((product) => (
              <div
                key={product.id}
                className="relative bg-[#140c10]/90 hover:bg-[#190f14] border border-white/[0.08] hover:border-white/25 rounded-2xl p-3 sm:p-3.5 pt-2 flex flex-col justify-between transition-all duration-300 group shadow-lg hover:shadow-2xl"
              >
                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-20 ${wishlistIds.has(product.id)
                      ? "bg-red-500/25 border border-red-500 text-red-500 shadow-md scale-105"
                      : "bg-black/50 hover:bg-black/80 border border-white/10 text-white/50 hover:text-red-400"
                    }`}
                  title="Wishlist"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill={wishlistIds.has(product.id) ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Upper Area: 3D Popping Out Product Image */}
                <div className="relative w-full h-32 sm:h-36 flex items-center justify-center -mt-7 sm:-mt-8 mb-1 pointer-events-none z-10">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="max-h-[120%] sm:max-h-[130%] max-w-[110%] object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.85)] group-hover:scale-115 group-hover:-translate-y-2 transition-all duration-300 select-none"
                  />
                </div>

                {/* Bottom Product Info */}
                <div className="w-full pt-1 select-none">
                  {/* Title & Price */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                      {product.title}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white">
                      ${product.price}
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="text-[10px] text-white/50 leading-tight mb-2 line-clamp-1">
                    {product.subtitle}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {product.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-sm border border-white/20 shadow-sm cursor-pointer hover:scale-125 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-[11px] font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-md hover:shadow-[0_4px_16px_rgba(217,72,25,0.4)]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;