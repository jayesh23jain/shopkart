import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard that requires the customer to be logged in.
 * If unauthenticated, redirects to /login.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0e0709] flex flex-col items-center justify-center text-white select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#991b1b] to-[#dc2626] flex items-center justify-center font-black text-lg tracking-wider text-white shadow-2xl animate-pulse">
          SK
        </div>
        <span className="mt-4 text-[11px] font-bold tracking-[0.25em] text-white/50 uppercase">
          Verifying Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

/**
 * Route guard for public-only pages (Landing, Login, Register).
 * If the customer is already logged in, redirects them straight to /home.
 * Prevents accessing the landing page without logging out first.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0e0709] flex flex-col items-center justify-center text-white select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#991b1b] to-[#dc2626] flex items-center justify-center font-black text-lg tracking-wider text-white shadow-2xl animate-pulse">
          SK
        </div>
        <span className="mt-4 text-[11px] font-bold tracking-[0.25em] text-white/50 uppercase">
          Loading Showcase...
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children ? children : <Outlet />;
}
