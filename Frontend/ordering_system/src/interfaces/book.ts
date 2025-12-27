export interface Book {
  isbn: string;
  ISBN_number?: string; // Backend format
  title: string;
  quantity: number;
  quantity_stock?: number; // Backend format
  price: number;
  selling_price?: number; // Backend format
  publicationYear: number;
  publication_year?: number; // Backend format
  publisher: string;
  name?: string; // Backend format
  publisher_name?: string; // Backend format
  image: string;
  book_image?: string; // Backend format
  category: string;
  authors?: string[];
  threshold?: number;
  publisher_id?: number;
  createdAt: string;
  updatedAt: string;
}