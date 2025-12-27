"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useContext } from "react";
import { cartContext } from "@/contexts/cartContext";
import { User, ShoppingCart, LogOut } from "lucide-react"; // Icons
import { Package } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; // Optional: for a nice dropdown
import { signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useContext(cartContext);

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

        {/* Right Side Items */}
        <div className="flex items-center space-x-6">
          
          {/* Cart Icon (Dynamic Count) */}
          <Link href="/cart" className="relative text-indigo-300 hover:text-purple-400 transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            /* Logged In: Show Profile Icon with Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="h-9 w-9 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white hover:bg-indigo-500 transition-all cursor-pointer">
                  <User className="h-5 w-5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0b1020] border-indigo-900 text-indigo-100 w-48">
                <div className="px-2 py-2 text-xs text-indigo-400 border-b border-indigo-900 mb-1">
                  Signed in as <br/>
                  <span className="text-indigo-100 font-semibold">{(session.user as any).username}</span>
                  {(session.user as any).role === "Admin" && (
                    <span className="block mt-1 text-amber-400">Admin</span>
                  )}
                </div>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-indigo-900/50">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                {(session.user as any).role === "Admin" && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-indigo-900/50">
                    <Link href="/admin" className="flex items-center w-full">
                      <Package className="mr-2 h-4 w-4" /> Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-indigo-900/50">
                  <Link href="/allOrders" className="flex items-center w-full">
                    <Package className="mr-2 h-4 w-4" /> My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: "/authentication/login" })}
                  className="cursor-pointer text-red-400 hover:bg-red-900/20 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Not Logged In: Show Login Link */
            <Link 
              href="/authentication/login"
              className="text-indigo-300 hover:text-purple-400 font-medium transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}