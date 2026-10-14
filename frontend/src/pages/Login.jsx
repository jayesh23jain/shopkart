import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { JACKETS } from "../data/jacketsData";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJacketIndex, setSelectedJacketIndex] = useState(0);

  const activeJacket = JACKETS[selectedJacketIndex];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in both your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      let response;
      try {
        response = await api.post("customers/login", formData);
      } catch (loginErr) {
        // If guest demo account was not registered yet, auto-register & login
        if (
          formData.email === "guest@shopkart.com" ||
          formData.email === "guest@jacketmasters.com"
        ) {
          try {
            await api.post("customers/register", {
              fullName: "Alexander Guest",
              email: formData.email,
              password: "password123",
              phone: "+1 (555) 019-2834",
            });
            response = await api.post("customers/login", formData);
          } catch {
            throw loginErr;
          }
        } else {
          throw loginErr;
        }
      }

      if (response?.data?.success) {
        login(
          response.data.customer || {
            email: formData.email,
            fullName: "Alexander Guest",
          }
        );
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo account filler for convenience
  const handleQuickDemo = () => {
    setFormData({
      email: "guest@shopkart.com",
      password: "password123",
    });
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 select-none overflow-x-hidden transition-all duration-700"
      style={{
        background: `
          radial-gradient(circle at 94% 18%, rgba(195, 25, 25, 0.45) 0%, rgba(130, 15, 18, 0.28) 35%, transparent 68%),
          radial-gradient(circle at 95% 65%, rgba(160, 20, 22, 0.35) 0%, rgba(90, 10, 15, 0.18) 40%, transparent 65%),
          radial-gradient(circle at 10% 88%, rgba(85, 18, 14, 0.25) 0%, transparent 45%),
          #0e0709
        `,
      }}
    >
      {/* Top back navigation */}
      <div className="absolute top-6 left-6 sm:left-10 z-30">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all hover:scale-105"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Showcase
        </Link>
      </div>

      {/* Main Luxury Auth Card */}
      <div
        className="w-full max-w-4xl rounded-[32px] md:rounded-[40px] shadow-[0_35px_100px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 transition-all duration-700"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #201f22 0%, #141315 60%, #0a090b 100%)",
        }}
      >
        {/* Left Visual Column: Interactive Jacket Visualizer */}
        <div
          className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-700 border-b lg:border-b-0 lg:border-r border-white/10"
          style={{ background: activeJacket.cardGradient }}
        >
          {/* Subtle colored glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-50"
            style={{ backgroundColor: activeJacket.accentColor }}
          />

          {/* Brand header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xs text-white">
              SK
            </div>
            <span className="font-extrabold text-xs tracking-[0.22em] text-white uppercase">
              SHOPKART
            </span>
          </div>

          {/* Floating jacket graphic */}
          <div className="relative z-10 flex flex-col items-center justify-center my-6">
            <div className="w-48 sm:w-56 aspect-square flex items-center justify-center">
              <img
                src={activeJacket.image}
                alt={activeJacket.name}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)] animate-float-jacket select-none pointer-events-none"
              />
            </div>
            <div
              className="w-36 h-4 rounded-[100%] bg-black/60 blur-md -mt-2 animate-float-shadow pointer-events-none"
              style={{ boxShadow: `0 0 20px 4px rgba(0,0,0,0.7)` }}
            />
          </div>

          {/* Color Switcher & Quote */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {JACKETS.map((j, idx) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJacketIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    selectedJacketIndex === idx
                      ? "scale-125 ring-2 ring-white"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: j.accentColor }}
                  title={j.colorName}
                />
              ))}
            </div>
            <p className="text-xs text-white/80 italic font-light">
              "{activeJacket.tagline}"
            </p>
            <span className="text-[11px] text-white/50 tracking-wider uppercase mt-1">
              {activeJacket.colorName} Edition
            </span>
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mb-6">
              Welcome back to your luxury wardrobe and member exclusives.
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-shake">
                <svg
                  className="w-4 h-4 text-red-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-orange-500 focus:bg-white/10 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Password reset demo link sent to your registered email.")
                    }
                    className="text-[11px] text-white/50 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/30 focus:border-orange-500 focus:bg-white/10 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-full bg-white text-black font-extrabold text-sm tracking-wider uppercase hover:bg-orange-400 hover:text-white hover:shadow-[0_10px_30px_rgba(255,255,255,0.25)] transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In to Account"}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <span>Need test credentials?</span>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                Fill Guest Account
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center mt-6 text-xs text-white/60">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="text-white font-bold hover:text-orange-400 underline underline-offset-4 ml-1 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;