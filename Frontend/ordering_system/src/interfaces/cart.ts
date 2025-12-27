import { Book } from '@/interfaces/book';
export interface CartBook {
  count: number;
  isbn: string;
  book:Book;
  price: number;
}