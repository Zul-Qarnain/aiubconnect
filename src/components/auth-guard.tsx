"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const PUBLIC_PATHS = ["/login", "/signup", "/verify-email"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            // Allow access to public paths
            // Also allow access to home page "/" and post details "/post/*" and profile pages "/profile/*"
            const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname === "/" || pathname.startsWith("/post/") || pathname.startsWith("/profile/");

            if (isPublicPath) {
                return;
            }

            // Protect private routes
            if (!user) {
                router.push("/login");
            } else if (user && !userProfile?.isVerified) {
                // If logged in but not verified, redirect to verify-email
                router.push("/verify-email");
            }
        }
    }, [user, userProfile, loading, pathname, router]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // If on a public path, just render
    const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname === "/" || pathname.startsWith("/post/") || pathname.startsWith("/profile/");
    if (isPublicPath) {
        return <>{children}</>;
    }

    // If on a private path, only render if authenticated and verified
    if (!user || (user && !userProfile?.isVerified)) {
        return null; // Or a loading spinner while redirecting
    }

    if (userProfile?.isBanned) {
        return (
            <div className="flex flex-col h-screen items-center justify-center space-y-4 p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive">Account Suspended</h1>
                <p>Your account has been permanently banned due to repeated violations of our community guidelines.</p>
                <p className="text-sm text-muted-foreground">If you believe this is a mistake, please contact support at <a href="mailto:shihab.dev@pm.me" className="underline">shihab.dev@pm.me</a>.</p>
                <Button onClick={() => { import("@/lib/firebase").then(({ auth }) => auth.signOut()); window.location.href = "/"; }}>
                    Sign Out
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
