import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import Navbar from "../components/Navbar";
import api from "../services/api";

/* ── Technical Apparel Catalog with pop-out 3D cards ── */
const CATALOG_PRODUCTS = [
  {
    id: "prod-shirt",
    title: "Shirt",
    subtitle: "Luxury tailored contrast-collar button shirt",
    price: 250,
    image: "/assets/cat_shirt_pop.png",
    style: "Field",
    color: "Arctic White",
    size: "36",
    material: "Wool Blend",
    colors: ["#38bdf8", "#ffffff"],
  },
  {
    id: "prod-pants",
    title: "Pants",
    subtitle: "Technical tactical cargo running pants",
    price: 250,
    image: "/assets/prod_alpha_pants_pop.png",
    style: "Field",
    color: "Stealth Black",
    size: "36",
    material: "Technical Nylon",
    colors: ["#18181b", "#3f3f46"],
  },
  {
    id: "prod-jacket",
    title: "Jacket",
    subtitle: "Men high-gloss down puffer jacket",
    price: 250,
    image: "/assets/cat_sale_pop.png",
    style: "Puffer",
    color: "Crimson Red",
    size: "36",
    material: "Eco-Down",
    colors: ["#ea580c", "#ffffff"],
  },
  {
    id: "prod-shoe",
    title: "Shoe",
    subtitle: "Aerodynamic technical trail running sneaker",
    price: 380,
    image: "/assets/prod_shoe_pop.png",
    style: "Field",
    color: "Orange",
    size: "40",
    material: "Technical Nylon",
    colors: ["#ea580c", "#18181b"],
  },
  {
    id: "prod-watch",
    title: "Watch",
    subtitle: "Swiss chronograph black ceramic timepiece",
    price: 850,
    image: "/assets/prod_watch_pop.png",
    style: "Field",
    color: "Stealth Black",
    size: "42",
    material: "Technical Nylon",
    colors: ["#18181b", "#e2e8f0"],
  },
  {
    id: "prod-hoodie",
    title: "Hoodie",
    subtitle: "Heavyweight oversized streetwear fleece hoodie",
    price: 195,
    image: "/assets/prod_hoodie_pop.png",
    style: "Bomber",
    color: "Stealth Black",
    size: "40",
    material: "Wool Blend",
    colors: ["#18181b", "#71717a"],
  },
  {
    id: "prod-base-layer",
    title: "Base Layer",
    subtitle: "Premium textured athletic black compression T-shirt",
    price: 250,
    image: "/assets/prod_base_layer_pop.png",
    style: "Field",
    color: "Stealth Black",
    size: "38",
    material: "Technical Nylon",
    colors: ["#18181b", "#ffffff"],
  },
  {
    id: "prod-puffer-black",
    title: "Core Puffer",
    subtitle: "Engineered thermal down luxury winter jacket",
    price: 320,
    image: "/assets/cat_puffer_pop.png",
    style: "Puffer",
    color: "Stealth Black",
    size: "44",
    material: "Eco-Down",
    colors: ["#ea580c", "#18181b"],
  },
];

function Products({ activeNav = "products" }) {
  const navigate = useNavigate();
  const { addCart, updateCart, deleteCart, cartItems = [] } =
    useContext(CartContext) || {};

  const [search, setSearch] = useState("");
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [priceMax, setPriceMax] = useState(1000);
  const [selectedSize, setSelectedSize] = useState("36");
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  /* Accordion collapse states */
  const [openSections, setOpenSections] = useState({
    style: true,
    color: true,
    price: true,
    size: true,
    material: true,
  });

  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState("");
  const [selectedCardColors, setSelectedCardColors] = useState({});

  const cartCount = (cartItems || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2600);
  };

  /* Helper to get active display image when user selects color */
  const getProductDisplayImage = (product) => {
    const chosenColor = selectedCardColors[product.id];
    if (product.id === "prod-shirt") {
      if (chosenColor === "#ffffff") {
        return "/assets/prod_shirt_clean.png";
      }
      return "/assets/cat_shirt_pop.png";
    }
    if (product.id === "prod-puffer-black" && chosenColor === "#18181b") {
      return "/assets/cat_jacket_clean1.png";
    }
    return product.image;
  };

  /* Helper to check quantity of a product in cart */
  const getProductQuantity = (product) => {
    const prodId = product.id || product._id;
    const prodTitle = (product.title || product.name || "").toLowerCase();
    const item = (cartItems || []).find((ci) => {
      const matchId = ci.product?._id || ci.product?.id || ci._id || ci.id;
      const matchName = (ci.product?.name || ci.product?.title || ci.name || ci.title || "").toLowerCase();
      return (
        String(matchId) === String(prodId) ||
        (prodTitle && matchName && matchName === prodTitle)
      );
    });
    return item ? Number(item.quantity || 1) : 0;
  };

  const handleIncrease = async (product, currentQty) => {
    await updateCart(product, currentQty + 1);
    showToast(`Updated ${product.title || "Item"} quantity to ${currentQty + 1}`);
  };

  const handleDecrease = async (product, currentQty) => {
    if (currentQty <= 1) {
      await deleteCart(product);
      showToast(`Removed ${product.title || "Item"} from Shopping Bag`);
    } else {
      await updateCart(product, currentQty - 1);
      showToast(`Updated ${product.title || "Item"} quantity to ${currentQty - 1}`);
    }
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleMaterial = (mat) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleToggleWishlist = (product) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        showToast(`Removed from Wishlist`);
      } else {
        next.add(product.id);
        showToast(`Added ${product.title} to Wishlist!`);
      }
      return next;
    });
  };

  const handleAddToCart = async (product) => {
    try {
      await addCart(product);
      showToast(`Added ${product.title || product.name || "Item"} to Bag!`);
    } catch {
      showToast(`Added ${product.title || product.name || "Item"} to Bag!`);
    }
  };

  /* Filter Logic */
  const filteredProducts = CATALOG_PRODUCTS.filter((product) => {
    // Search match
    if (search.trim()) {
      const query = search.toLowerCase();
      const matchName = product.title.toLowerCase().includes(query);
      const matchSub = product.subtitle.toLowerCase().includes(query);
      const matchColor = product.color.toLowerCase().includes(query);
      if (!matchName && !matchSub && !matchColor) return false;
    }

    // Style match
    if (selectedStyles.length > 0 && !selectedStyles.includes(product.style)) {
      return false;
    }

    // Color match
    if (selectedColor && product.color !== selectedColor) {
      if (!product.colors || !product.colors.length) {
        if (product.color !== selectedColor) return false;
      }
    }

    // Price match
    if (product.price > priceMax) {
      return false;
    }

    // Material match
    if (
      selectedMaterials.length > 0 &&
      !selectedMaterials.includes(product.material)
    ) {
      return false;
    }

    return true;
  });

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-xl border border-white/20 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Navbar */}
      <Navbar active={activeNav} />

      {/* ════════════════ 2. HERO SEARCH & TITLE ════════════════ */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <div className="w-full rounded-2xl bg-[#140b0f]/80 border border-white/[0.08] shadow-2xl py-7 px-6 text-center backdrop-blur-sm">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-black text-white uppercase tracking-[0.05em] mb-4 drop-shadow">
            FIND YOUR PERFECT TECHNICAL APPAREL
          </h1>

          {/* Centered Pill Search Input */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a style, color, or material..."
              className="w-full bg-[#1b1015]/90 border border-white/15 focus:border-[#ea580c] rounded-full pl-5 pr-11 py-2.5 text-xs text-white placeholder-white/40 shadow-inner outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 3. MAIN CONTENT: FILTERS SIDEBAR + PRODUCT GRID ════════════════ */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* ── Left Sidebar Filters ── */}
        <aside className="w-full md:w-56 lg:w-60 shrink-0 space-y-4 select-none">
          <h2 className="text-sm font-black text-white tracking-widest uppercase pb-1.5 border-b border-white/10">
            FILTERS
          </h2>

          {/* Filter 1: STYLE */}
          <div className="border-b border-white/[0.08] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection("style")}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white py-1"
            >
              <span>STYLE</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.style ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openSections.style && (
              <div className="grid grid-cols-2 gap-2 pt-2.5">
                {["Puffer", "Field", "Bomber", "Parka"].map((style) => (
                  <label
                    key={style}
                    className="flex items-center gap-2 text-[11px] text-white/70 hover:text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(style)}
                      onChange={() => toggleStyle(style)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>{style}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter 2: COLOR */}
          <div className="border-b border-white/[0.08] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection("color")}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white py-1"
            >
              <span>COLOR</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.color ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openSections.color && (
              <div className="grid grid-cols-4 gap-2 pt-2.5 text-center">
                {[
                  { label: "Orange", color: "#ea580c" },
                  { label: "Stealth Black", color: "#18181b" },
                  { label: "Crimson Red", color: "#b91c1c" },
                  { label: "Arctic White", color: "#ffffff" },
                ].map((c) => (
                  <div
                    key={c.label}
                    onClick={() =>
                      setSelectedColor((prev) =>
                        prev === c.label ? "" : c.label
                      )
                    }
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border transition-all ${selectedColor === c.label
                          ? "ring-2 ring-red-500 border-white scale-105 shadow-md"
                          : "border-white/20 group-hover:border-white/50"
                        }`}
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[9px] text-white/50 group-hover:text-white/80 leading-tight">
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter 3: PRICE RANGE */}
          <div className="border-b border-white/[0.08] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white py-1"
            >
              <span>PRICE RANGE</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.price ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openSections.price && (
              <div className="pt-2.5">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex items-center justify-between text-[11px] font-bold text-white/70 mt-2">
                  <span>$100</span>
                  <span className="text-red-400 font-extrabold">${priceMax}</span>
                  <span>$1000</span>
                </div>
              </div>
            )}
          </div>

          {/* Filter 4: SIZE */}
          <div className="border-b border-white/[0.08] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection("size")}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white py-1"
            >
              <span>SIZE</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.size ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openSections.size && (
              <div className="flex items-center gap-2 pt-2.5">
                {["36", "38", "40", "42", "44"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`w-7 h-7 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center ${selectedSize === size
                        ? "bg-white text-black shadow-md scale-105"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter 5: MATERIAL */}
          <div className="pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection("material")}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white py-1"
            >
              <span>MATERIAL</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.material ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openSections.material && (
              <div className="space-y-2 pt-2.5">
                {["Technical Nylon", "Eco-Down", "Wool Blend"].map((mat) => (
                  <label
                    key={mat}
                    className="flex items-center gap-2 text-[11px] text-white/70 hover:text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() => toggleMaterial(mat)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>{mat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── Right Product Grid (Pop-out 3D cards matching user reference) ── */}
        <section className="flex-1 w-full">
          {filteredProducts.length === 0 ? (
            <div className="w-full py-20 text-center bg-white/[0.03] border border-white/10 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-1">
                No matching apparel found
              </h3>
              <p className="text-xs text-white/50 mb-4">
                Try loosening your filters or search keywords.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedStyles([]);
                  setSelectedColor("");
                  setPriceMax(1000);
                  setSelectedMaterials([]);
                }}
                className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 sm:gap-y-14 pt-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-[#140c10]/90 hover:bg-[#190f14] border border-white/[0.08] hover:border-white/25 rounded-2xl p-3 sm:p-3.5 pt-2 flex flex-col justify-between transition-all duration-300 group shadow-lg hover:shadow-2xl"
                >
                  {/* Top-Right Wishlist Heart Button */}
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
                  <div className="relative w-full h-36 sm:h-40 flex items-center justify-center -mt-8 mb-1 pointer-events-none z-10">
                    <img
                      src={getProductDisplayImage(product)}
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

                    {/* Interactive Color Swatches */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      {product.colors.map((color, idx) => {
                        const activeColor =
                          selectedCardColors[product.id] || product.colors[0];
                        const isSelected = activeColor === color;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCardColors((prev) => ({
                                ...prev,
                                [product.id]: color,
                              }));
                            }}
                            className={`w-3.5 h-3.5 rounded-sm border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "ring-2 ring-white scale-125 border-white shadow-md z-10"
                                : "border-white/20 hover:scale-115 opacity-70 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Select color: ${color}`}
                          />
                        );
                      })}
                    </div>

                    {/* Action Buttons: Details Button + Add to Cart / Quantity Control */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {/* Detail Button */}
                      <Link
                        to={`/products/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="py-2 px-2 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 hover:border-white/30 text-white text-[11px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 text-center cursor-pointer"
                      >
                        <span>Details</span>
                        <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      {/* Add to Cart OR Quantity Control with +/- */}
                      {getProductQuantity(product) === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="py-2 px-2 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-[10.5px] font-black tracking-wider uppercase transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 shadow-md hover:shadow-[0_4px_16px_rgba(217,72,25,0.4)] cursor-pointer"
                        >
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <span className="truncate">Add to Cart</span>
                        </button>
                      ) : (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between bg-black/60 border border-red-500/40 rounded-xl overflow-hidden px-1 py-0.5 shadow-inner"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecrease(product, getProductQuantity(product));
                            }}
                            className="w-6 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-black transition-colors cursor-pointer select-none"
                            title="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="text-xs font-black text-white px-1 select-none">
                            {getProductQuantity(product)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncrease(product, getProductQuantity(product));
                            }}
                            className="w-6 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-black transition-colors cursor-pointer select-none"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Products;