"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  Package, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  BarChart3,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/authentication/login");
      return;
    }

    const role = (session.user as any)?.role;
    if (role !== "Admin") {
      router.push("/books");
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-indigo-300">Loading dashboard...</p>
      </div>
    );
  }

  const adminLinks = [
    {
      title: "Manage Books",
      description: "Add, edit, or remove books from the catalog",
      icon: BookOpen,
      href: "/admin/books",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Publisher Orders",
      description: "View and confirm publisher replenishment orders",
      icon: Package,
      href: "/admin/publisher-orders",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Customer Orders",
      description: "View all customer orders and their details",
      icon: ShoppingBag,
      href: "/admin/customer-orders",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Sales Reports",
      description: "View sales statistics and top customers",
      icon: BarChart3,
      href: "/admin/reports",
      color: "bg-orange-600 hover:bg-orange-700"
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-indigo-300">Manage your bookstore operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6 hover:border-indigo-700 transition-all cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <div className={`${link.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{link.title}</h3>
                    <p className="text-indigo-300 text-sm">{link.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

