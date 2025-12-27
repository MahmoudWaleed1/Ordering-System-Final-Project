"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPrice } from "@/helpers/currency";

export default function CustomerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = (session?.user as any)?.token;

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user as any)?.role !== "Admin") {
      router.push("/books");
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  async function fetchOrders() {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await apiService.getCustomerOrders(token);
      if (response.ok) {
        setOrders(response.data);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-indigo-300">Loading customer orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Customer Orders</h1>
        <p className="text-indigo-300">View all customer orders and their details</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-[#0b1020]/50 rounded-3xl border border-indigo-900/50">
          <Package className="h-16 w-16 mx-auto text-indigo-500 mb-4" />
          <p className="text-indigo-300 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Order #{order.order_id}
                  </h3>
                  <div className="flex items-center gap-4 text-indigo-300 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(order.total_cost || 0)}
                    </div>
                  </div>
                  {order.username && (
                    <p className="text-indigo-400 text-sm mt-2">
                      Customer: {order.first_name} {order.last_name} ({order.username})
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-indigo-900 pt-4">
                <h4 className="text-sm font-semibold text-indigo-400 mb-3">Order Items:</h4>
                <div className="space-y-2">
                  {order.books?.map((book: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-indigo-950/30 p-3 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{book.title}</p>
                        <p className="text-indigo-400 text-sm">ISBN: {book.ISBN_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-300">Qty: {book.item_quantity}</p>
                        <p className="text-indigo-400">{formatPrice(book.unit_price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

