"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiService } from "@/services/api";
import { cartStorage } from "@/helpers/cartStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Truck, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const checkoutSchema = z.object({
  credit_card_number: z.string().min(13, "Credit card number is required"),
  expiration_date: z.string()
    .regex(/^\d{4}-\d{2}$/, "Expiration date must be in YYYY-MM format")
    .refine((date) => {
      const [year, month] = date.split('-').map(Number);
      const expDate = new Date(year, month - 1);
      const today = new Date();
      return expDate > today;
    }, "Credit card has expired"),
});

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState(cartStorage.getCart());
  const [userProfile, setUserProfile] = useState<any>(null);
  const token = (session?.user as any)?.token;

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
    }
    
    // Load user profile to get shipping address
    if (token) {
      apiService.getUserProfile(token).then((response) => {
        if (response.ok) {
          setUserProfile(response.data);
        }
      });
    }
  }, [cartItems.length, router, token]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
      credit_card_number: "",
      expiration_date: "",
    },
  });

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!token) {
      toast.error("Please login to complete your order");
      router.push("/authentication/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform cart items to backend format
      const books = cartItems.map(item => ({
        ISBN_number: item.book.isbn || item.book.ISBN_number || "",
        quantity: item.quantity
      }));

      const response = await apiService.createOrder(
        books,
        values.credit_card_number,
        token,
        values.expiration_date
      );

      if (response.ok) {
        toast.success("Order placed successfully!");
        cartStorage.clearCart();
        router.push("/allOrders");
      } else {
        toast.error(response.data?.msg || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "An error occurred during checkout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-center bg-gradient-to-br from-[#0f172a] to-black">
      <div className="w-full max-w-lg bg-[#0b1020]/90 border border-indigo-900 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <Truck className="text-indigo-400 h-6 w-6" />
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {userProfile?.shipping_address && (
              <div className="mb-4 p-4 bg-indigo-950/30 border border-indigo-800 rounded-lg">
                <p className="text-sm text-indigo-300 mb-1">Shipping Address:</p>
                <p className="text-white font-medium">{userProfile.shipping_address}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="credit_card_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-200 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit Card Number
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234-5678-9012-3456" 
                      {...field} 
                      className="bg-indigo-950/30 border-indigo-800 text-white" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiration_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-200">Expiration Date (YYYY-MM)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="2025-12" 
                      {...field} 
                      className="bg-indigo-950/30 border-indigo-800 text-white"
                      maxLength={7}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Complete Purchase"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}