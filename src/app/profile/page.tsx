import { getCurrentUser, getPostsByUser, getCommentsByUser } from "@/lib/data";
import { format, formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post-card";
import { MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const user = getCurrentUser();
  const userPosts = getPostsByUser(user.id);
  const userComments = getCommentsByUser(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <UserAvatar user={user} className="w-24 h-24 text-4xl" />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Joined on {format(new Date(user.createdAt), "MMMM d, yyyy")}
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
            <p className="text-muted-foreground text-center py-8">You haven't made any posts yet.</p>
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
                        <p className="text-muted-foreground text-center py-8">You haven't made any comments yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
