"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, BarChart3, TrendingUp, BookOpen, ShoppingBag, DollarSign, Search, Package, Users } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPrice } from "@/helpers/currency";

export default function SalesReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<"previous-month" | "by-date">("previous-month");
  const [selectedDate, setSelectedDate] = useState("");
  const [salesData, setSalesData] = useState<any>(null);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [replenishmentISBN, setReplenishmentISBN] = useState("");
  const [replenishmentData, setReplenishmentData] = useState<any>(null);
  const [loadingReplenishment, setLoadingReplenishment] = useState(false);
  const token = (session?.user as any)?.token;

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user as any)?.role !== "Admin") {
      router.push("/books");
      return;
    }

    fetchReports();
  }, [session, status, router]);

  useEffect(() => {
    if (token && reportType === "previous-month") {
      fetchReports();
    }
  }, [reportType]);

  async function fetchReports() {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Fetch sales report based on type
      if (reportType === "previous-month") {
        const salesResponse = await apiService.getSalesReport(token, "previous-month");
        if (salesResponse.ok) {
          setSalesData(salesResponse.data);
        } else {
          toast.error("Failed to load previous month sales");
        }
      } else if (reportType === "by-date" && selectedDate) {
        const salesResponse = await apiService.getSalesReport(token, "by-date", selectedDate);
        if (salesResponse.ok) {
          setSalesData(salesResponse.data);
        } else {
          toast.error("Failed to load sales for selected date");
        }
      }
      
      // Always fetch top books and top customers (they're independent of date selection)
      const booksResponse = await apiService.getTopBooks(token);
      if (booksResponse.ok) {
        setTopBooks(booksResponse.data);
      } else {
        toast.error("Failed to load top selling books");
      }
      
      const customersResponse = await apiService.getTopCustomers(token);
      if (customersResponse.ok) {
        setTopCustomers(customersResponse.data);
      } else {
        toast.error("Failed to load top customers");
      }
    } catch (error) {
      toast.error("Error loading reports");
    } finally {
      setLoading(false);
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleGenerateReport = () => {
    if (reportType === "by-date" && !selectedDate) {
      toast.error("Please select a date");
      return;
    }
    fetchReports();
  };

  async function fetchReplenishmentHistory() {
    if (!token || !replenishmentISBN.trim()) {
      toast.error("Please enter a book ISBN");
      return;
    }

    try {
      setLoadingReplenishment(true);
      const response = await apiService.getReplenishmentHistory(token, replenishmentISBN.trim());
      if (response.ok) {
        setReplenishmentData(response.data);
      } else {
        toast.error(response.data?.msg || "Failed to load replenishment history");
        setReplenishmentData(null);
      }
    } catch (error) {
      toast.error("Error loading replenishment history");
      setReplenishmentData(null);
    } finally {
      setLoadingReplenishment(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-indigo-300">Loading sales reports...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Sales Reports</h1>
        <p className="text-indigo-300">View sales statistics and top-selling books</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Report Options</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-4">
            <Button
              variant={reportType === "previous-month" ? "default" : "outline"}
              onClick={() => setReportType("previous-month")}
              className={reportType === "previous-month" ? "bg-indigo-600" : ""}
            >
              Previous Month
            </Button>
            <Button
              variant={reportType === "by-date" ? "default" : "outline"}
              onClick={() => setReportType("by-date")}
              className={reportType === "by-date" ? "bg-indigo-600" : ""}
            >
              By Date
            </Button>
          </div>
          {reportType === "by-date" && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-indigo-950/30 border-indigo-800 text-white"
              />
              <Button onClick={handleGenerateReport} className="bg-indigo-600 hover:bg-indigo-700">
                Generate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sales Summary */}
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-8 w-8 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-indigo-400">
              {formatPrice(salesData.Total_Sales || salesData.total_sales || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Top 5 Customers */}
      <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Top 5 Customers (Last 3 Months)</h3>
        </div>
        {topCustomers.length === 0 ? (
          <p className="text-indigo-300 text-center py-8">No customer data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-950/40 border-b border-indigo-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase">Customer Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase">Total Purchase Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-900">
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-indigo-950/20">
                    <td className="px-6 py-4 text-sm text-indigo-300 font-mono">#{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-white">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-400 font-semibold">
                      {formatPrice(customer.total_purchase_amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Selling Books */}
      <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Top 10 Selling Books (Last 3 Months)</h3>
        </div>
        {topBooks.length === 0 ? (
          <p className="text-indigo-300 text-center py-8">No sales data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-950/40 border-b border-indigo-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase">Book Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase">Copies Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-900">
                {topBooks.map((book, index) => (
                  <tr key={index} className="hover:bg-indigo-950/20">
                    <td className="px-6 py-4 text-sm text-indigo-300 font-mono">#{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-white">{book.title}</td>
                    <td className="px-6 py-4 text-sm text-indigo-400 font-semibold">{book.total_number_of_copies_sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Replenishment History Section */}
      <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl p-6 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Book Replenishment History</h3>
        </div>
        <p className="text-indigo-300 text-sm mb-4">
          Enter a book ISBN to see how many times replenishment orders were placed for that book.
        </p>
        <div className="flex gap-3 mb-4">
          <Input
            type="text"
            placeholder="Enter ISBN (e.g., 978-0-123456-78-9)"
            value={replenishmentISBN}
            onChange={(e) => setReplenishmentISBN(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchReplenishmentHistory()}
            className="bg-indigo-950/30 border-indigo-800 text-white flex-1"
          />
          <Button 
            onClick={fetchReplenishmentHistory}
            disabled={loadingReplenishment}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loadingReplenishment ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
        {replenishmentData && (
          <div className="bg-indigo-950/30 p-4 rounded-lg border border-indigo-800">
            <p className="text-indigo-300 text-sm mb-2">ISBN: <span className="text-white font-mono">{replenishmentISBN}</span></p>
            <p className="text-2xl font-bold text-indigo-400">
              {replenishmentData.number_of_replenishments || 0} <span className="text-lg text-indigo-300">replenishment order(s)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

