import { useCallback, useState, useEffect, createContext } from "react";
import api from "../services/api";
import { resolveProduct } from "../data/productRegistry";

const CartContext = createContext();

const LOCAL_STORAGE_KEY = "jm_atelier_cart";

const CartProvider = ({ children }) => {
  // Initialize cart state with localStorage cache, healing any corrupted snapshots
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => {
        const resolved = resolveProduct(item);
        return {
          ...item,
          product: resolved,
          quantity: item.quantity || 1,
        };
      });
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep localStorage synchronized
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // storage quota or private mode fallback
    }
  }, [cartItems]);

  // Synchronize cart from backend on mount
  const getCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/cart");
      if (response.data?.cart && response.data.cart.length > 0) {
        const healed = response.data.cart.map((ci) => ({
          ...ci,
          product: resolveProduct(ci.product || ci),
        }));
        setCartItems(healed);
      }
    } catch {
      // Keep existing local cart items if unauthenticated
    } finally {
      setLoading(false);
    }
  }, []);

  const addCart = async (idOrProduct) => {
    try {
      setLoading(true);
      setError(null);

      // Resolve product snapshot upfront so we ALWAYS have authentic name, image, price, id
      const resolved = resolveProduct(idOrProduct);
      const prodId = resolved._id || resolved.id;
      const targetTitle = (resolved.title || resolved.name || "").toLowerCase();

      // Optimistically update local cart immediately for instant UI response
      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => {
          const currentId = item.product?._id || item.product?.id || item._id;
          const currentTitle = (item.product?.title || item.product?.name || item.title || item.name || "")?.toLowerCase();
          return (
            String(currentId) === String(prodId) ||
            (targetTitle && currentTitle && currentTitle === targetTitle)
          );
        });

        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            product: resolved,
            quantity: (next[existingIdx].quantity || 1) + 1,
          };
          return next;
        }

        return [
          ...prev,
          {
            product: resolved,
            quantity: 1,
          },
        ];
      });

      // Try server sync in parallel
      try {
        const response = await api.post(`/cart/${prodId}`);
        if (response.data?.cart && Array.isArray(response.data.cart)) {
          const healed = response.data.cart.map((ci) => ({
            ...ci,
            product: resolveProduct(ci.product || ci),
          }));
          setCartItems(healed);
        }
      } catch {
        // Backend not logged in; local state already updated
      }

      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to add product to bag";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (idOrProduct, quantity) => {
    try {
      setLoading(true);
      setError(null);

      const targetId = typeof idOrProduct === "object" ? (idOrProduct._id || idOrProduct.id) : idOrProduct;
      const targetTitle = (typeof idOrProduct === "object" ? (idOrProduct.title || idOrProduct.name) : targetId || "")?.toLowerCase();

      if (quantity <= 0) {
        await deleteCart(idOrProduct);
        return;
      }

      // Optimistically update local cart immediately
      setCartItems((prev) =>
        prev.map((item) => {
          const itemProdId = item.product?._id || item.product?.id || item._id || item.id;
          const itemTitle = (item.product?.title || item.product?.name || item.title || item.name || "")?.toLowerCase();

          const matches =
            String(itemProdId) === String(targetId) ||
            String(item._id) === String(targetId) ||
            (targetTitle && itemTitle && itemTitle === targetTitle);

          if (matches) {
            return {
              ...item,
              quantity: Number(quantity),
            };
          }
          return item;
        })
      );

      // Attempt backend server sync
      try {
        const response = await api.patch(`/cart/${targetId}`, { quantity });
        if (response.data?.cart && Array.isArray(response.data.cart)) {
          const healed = response.data.cart.map((ci) => ({
            ...ci,
            product: resolveProduct(ci.product || ci),
          }));
          setCartItems(healed);
        }
      } catch {
        // Local state already updated
      }
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update cart");
    } finally {
      setLoading(false);
    }
  };

  const deleteCart = async (idOrProduct) => {
    try {
      setLoading(true);
      setError(null);

      const targetId = typeof idOrProduct === "object" ? (idOrProduct._id || idOrProduct.id) : idOrProduct;
      const targetTitle = (typeof idOrProduct === "object" ? (idOrProduct.title || idOrProduct.name) : targetId || "")?.toLowerCase();

      // Optimistically update local cart immediately
      setCartItems((prev) =>
        prev.filter((item) => {
          const itemProdId = item.product?._id || item.product?.id || item._id || item.id;
          const itemTitle = (item.product?.title || item.product?.name || item.title || item.name || "")?.toLowerCase();

          const matches =
            String(itemProdId) === String(targetId) ||
            String(item._id) === String(targetId) ||
            (targetTitle && itemTitle && itemTitle === targetTitle);

          return !matches;
        })
      );

      // Attempt backend server sync
      try {
        const response = await api.delete(`/cart/${targetId}`);
        if (response.data?.cart && Array.isArray(response.data.cart)) {
          const healed = response.data.cart.map((ci) => ({
            ...ci,
            product: resolveProduct(ci.product || ci),
          }));
          setCartItems(healed);
        }
      } catch {
        // Local state already updated
      }
    } catch (err) {
      setError(err.response?.data?.error || "Unable to remove product");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addCart,
        updateCart,
        deleteCart,
        getCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };
export default CartContext;