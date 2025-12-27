"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPrice } from "@/helpers/currency";

const bookSchema = z.object({
  ISBN_number: z.string().min(1, "ISBN is required"),
  title: z.string().min(1, "Title is required"),
  publication_year: z.number().min(1000).max(2100),
  quantity_stock: z.number().min(0),
  category: z.enum(["Science", "Art", "Religion", "History", "Geography"]),
  threshold: z.number().min(0),
  selling_price: z.number().min(0),
  publisher_id: z.number().optional(),
  book_image: z.string().min(1, "Book image path is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
});

export default function AdminBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [publishers, setPublishers] = useState<any[]>([]);
  const token = (session?.user as any)?.token;

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      ISBN_number: "",
      title: "",
      publication_year: new Date().getFullYear(),
      quantity_stock: 0,
      category: "Science",
      threshold: 10,
      selling_price: 0,
      publisher_id: undefined,
      book_image: "",
      authors: [""],
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user as any)?.role !== "Admin") {
      router.push("/books");
      return;
    }

    fetchBooks();
    fetchPublishers();
  }, [session, status, router]);

  async function fetchPublishers() {
    if (!token) return;
    try {
      const response = await apiService.getPublishers?.(token);
      if (response?.ok) {
        setPublishers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch publishers");
    }
  }

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

  function handleEdit(book: any) {
    setEditingBook(book);
    form.reset({
      ISBN_number: book.ISBN_number,
      title: book.title,
      publication_year: book.publication_year,
      quantity_stock: book.quantity_stock,
      category: book.category,
      threshold: book.threshold,
      selling_price: parseFloat(book.selling_price),
      publisher_id: book.publisher_id,
      book_image: book.book_image,
      authors: book.authors && book.authors.length > 0 ? book.authors : [""],
    });
    setShowEditModal(true);
  }

  function handleAdd() {
    form.reset({
      ISBN_number: "",
      title: "",
      publication_year: new Date().getFullYear(),
      quantity_stock: 0,
      category: "Science",
      threshold: 10,
      selling_price: 0,
      publisher_id: undefined,
      book_image: "",
      authors: [""],
    });
    setShowAddModal(true);
  }

  async function onSubmit(values: z.infer<typeof bookSchema>) {
    if (!token) return;

    try {
      const bookData = {
        ...values,
        authors: values.authors.filter(a => a.trim() !== ""),
      };

      let response;
      if (showEditModal && editingBook) {
        response = await apiService.updateBook(token, editingBook.ISBN_number, bookData);
      } else {
        response = await apiService.createBook(token, bookData);
      }

      if (response.ok) {
        toast.success(showEditModal ? "Book updated successfully" : "Book created successfully");
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingBook(null);
        fetchBooks();
      } else {
        toast.error(response.data?.msg || "Failed to save book");
      }
    } catch (error) {
      toast.error("Error saving book");
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
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-indigo-700 text-indigo-300"
                        onClick={() => handleEdit(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0b1020] border border-indigo-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Book</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ISBN_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">ISBN</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="publication_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Threshold</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Category</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 bg-indigo-950/30 border border-indigo-800 text-white rounded-md">
                            <option value="Science">Science</option>
                            <option value="Art">Art</option>
                            <option value="Religion">Religion</option>
                            <option value="History">History</option>
                            <option value="Geography">Geography</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="selling_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="book_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-200">Image Path</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-200">Authors (one per line)</FormLabel>
                      <FormControl>
                        <textarea
                          value={field.value.join("\n")}
                          onChange={(e) => field.onChange(e.target.value.split("\n").filter(a => a.trim() !== ""))}
                          className="w-full px-3 py-2 bg-indigo-950/30 border border-indigo-800 text-white rounded-md"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Create Book
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && editingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0b1020] border border-indigo-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Book</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowEditModal(false); setEditingBook(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ISBN_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">ISBN</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-indigo-950/30 border-indigo-800 text-white opacity-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="publication_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Threshold</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Category</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 bg-indigo-950/30 border border-indigo-800 text-white rounded-md">
                            <option value="Science">Science</option>
                            <option value="Art">Art</option>
                            <option value="Religion">Religion</option>
                            <option value="History">History</option>
                            <option value="Geography">Geography</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="selling_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-indigo-200">Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="bg-indigo-950/30 border-indigo-800 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="book_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-200">Image Path</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-indigo-950/30 border-indigo-800 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-200">Authors (one per line)</FormLabel>
                      <FormControl>
                        <textarea
                          value={field.value.join("\n")}
                          onChange={(e) => field.onChange(e.target.value.split("\n").filter(a => a.trim() !== ""))}
                          className="w-full px-3 py-2 bg-indigo-950/30 border border-indigo-800 text-white rounded-md"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingBook(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Update Book
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

