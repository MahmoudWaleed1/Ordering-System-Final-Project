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
  details: z.string().min(5, "Address details are required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(2, "City is required"),
});

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState(cartStorage.getCart());
  const token = (session?.user as any)?.token;

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
    }
  }, [cartItems.length, router]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
      credit_card_number: "",
      details: "", 
      phone: "", 
      city: "" 
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
        token
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
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-200">City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Cairo" {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-200">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="01XXXXXXXXX" {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-200">Address Details</FormLabel>
                  <FormControl>
                    <Input placeholder="Street name, Building number..." {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
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