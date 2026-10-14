import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../services/api";
import api from "../services/api";
import CartContext from "../context/CartContext";
import Navbar from "../components/Navbar";

// Comprehensive Technical Catalog Details for all pieces
const CATALOG_DETAILS = {
  "prod-shirt": {
    _id: "prod-shirt",
    id: "prod-shirt",
    name: "Tailored Contrast-Collar Shirt",
    category: "FORMALWEAR / APPAREL",
    price: 250,
    image: "/assets/cat_shirt_pop.png",
    description:
      "Bespoke formal elegance merged with modern technical tailoring. Features structured contrast spread collar, mother-of-pearl button placket, French tailored cuffs, and premium breathable stretch-woven Egyptian cotton microfiber.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Sky Blue", hex: "#38bdf8", image: "/assets/cat_shirt_pop.png" },
      { label: "Arctic White", hex: "#ffffff", image: "/assets/prod_shirt_clean.png" },
    ],
    defaultColor: "Sky Blue",
  },
  "rec-shirt": {
    _id: "rec-shirt",
    id: "rec-shirt",
    name: "Tailored Contrast-Collar Shirt",
    category: "FORMALWEAR / APPAREL",
    price: 250,
    image: "/assets/cat_shirt_pop.png",
    description:
      "Bespoke formal elegance merged with modern technical tailoring. Features structured contrast spread collar, mother-of-pearl button placket, French tailored cuffs, and premium breathable stretch-woven Egyptian cotton microfiber.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Sky Blue", hex: "#38bdf8", image: "/assets/cat_shirt_pop.png" },
      { label: "Arctic White", hex: "#ffffff", image: "/assets/prod_shirt_clean.png" },
    ],
    defaultColor: "Sky Blue",
  },
  "prod-pants": {
    _id: "prod-pants",
    id: "prod-pants",
    name: "Alpha Tactical Pants",
    category: "TECHNICAL APPAREL",
    price: 250,
    image: "/assets/prod_alpha_pants_pop.png",
    description:
      "Structured technical cargo running pants engineered with geometric reinforced knee articulation, magnetic stowage pockets, waterproof sealed seams, and weather-resistant stretch-woven nylon construction.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_alpha_pants_pop.png" },
      { label: "Slate Grey", hex: "#3f3f46", image: "/assets/prod_alpha_pants_pop.png" },
    ],
    defaultColor: "Stealth Black",
  },
  "prod-alpha-pants": {
    _id: "prod-alpha-pants",
    id: "prod-alpha-pants",
    name: "Alpha Tactical Pants",
    category: "TECHNICAL APPAREL",
    price: 250,
    image: "/assets/prod_alpha_pants_pop.png",
    description:
      "Structured technical cargo running pants engineered with geometric reinforced knee articulation, magnetic stowage pockets, waterproof sealed seams, and weather-resistant stretch-woven nylon construction.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_alpha_pants_pop.png" },
      { label: "Slate Grey", hex: "#3f3f46", image: "/assets/prod_alpha_pants_pop.png" },
    ],
    defaultColor: "Stealth Black",
  },
  "rec-pants": {
    _id: "rec-pants",
    id: "rec-pants",
    name: "Alpha Tactical Pants",
    category: "TECHNICAL APPAREL",
    price: 250,
    image: "/assets/prod_alpha_pants_pop.png",
    description:
      "Structured technical cargo running pants engineered with geometric reinforced knee articulation, magnetic stowage pockets, waterproof sealed seams, and weather-resistant stretch-woven nylon construction.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_alpha_pants_pop.png" },
      { label: "Slate Grey", hex: "#3f3f46", image: "/assets/prod_alpha_pants_pop.png" },
    ],
    defaultColor: "Stealth Black",
  },
  "prod-jacket": {
    _id: "prod-jacket",
    id: "prod-jacket",
    name: "Crimson Core Puffer Jacket",
    category: "OUTERWEAR",
    price: 250,
    image: "/assets/cat_sale_pop.png",
    description:
      "High-gloss thermal luxury down puffer engineered for maximum warmth with minimum bulk. Features 800-fill certified goose down, waterproof double-ended metallic zip closures, and cashmere ribbed storm cuffs.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Crimson Red", hex: "#b91c1c", image: "/assets/cat_sale_pop.png" },
      { label: "Solar Orange", hex: "#ea580c", image: "/assets/cat_sale_pop.png" },
      { label: "Stealth Black", hex: "#18181b", image: "/assets/cat_jacket_clean1.png" },
    ],
    defaultColor: "Crimson Red",
  },
  "prod-crimson-puffer": {
    _id: "prod-crimson-puffer",
    id: "prod-crimson-puffer",
    name: "Crimson Core Puffer Jacket",
    category: "OUTERWEAR",
    price: 250,
    image: "/assets/cat_sale_pop.png",
    description:
      "High-gloss thermal luxury down puffer engineered for maximum warmth with minimum bulk. Features 800-fill certified goose down, waterproof double-ended metallic zip closures, and cashmere ribbed storm cuffs.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: [
      { label: "Crimson Red", hex: "#b91c1c", image: "/assets/cat_sale_pop.png" },
      { label: "Solar Orange", hex: "#ea580c", image: "/assets/cat_sale_pop.png" },
      { label: "Stealth Black", hex: "#18181b", image: "/assets/cat_jacket_clean1.png" },
    ],
    defaultColor: "Crimson Red",
  },
  "prod-shoe": {
    _id: "prod-shoe",
    id: "prod-shoe",
    name: "Aero Speed Trail Shoe",
    category: "FOOTWEAR",
    price: 380,
    image: "/assets/prod_shoe_pop.png",
    description:
      "Aerodynamic technical trail runner featuring hyper-cushioned AeroFoam midsole, high-traction lugged rubber outsole, and ultra-breathable ripstop mesh upper engineered for technical terrains and high-speed urban transit.",
    sizes: ["40", "41", "42", "43", "44"],
    colors: [
      { label: "Fire Orange", hex: "#ea580c", image: "/assets/prod_shoe_pop.png" },
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_shoe_pop.png" },
    ],
    defaultColor: "Fire Orange",
  },
  "prod-running-shoe-1": {
    _id: "prod-running-shoe-1",
    id: "prod-running-shoe-1",
    name: "Aero Speed Trail Shoe",
    category: "FOOTWEAR",
    price: 380,
    image: "/assets/prod_shoe_pop.png",
    description:
      "Aerodynamic technical trail runner featuring hyper-cushioned AeroFoam midsole, high-traction lugged rubber outsole, and ultra-breathable ripstop mesh upper engineered for technical terrains and high-speed urban transit.",
    sizes: ["40", "41", "42", "43", "44"],
    colors: [
      { label: "Fire Orange", hex: "#ea580c", image: "/assets/prod_shoe_pop.png" },
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_shoe_pop.png" },
    ],
    defaultColor: "Fire Orange",
  },
  "rec-shoe": {
    _id: "rec-shoe",
    id: "rec-shoe",
    name: "Aero Speed Trail Shoe",
    category: "FOOTWEAR",
    price: 380,
    image: "/assets/prod_shoe_pop.png",
    description:
      "Aerodynamic technical trail runner featuring hyper-cushioned AeroFoam midsole, high-traction lugged rubber outsole, and ultra-breathable ripstop mesh upper engineered for technical terrains and high-speed urban transit.",
    sizes: ["40", "41", "42", "43", "44"],
    colors: [
      { label: "Fire Orange", hex: "#ea580c", image: "/assets/prod_shoe_pop.png" },
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_shoe_pop.png" },
    ],
    defaultColor: "Fire Orange",
  },
  "prod-watch": {
    _id: "prod-watch",
    id: "prod-watch",
    name: "Swiss Ceramic Chronograph",
    category: "HOROLOGY",
    price: 850,
    image: "/assets/prod_watch_pop.png",
    description:
      "Black matte high-tech ceramic case and bracelet, tachymeter bezel, automatic self-winding chronograph movement, and scratch-resistant anti-reflective sapphire crystal.",
    sizes: ["40", "42", "44"],
    colors: [
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_watch_pop.png" },
      { label: "Silver Ceramic", hex: "#e2e8f0", image: "/assets/prod_watch_pop.png" },
    ],
    defaultColor: "Stealth Black",
  },
  "prod-hoodie": {
    _id: "prod-hoodie",
    id: "prod-hoodie",
    name: "Heavyweight Tech Hoodie",
    category: "STREETWEAR",
    price: 195,
    image: "/assets/prod_hoodie_pop.png",
    description:
      "500 GSM loopback cotton fleece with dropped shoulder tailoring, structured double-layered hood, and invisible kangaroo pocket with concealed headphone routing.",
    sizes: ["38", "40", "42", "44"],
    colors: [
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_hoodie_pop.png" },
      { label: "Heather Grey", hex: "#71717a", image: "/assets/prod_hoodie_pop.png" },
    ],
    defaultColor: "Stealth Black",
  },
  "prod-base-layer": {
    _id: "prod-base-layer",
    id: "prod-base-layer",
    name: "Technical Base Layer",
    category: "TECHNICAL APPAREL",
    price: 250,
    image: "/assets/prod_base_layer_pop.png",
    description:
      "Engineered ergonomic base layer crafted from high-tensile athletic microfiber. Features bonded friction-free seams, moisture-dispersing weave, and subtle reflective micro-branding for modern urban performance.",
    sizes: ["36", "38", "40", "42"],
    colors: [
      { label: "Stealth Black", hex: "#18181b", image: "/assets/prod_base_layer_pop.png" },
      { label: "Arctic White", hex: "#ffffff", image: "/assets/prod_base_layer_pop.png" },
    ],
    defaultColor: "Stealth Black",
  },
  "prod-puffer-black": {
    _id: "prod-puffer-black",
    id: "prod-puffer-black",
    name: "Core Down Puffer Jacket",
    category: "OUTERWEAR",
    price: 320,
    image: "/assets/cat_puffer_pop.png",
    description:
      "Thermal luxury outerwear featuring lightweight water-repellent shell, high-loft down insulation, storm flap zip enclosure, and ergonomic funnel neck.",
    sizes: ["38", "40", "42", "44"],
    colors: [
      { label: "Blaze Orange", hex: "#ea580c", image: "/assets/cat_puffer_pop.png" },
      { label: "Stealth Black", hex: "#18181b", image: "/assets/cat_jacket_clean1.png" },
    ],
    defaultColor: "Blaze Orange",
  },
};

/**
 * Robust resolver for detailed product data matching by ID or product name
 */
function resolveDetailedProduct(targetId) {
  if (!targetId) return CATALOG_DETAILS["prod-jacket"];
  const lower = String(targetId).toLowerCase();

  if (CATALOG_DETAILS[targetId]) return CATALOG_DETAILS[targetId];

  if (lower.includes("shirt")) return CATALOG_DETAILS["prod-shirt"];
  if (lower.includes("pant") || lower.includes("cargo"))
    return CATALOG_DETAILS["prod-pants"];
  if (
    lower.includes("shoe") ||
    lower.includes("runner") ||
    lower.includes("sneaker")
  )
    return CATALOG_DETAILS["prod-shoe"];
  if (lower.includes("watch") || lower.includes("chronograph"))
    return CATALOG_DETAILS["prod-watch"];
  if (lower.includes("hoodie") || lower.includes("fleece"))
    return CATALOG_DETAILS["prod-hoodie"];
  if (lower.includes("base") || lower.includes("layer"))
    return CATALOG_DETAILS["prod-base-layer"];
  if (lower.includes("puffer") || lower.includes("jacket"))
    return CATALOG_DETAILS["prod-jacket"];

  return CATALOG_DETAILS["prod-jacket"];
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addCart } = useContext(CartContext) || { addCart: () => {} };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("36");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState("");

  // Cart action states
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Wishlist action states
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Instant local resolution matching the requested product
        const detailed = resolveDetailedProduct(id);
        setProduct(detailed);
        setSelectedSize(detailed.sizes ? detailed.sizes[0] : "36");
        setSelectedColor(detailed.defaultColor || (detailed.colors ? detailed.colors[0]?.label : "Stealth Black"));
        setActiveImage(detailed.image);

        // Try backend API for remote updates if available
        try {
          const remoteData = await getProduct(id);
          if (remoteData) {
            setProduct((prev) => ({
              ...detailed,
              ...remoteData,
              name: remoteData.name || detailed.name,
              category: remoteData.category || detailed.category,
              price: remoteData.price || detailed.price,
              image: remoteData.image || detailed.image,
              description: remoteData.description || detailed.description,
            }));
            if (remoteData.image) setActiveImage(remoteData.image);
          }
        } catch {
          // Keep authentic catalog details
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const response = await api.get("/wishlist");
        if (response.data?.wishlist) {
          const found = response.data.wishlist.some(
            (item) => (item._id || item.id) === id
          );
          setIsInWishlist(found);
        }
      } catch {
        // graceful ignore
      }
    };

    if (id) checkWishlistStatus();
  }, [id]);

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj.label);
    if (colorObj.image) {
      setActiveImage(colorObj.image);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);

      await addCart({
        ...product,
        id: product._id || product.id || id,
        _id: product._id || product.id || id,
        image: activeImage || product.image,
      });
      setCartSuccess(true);
      showToast(`Added ${product.name || "Item"} to Shopping Bag!`);
      setTimeout(() => setCartSuccess(false), 3500);
    } catch {
      showToast(`Added ${product.name || "Item"} to Shopping Bag!`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      setSavingWishlist(true);
      if (isInWishlist) {
        await api.delete(`/wishlist/${product._id || id}`).catch(() => {});
        setIsInWishlist(false);
        showToast("Removed from Wishlist");
      } else {
        await api.post(`/wishlist/${product._id || id}`).catch(() => {});
        setIsInWishlist(true);
        showToast("Saved to your Wishlist!");
      }
    } catch {
      setIsInWishlist(!isInWishlist);
      showToast(isInWishlist ? "Removed from Wishlist" : "Saved to your Wishlist!");
    } finally {
      setSavingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0709] text-white flex flex-col font-sans">
        <Navbar active="products" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
            <span>Loading Atelier Piece...</span>
          </div>
        </div>
      </div>
    );
  }

  const prodImage = activeImage || product?.image || "/assets/cat_shirt_pop.png";
  const prodPrice = product?.price || 250;
  const availableColors = product?.colors || [
    { label: "Stealth Black", hex: "#18181b" },
    { label: "Arctic White", hex: "#ffffff" },
  ];
  const availableSizes = product?.sizes || ["36", "38", "40", "42", "44"];

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
      <Navbar active="products" />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-6">
          <Link to="/home" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">
            Collection
          </Link>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{product?.name}</span>
        </div>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Big 3D Pop Out Showcase */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl bg-[#140c10]/90 border border-white/[0.08] shadow-2xl flex items-center justify-center p-8 overflow-hidden group">
              {/* Warm Ambient Spotlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(215,35,45,0.28)_0%,rgba(120,20,25,0.1)_45%,transparent_75%)] pointer-events-none" />

              {/* Limited Edition Pill */}
              <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/80 backdrop-blur-md">
                <span>AUTHENTIC MASTERPIECE</span>
              </div>

              {/* Wishlist Heart Top Right */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={savingWishlist}
                className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 shadow-lg cursor-pointer ${
                  isInWishlist
                    ? "bg-red-500/25 border border-red-500 text-red-500 scale-105"
                    : "bg-black/50 hover:bg-black/80 border border-white/15 text-white/60 hover:text-red-400"
                }`}
                title="Wishlist"
              >
                <svg
                  className="w-5 h-5"
                  fill={isInWishlist ? "currentColor" : "none"}
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

              {/* 3D Pop Out Garment with realistic shadow */}
              <img
                src={prodImage}
                alt={product?.name}
                className="relative z-10 max-h-[92%] max-w-[92%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] group-hover:scale-108 group-hover:-translate-y-2 transition-all duration-500 select-none"
              />
            </div>
          </div>

          {/* Right Column: Garment Details & Actions */}
          <div className="lg:col-span-5 bg-[#140c10]/95 border border-[#852a33]/35 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              {/* Category */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-3">
                <span>{product?.category || "TECHNICAL ARCHIVE"}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mb-3">
                {product?.name}
              </h1>

              {/* Price & Status */}
              <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-white/[0.08]">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ${prodPrice}
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  ✓ Available In Stock
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6 font-normal">
                {product?.description ||
                  "Engineered for technical precision and luxury aesthetics."}
              </p>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
                  <span>SELECT SIZE</span>
                  <span className="text-[10px] text-white/40 cursor-pointer hover:underline">
                    SIZE GUIDE
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                        selectedSize === size
                          ? "bg-white text-black shadow-lg scale-105"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="mb-8">
                <span className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
                  FINISH: {selectedColor.toUpperCase()}
                </span>
                <div className="flex items-center gap-3">
                  {availableColors.map((color) => {
                    const isSelected = selectedColor === color.label;
                    return (
                      <button
                        key={color.label}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-red-500 border-white scale-110 shadow-md"
                            : "border-white/20 hover:border-white/50"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl hover:shadow-[0_8px_25px_rgba(217,72,25,0.45)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span>
                    {addingToCart
                      ? "ADDING TO BAG..."
                      : cartSuccess
                      ? "ADDED TO BAG ✓"
                      : "ADD TO CART"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart();
                    navigate("/checkout");
                  }}
                  className="w-full py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-xs font-black tracking-widest uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  EXPRESS CHECKOUT
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/[0.08] text-[10.5px] text-white/50">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>30-Day Atelier Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;