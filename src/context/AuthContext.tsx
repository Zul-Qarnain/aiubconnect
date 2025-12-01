"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "@/types/user";

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch user profile
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserProfile(userSnap.data() as UserProfile);
                } else {
                    // Handle case where user exists in Auth but not in Firestore (shouldn't happen with new flow, but good for safety)
                    // We don't create it here to avoid race conditions, we rely on login or manual creation
                    setUserProfile(null);
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const email = user.email;

            if (!email) throw new Error("No email found");

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Check if it's already an AIUB email OR the admin email
                const allowedDomains = ["@student.aiub.edu", "@aiub.edu"];
                const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                const isAiubEmail = allowedDomains.some(domain => email.endsWith(domain));
                const isAdmin = email === ADMIN_EMAIL;
                const isVerified = isAiubEmail || isAdmin;

                const newProfile: UserProfile = {
                    uid: user.uid,
                    email: email,
                    displayName: user.displayName || "User",
                    photoURL: user.photoURL || "",
                    isVerified: isVerified,
                    ...(isAiubEmail && { aiubEmail: email }),
                    createdAt: new Date(), // Firestore will convert this
                    isAdmin: isAdmin
                };

                await setDoc(userRef, newProfile);
                setUserProfile(newProfile);
            } else {
                setUserProfile(userSnap.data() as UserProfile);
            }

        } catch (error: any) {
            if (error.code === 'auth/cancelled-popup-request') {
                // User closed the popup, ignore or show a mild toast
                console.log("Login cancelled by user");
                return;
            }
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
