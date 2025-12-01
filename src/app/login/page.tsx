"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle } = useAuth();
    const { toast } = useToast();

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            router.push("/");
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Failed to login with Google",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access the AIUB Connect community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-4">
                        <Button className="w-full" onClick={handleGoogleLogin}>
                            Login with Google
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Personal Google accounts allowed (AIUB email verification required).
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
