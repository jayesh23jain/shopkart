import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { resolveProduct } from "../data/productRegistry";

const RAZORPAY_KEY = "rzp_test_TnBwgCMdwJHEUG";

const formatPrice = (value) =>
  `$${Number(value || 0).toLocaleString("en-US")}`;

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems = [],
    loading,
    error,
    updateCart,
    deleteCart,
    getCart,
    clearCart,
  } = useContext(CartContext) || {};

  const [promoCode, setPromoCode] = useState("JM-VIP50");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (getCart) getCart();
  }, [getCart]);

  const itemCount = (cartItems || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );
  const subtotal = (cartItems || []).reduce((total, item) => {
    const resolved = resolveProduct(item);
    return total + Number(resolved.price || 250) * (item.quantity || 1);
  }, 0);

  const discount = promoApplied ? Math.round(subtotal * 0.15) : 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const handleDecrease = (item) => {
    const resolved = resolveProduct(item);
    const prodId = resolved._id || resolved.id || item.product?._id || item._id;
    if (item.quantity === 1) {
      deleteCart(prodId);
      return;
    }
    updateCart(prodId, item.quantity - 1);
  };

  const handleIncrease = (item) => {
    const resolved = resolveProduct(item);
    const prodId = resolved._id || resolved.id || item.product?._id || item._id;
    updateCart(prodId, (item.quantity || 1) + 1);
  };

  const handleRemove = (item) => {
    const resolved = resolveProduct(item);
    const prodId = resolved._id || resolved.id || item.product?._id || item._id;
    deleteCart(prodId);
  };

  /* ── Direct Razorpay Checkout from Cart ── */
  const handleRazorpayInstant = async () => {
    if (cartItems.length === 0) return;

    if (!window.Razorpay) {
      showToast("Loading Razorpay SDK... please retry in a moment.");
      return;
    }

    setIsPaying(true);

    try {
      // 1. Attempt backend order creation
      let orderData = null;
      try {
        const res = await api.post("/orders/create-payment-order", {
          shippingAddress: {
            fullName: "Alex Harrison",
            phone: "9876543210",
            address: "742 Evergreen Atelier",
            addressLine1: "742 Evergreen Atelier",
            city: "New York",
            state: "NY",
            pincode: "10001",
          },
        });
        orderData = res.data;
      } catch {
        // Guest or unauthenticated fallback
      }

      const amountInPaise = Math.round((grandTotal || 250) * 100);

      const options = {
        key: orderData?.key || RAZORPAY_KEY,
        amount: orderData?.amount || amountInPaise,
        currency: orderData?.currency || "INR",
        name: "ShopKart",
        description: `Technical Apparel Atelier - ${itemCount} items`,
        order_id: orderData?.razorpayOrderId || undefined,

        handler: async function (response) {
          try {
            if (orderData?.shopKartOrderId) {
              await api.post("/orders/verify-payment", {
                shopKartOrderId: orderData.shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }).catch(() => {});
            }

            if (clearCart) clearCart();
            showToast(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
            setTimeout(() => {
              navigate("/orders");
            }, 1800);
          } catch {
            if (clearCart) clearCart();
            navigate("/orders");
          } finally {
            setIsPaying(false);
          }
        },

        prefill: {
          name: "Alex Harrison",
          email: "alex@jacketmasters.com",
          contact: "9876543210",
        },

        theme: {
          color: "#ea580c",
        },

        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        showToast(resp.error?.description || "Payment failed. Please retry.");
        setIsPaying(false);
      });

      rzp.open();
    } catch {
      showToast("Unable to open Razorpay. Please retry.");
      setIsPaying(false);
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
      <Navbar active="cart" />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-black/95 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>TECHNICAL APPAREL ATELIER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              SHOPPING BAG
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-white/60 tracking-wider">
              {itemCount} {itemCount === 1 ? "PIECE" : "PIECES"} IN CART
            </span>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-bold text-white/40 hover:text-red-400 uppercase tracking-widest transition-colors cursor-pointer border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg bg-white/[0.03]"
              >
                Clear Bag
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 px-5 py-3 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-[#140c10]/80 border border-white/[0.08] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
              <svg
                className="w-9 h-9"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
              Your bag is empty
            </h2>
            <p className="text-xs text-white/50 mb-7 max-w-md mx-auto">
              Explore our technical apparel catalog, engineered down puffer outerwear, and precision accessories.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-lg active:scale-95"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
            {/* Left Items Column */}
            <section className="space-y-4">
              {cartItems.map((item, idx) => {
                const resolved = resolveProduct(item);
                const prodId = resolved._id || resolved.id || item.product?._id || item._id || idx;
                const prodName = resolved.title || resolved.name || "Technical Outerwear";
                const prodPrice = resolved.price || 250;
                const prodImage = resolved.image || "/assets/cat_sale_pop.png";
                const prodSubtitle = resolved.subtitle || "Standard Issue • Atelier Signature Fit";

                return (
                  <article
                    key={prodId}
                    className="relative bg-[#140c10]/90 hover:bg-[#180f14] border border-white/[0.08] hover:border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 transition-all duration-300 group shadow-lg"
                  >
                    {/* Item Image with spotlight */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(180,50,20,0.25)_0%,rgba(90,20,15,0.08)_50%,transparent_75%)] flex items-center justify-center p-2">
                      <img
                        src={prodImage}
                        alt={prodName}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-108 transition-all select-none"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <Link
                            to={`/products/${prodId}`}
                            className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-tight"
                          >
                            {prodName}
                          </Link>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            {prodSubtitle}
                          </p>
                        </div>
                        <span className="text-base sm:text-lg font-black text-white shrink-0">
                          {formatPrice(prodPrice * (item.quantity || 1))}
                        </span>
                      </div>

                      <div className="text-[11px] text-white/40 mb-3">
                        {formatPrice(prodPrice)} each
                      </div>

                      {/* Controls: Quantity + Remove */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                        {/* Stepper */}
                        <div className="flex items-center bg-black/40 border border-white/15 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            disabled={loading}
                            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-black disabled:opacity-30 cursor-pointer"
                          >
                            –
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            disabled={loading}
                            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-black disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={loading}
                          className="text-[11px] font-bold text-red-400/80 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Right Order Summary Column */}
            <aside className="bg-[#140c10]/95 border border-[#852a33]/40 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md sticky top-24">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] pb-3 border-b border-white/10">
                ORDER SUMMARY
              </h2>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Insured Global Shipping</span>
                  <span className="font-bold text-emerald-400 uppercase">Complimentary</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-[#f59e0b]">
                    <span>VIP Code (15% OFF)</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 pb-4 border-t border-white/[0.08]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Promotional Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter Coupon"
                    className="flex-1 bg-black/40 border border-white/15 focus:border-[#ea580c] rounded-xl px-3 py-2 text-xs text-white uppercase font-mono tracking-wider outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setPromoApplied(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-white/70 uppercase block">Total Due</span>
                  <span className="text-[10px] text-white/40">Includes all taxes & duties</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Action 1: Instant Razorpay Modal Trigger */}
              <button
                type="button"
                onClick={handleRazorpayInstant}
                disabled={isPaying || loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl hover:shadow-[0_8px_25px_rgba(217,72,25,0.45)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 mb-3"
              >
                <span>{isPaying ? "AUTHORIZING..." : "CHECKOUT WITH RAZORPAY"}</span>
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>

              {/* Action 2: Go to Shipping Details */}
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="w-full py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-xs font-bold tracking-widest uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ENTER SHIPPING DETAILS</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
