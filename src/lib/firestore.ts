import {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    deleteDoc,
    collectionGroup,
} from "firebase/firestore";
import { db, storage } from "./firebase";
import { User, Post } from "./types";
import { User as FirebaseUser } from "firebase/auth";

// Collection references
const usersCollection = collection(db, "users");
const postsCollection = collection(db, "posts");
const reportsCollection = collection(db, "reports");

// User functions
export const createUserDocument = async (user: FirebaseUser, additionalData?: any) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { displayName, email, photoURL } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid: user.uid,
                name: displayName,
                email,
                profilePicUrl: photoURL,
                createdAt,
                dailyPostCount: 0,
                monthlyImagePostCount: 0,
                textPostCount: 0,
                ...additionalData,
            });
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
};

export const getUserDocument = async (uid: string) => {
    if (!uid) return null;
    try {
        const userRef = doc(db, "users", uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            return snapshot.data();
        }
    } catch (error) {
        console.error("Error fetching user document", error);
    }
    return null;
};

// Post functions
export const createPost = async (postData: any) => {
    try {
        // Sanitize the post data to ensure no custom objects (like Firebase User internal methods) are passed
        const { author, ...rest } = postData;

        const sanitizedAuthor = author ? {
            uid: author.uid,
            name: author.displayName || author.name,
            email: author.email,
            profilePicUrl: author.photoURL || author.profilePicUrl,
        } : null;

        // Remove undefined fields
        const cleanRest = Object.fromEntries(
            Object.entries(rest).filter(([_, v]) => v !== undefined)
        );

        await addDoc(postsCollection, {
            ...cleanRest,
            author: sanitizedAuthor,
            createdAt: serverTimestamp(),
            reactions: { upvotes: 0, downvotes: 0 },
            commentsCount: 0,
        });
    } catch (error) {
        console.error("Error creating post", error);
        throw error;
    }
};

export const getPosts = async (isAdmin = false) => {
    try {
        const q = query(postsCollection, orderBy("createdAt", "desc"), limit(20));

        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure dates are converted to strings/ISO if needed, or keep as is depending on usage
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as Post;
        });

        if (isAdmin) {
            return posts;
        }

        return posts.filter(post => !post.isSuspended);
    } catch (error) {
        console.error("Error getting posts", error);
        throw error;
    }
};

export const getPostsByUser = async (userId: string) => {
    try {
        const q = query(postsCollection, where("authorId", "==", userId), orderBy("createdAt", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            };
        });
    } catch (error) {
        console.error("Error fetching user posts", error);
        return [];
    }
};

// Comments (Placeholder for now as we haven't implemented comments collection yet)
// Comments
export const getCommentsByUser = async (userId: string) => {
    try {
        const commentsQuery = query(
            collectionGroup(db, 'comments'),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
        const snapshot = await getDocs(commentsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching user comments", error);
        return [];
    }
};

export const updatePost = async (postId: string, data: any) => {
    try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, data);
    } catch (error) {
        console.error("Error updating post", error);
        throw error;
    }
};

export const deletePost = async (postId: string) => {
    try {
        const postRef = doc(db, "posts", postId);
        await deleteDoc(postRef);
    } catch (error) {
        console.error("Error deleting post", error);
        throw error;
    }
};



export const getPostById = async (postId: string) => {
    try {
        const postRef = doc(db, "posts", postId);
        const snapshot = await getDoc(postRef);
        if (snapshot.exists()) {
            const data = snapshot.data();
            return {
                id: snapshot.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            };
        }
    } catch (error) {
        console.error("Error fetching post", error);
    }
    return null;
};

// Like/Dislike functions
export const togglePostLike = async (postId: string, userId: string, type: 'up' | 'down') => {
    if (!userId) return;
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(postRef, "likes", userId);

    try {
        const likeSnap = await getDoc(likeRef);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return;

        const currentReactions = postSnap.data().reactions || { upvotes: 0, downvotes: 0 };
        let newReactions = { ...currentReactions };

        if (likeSnap.exists()) {
            const currentVote = likeSnap.data().type;
            if (currentVote === type) {
                // Remove vote
                await deleteDoc(likeRef);
                if (type === 'up') newReactions.upvotes = Math.max(0, newReactions.upvotes - 1);
                else newReactions.downvotes = Math.max(0, newReactions.downvotes - 1);
            } else {
                // Change vote
                await setDoc(likeRef, { type });
                if (type === 'up') {
                    newReactions.upvotes++;
                    newReactions.downvotes = Math.max(0, newReactions.downvotes - 1);
                } else {
                    newReactions.downvotes++;
                    newReactions.upvotes = Math.max(0, newReactions.upvotes - 1);
                }
            }
        } else {
            // New vote
            await setDoc(likeRef, { type });
            if (type === 'up') newReactions.upvotes++;
            else newReactions.downvotes++;
        }

        await updateDoc(postRef, { reactions: newReactions });
        return newReactions;
    } catch (error) {
        console.error("Error toggling like", error);
        throw error;
    }
};

export const getUserVote = async (postId: string, userId: string) => {
    if (!userId) return null;
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const snap = await getDoc(likeRef);
    return snap.exists() ? snap.data().type : null;
};

// Comment functions
// We use a subcollection 'comments' under 'posts' where docId = userId to enforce 1 comment per user per post.
export const addComment = async (postId: string, user: any, text: string) => {
    const userId = user.uid || user.id;
    if (!userId) throw new Error("User ID is missing");

    const commentRef = doc(db, "posts", postId, "comments", userId);
    const postRef = doc(db, "posts", postId);

    try {
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists()) {
            throw new Error("You have already commented on this post.");
        }

        const newComment = {
            id: userId, // Use userId as comment ID
            postId,
            authorId: userId,
            text,
            createdAt: new Date().toISOString(), // Store as string for consistency with mock data types, or use serverTimestamp if changing types
            reactions: { upvotes: 0, downvotes: 0 },
            author: {
                id: userId,
                name: user.displayName || user.name,
                email: user.email,
                profilePicUrl: user.photoURL || user.profilePicUrl,
            }
        };

        await setDoc(commentRef, newComment);

        // Update post comment count
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            await updateDoc(postRef, {
                commentsCount: (postSnap.data().commentsCount || 0) + 1
            });
        }

        return newComment;
    } catch (error) {
        console.error("Error adding comment", error);
        throw error;
    }
};

export const updateComment = async (postId: string, userId: string, text: string) => {
    const commentRef = doc(db, "posts", postId, "comments", userId);
    try {
        await updateDoc(commentRef, {
            text,
            editedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating comment", error);
        throw error;
    }
};

export const deleteComment = async (postId: string, userId: string) => {
    const commentRef = doc(db, "posts", postId, "comments", userId);
    const postRef = doc(db, "posts", postId);

    try {
        await deleteDoc(commentRef);

        // Update post comment count
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            await updateDoc(postRef, {
                commentsCount: Math.max(0, (postSnap.data().commentsCount || 0) - 1)
            });
        }
    } catch (error) {
        console.error("Error deleting comment", error);
        throw error;
    }
};

export const getPostComments = async (postId: string) => {
    const commentsRef = collection(db, "posts", postId, "comments");
    try {
        const q = query(commentsRef); // Client-side sorting might be needed if using userId as doc ID
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching comments", error);
        return [];
    }
};

export const getUserComment = async (postId: string, userId: string) => {
    if (!userId) return null;
    const commentRef = doc(db, "posts", postId, "comments", userId);
    const snap = await getDoc(commentRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Comment Voting
export const toggleCommentLike = async (postId: string, commentId: string, userId: string, type: 'up' | 'down') => {
    if (!userId) return;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const likeRef = doc(commentRef, "likes", userId);

    try {
        const likeSnap = await getDoc(likeRef);
        const commentSnap = await getDoc(commentRef);

        if (!commentSnap.exists()) return;

        const currentReactions = commentSnap.data().reactions || { upvotes: 0, downvotes: 0 };
        let newReactions = { ...currentReactions };

        if (likeSnap.exists()) {
            const currentVote = likeSnap.data().type;
            if (currentVote === type) {
                // Remove vote
                await deleteDoc(likeRef);
                if (type === 'up') newReactions.upvotes = Math.max(0, newReactions.upvotes - 1);
                else newReactions.downvotes = Math.max(0, newReactions.downvotes - 1);
            } else {
                // Change vote
                await setDoc(likeRef, { type });
                if (type === 'up') {
                    newReactions.upvotes++;
                    newReactions.downvotes = Math.max(0, newReactions.downvotes - 1);
                } else {
                    newReactions.downvotes++;
                    newReactions.upvotes = Math.max(0, newReactions.upvotes - 1);
                }
            }
        } else {
            // New vote
            await setDoc(likeRef, { type });
            if (type === 'up') newReactions.upvotes++;
            else newReactions.downvotes++;
        }

        await updateDoc(commentRef, { reactions: newReactions });
        return newReactions;
    } catch (error) {
        console.error("Error toggling comment like", error);
        throw error;
    }
};

export const getUserCommentVote = async (postId: string, commentId: string, userId: string) => {
    if (!userId) return null;
    const likeRef = doc(db, "posts", postId, "comments", commentId, "likes", userId);
    const snap = await getDoc(likeRef);
    return snap.exists() ? snap.data().type : null;
};


// Reporting & Admin Functions

export const createReport = async (reportData: any) => {
    try {
        const { contentId, contentType, reporterId } = reportData;

        // Check if user already reported this content
        const q = query(
            reportsCollection,
            where("contentId", "==", contentId),
            where("reporterId", "==", reporterId)
        );
        const existingReports = await getDocs(q);

        if (!existingReports.empty) {
            throw new Error("You have already reported this content.");
        }

        // Create report
        await addDoc(reportsCollection, {
            ...reportData,
            createdAt: serverTimestamp(),
            status: "pending"
        });

        // Increment report count on content
        if (contentType === "post") {
            const postRef = doc(db, "posts", contentId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const currentReports = (postSnap.data().reportCount || 0) + 1;
                const updates: any = { reportCount: currentReports };

                // Automatic suspension threshold
                if (currentReports >= 5) {
                    updates.isSuspended = true;
                }

                await updateDoc(postRef, updates);
            }
        }
    } catch (error) {
        console.error("Error creating report", error);
        throw error;
    }
};

export const getReports = async () => {
    try {
        const q = query(reportsCollection, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching reports", error);
        return [];
    }
};

export const deleteReport = async (reportId: string) => {
    try {
        await deleteDoc(doc(db, "reports", reportId));
    } catch (error) {
        console.error("Error deleting report", error);
        throw error;
    }
};

export const banUser = async (userId: string) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isBanned: true,
            bannedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error banning user", error);
        throw error;
    }
};

export const unbanUser = async (userId: string) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isBanned: false,
            bannedAt: null
        });
    } catch (error) {
        console.error("Error unbanning user", error);
        throw error;
    }
};
