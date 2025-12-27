"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Book } from "@/interfaces/book";
import { BookCard } from "@/components/books/bookCard";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/helpers/currency";
import { apiService } from "@/services/api";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  async function getBooks() {
    try {
      setLoading(true);
      const books = await apiService.getAllBooks();
      setBooks(books);
      setFilteredBooks(books);
    } catch (err: any) {
      console.error("Error fetching books:", err);
      setError(err.message || "Failed to load books");
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getBooks();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(lowercaseQuery);
      const isbnMatch = book.isbn.toLowerCase().includes(lowercaseQuery);
      return titleMatch || isbnMatch;
    });

    setFilteredBooks(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBooks(books);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">All Books</h1>
      </div>

      {/* Search Bar - Always visible */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title or ISBN..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={getBooks}>Try Again</Button>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && searchQuery && (
        <div className="mb-4 text-center text-muted-foreground">
          Found {filteredBooks.length}{" "}
          {filteredBooks.length === 1 ? "book" : "books"}
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.isbn} book={book} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBooks.length === 0 && books.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No books found matching your search.
          </p>
          <p className="text-muted-foreground/70 mt-2">
            Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}