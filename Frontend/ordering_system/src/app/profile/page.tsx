"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-indigo-300">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-indigo-300 mb-4">You are not signed in.</p>
          <Link href="/authentication/login">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user as any;

  const initials = (user.name || user.username || "User")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-black p-6">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0b1020]/90 backdrop-blur-xl border border-indigo-900 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-10">
        <h2 className="text-2xl font-bold text-center mb-6 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Profile</h2>

        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>

          <div className="flex-1">
            <p className="text-indigo-200 text-sm">Name</p>
            <p className="text-white text-lg font-semibold">{user.name || "-"}</p>

            <p className="text-indigo-200 text-sm mt-4">Username</p>
            <p className="text-white text-lg font-semibold">{user.username || "-"}</p>

            <p className="text-indigo-200 text-sm mt-4">Email</p>
            <p className="text-white text-lg font-semibold">{user.email || "-"}</p>

            <p className="text-indigo-200 text-sm mt-4">Role</p>
            <p className="text-white text-lg font-semibold">{user.role || "user"}</p>

            <div className="mt-6 flex space-x-3">
              <Button onClick={() => signOut({ callbackUrl: "/authentication/login" })} className="bg-red-600 hover:bg-red-700">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
