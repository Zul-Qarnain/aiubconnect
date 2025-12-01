export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    isVerified: boolean;
    aiubEmail?: string;
    createdAt: Date;
    isAdmin?: boolean;
    isBanned?: boolean;
    strikes?: number;
    suspensionEndDate?: string;
}
