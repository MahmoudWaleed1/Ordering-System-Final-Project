"use client";
import { Button} from "@/components";
import { CartBook } from "@/components/books/CartBook";
import { cartContext } from "@/contexts/cartContext";
import { formatPrice } from "@/helpers/currency";
import { apiService } from "@/services/api";
import { Separator } from "@/components/ui/separator"; // Ensure this path is correct in your project
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Added to handle authentication
import toast from "react-hot-toast";

export function CartContainer() {
  const { data: session } = useSession(); // Access the current session
  const [innerCartData, setInnerCartData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);
  const { setCartCount } = useContext(cartContext);
  const router = useRouter();

  // Safely extract the token from the session
  const token = (session?.user as any)?.token;

  // 🔑 fetch cart on mount or when token changes
  useEffect(() => {
    async function fetchCart() {
      if (!token) return; // Wait until the user is authenticated
      
      setLoading(true);
      const response = await apiService.getLoggedUserCart(token); // Pass token to API
      
      if (response.ok) {
        setInnerCartData(response.data);
        setCartCount(response.data.numOfCartItems || 0);
      } else {
        toast.error("Failed to load cart");
      }
      setLoading(false);
    }
    fetchCart();
  }, [token, setCartCount]);

  async function handleRemoveCartItem(
    productId: string,
    setIsRemovingItem: (newState: boolean) => void
  ) {
    if (!token) return;
    setIsRemovingItem(true);
    
    // API must receive the token to authorize the deletion
    const response = await apiService.removeSpecificCartItem(productId, token);
    setIsRemovingItem(false);

    if (response.status === "success") {
      toast.success("Product removed successfully");
      const newCartData = await apiService.getLoggedUserCart(token);
      setInnerCartData(newCartData.data);
      setCartCount(newCartData.data.numOfCartItems);
    } else {
      toast.error(response.message ?? "An error occurred");
    }
  }

  async function handleClearCart() {
    if (!token) return;
    setIsClearingCart(true);
    const response = await apiService.clearCart(token); // Pass token
    setIsClearingCart(false);

    if (response.status === "success") {
      toast.success("Cart cleared successfully");
      setInnerCartData(null);
      setCartCount(0);
    } else {
      toast.error(response.message ?? "An error occurred");
    }
  }

  async function handleUpdateCartProductCount(productId: string, count: number) {
    if (!token) return;
    const response = await apiService.updateCartProductCount(productId, count, token); // Pass token
    
    if (response.status === "success") {
      const newCartData = await apiService.getLoggedUserCart(token);
      setInnerCartData(newCartData.data);
      setCartCount(newCartData.data.numOfCartItems);
    }
  }

  const handleProceedToCheckout = () => {
    setIsProceedingToCheckout(true);
    router.push("/addresses");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!innerCartData || innerCartData.numOfCartItems === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">No Books in your cart</h2>
        <Button variant="outline" className="mt-2" asChild>
          <Link href="/products">Browse Books</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {innerCartData.numOfCartItems} item{innerCartData.numOfCartItems !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {innerCartData.products?.map((item: any) => (
              <CartBook
                key={item.book.isbn}
                item={item}
                onRemoveItem={handleRemoveCartItem}
                onUpdateItemCount={handleUpdateCartProductCount}
              />
            ))}
          </div>

          <div className="mt-6">
            <Button disabled={isClearingCart} onClick={handleClearCart} variant="outline">
              {isClearingCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({innerCartData.numOfCartItems} items)</span>
                <span>{formatPrice(innerCartData.totalCartPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(innerCartData.totalCartPrice)}</span>
            </div>
            <Button onClick={handleProceedToCheckout} disabled={isProceedingToCheckout} className="w-full" size="lg">
              {isProceedingToCheckout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Proceed to Checkout'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}