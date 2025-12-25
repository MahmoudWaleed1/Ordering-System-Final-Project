"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { apiService } from "@/services/api";
import { pl } from "zod/locales";


const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email format"),

    username: z
      .string()
      .nonempty("Username is required")
      .min(6, "Username must be at least 6 characters"),

    password: z
      .string()
      .nonempty("Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(
        /(?=.*[A-Z])(?=.*[0-9])/,
        "Password must contain at least one uppercase letter and one number"
      ),

    rePassword: z
      .string()
      .nonempty("Please confirm your password"),

    phone: z
      .string()
      .nonempty("Phone is required")
      .regex(/^[0-9]{10,15}$/, "Invalid phone number"),

    address: z.string().nonempty("Address is required"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export default function RegisterPage() {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      rePassword: "",
      phone: "",
      address: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = await apiService.signup(
        values.name,
        values.email,
        values.username,
        values.password,
        values.phone,
        values.address
      );

      if (data.message === "success") {
        router.push("/auth/login");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-black p-6">
      <div className="w-full max-w-xl rounded-3xl bg-[#0b1020]/90 backdrop-blur-xl border border-indigo-900 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-10">

        <h2 className="text-3xl font-bold text-center mb-8 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Create Account
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {[
              { name: "name", label: "Name", placeholder: "Your Name" },
              { name: "email", label: "Email", placeholder: "you@example.com" },
              { name: "username", label: "Username", placeholder: "yourusername" },
              { name: "password", label: "Password", type: "password", placeholder: "********" },
              { name: "rePassword", label: "Confirm Password", type: "password", placeholder: "********" },
              { name: "phone", label: "Phone", placeholder: "0123456789" },
              {
                name: "address",
                label: "Address",
                placeholder: "123 Main Street, City",
              },
            ].map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name as any}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-indigo-300">
                      {item.label}
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type={item.type || "text"}
                        placeholder={item.placeholder}
                        className="
                          bg-[#020617]
                          border border-indigo-800
                          text-indigo-100
                          placeholder:text-indigo-500/60
                          focus:border-purple-500
                          focus:ring-purple-500/40
                          rounded-xl
                        "
                      />
                    </FormControl>

                    {fieldState.error && (
                      <p className="text-red-400 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            ))}

        <Button
          type="submit"
          disabled={loading}
          className="
            relative w-full py-3 rounded-xl
            text-white font-semibold
            overflow-hidden
            shadow-lg shadow-indigo-900/40
            cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <span className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 transition-opacity duration-500"></span>
          <span className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
          <span className="relative">Register</span>
        </Button>

          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-indigo-400">
          Already have an account?{" "}
          <Link
            href="/authentication/login"
            className="text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
