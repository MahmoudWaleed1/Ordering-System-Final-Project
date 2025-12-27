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
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Zod schema for login
const loginSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(
      /(?=.*[A-Z])(?=.*[0-9])/,
      "Password must have at least one uppercase letter and one number"
    ),
});

export default function LoginPage() {
    const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
        username: "",
        password: "",
    },
    });

  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [lastPage, setLastPage] = useState("/");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("lastPage");
    if (stored && stored !== "/auth/login") setLastPage(stored);
  }, []);

  const onSubmit = async (values: any) => {
    setSigningIn(true);
    setErrorMessage("");
    try {
      const response = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      if (response?.ok) {
        sessionStorage.setItem("isLoggedIn", "true");
        router.push(lastPage);
      } else {
        setErrorMessage("Invalid username or password");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    }
    setSigningIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-black p-6">
      <div className="w-full max-w-xl rounded-3xl bg-[#0b1020]/90 backdrop-blur-xl border border-indigo-900 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-10">
        <h2 className="text-3xl font-bold text-center mb-8 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Login
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email */}
            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm text-indigo-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="you@example.com"
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
                    <p className="text-red-400 text-xs mt-1">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm text-indigo-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="********"
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
                    <p className="text-red-400 text-xs mt-1">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />

            {errorMessage && (
              <p className="text-red-400 text-center text-sm">{errorMessage}</p>
            )}

            {/* Forgot password */}
            <p className="text-center text-sm">
              <Link href="/auth/resetPassword" className="text-indigo-400 hover:text-purple-300 underline">
                Forgot password?
              </Link>
            </p>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={signingIn}
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
              <span className="relative">
                {signingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </Button>

            {/* Sign Up link */}
            <p className="mt-6 text-center text-sm text-indigo-400">
              Don't have an account?{" "}
              <Link
                href="/authentication/register"
                className="text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
