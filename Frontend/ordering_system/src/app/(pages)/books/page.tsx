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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    isbn: "",
    title: "",
    category: "",
    publisher: "",
    author: "",
  });

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any search parameter is filled
    const hasSearchParams = Object.values(searchParams).some(v => v !== "");
    
    if (!hasSearchParams) {
      // If no search params, show all books
      setFilteredBooks(books);
      return;
    }

    try {
      setLoading(true);
      
      // Send search request to backend
      const results = await apiService.searchBooks(searchParams);
      
      setFilteredBooks(results);
      
    //   if (results.length === 0) {
    //     toast.info("No books found matching your search");
    //   }
    } catch (err: any) {
      console.error("Search error:", err);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchParams({
      isbn: "",
      title: "",
      category: "",
      publisher: "",
      author: "",
    });
    setFilteredBooks(books);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">All Books</h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 p-6 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Search Books</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="ISBN"
            value={searchParams.isbn}
            onChange={(e) => setSearchParams({ ...searchParams, isbn: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Title"
            value={searchParams.title}
            onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Author"
            value={searchParams.author}
            onChange={(e) => setSearchParams({ ...searchParams, author: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={searchParams.category}
            onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="Science">Science</option>
            <option value="Art">Art</option>
            <option value="Religion">Religion</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
          </select>
          <input
            type="text"
            placeholder="Publisher"
            value={searchParams.publisher}
            onChange={(e) => setSearchParams({ ...searchParams, publisher: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button type="submit" className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button type="button" variant="outline" onClick={clearSearch}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </form>

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
      {!loading && !error && Object.values(searchParams).some(v => v !== "") && (
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