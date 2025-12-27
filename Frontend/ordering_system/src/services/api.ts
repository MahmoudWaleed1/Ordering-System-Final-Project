import { Book } from "@/interfaces/book";

class ApiService {
    // Uses the variable from your .env file
    #baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    async signup(name: string, email: string, username: string, password: string, phone: string, address: string) {
        return await fetch(`${this.#baseUrl}/api/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                name, 
                email, 
                username, 
                password, 
                phone_number: phone, 
                shipping_address: address 
            }),
        }).then(res => res.json());
    }

    async login(username: string, password: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            // SAFETY CHECK: If the server returns HTML (error page), don't parse as JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Server returned non-JSON response:", text);
                return { ok: false, status: response.status, data: null };
            }

            const data = await response.json();
            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            console.error("Fetch error:", error);
            return { ok: false, status: 500, data: null };
        }
    }

    async getAllBooks(): Promise<Book[]> {
        const response = await fetch(`${this.#baseUrl}/api/books/`);
        const books = await response.json();
        // Transform backend response to frontend format
        return books.map((book: any) => ({
            isbn: book.ISBN_number,
            title: book.title,
            quantity: book.quantity_stock,
            price: parseFloat(book.selling_price),
            publicationYear: book.publication_year,
            publisher: book.name || book.publisher_name || "",
            image: book.book_image,
            category: book.category,
            authors: book.authors || [],
            createdAt: "",
            updatedAt: "",
        }));
    }

    async getBookDetails(isbn: string): Promise<Book> {
        const response = await fetch(`${this.#baseUrl}/api/books/${isbn}`);
        const book = await response.json();
        return {
            isbn: book.ISBN_number,
            title: book.title,
            quantity: book.quantity_stock,
            price: parseFloat(book.selling_price),
            publicationYear: book.publication_year,
            publisher: book.name || book.publisher_name || "",
            image: book.book_image,
            category: book.category,
            authors: book.authors || [],
            createdAt: "",
            updatedAt: "",
        };
    }

    async searchBooks(searchParams: {
        isbn?: string;
        title?: string;
        category?: string;
        publisher?: string;
        author?: string;
    }): Promise<Book[]> {
        const params = new URLSearchParams();
        if (searchParams.isbn) params.append('isbn', searchParams.isbn);
        if (searchParams.title) params.append('title', searchParams.title);
        if (searchParams.category) params.append('category', searchParams.category);
        if (searchParams.publisher) params.append('publisher', searchParams.publisher);
        if (searchParams.author) params.append('author', searchParams.author);

        const url = `${this.#baseUrl}/api/books/search?${params.toString()}`;
        const response = await fetch(url);
        const books = await response.json();
        // Transform backend response to frontend format
        return books.map((book: any) => ({
            isbn: book.ISBN_number,
            title: book.title,
            quantity: book.quantity_stock,
            price: parseFloat(book.selling_price),
            publicationYear: book.publication_year,
            publisher: book.name || book.publisher_name || "",
            image: book.book_image,
            category: book.category,
            authors: book.authors || [],
            createdAt: "",
            updatedAt: "",
        }));
    }

    // Helper for Auth Headers
    #getAuthHeaders(token: string) {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    }

    async getUserProfile(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/users/me`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async updateUserProfile(token: string, updates: any) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/users/me`, {
                method: "PUT",
                headers: this.#getAuthHeaders(token),
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async createOrder(books: Array<{ISBN_number: string, quantity: number}>, creditCardNumber: string, token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/books/orders`, {
                method: "POST",
                headers: this.#getAuthHeaders(token),
                body: JSON.stringify({
                    books,
                    credit_card_number: creditCardNumber
                })
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async getUserOrders(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/users/orders`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            console.error("Orders fetch error:", error);
            return { ok: false, data: [] };
        }
    }

    // Admin endpoints
    async getAdminBooks(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/books`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: [] };
        }
    }

    async createBook(token: string, bookData: any) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/books`, {
                method: "POST",
                headers: this.#getAuthHeaders(token),
                body: JSON.stringify(bookData)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async updateBook(token: string, isbn: string, bookData: any) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/books/${isbn}`, {
                method: "PUT",
                headers: this.#getAuthHeaders(token),
                body: JSON.stringify(bookData)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async deleteBook(token: string, isbn: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/books/${isbn}`, {
                method: "DELETE",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async getPublisherOrders(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/publisher-orders`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: [] };
        }
    }

    async confirmPublisherOrder(token: string, orderId: number) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/publisher-orders/${orderId}/confirm`, {
                method: "PUT",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async getCustomerOrders(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/customer-orders`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: [] };
        }
    }

    async getSalesReport(token: string, type: "previous-month" | "by-date", date?: string) {
        try {
            const url = date 
                ? `${this.#baseUrl}/api/admins/reports/sales/by-date?date=${date}`
                : `${this.#baseUrl}/api/admins/reports/sales/previous-month`;
            const response = await fetch(url, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    }

    async getTopCustomers(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/reports/top-customers`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: [] };
        }
    }

    async getTopBooks(token: string) {
        try {
            const response = await fetch(`${this.#baseUrl}/api/admins/reports/top-books`, {
                method: "GET",
                headers: this.#getAuthHeaders(token)
            });
            const data = await response.json();
            return { ok: response.ok, data };
        } catch (error) {
            return { ok: false, data: [] };
        }
    }
}

export const apiService = new ApiService();