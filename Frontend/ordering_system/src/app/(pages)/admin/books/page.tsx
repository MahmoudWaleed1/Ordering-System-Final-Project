"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPrice } from "@/helpers/currency";

export default function AdminBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = (session?.user as any)?.token;

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user as any)?.role !== "Admin") {
      router.push("/books");
      return;
    }

    fetchBooks();
  }, [session, status, router]);

  async function fetchBooks() {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await apiService.getAdminBooks(token);
      if (response.ok) {
        setBooks(response.data);
      } else {
        toast.error("Failed to load books");
      }
    } catch (error) {
      toast.error("Error loading books");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(isbn: string) {
    if (!confirm(`Are you sure you want to delete book ${isbn}?`)) return;
    if (!token) return;

    try {
      const response = await apiService.deleteBook(token, isbn);
      if (response.ok) {
        toast.success("Book deleted successfully");
        fetchBooks();
      } else {
        toast.error(response.data?.msg || "Failed to delete book");
      }
    } catch (error) {
      toast.error("Error deleting book");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-indigo-300">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 mb-4 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Books</h1>
          <p className="text-indigo-300">Add, edit, or remove books from the catalog</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Book
        </Button>
      </div>

      <div className="bg-[#0b1020]/80 border border-indigo-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-indigo-950/40 border-b border-indigo-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-900">
              {books.map((book) => (
                <tr key={book.ISBN_number} className="hover:bg-indigo-950/20">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-300 font-mono">
                    {book.ISBN_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{book.title}</td>
                  <td className="px-6 py-4 text-sm text-indigo-300">{book.category}</td>
                  <td className="px-6 py-4 text-sm text-indigo-400">{formatPrice(book.selling_price)}</td>
                  <td className="px-6 py-4 text-sm text-indigo-300">{book.quantity_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-indigo-700 text-indigo-300">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                        onClick={() => handleDelete(book.ISBN_number)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

