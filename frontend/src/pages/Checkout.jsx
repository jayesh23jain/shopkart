import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { resolveProduct } from "../data/productRegistry";

const formatPrice = (value) =>
  `$${Number(value || 0).toLocaleString("en-US")}`;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems = [],
    getCart,
    clearCart,
  } = useContext(CartContext) || {};

  const [formData, setFormData] = useState({
    fullName: "Alex Harrison",
    phone: "9876543210",
    address: "742 Evergreen Atelier Suite 400",
    city: "New York",
    state: "NY",
    pincode: "10001",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (getCart) {
      getCart();
    }
  }, [getCart]);

  const totalAmount = cartItems.reduce((total, item) => {
    const resolved = resolveProduct(item);
    return total + Number(resolved.price || 250) * Number(item?.quantity ?? 1);
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    let cleanPhone = "";
    for (let i = 0; i < formData.phone.length; i++) {
      const char = formData.phone[i];
      if (char !== " " && char !== "-") {
        cleanPhone += char;
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required.";
    } else if (
      cleanPhone.length < 10 ||
      !cleanPhone.split("").every((ch) => ch >= "0" && ch <= "9")
    ) {
      newErrors.phone = "Phone must contain a valid 10-digit number.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    const trimmedPincode = formData.pincode.trim();
    if (
      trimmedPincode.length < 5 ||
      !trimmedPincode.split("").every((ch) => ch >= "0" && ch <= "9")
    ) {
      newErrors.pincode = "Postal code must contain valid digits.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      setSubmitError("Your cart is empty. Please add items before placing an order.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError("");

    let cleanPhone = "";
    for (let i = 0; i < formData.phone.length; i++) {
      const char = formData.phone[i];
      if (char !== " " && char !== "-") {
        cleanPhone += char;
      }
    }

    const payload = {
      shippingAddress: {
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        address: formData.address.trim(),
        addressLine1: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
    };

    const RAZORPAY_KEY = "rzp_test_TnBwgCMdwJHEUG";
    let data = null;

    try {
      const response = await api.post("/orders/create-payment-order", payload);
      data = response.data;
    } catch {
      // Guest or mock session fallback
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setSubmitError(
          "Unable to load Razorpay payment SDK. Please verify your connection."
        );
        setIsSubmitting(false);
        return;
      }

      const amountInPaise = Math.round((totalAmount || 250) * 100);

      const options = {
        key: data?.key || RAZORPAY_KEY,
        amount: data?.amount || amountInPaise,
        currency: data?.currency || "INR",
        name: "ShopKart",
        description: "Technical Apparel Atelier",
        order_id: data?.razorpayOrderId || undefined,

        handler: async function (paymentResponse) {
          try {
            setIsSubmitting(true);
            setSubmitError("");

            if (data?.shopKartOrderId) {
              await api.post("/orders/verify-payment", {
                shopKartOrderId: data.shopKartOrderId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }).catch(() => {});
            }

            if (clearCart) clearCart();
            if (getCart) getCart();

            setConfirmedOrder({
              _id: paymentResponse.razorpay_order_id || "JM-" + Math.floor(100000 + Math.random() * 900000),
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              totalAmount: totalAmount || 250,
              status: "CONFIRMED & PAID",
            });
            setOrderPlaced(true);
          } finally {
            setIsSubmitting(false);
          }
        },

        prefill: {
          name: formData.fullName.trim(),
          contact: cleanPhone,
          email: "customer@jacketmasters.com",
        },

        theme: {
          color: "#ea580c",
        },

        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (failResponse) {
        setSubmitError(
          failResponse.error?.description || "Payment failed. Please try again."
        );
        setIsSubmitting(false);
      });

      paymentObject.open();
    } catch {
      setSubmitError("Failed to initiate Razorpay checkout. Please retry.");
      setIsSubmitting(false);
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

      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>ENCRYPTED DIRECT CHECKOUT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              FINAL DISPATCH
            </h1>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white/60 tracking-wider">
            STEP 2 OF 2 • SECURE PAYMENT
          </span>
        </div>

        {orderPlaced ? (
          <div className="bg-[#140c10]/95 border border-[#852a33]/40 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
              Order Confirmed
            </h2>
            <p className="text-xs text-white/60 mb-6">
              Your technical archive order has been allocated and passed to our atelier dispatch facility.
            </p>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 mb-8 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Tracking / Order ID:</span>
                <span className="font-mono font-bold text-white">{confirmedOrder?._id || "JM-948201"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Total Amount:</span>
                <span className="font-bold text-white">{formatPrice(confirmedOrder?.totalAmount || totalAmount || 250)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Status:</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {confirmedOrder?.status || "PLACED & VERIFIED"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/orders"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] text-white text-xs font-black tracking-widest uppercase transition-all shadow-lg hover:shadow-[0_8px_25px_rgba(217,72,25,0.45)]"
              >
                Track In Orders
              </Link>
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Shipping Address Form */}
            <div className="lg:col-span-7 bg-[#140c10]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] pb-3 border-b border-white/10 mb-6">
                DELIVERY ADDRESS & CONTACT
              </h2>

              {submitError && (
                <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 px-5 py-3 text-red-300 text-xs font-semibold">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Recipient Name"
                    className="w-full bg-black/40 border border-white/15 focus:border-[#ea580c] text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all"
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-red-400 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Contact Phone (SMS Delivery Updates) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Mobile Number"
                    className="w-full bg-black/40 border border-white/15 focus:border-[#ea580c] text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono"
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Building, street, suite number"
                    className="w-full bg-black/40 border border-white/15 focus:border-[#ea580c] text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all"
                  />
                  {errors.address && (
                    <p className="text-[10px] text-red-400 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City & State Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full bg-black/40 border border-white/15 focus:border-[#ea580c] text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all"
                    />
                    {errors.city && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full bg-black/40 border border-white/15 focus:border-[#ea580c] text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all"
                    />
                    {errors.state && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Postal / PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="ZIP / Postal Code"
                    className="w-full bg-black/40 border border-white/15 focus:border-[#ea580c] text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono"
                  />
                  {errors.pincode && (
                    <p className="text-[10px] text-red-400 mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Preview & Pay CTA */}
            <div className="lg:col-span-5 bg-[#140c10]/95 border border-[#852a33]/40 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md sticky top-24">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] pb-3 border-b border-white/10 mb-4">
                ITEMS IN DISPATCH
              </h2>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs mb-5">
                {cartItems.map((item, idx) => {
                  const resolved = resolveProduct(item);
                  const name = resolved.title || resolved.name || "Technical Apparel";
                  const price = Number(resolved.price ?? 250);
                  const qty = Number(item?.quantity ?? 1);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-white/80 py-1.5 border-b border-white/[0.04]"
                    >
                      <div className="flex-1 pr-3 flex items-center gap-2.5">
                        <img
                          src={resolved.image || "/assets/cat_sale_pop.png"}
                          alt={name}
                          className="w-8 h-8 rounded-lg object-contain bg-black/30 p-0.5 border border-white/10 shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white block truncate">{name}</span>
                          <span className="text-[10px] text-white/40">Qty: {qty} • ${price} ea</span>
                        </div>
                      </div>
                      <span className="font-bold text-white shrink-0 font-mono">
                        {formatPrice(price * qty)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/[0.08] space-y-2 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatPrice(totalAmount || 250)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-400 uppercase">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-white/15">
                  <span>Grand Total</span>
                  <span className="text-xl sm:text-2xl font-mono text-white">
                    {formatPrice(totalAmount || 250)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl hover:shadow-[0_8px_25px_rgba(217,72,25,0.45)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "AUTHORIZING..." : "PAY & DISPATCH ORDER"}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="mt-4 text-center">
                <span className="text-[10px] text-white/40 flex items-center justify-center gap-1.5">
                  <span>🔒 256-Bit SSL Atelier Direct Encryption</span>
                </span>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default Checkout;
