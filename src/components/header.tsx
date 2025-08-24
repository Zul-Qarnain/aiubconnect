
"use client";

import Link from "next/link";
import {
  Menu,
  Home,
  User,
  LogOut,
  ChevronDown,
  BookCopy,
  Search,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCurrentUser } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { SearchBar } from "./search-bar";


export function Header() {
  const isMobile = useIsMobile();
  const user = getCurrentUser();
  const { setTheme, themes } = useTheme();
  const pathname = usePathname();

  const showSearch = pathname === '/';

  const navLinks = (
    <>
      <Button variant="ghost" asChild>
        <Link href="/">
          <Home className="mr-2" /> Home
        </Link>
      </Button>
      <Button variant="ghost" className="text-muted-foreground" disabled>
        <BookCopy className="mr-2" /> Categories
      </Button>
    </>
  );
  
  const searchBar = showSearch ? <SearchBar /> : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4">
        {isMobile ? (
          <>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-4">
                <Logo className="mb-8" />
                <nav className="flex flex-col gap-4">{navLinks}</nav>
              </SheetContent>
            </Sheet>
            <div className="flex-1 flex justify-center">
              <Logo />
            </div>
            <div className="w-9" />
          </>
        ) : (
          <Logo />
        )}

        {!isMobile && (
          <nav className="flex items-center space-x-2 mx-auto">
            {navLinks}
          </nav>
        )}
        
        <div className="flex items-center gap-4 ml-auto flex-1 justify-end">
            {!isMobile && searchBar}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
                    <UserAvatar user={user} className="w-8 h-8" />
                    {!isMobile && <span className="font-medium">{user.name}</span>}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setTheme("monokai")}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>Monokai</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setTheme("tokyo-night")}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>Tokyo Night</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setTheme("dracula")}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>Dracula</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      {isMobile && showSearch && (
        <div className="container px-4 pb-3">
          {searchBar}
        </div>
      )}
    </header>
  );
}
