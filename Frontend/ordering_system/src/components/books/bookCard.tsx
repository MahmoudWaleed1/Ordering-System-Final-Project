"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@/interfaces/book";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { formatPrice } from "@/helpers/currency";
import { useContext, useState } from "react";
import { cartStorage } from "@/helpers/cartStorage";
import { cartContext } from "@/contexts/cartContext";
import toast from "react-hot-toast";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const { refreshCart } = useContext(cartContext);

  const handleAddToCart = () => {
    if (book.quantity === 0 || (book.quantity_stock !== undefined && book.quantity_stock === 0)) {
      toast.error("This book is out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      cartStorage.addToCart(book, 1);
      refreshCart();
      toast.success(`${book.title} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const bookImage = book.image || book.book_image || "/placeholder-book.jpg";
  const bookPrice = book.price || book.selling_price || 0;
  const bookIsbn = book.isbn || book.ISBN_number || "";

  return (
    <div className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={bookImage}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      {/* Product details */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
          <Link
            href={`/books?category=${book.category}`}
            className="hover:text-primary hover:underline transition-colors"
          >
            {book.category}
          </Link>
        </p>

        <h3 className="font-semibold text-sm mb-2 h-6 line-clamp-2 hover:text-primary transition-colors">
          <Link href={`/books/${bookIsbn}`}>{book.title}</Link>
        </h3>

        {book.authors && book.authors.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">By {book.authors.join(", ")}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(bookPrice)}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {book.quantity || book.quantity_stock || 0}
          </span>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={addingToCart || (book.quantity === 0 && book.quantity_stock === 0)}
          className="w-full"
          size="sm"
        >
          {addingToCart ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

