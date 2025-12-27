"use client";
import { apiService } from "@/services/api";
import { useSession } from "next-auth/react";
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
}>({
  cartCount: 0,
  setCartCount: (value: SetStateAction<number>) => null,
});

export default function CartContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  async function getCart() {
    const token = (session?.user as any)?.token;
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await apiService.getLoggedUserCart(token);
      if (response.ok && response.data) {
        setCartCount(response.data.numOfCartItems || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartCount(0);
    }
  }

  useEffect(() => {
    getCart();
  }, [session]);

  return (
    <cartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </cartContext.Provider>
  );
}
