"use client";

import { Button } from "@/components";
import { CartBook } from "@/components/books/CartBook";
import { cartContext } from "@/contexts/cartContext";
import { formatPrice } from "@/helpers/currency";
import { apiService } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function CartContainer() {
  const { data: session, status } = useSession();
  const [innerCartData, setInnerCartData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);
  const { setCartCount } = useContext(cartContext);
  const router = useRouter();

  const token = (session?.user as any)?.token;

  useEffect(() => {
    async function fetchCart() {
      if (status === "loading") return;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getLoggedUserCart(token);
        
        if (response.ok && response.data) {
          setInnerCartData(response.data);
          setCartCount(response.data.numOfCartItems || 0);
        } else {
          setInnerCartData(null);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Could not load cart data");
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [token, status, setCartCount]);

  async function handleRemoveCartItem(
    productId: string,
    setIsRemovingItem: (newState: boolean) => void
  ) {
    if (!token) return;
    setIsRemovingItem(true);
    
    try {
      const response = await apiService.removeSpecificCartItem(productId, token);
      if (response.status === "success") {
        toast.success("Book removed successfully");
        const newCartData = await apiService.getLoggedUserCart(token);
        setInnerCartData(newCartData.data);
        setCartCount(newCartData.data.numOfCartItems);
      }
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsRemovingItem(false);
    }
  }

  async function handleClearCart() {
    if (!token) return;
    setIsClearingCart(true);
    try {
      const response = await apiService.clearCart(token);
      if (response.status === "success" || response.message === "success") {
        toast.success("Cart cleared");
        setInnerCartData(null);
        setCartCount(0);
      }
    } catch (error) {
      toast.error("Failed to clear cart");
    } finally {
      setIsClearingCart(false);
    }
  }

  async function handleUpdateCartProductCount(productId: string, count: number) {
    if (!token) return;
    try {
      const response = await apiService.updateCartProductCount(productId, count, token);
      if (response.status === "success") {
        const newCartData = await apiService.getLoggedUserCart(token);
        setInnerCartData(newCartData.data);
        setCartCount(newCartData.data.numOfCartItems);
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  }

  const handleProceedToCheckout = () => {
    setIsProceedingToCheckout(true);
    router.push("/addresses");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-indigo-300 animate-pulse">Loading your library cart...</p>
      </div>
    );
  }

  if (!innerCartData || innerCartData.numOfCartItems === 0) {
    return (
      <div className="text-center py-20 bg-[#0b1020]/50 rounded-3xl border border-indigo-900/50">
        <h2 className="text-2xl font-semibold text-indigo-100 mb-4">
          Your cart is currently empty
        </h2>
        <p className="text-indigo-300 mb-8">Ready to add some new books to your collection?</p>
        <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
          <Link href="/books">Browse Books</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart</h1>
        <p className="text-indigo-300">
          You have {innerCartData.numOfCartItems} book{innerCartData.numOfCartItems !== 1 ? "s" : ""} reserved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {innerCartData.products?.map((item: any) => (
              <CartBook
                key={item.book.isbn || item._id}
                item={item}
                onRemoveItem={handleRemoveCartItem}
                onUpdateItemCount={handleUpdateCartProductCount}
              />
            ))}
          </div>

          <div className="mt-8">
            <Button 
              disabled={isClearingCart} 
              onClick={handleClearCart} 
              variant="destructive"
              className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50"
            >
              {isClearingCart ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Clear Entire Cart
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#0b1020]/80 backdrop-blur-xl border border-indigo-900 rounded-2xl p-6 sticky top-24 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-indigo-200">
                <span>Subtotal ({innerCartData.numOfCartItems} items)</span>
                <span>{formatPrice(innerCartData.totalCartPrice)}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <Separator className="bg-indigo-900" />
              <div className="flex justify-between font-bold text-xl text-white">
                <span>Total</span>
                <span className="text-indigo-400">{formatPrice(innerCartData.totalCartPrice)}</span>
              </div>
            </div>

            <Button 
              onClick={handleProceedToCheckout} 
              disabled={isProceedingToCheckout} 
              className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20"
            >
              {isProceedingToCheckout ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Proceed to Checkout'
              )}
            </Button>

            <Link 
              href="/books" 
              className="block text-center mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ← Continue Browsing Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}