"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

export default function VerifyEmailPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        const handleVerificationLink = async () => {
            setLoading(true);
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');

            if (!emailForSignIn) {
                // User opened link on different device. Ask for email.
                emailForSignIn = window.prompt('Please provide your email for confirmation');
            }

            if (!emailForSignIn) {
                setLoading(false);
                return;
            }

            try {
                // 1. Create credential from the link
                const credential = EmailAuthProvider.credentialWithLink(emailForSignIn, window.location.href);

                // 2. Link to the current user (if logged in)
                if (auth.currentUser) {
                    await linkWithCredential(auth.currentUser, credential);

                    // 3. Update Firestore
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    await updateDoc(userRef, {
                        isVerified: true,
                        aiubEmail: emailForSignIn
                    });

                    toast({
                        title: "Success",
                        description: "Email verified and account linked successfully!",
                    });

                    window.localStorage.removeItem('emailForSignIn');
                    window.location.href = "/";
                } else {
                    // If not logged in, we can sign them in with the link, but that creates a separate session
                    // unless we merge. For this specific flow (Verification of Google Account), 
                    // we really need them to be logged in to the Google Account first.
                    toast({
                        title: "Session Expired",
                        description: "Please login with your Google account again, then click the link.",
                        variant: "destructive",
                    });
                    router.push("/login");
                }

            } catch (error: any) {
                if (error.code === 'auth/invalid-action-code') {
                    // Expected error for expired/used links, no need to log as error
                    toast({
                        title: "Link Expired or Invalid",
                        description: "This verification link has expired or has already been used. Please send a new one.",
                        variant: "destructive",
                    });
                } else {
                    console.error(error);
                    toast({
                        title: "Verification Failed",
                        description: error.message || "Failed to verify link",
                        variant: "destructive",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        // Check if this is a verification link return
        if (isSignInWithEmailLink(auth, window.location.href)) {
            handleVerificationLink();
        }
    }, [router, toast]);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                // If checking link, user might not be loaded yet or might be null if opened in new browser
                // But for linking, we need the user logged in. 
                // If not logged in, we can't link to the existing account easily without re-login.
                // For now, assume same browser session.
            } else if (userProfile?.isVerified) {
                router.push("/");
            }
        }
    }, [user, userProfile, authLoading, router]);

    const handleSendLink = async () => {
        if (!email.endsWith("@student.aiub.edu") && !email.endsWith("@aiub.edu")) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid AIUB email address (@student.aiub.edu or @aiub.edu)",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const actionCodeSettings = {
                // URL you want to redirect back to. The domain (www.example.com) for this
                // URL must be in the authorized domains list in the Firebase Console.
                url: window.location.href, // Redirect back to this page
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setEmailSent(true);
            toast({
                title: "Verification Link Sent",
                description: "Check your AIUB email for the sign-in link.",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "Failed to send verification link",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Verify AIUB Email</CardTitle>
                    <CardDescription>
                        To access AIUB Connect, you must verify that you are a student or faculty member of AIUB.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!emailSent ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">AIUB Email</label>
                                <Input
                                    type="email"
                                    placeholder="your.name@student.aiub.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleSendLink} disabled={loading}>
                                {loading ? "Sending..." : "Send Verification Link"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm">
                                    We sent a verification link to <strong>{email}</strong>.
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Please check your inbox (and <strong>Spam/Junk</strong> folder) and click the link to verify your account.
                                </p>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setEmailSent(false)}>
                                Use different email
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
