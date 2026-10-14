import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("jm_customer");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Re-verify session on boot
  useEffect(() => {
    let isMounted = true;

    api
      .post("/customers/me")
      .then((res) => {
        if (!isMounted) return;
        const customerData = {
          _id: res.data.id || res.data._id,
          fullName: res.data.name || res.data.fullName || "Member",
          email: res.data.email,
          phone: res.data.phone,
        };
        setUser(customerData);
        localStorage.setItem("jm_customer", JSON.stringify(customerData));
      })
      .catch(() => {
        if (!isMounted) return;
        // If /me rejects (expired or no token cookie), clear stored user
        setUser(null);
        localStorage.removeItem("jm_customer");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((userData) => {
    const formatted = {
      _id: userData._id || userData.id,
      fullName: userData.fullName || userData.name || "Member",
      email: userData.email,
      phone: userData.phone,
    };
    setUser(formatted);
    localStorage.setItem("jm_customer", JSON.stringify(formatted));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/customers/logout");
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem("jm_customer");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
