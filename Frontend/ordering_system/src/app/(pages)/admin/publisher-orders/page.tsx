"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, CheckCircle, Clock, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPrice } from "@/helpers/currency";

export default function PublisherOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<number | null>(null);
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
      const response = await apiService.getPublisherOrders(token);
      if (response.ok) {
        setOrders(response.data);
      } else {
        toast.error("Failed to load publisher orders");
      }
    } catch (error) {
      toast.error("Error loading publisher orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmOrder(orderId: number) {
    if (!token) return;
    
    setConfirming(orderId);
    try {
      const response = await apiService.confirmPublisherOrder(token, orderId);
      if (response.ok) {
        toast.success("Order confirmed successfully");
        fetchOrders();
      } else {
        toast.error(response.data?.msg || "Failed to confirm order");
      }
    } catch (error) {
      toast.error("Error confirming order");
    } finally {
      setConfirming(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-indigo-300">Loading publisher orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Publisher Orders</h1>
        <p className="text-indigo-300">View and confirm publisher replenishment orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-[#0b1020]/50 rounded-3xl border border-indigo-900/50">
          <Package className="h-16 w-16 mx-auto text-indigo-500 mb-4" />
          <p className="text-indigo-300 text-lg">No publisher orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      Order #{order.order_id}
                    </h3>
                    {order.status === "Pending" ? (
                      <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Confirmed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-indigo-300 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(order.cost || 0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Quantity: {order.quantity}
                    </div>
                  </div>
                  {order.book_title && (
                    <p className="text-indigo-400 text-sm mt-2">
                      Book: {order.book_title} (ISBN: {order.ISBN_number})
                    </p>
                  )}
                </div>
                {order.status === "Pending" && (
                  <Button
                    onClick={() => handleConfirmOrder(order.order_id)}
                    disabled={confirming === order.order_id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {confirming === order.order_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

