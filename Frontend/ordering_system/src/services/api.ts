import { use } from "react";

class ApiService {
    #baseUrl: string = "http://localhost:5000/";





    async signup(name: string, email: string, username: string, password: string, phone: string, address: string) {
    return await fetch(this.#baseUrl + "/api/users/register", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        name,
        email,
        username,
        password,
        phone,
        address,
        }),
    }).then(res => res.json());
    }

    async login(username: string, password: string) {
  console.log("➡️ login() called with", username, password);

  return await fetch(this.#baseUrl + "/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password }),
  }).then(async res => {
    const data = await res.json().catch(() => ({}));
    console.log("⬅️ Login status:", res.status, "Response:", data);
    return { status: res.status, ...data };
  });
}
}



export const apiService = new ApiService()