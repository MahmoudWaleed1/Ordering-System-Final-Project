"use client";
import { formatPrice } from "@/helpers/currency";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "../ui";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/helpers/cartStorage";

interface CartBookProps {
  item: CartItem;
  onRemoveItem: (isbn: string) => void;
  onUpdateItemCount: (isbn: string, count: number) => void;
}

export function CartBook({
  item,
  onRemoveItem,
  onUpdateItemCount,
}: CartBookProps) {
  const [isRemovingItem, setIsRemovingItem] = useState(false);
  const [productCount, setProductCount] = useState(item.quantity);
  const [timeOutId, setTimeOutId] = useState<NodeJS.Timeout>();

  useEffect(() => {
    setProductCount(item.quantity);
  }, [item.quantity]);

  function handleUpdateProductCount(count: number) {
    if (count < 1) return;
    
    clearTimeout(timeOutId);
    setProductCount(count);

    const id = setTimeout(() => {
      if (count !== item.quantity) {
        onUpdateItemCount(item.book.isbn || item.book.ISBN_number || "", count);
      }
    }, 500);
    setTimeOutId(id);
  }

  const bookIsbn = item.book.isbn || item.book.ISBN_number || "";
  const bookImage = item.book.image || item.book.book_image || "/placeholder-book.jpg";
  const bookPrice = item.book.price || item.book.selling_price || 0;

  return (
    <div key={bookIsbn} className="flex gap-4 p-4 bg-[#0b1020]/50 border border-indigo-900/50 rounded-lg">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={bookImage}
          alt={item.book.title}
          fill
          className="object-cover rounded-md"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold line-clamp-2 text-white">
          <Link
            href={`/books/${bookIsbn}`}
            className="hover:text-indigo-400 transition-colors"
          >
            {item.book.title}
          </Link>
        </h3>
        <p className="font-semibold text-indigo-400 mt-2">
          {formatPrice(bookPrice)} each
        </p>
        <p className="text-sm text-indigo-300 mt-1">
          Total: {formatPrice(bookPrice * item.quantity)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          onClick={() => {
            setIsRemovingItem(true);
            onRemoveItem(bookIsbn);
            setTimeout(() => setIsRemovingItem(false), 500);
          }}
          variant="ghost"
          size="sm"
          disabled={isRemovingItem}
          className="text-red-400 hover:text-red-300"
        >
          {isRemovingItem ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            disabled={item.quantity <= 1}
            onClick={() => handleUpdateProductCount(productCount - 1)}
            variant="outline"
            size="sm"
            className="border-indigo-700 text-indigo-300"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-white">{productCount}</span>
          <Button
            onClick={() => handleUpdateProductCount(productCount + 1)}
            variant="outline"
            size="sm"
            className="border-indigo-700 text-indigo-300"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
