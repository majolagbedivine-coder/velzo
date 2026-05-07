import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingBag, MessageSquare, LayoutDashboard, LogOut, Store, Plus } from "lucide-react";
import velzoIcon from "@/assets/velzo-icon.jpg";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={velzoIcon} alt="Velzo" className="w-7 h-7 rounded-md object-cover" />
          <span className="text-xl font-bold text-[#1D6146]">Velzo</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-medium text-gray-600 hover:text-[#1D6146] transition-colors">
            Browse
          </Link>
          <Link href="/catalog?category=templates" className="text-sm font-medium text-gray-600 hover:text-[#1D6146] transition-colors">
            Templates
          </Link>
          <Link href="/catalog?category=ebooks" className="text-sm font-medium text-gray-600 hover:text-[#1D6146] transition-colors">
            E-Books
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === "seller" && (
                <Link href="/sell">
                  <Button size="sm" className="bg-[#1D6146] text-white hover:bg-[#174f38] gap-1">
                    <Plus className="w-4 h-4" />
                    Sell
                  </Button>
                </Link>
              )}
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#1D6146]">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="w-8 h-8 cursor-pointer">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback className="bg-[#1D6146] text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {user?.role === "seller" && (
                    <DropdownMenuItem onClick={() => navigate("/store/create")} className="cursor-pointer">
                      <Store className="w-4 h-4 mr-2" />
                      My Store
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { logout(); navigate("/"); }}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#1D6146]">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#1D6146] text-white hover:bg-[#174f38]">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
