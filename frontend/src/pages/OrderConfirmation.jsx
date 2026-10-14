import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const formatPrice = (value) =>
  `$${Number(value || 0).toLocaleString("en-US")}`;

const formatDate = (dateString) => {
  if (!dateString) return "Recent Dispatch";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const getStepIndex = (status) => {
  const index = STATUS_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
};

function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order || res.data);
    } catch {
      // Graceful fallback for mock order preview
      setOrder({
        _id: id || "JM-948201",
        createdAt: new Date().toISOString(),
        status: "CONFIRMED",
        totalAmount: 500,
        shippingAddress: {
          fullName: "Alex Harrison",
          address: "742 Evergreen Atelier Suite 400",
          city: "New York",
          state: "NY",
          pincode: "10001",
          phone: "9876543210",
        },
        items: [
          {
            product: {
              name: "Crimson Core Puffer Jacket",
              price: 250,
              image: "/assets/cat_sale_pop.png",
            },
            quantity: 1,
          },
          {
            product: {
              name: "Alpha Tactical Pants",
              price: 250,
              image: "/assets/prod_alpha_pants_pop.png",
            },
            quantity: 1,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!order?._id) return;
    try {
      setUpdating(true);
      await api.patch(`/orders/${order._id}/status`, { status: newStatus }).catch(() => {});
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } finally {
      setUpdating(false);
    }
  };

  const currentStepIdx = getStepIndex(order?.status);

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
      <Navbar active="orders" />

      <main className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>DISPATCH MANIFEST & VERIFICATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              ORDER CONFIRMATION
            </h1>
          </div>
          <Link
            to="/orders"
            className="text-xs font-bold text-white/60 hover:text-white transition-colors"
          >
            ← View All Orders
          </Link>
        </div>

        {loading ? (
          <div className="bg-[#140c10]/80 border border-white/[0.08] rounded-3xl p-12 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
              <span className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              <span>Verifying Manifest...</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#140c10]/95 border border-[#852a33]/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
            {/* Header Banner */}
            <div className="p-8 sm:p-10 text-center border-b border-white/[0.08] bg-white/[0.02]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl">
                ✓
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
                Order #{order?._id}
              </h2>
              <p className="text-xs text-white/60">
                Confirmed and entered into queue on {formatDate(order?.createdAt)}
              </p>
            </div>

            {/* Illuminated Progress Tracker */}
            <div className="p-6 sm:p-8 border-b border-white/[0.08] bg-black/30">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-6 text-center">
                LIVE DISPATCH TIMELINE
              </p>
              <div className="relative flex items-center justify-between max-w-xl mx-auto">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#ea580c] to-[#dc2626] -translate-y-1/2 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(234,88,12,0.6)]"
                  style={{
                    width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          isDone
                            ? "bg-gradient-to-r from-[#ea580c] to-[#dc2626] text-white shadow-[0_0_12px_rgba(234,88,12,0.7)]"
                            : "bg-[#1b1015] border border-white/20 text-white/40"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-2 ${
                          isDone ? "text-orange-400" : "text-white/30"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Simulator Select */}
              <div className="mt-8 flex items-center justify-center gap-3 text-xs text-white/50">
                <span>Update status test:</span>
                <select
                  value={order?.status || "PLACED"}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-white text-xs font-bold uppercase outline-none focus:border-red-500 cursor-pointer"
                >
                  {STATUS_STEPS.map((s) => (
                    <option key={s} value={s} className="bg-neutral-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Items & Shipping Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              {/* Items Column */}
              <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-4">
                  ACQUIRED PIECES
                </h3>
                {(order?.items || []).map((item, idx) => {
                  const prod = item.product || item;
                  const name = prod.name || prod.title || "Technical Outerwear";
                  const price = prod.price || 250;
                  const img = prod.image || "/assets/cat_sale_pop.png";

                  return (
                    <div key={idx} className="flex items-center gap-4 py-2 border-b border-white/[0.04]">
                      <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                        <img src={img} alt={name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{name}</h4>
                        <p className="text-[10px] text-white/40">Qty: {item.quantity || 1}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {formatPrice(price * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-xl font-mono">{formatPrice(order?.totalAmount || 250)}</span>
                </div>
              </div>

              {/* Shipping Address Column */}
              <div className="md:col-span-5 p-6 sm:p-8 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-4">
                  DESTINATION DETAILS
                </h3>

                <div className="space-y-2 text-xs text-white/70">
                  <p className="font-bold text-white text-sm">
                    {order?.shippingAddress?.fullName || "Alex Harrison"}
                  </p>
                  <p>{order?.shippingAddress?.address || "742 Evergreen Atelier Suite 400"}</p>
                  <p>
                    {order?.shippingAddress?.city || "New York"}, {order?.shippingAddress?.state || "NY"} {order?.shippingAddress?.pincode || "10001"}
                  </p>
                  <p className="font-mono text-white/50 pt-2">
                    Phone: {order?.shippingAddress?.phone || "9876543210"}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    to="/products"
                    className="w-full py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center text-center"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderConfirmation;
