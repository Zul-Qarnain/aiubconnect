"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
    const router = useRouter();
    const { signInWithGoogle } = useAuth();
    const { toast } = useToast();

    const handleGoogleSignup = async () => {
        try {
            await signInWithGoogle();
            router.push("/");
        } catch (error: any) {
            toast({
                title: "Access Denied",
                description: error.message || "Failed to sign up with Google",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Join the Community</CardTitle>
                    <CardDescription>
                        Sign up using your AIUB email address to connect with others.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-4">
                        <Button className="w-full" onClick={handleGoogleSignup}>
                            Sign up with Google
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Only @student.aiub.edu and @aiub.edu accounts are allowed.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
