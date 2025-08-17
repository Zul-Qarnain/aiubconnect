"use client";

import Link from "next/link";
import {
  Menu,
  Home,
  User,
  LogOut,
  ChevronDown,
  BookCopy,
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
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Logo } from "@/components/logo";

export function Header() {
  const isMobile = useIsMobile();
  const user = getCurrentUser();

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

        <div className="flex items-center gap-4 ml-auto">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
