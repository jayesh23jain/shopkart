import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const formatPrice = (value) =>
  `$${Number(value || 0).toLocaleString("en-US")}`;

const formatDate = (dateString) => {
  if (!dateString) return "Recent Archive";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const getStepIndex = (status) => {
  const index = STATUS_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
};

// Curated sample orders in case backend is empty
const SAMPLE_ORDERS = [
  {
    _id: "JM-882104",
    createdAt: new Date().toISOString(),
    status: "CONFIRMED",
    totalAmount: 500,
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
  },
  {
    _id: "JM-771920",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "DELIVERED",
    totalAmount: 380,
    items: [
      {
        product: {
          name: "Aero Speed Trail Shoe",
          price: 380,
          image: "/assets/prod_shoe_pop.png",
        },
        quantity: 1,
      },
    ],
  },
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/orders");
      const list = res.data?.orders || (Array.isArray(res.data) ? res.data : []);
      if (list.length > 0) {
        setOrders(list);
      } else {
        setOrders(SAMPLE_ORDERS);
      }
    } catch {
      setOrders(SAMPLE_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.patch(`/orders/${orderId}/status`, { status: newStatus }).catch(() => {});
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } finally {
      setUpdatingId(null);
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
      <Navbar active="orders" />

      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>MEMBER DISPATCH RECORD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              ORDER ARCHIVE
            </h1>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white/60 tracking-wider">
            {orders.length} {orders.length === 1 ? "DISPATCH RECORD" : "DISPATCH RECORDS"}
          </span>
        </div>

        {loading ? (
          <div className="bg-[#140c10]/80 border border-white/[0.08] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl">
            <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
              <span className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              <span>Retrieving Order History...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#140c10]/80 border border-white/[0.08] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
              No orders placed yet
            </h2>
            <p className="text-xs text-white/50 mb-7 max-w-md mx-auto">
              Your acquired technical apparel, jackets, and accessories will appear here with live dispatch tracking.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-[#d94819] to-[#b91c1c] hover:from-[#ea580c] hover:to-[#dc2626] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-lg active:scale-95"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStepIdx = getStepIndex(order.status);
              const items = order.items || [];

              return (
                <article
                  key={order._id}
                  className="bg-[#140c10]/90 border border-white/[0.08] hover:border-white/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group"
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm sm:text-base font-black text-white tracking-wider">
                          ORDER #{order._id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-black uppercase tracking-wider text-red-400">
                          {order.status || "CONFIRMED"}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-white/40 block">Total Amount</span>
                        <span className="text-lg sm:text-xl font-black text-white">
                          {formatPrice(order.totalAmount || 250)}
                        </span>
                      </div>

                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white text-xs font-bold tracking-wider uppercase transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                  {/* Illuminated Status Progression Tracker */}
                  <div className="px-6 py-6 border-b border-white/[0.06] bg-black/30">
                    <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                      {/* Background Bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />
                      {/* Active Progress Bar */}
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#ea580c] to-[#dc2626] -translate-y-1/2 z-0 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(234,88,12,0.6)]"
                        style={{
                          width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />

                      {/* Step Pips */}
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={step}
                            className="relative z-10 flex flex-col items-center select-none"
                          >
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                isDone
                                  ? "bg-gradient-to-r from-[#ea580c] to-[#dc2626] text-white shadow-[0_0_14px_rgba(234,88,12,0.7)] scale-105"
                                  : "bg-[#1c1216] border border-white/20 text-white/40"
                              }`}
                            >
                              {isDone ? "✓" : idx + 1}
                            </div>
                            <span
                              className={`text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${
                                isCurrent
                                  ? "text-orange-400 font-black"
                                  : isDone
                                  ? "text-white/80"
                                  : "text-white/30"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {items.map((item, idx) => {
                      const prod = item.product || item;
                      const name = prod.name || prod.title || "Technical Outerwear";
                      const price = prod.price || 250;
                      const img =
                        prod.image ||
                        (idx % 2 === 0
                          ? "/assets/cat_sale_pop.png"
                          : "/assets/prod_alpha_pants_pop.png");

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 py-2 border-b border-white/[0.04] last:border-0"
                        >
                          <div className="w-16 h-16 rounded-xl bg-[radial-gradient(circle_at_50%_50%,rgba(180,50,20,0.2)_0%,transparent_70%)] bg-black/40 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                            <img
                              src={img}
                              alt={name}
                              className="max-h-full max-w-full object-contain drop-shadow"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {name}
                            </h4>
                            <p className="text-[10.5px] text-white/40">
                              Qty: {item.quantity || 1} • Atelier Signature Fit
                            </p>
                          </div>

                          <span className="text-xs sm:text-sm font-mono font-bold text-white shrink-0">
                            {formatPrice(price * (item.quantity || 1))}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Simulator Action Buttons */}
                  <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
                    <span className="text-[10.5px]">Simulator: Advance delivery state</span>
                    <div className="flex items-center gap-2">
                      {STATUS_STEPS.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusUpdate(order._id, st)}
                          disabled={updatingId === order._id || order.status === st}
                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            order.status === st
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
