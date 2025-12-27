import { Book } from "@/interfaces/book";

export interface CartItem {
  book: Book;
  quantity: number;
}

const CART_STORAGE_KEY = "book_cart";

export const cartStorage = {
  getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  },

  addToCart(book: Book, quantity: number = 1): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      (item) => item.book.isbn === book.isbn || item.book.ISBN_number === book.isbn
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ book, quantity });
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  },

  removeFromCart(isbn: string): void {
    const cart = this.getCart();
    const filtered = cart.filter(
      (item) => item.book.isbn !== isbn && item.book.ISBN_number !== isbn
    );
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
  },

  updateQuantity(isbn: string, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(
      (item) => item.book.isbn === isbn || item.book.ISBN_number === isbn
    );
    if (item) {
      item.quantity = Math.max(1, quantity);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  },

  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
  },

  getCartCount(): number {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice(): number {
    const cart = this.getCart();
    return cart.reduce(
      (sum, item) => sum + (item.book.price || item.book.selling_price || 0) * item.quantity,
      0
    );
  },
};

