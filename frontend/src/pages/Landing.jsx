import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { JACKETS } from "../data/jacketsData";
import api from "../services/api";

function Landing() {
  // Active Jacket State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("36");
  const [customer, setCustomer] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [exitingJacket, setExitingJacket] = useState(null);
  const [slideDirection, setSlideDirection] = useState("next");

  const currentJacket = JACKETS[currentIndex];
  const isScrollingRef = useRef(false);

  // Check if visitor is already logged in; if so, offer direct link to /home
  useEffect(() => {
    let isMounted = true;
    api
      .post("customers/me")
      .then((res) => {
        if (isMounted) setCustomer(res.data);
      })
      .catch(() => {
        if (isMounted) setCustomer(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Change active jacket with diagonal entrance and exit transitions
  const changeSlide = useCallback(
    (indexOrDirection) => {
      if (transitioning) return;

      let nextIdx;
      let dir = "next";

      if (typeof indexOrDirection === "number") {
        if (indexOrDirection === currentIndex) return;
        dir = indexOrDirection > currentIndex ? "next" : "prev";
        nextIdx = indexOrDirection;
      } else if (indexOrDirection === "prev") {
        dir = "prev";
        nextIdx = (currentIndex - 1 + JACKETS.length) % JACKETS.length;
      } else {
        dir = "next";
        nextIdx = (currentIndex + 1) % JACKETS.length;
      }

      setTransitioning(true);
      setSlideDirection(dir);
      setExitingJacket({
        jacket: JACKETS[currentIndex],
        direction: dir,
      });
      setCurrentIndex(nextIdx);

      setTimeout(() => {
        setExitingJacket(null);
        setTransitioning(false);
      }, 650);
    },
    [currentIndex, transitioning]
  );

  // Mouse wheel scroll to transition jacket shades
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrollingRef.current) return;

      if (Math.abs(e.deltaY) > 28) {
        isScrollingRef.current = true;
        if (e.deltaY > 0) {
          changeSlide("next");
        } else {
          changeSlide("prev");
        }

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 700);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [changeSlide]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        changeSlide("next");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        changeSlide("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeSlide]);

  // Next jacket in sequence (visible in bottom-right in small size)
  const nextJacket = JACKETS[(currentIndex + 1) % JACKETS.length];
  const otherJackets = JACKETS.filter((_, idx) => idx !== currentIndex);

  return (
    <div
      className="min-h-screen h-screen w-full text-white overflow-hidden flex flex-col justify-between selection:bg-orange-500 selection:text-white transition-all duration-700 ease-in-out"
      style={{
        background: currentJacket.fullScreenGradient,
      }}
    >
      {/* ---------------- 1. CLEAN NAVIGATION HEADER ---------------- */}
      <header className="w-full relative z-30 px-6 sm:px-10 lg:px-16 pt-7 pb-4 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center font-black text-xs tracking-wider text-white shadow-inner group-hover:scale-105 transition-transform">
            SK
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-[0.22em] text-white uppercase drop-shadow-sm">
            SHOPKART
          </span>
        </Link>

        {/* Right: Clean Authentication Buttons */}
        <div className="flex items-center gap-3">
          {customer ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/80 font-medium hidden sm:inline">
                Hi, {customer.name?.split(" ")[0]}
              </span>
              <Link
                to="/home"
                className="text-xs font-extrabold px-5 py-2 rounded-full bg-white text-black hover:bg-orange-400 hover:text-white transition-all duration-300 shadow-md tracking-wider uppercase active:scale-95"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="text-xs font-bold text-white/80 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all tracking-wider uppercase"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-xs font-extrabold px-5 py-2 rounded-full bg-white text-black hover:bg-orange-400 hover:text-white transition-all duration-300 shadow-md tracking-wider uppercase active:scale-95"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ---------------- 2. HERO FULL-SCREEN SECTION ---------------- */}
      <section className="relative w-full flex-1 px-6 sm:px-10 lg:px-16 flex flex-col justify-between py-4">

        {/* Main Hero Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center flex-1 gap-8 my-auto">
          {/* Left Column: Headline, Value Proposition, and Size Selector */}
          <div className="lg:col-span-4 flex flex-col justify-center items-start text-left z-20">
            {/* Color Swatches / Arrow controls */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => changeSlide("prev")}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-white hover:text-black text-white/70 border border-white/15 flex items-center justify-center transition-all duration-200 active:scale-90"
                aria-label="Previous jacket shade"
                title="Previous Color"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => changeSlide("next")}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-white hover:text-black text-white/70 border border-white/15 flex items-center justify-center transition-all duration-200 active:scale-90"
                aria-label="Next jacket shade"
                title="Next Color"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="flex items-center gap-2 ml-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                {JACKETS.map((j, idx) => (
                  <button
                    key={j.id}
                    onClick={() => changeSlide(idx)}
                    onMouseEnter={() => changeSlide(idx)}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                      currentIndex === idx
                        ? "scale-125 ring-2 ring-white border-white"
                        : "opacity-60 hover:opacity-100 border-white/20"
                    }`}
                    style={{ backgroundColor: j.colorHex }}
                    title={j.colorName}
                  />
                ))}
              </div>
            </div>

            {/* Headline: "Stand out Without trying" */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-4 drop-shadow-md">
              {currentJacket.headlineMain} <br />
              <span className="font-light tracking-normal text-white/95">
                {currentJacket.headlineSub}
              </span>
            </h1>

            {/* Subtitle / Value Proposition */}
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-md mb-8 font-normal">
              {currentJacket.valueProposition}
            </p>

            {/* "Get the look >" Action Button matching record.mp4 */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-orange-400 hover:text-white transition-all duration-300 shadow-xl active:scale-95 group/btn"
            >
              <span>Get the look</span>
              <svg
                className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* Center Column: Smooth Floating Central Jacket Image & Tagline */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative my-4 lg:my-0">
            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Central Floating Jacket Showcase with Diagonal Animation */}
              <div className="relative w-72 sm:w-88 md:w-[440px] aspect-square flex items-center justify-center">
                {/* Dedicated Studio Glow directly behind and around the jacket */}
                <div
                  className="absolute inset-0 -inset-x-14 -inset-y-14 m-auto w-[440px] sm:w-[520px] h-[440px] sm:h-[520px] rounded-full pointer-events-none transition-all duration-700 -z-10"
                  style={{
                    background:
                      currentJacket.id === "black"
                        ? "radial-gradient(circle closest-side, rgba(140, 146, 160, 0.45) 0%, rgba(75, 80, 92, 0.32) 40%, rgba(30, 32, 38, 0.16) 70%, transparent 100%)"
                        : `radial-gradient(circle closest-side, ${currentJacket.accentColor}55 0%, ${currentJacket.accentColor}25 45%, transparent 100%)`,
                    filter: "blur(55px)",
                  }}
                />

                {/* Exiting Jacket (moves toward TOP-LEFT with blur & fade out) */}
                {exitingJacket && (
                  <div
                    key={`exit-${exitingJacket.jacket.id}`}
                    className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 ${
                      exitingJacket.direction === "next"
                        ? "animate-jacket-exit-topleft"
                        : "animate-jacket-exit-bottomright"
                    }`}
                  >
                    <img
                      src={exitingJacket.jacket.image}
                      alt={exitingJacket.jacket.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)] select-none pointer-events-none"
                    />
                  </div>
                )}

                {/* Incoming / Active Jacket (enters from BOTTOM-RIGHT to center with blur clearing & size growth) */}
                <div
                  key={`enter-${currentJacket.id}`}
                  className={`relative w-full h-full flex items-center justify-center group ${
                    transitioning
                      ? slideDirection === "next"
                        ? "animate-jacket-enter-bottomright z-20"
                        : "animate-jacket-enter-topleft z-20"
                      : "animate-float-jacket z-20"
                  }`}
                >
                  <img
                    src={currentJacket.image}
                    alt={currentJacket.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                  />
                </div>
              </div>

              {/* Pulsing Floor Shadow */}
              <div
                className="w-56 sm:w-72 h-6 rounded-[100%] bg-black/60 blur-md -mt-4 animate-float-shadow pointer-events-none"
                style={{ boxShadow: `0 0 28px 8px rgba(0,0,0,0.75)` }}
              />

              {/* Tagline */}
              <p className="mt-8 text-center text-xs sm:text-sm font-light text-white/85 tracking-wide drop-shadow">
                "{currentJacket.tagline}"
              </p>
            </div>
          </div>

          {/* Right Column: Prominent Price Tag, Size Selector & Small Next Jacket Preview (matching record.mp4) */}
          <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-between h-full py-4 text-left lg:text-right z-20 gap-6">
            {/* Price Tag Block (Top Right) */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  ${currentJacket.price}
                </span>
                <span className="text-lg sm:text-xl line-through text-white/45 font-medium">
                  ${currentJacket.originalPrice}
                </span>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-1 mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  In Stock (Size {selectedSize})
                </span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-medium">
                  Free Express Shipping Included
                </span>
              </div>
            </div>

            {/* Choose Your Size Selector (Mid Right) */}
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-2.5">
                Choose your size:
              </span>
              <div className="flex items-center gap-2">
                {currentJacket.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                      selectedSize === size
                        ? "bg-white text-black shadow-lg scale-110 ring-2 ring-white/60 font-black"
                        : "bg-black/35 text-white/75 border border-white/15 hover:border-white/40 hover:bg-white/10"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom-Right Next Jacket in Small Size (matching record.mp4) */}
            <div
              onClick={() => changeSlide("next")}
              className="group cursor-pointer flex flex-col items-start lg:items-end select-none transition-all duration-300 hover:scale-105 active:scale-95"
              title={`Next: ${nextJacket.colorName} Edition (Click or scroll to bring to mid)`}
            >
              {/* Small floating preview jacket perched in bottom-right */}
              <div className="relative w-24 sm:w-28 md:w-32 aspect-square flex items-center justify-center">
                {/* Glow behind thumbnail */}
                <div
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full blur-xl opacity-45 group-hover:opacity-80 transition-opacity pointer-events-none"
                  style={{ backgroundColor: nextJacket.accentColor }}
                />

                <img
                  key={`preview-${nextJacket.id}`}
                  src={nextJacket.image}
                  alt={nextJacket.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.65)] group-hover:scale-110 transition-transform duration-300 pointer-events-none animate-preview-in select-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75 group-hover:text-white transition-colors mt-1">
                <span>{nextJacket.colorName}</span>
                <svg
                  className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Media Icons & Color Switch Hint */}
        <footer className="relative z-20 flex items-center justify-between pt-4 pb-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/50">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Dribbble">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm10.16 10.742c-.443-.075-2.627-.417-5.068.326-.307-.714-.633-1.424-.986-2.126 3.129-1.385 4.398-3.328 4.549-3.568 1.01 1.488 1.585 3.322 1.505 5.368zm-3.084-6.657c-.19.303-1.378 2.115-4.372 3.428-1.554-2.868-3.23-5.267-3.447-5.574 1.189-.481 2.496-.739 3.843-.739 1.464 0 2.872.33 4.137.944l-.161-.059zm-9.576-2.001c.219.309 1.888 2.7 3.446 5.565-2.457.77-5.385.955-8.497.839.816-2.861 3.013-5.187 6.051-6.404zm-7.42 8.358c3.279.117 6.388-.088 8.995-.91.319.646.619 1.303.896 1.968-3.921 1.254-7.581 4.502-8.318 5.228-1.047-1.745-1.637-3.832-1.573-6.286zm2.348 7.828c.677-.66 4.093-3.708 7.859-4.948 1.139 2.973 1.637 5.795 1.764 6.576-1.551.758-3.32 1.184-5.187 1.184-1.687 0-3.265-.402-4.665-1.127l.229-1.685zm11.396 1.411c-.139-.785-.626-3.486-1.722-6.368 2.278-.718 4.331-.383 4.767-.303-.453 2.863-2.142 5.312-4.545 6.671h1.5z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium tracking-wider uppercase">
            <span>Scroll or use arrows to explore colors</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-ping" />
          </div>
        </footer>
      </section>
    </div>
  );
}

export default Landing;
