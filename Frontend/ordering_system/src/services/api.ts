import { Book } from "@/interfaces/book";

class ApiService {
    // Uses the variable from your .env file
    #baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    async signup(name: string, email: string, username: string, password: string, phone: string, address: string) {
        return await fetch(`${this.#baseUrl}/api/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, username, password, phone, address }),
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
        return await fetch(`${this.#baseUrl}/api/users/books`).then((res) => res.json());
    }

    async getBookDetails(isbn: string): Promise<Book> {
        return await fetch(`${this.#baseUrl}/api/users/books/${isbn}`).then((res) => res.json());
    }

    async searchBooks(searchParams: {
        isbn?: string;
        title?: string;
        category?: string;
        publisher?: string;
    }): Promise<Book[]> {
        const params = new URLSearchParams();
        if (searchParams.isbn) params.append('isbn', searchParams.isbn);
        if (searchParams.title) params.append('title', searchParams.title);
        if (searchParams.category) params.append('category', searchParams.category);
        if (searchParams.publisher) params.append('publisher', searchParams.publisher);

        const url = `${this.#baseUrl}/api/users/books/search?${params.toString()}`;
        return await fetch(url).then((res) => res.json());
    }
}

export const apiService = new ApiService();