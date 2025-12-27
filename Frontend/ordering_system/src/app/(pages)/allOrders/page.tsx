"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiService } from "@/services/api";
import { formatPrice } from "@/helpers/currency";
import { Loader2, Package, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Ensure you have a Badge component or use a div
import { Separator } from "@/components/ui/separator";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = (session?.user as any)?.token;

  useEffect(() => {
    async function fetchOrders() {
      if (status === "loading") return;
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiService.getUserOrders(token);
      if (response.ok) {
        setOrders(response.data);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [token, status]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-indigo-300">Retrieving your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-indigo-900 mb-4" />
        <h2 className="text-2xl font-bold text-white">No orders found</h2>
        <p className="text-indigo-300 mt-2">You haven't placed any book orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div 
            key={order._id} 
            className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Order Header */}
            <div className="bg-indigo-950/40 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-indigo-900">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="text-indigo-400 uppercase text-xs font-bold tracking-wider">Order ID</p>
                  <p className="text-white font-mono">#{order._id.slice(-8)}</p>
                </div>
                <div className="text-sm border-l border-indigo-800 pl-4">
                  <p className="text-indigo-400 uppercase text-xs font-bold tracking-wider">Date</p>
                  <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={order.isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}>
                  {order.isPaid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {order.isPaid ? "Paid" : "Pending Payment"}
                </Badge>
                <p className="text-xl font-bold text-indigo-400">
                  {formatPrice(order.totalOrderPrice)}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 space-y-4">
              {order.cartItems.map((item: any) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <div className="h-16 w-12 bg-indigo-900/50 rounded flex-shrink-0 flex items-center justify-center text-xs text-indigo-300">
                    IMG
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.book.title}</p>
                    <p className="text-sm text-indigo-400">Qty: {item.count}</p>
                  </div>
                  <p className="text-indigo-200">{formatPrice(item.price)}</p>
                </div>
              ))}
              
              <Separator className="bg-indigo-900/50" />
              
              {/* Shipping Details */}
              <div className="text-sm text-indigo-300">
                <p className="font-bold text-indigo-100 mb-1">Shipping to:</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.details}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}