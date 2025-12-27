"use client";
import { cartStorage } from "@/helpers/cartStorage";
import {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

export const cartContext = createContext<{
  cartCount: number;
  setCartCount: Dispatch<SetStateAction<number>>;
  refreshCart: () => void;
}>({
  cartCount: 0,
  setCartCount: (value: SetStateAction<number>) => null,
  refreshCart: () => null,
});

export default function CartContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = () => {
    setCartCount(cartStorage.getCartCount());
  };

  useEffect(() => {
    refreshCart();
    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = () => {
      refreshCart();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <cartContext.Provider value={{ cartCount, setCartCount, refreshCart }}>
      {children}
    </cartContext.Provider>
  );
}
