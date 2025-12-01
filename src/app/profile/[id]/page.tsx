"use client";

import { useEffect, useState } from "react";
import { getPostsByUser, getCommentsByUser, getUserDocument } from "@/lib/firestore";
import { format, formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post-card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { Post, Comment } from "@/lib/types";

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.id as string;

    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [userComments, setUserComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            const fetchData = async () => {
                try {
                    const [userDoc, posts, comments] = await Promise.all([
                        getUserDocument(userId),
                        getPostsByUser(userId),
                        getCommentsByUser(userId)
                    ]);

                    if (userDoc) {
                        setProfileUser({ id: userId, ...userDoc });
                    }
                    setUserPosts(posts as any);
                    setUserComments(comments as any);
                } catch (error) {
                    console.error("Error fetching profile data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [userId]);

    if (loading) {
        return <div className="flex justify-center py-8">Loading profile...</div>;
    }

    if (!profileUser) {
        return <div className="text-center py-8">User not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <UserAvatar user={profileUser} className="w-24 h-24 text-4xl" />
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h1 className="text-3xl font-bold font-headline">{profileUser.name || profileUser.displayName}</h1>
                            {profileUser.isBanned && <span className="text-destructive text-sm border border-destructive px-2 py-0.5 rounded">BANNED</span>}
                        </div>
                        {/* Hide email for privacy unless it's the user themselves, but for now we follow the requirement to view profile */}
                        {/* <p className="text-muted-foreground">{profileUser.email}</p> */}
                        <p className="text-sm text-muted-foreground mt-2">
                            Joined on {profileUser.createdAt ? format(new Date(profileUser.createdAt?.toDate ? profileUser.createdAt.toDate() : profileUser.createdAt), "MMMM d, yyyy") : "Unknown date"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="posts">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
                    <TabsTrigger value="comments">Comments ({userComments.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-6 space-y-6">
                    {userPosts.length > 0 ? (
                        userPosts.map((post) => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No posts yet.</p>
                    )}
                </TabsContent>
                <TabsContent value="comments" className="mt-6">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            {userComments.length > 0 ? (
                                userComments.map((comment, index) => (
                                    <div key={comment.id}>
                                        <div className="text-sm text-muted-foreground">
                                            Commented on a post <Link href={`/post/${comment.postId}`} className="text-primary hover:underline">here</Link> • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </div>
                                        <p className="mt-1 p-3 bg-muted/50 rounded-md">{comment.text}</p>
                                        {index < userComments.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No comments yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
