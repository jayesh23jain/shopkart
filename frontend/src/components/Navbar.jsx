import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar({ active = "" }) {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext) || { cartItems: [] };
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const cartCount = (cartItems || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { name: "HOME", path: "/home", id: "home" },
    { name: "PRODUCTS", path: "/products", id: "products" },
    { name: "WISHLIST", path: "/wishlist", id: "wishlist" },
    { name: "ORDERS", path: "/orders", id: "orders" },
    { name: "CART", path: "/cart", id: "cart" },
  ];

  return (
    <header className="w-full px-5 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#110709]/80 backdrop-blur-md sticky top-0 z-50">
      {/* Left: Brand Monogram & Name -> links to /home */}
      <Link
        to="/home"
        className="flex items-center gap-2.5 group shrink-0"
        title="ShopKart Home"
      >
        <span className="text-[#e62626] font-black text-2xl tracking-tighter leading-none select-none group-hover:scale-105 transition-transform">
          SK
        </span>
        <div className="flex flex-col leading-[1.0] justify-center">
          <span className="font-extrabold text-[10px] tracking-[0.24em] text-white uppercase">
            SHOP
          </span>
          <span className="font-extrabold text-[10px] tracking-[0.24em] text-white uppercase">
            KART
          </span>
        </div>
      </Link>

      {/* Center: Desktop Navigation Links (Products, Wishlist, Orders, Cart) */}
      <nav className="hidden md:flex items-center gap-7 lg:gap-9">
        {navLinks.map((link) => {
          const isActive = active === link.id;
          return (
            <Link
              key={link.id}
              to={link.path}
              className={`relative py-1 text-[11px] font-bold tracking-widest uppercase transition-colors ${
                isActive
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right: Cart Pill + User Profile + Log Out Button */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Shopping Bag / Cart Pill */}
        <Link
          to="/cart"
          className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all group shadow-sm ${
            active === "cart"
              ? "bg-white/20 border-white text-white"
              : "bg-white/[0.08] hover:bg-white/15 border-white/15 text-white hover:border-white/30"
          }`}
          title="Shopping Cart"
        >
          <div className="relative">
            <svg
              className="w-4 h-4 text-white group-hover:scale-110 transition-transform"
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
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] font-black flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase hidden sm:inline">
            Cart {cartCount > 0 ? `(${cartCount})` : ""}
          </span>
        </Link>

        {/* User Profile Info Badge (displays logged-in member) */}
        <div
          className="relative hidden sm:flex items-center gap-2 select-none"
          title={`Signed in as: ${user?.fullName || "Alexander Wright"}`}
        >
          <div className="w-8 h-8 rounded-full ring-1 ring-white/20 overflow-hidden bg-gradient-to-br from-[#4a1515] to-[#1c080a] flex items-center justify-center">
            <span className="text-[11px] font-black text-white/90 select-none">
              {(user?.fullName || "A")[0].toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white/70 max-w-[100px] truncate hidden lg:inline">
            {user?.fullName?.split(" ")[0] || "Member"}
          </span>
        </div>

        {/* Prominent Log Out Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/15 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/60 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50"
          title="Log Out of ShopKart"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden xs:inline sm:inline">
            {loggingOut ? "..." : "Log Out"}
          </span>
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#14080a] border-b border-white/10 p-4 flex flex-col gap-2.5 shadow-2xl md:hidden z-50">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                active === link.id
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/60">
              {user?.fullName || "Member"}
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;