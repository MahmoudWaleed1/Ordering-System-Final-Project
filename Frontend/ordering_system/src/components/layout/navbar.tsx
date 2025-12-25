"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b1020]/90 backdrop-blur-xl border-b border-indigo-900 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-white font-bold text-xl">Online Library</span>
        </Link>

        {/* Placeholder for future links/buttons */}
        <div className="flex items-center space-x-4">
       {/* Login Link */}
        <div className="flex items-center space-x-4 mx-10">
          <Link 
            href="/authentication/login"
            className="text-indigo-300 hover:text-purple-400 font-medium transition-colors"
          >
            Login
          </Link>
           </div>
        </div>
      </div>
    </header>
  );
}
