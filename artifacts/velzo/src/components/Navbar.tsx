import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingBag, MessageSquare, LayoutDashboard, LogOut,
  Store, Plus, Sun, Moon, User, Settings
} from "lucide-react";
import velzoIcon from "@/assets/velzo-icon.jpg";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={velzoIcon} alt="Velzo" className="w-7 h-7 rounded-md object-cover" />
          <span className="text-xl font-bold text-primary">Velzo</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>
          <Link href="/catalog?category=templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>
          <Link href="/catalog?category=ebooks" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            E-Books
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {user?.role === "seller" && (
                <Link href="/sell">
                  <Button size="sm" className="gap-1 ml-1">
                    <Plus className="w-4 h-4" />
                    Sell
                  </Button>
                </Link>
              )}
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none ml-1">
                    <Avatar className="w-8 h-8 cursor-pointer">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role} account</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {user?.role === "seller" && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard?tab=store")} className="cursor-pointer">
                      <Store className="w-4 h-4 mr-2" />
                      My Store
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { logout(); navigate("/"); }}
                    className="text-destructive cursor-pointer focus:text-destructive"
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
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
