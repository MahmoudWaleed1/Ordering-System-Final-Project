"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Truck } from "lucide-react";
import toast from "react-hot-toast";

const addressSchema = z.object({
  details: z.string().min(5, "Address details are required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(2, "City is required"),
});

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = (session?.user as any)?.token;

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: { details: "", phone: "", city: "" },
  });

  async function onSubmit(values: z.infer<typeof addressSchema>) {
    if (!token) return toast.error("Please login to complete your order");

    setIsSubmitting(true);
    try {
      // Assuming your apiService has a createCashOrder method
      const response = await apiService.createCashOrder(values, token);

      if (response.status === "success") {
        toast.success("Order placed successfully!");
        router.push("/allorders"); // Redirect to a success or orders page
      } else {
        toast.error(response.message || "Failed to place order");
      }
    } catch (error) {
      toast.error("An error occurred during checkout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-center bg-linear-to-br from-[#0f172a] to-black">
      <div className="w-full max-w-lg bg-[#0b1020]/90 border border-indigo-900 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <Truck className="text-indigo-400 h-6 w-6" />
          <h1 className="text-2xl font-bold text-white">Shipping Address</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Complete Purchase"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}