"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPostsByUser, getCommentsByUser } from "@/lib/firestore";
import { format, formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post-card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Post, Comment } from "@/lib/types";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchData = async () => {
        const posts = await getPostsByUser(user.uid);
        const comments = await getCommentsByUser(user.uid);
        setUserPosts(posts as any);
        setUserComments(comments as any);
        setLoadingData(false);
      };
      fetchData();
    }
  }, [user, loading, router]);

  if (loading || loadingData) {
    return <div className="flex justify-center py-8">Loading profile...</div>;
  }

  if (!user) return null;

  // Map Firebase user to App user shape
  const appUser = {
    id: user.uid,
    name: user.displayName || "User",
    email: user.email || "",
    profilePicUrl: user.photoURL || "",
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    dailyPostCount: 0,
    monthlyImagePostCount: 0,
    textPostCount: 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <UserAvatar user={appUser as any} className="w-24 h-24 text-4xl" />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold font-headline">{appUser.name}</h1>
            <p className="text-muted-foreground">{appUser.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Joined on {format(new Date(appUser.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">My Posts ({userPosts.length})</TabsTrigger>
          <TabsTrigger value="comments">My Comments ({userComments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6 space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven&apos;t made any posts yet.</p>
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
                <p className="text-muted-foreground text-center py-8">You haven&apos;t made any comments yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
