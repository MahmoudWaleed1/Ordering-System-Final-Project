"use client";

import Link from "next/link";

export function Footer() {
  return (
   <footer className="w-full bg-[#0b1020]/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-indigo-200">
        
        {/* Logo / Company */}
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-lg">Online Library</span>
        </div>

        {/* Links / Info */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm">
          <Link href="#" className="hover:text-purple-400 transition-colors">About Us</Link>
          <Link href="#" className="hover:text-purple-400 transition-colors">Contact</Link>
          <Link href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link>
        </div>

        {/* Copyright */}
        <div className="mt-4 md:mt-0 text-xs text-indigo-400">
          &copy; {new Date().getFullYear()} Book Ordering System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
