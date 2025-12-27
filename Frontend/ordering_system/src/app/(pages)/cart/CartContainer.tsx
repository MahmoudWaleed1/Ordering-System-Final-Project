"use client";

import { Button } from "@/components";
import { CartBook } from "@/components/books/CartBook";
import { cartContext } from "@/contexts/cartContext";
import { cartStorage, CartItem } from "@/helpers/cartStorage";
import { formatPrice } from "@/helpers/currency";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function CartContainer() {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);
  const { refreshCart } = useContext(cartContext);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    const items = cartStorage.getCart();
    setCartItems(items);
    setLoading(false);
  }, [status]);

  function handleRemoveCartItem(isbn: string) {
    cartStorage.removeFromCart(isbn);
    const items = cartStorage.getCart();
    setCartItems(items);
    refreshCart();
    toast.success("Book removed from cart");
  }

  function handleClearCart() {
    setIsClearingCart(true);
    try {
      cartStorage.clearCart();
      setCartItems([]);
      refreshCart();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    } finally {
      setIsClearingCart(false);
    }
  }

  function handleUpdateCartProductCount(isbn: string, count: number) {
    cartStorage.updateQuantity(isbn, count);
    const items = cartStorage.getCart();
    setCartItems(items);
    refreshCart();
  }

  const handleProceedToCheckout = () => {
    if (!session?.user) {
      toast.error("Please login to checkout");
      router.push("/authentication/login");
      return;
    }
    setIsProceedingToCheckout(true);
    router.push("/addresses");
  };

  const totalPrice = cartStorage.getTotalPrice();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-indigo-300 animate-pulse">Loading your library cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
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
          You have {totalItems} book{totalItems !== 1 ? "s" : ""} in your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartBook
                key={item.book.isbn || item.book.ISBN_number}
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
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <Separator className="bg-indigo-900" />
              <div className="flex justify-between font-bold text-xl text-white">
                <span>Total</span>
                <span className="text-indigo-400">{formatPrice(totalPrice)}</span>
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