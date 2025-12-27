"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@/interfaces/book";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { formatPrice } from "@/helpers/currency";
// import { AddToCartBtn } from "@/components";
import { useContext, useState } from "react";
import { apiService } from "@/services/api";
import toast from "react-hot-toast";

    interface BookCardProps {
    book: Book;
    }

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={book.image}
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
            href={``}
            className="hover:text-primary hover:underline transition-colors"
          >
            {book.category}
          </Link>
        </p>

        <h3 className="font-semibold text-sm mb-2 h-6 line-clamp-2 hover:text-primary transition-colors">
          <Link href={`/books/${book.isbn}`}>{book.title}</Link>
        </h3>


        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(book.price)}
          </span>
        </div>

        {/* <AddToCartBtn
          addToCartLoading={addToCartLoading}
          handleAddProductToCart={handleAddProductToCart}
        /> */}
      </div>
    </div>
  );
}

